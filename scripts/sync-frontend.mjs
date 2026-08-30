// =============================================================================
// DBV Teleprompter — PWA + app de escritorio para leer texto en scroll
// Copyright (c) 2026 David Bueno Vallejo
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================
//
// Copia los ficheros estáticos de la raíz del repo a `src-tauri/frontend/`.
//
// Por qué existe: la raíz del repo es la carpeta que GitHub Pages publica como PWA, pero también
// contiene `src-tauri/`, `node_modules/` y `dbv-specs-ops/`. Si `frontendDist` apunta a la raíz,
// Tauri intenta embeber todo eso como assets y falla al leer ficheros bloqueados por Cargo
// (`src-tauri/target/debug/.cargo-artifact-lock`, os error 33). Este script le da a Tauri una
// carpeta con exactamente los ficheros de la app y nada más, sin mover nada de la raíz — así el
// modo web/PWA sigue publicándose desde donde siempre.

import { cp, mkdir, readFile, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(repoRoot, "src-tauri", "frontend");

// Todo lo que la app necesita para funcionar. `sw.js` y `manifest.json` se copian también: son
// inertes bajo el protocolo de Tauri, pero mantienen los dos modos partiendo de ficheros idénticos.
// `privacy.html` y `privacidad.html` son obligatorias: el pie de la app enlaza a ellas en ambos
// idiomas, y si no viajan dentro del binario el enlace muere en la app de escritorio.
const assets = ["index.html", "style.css", "script.js", "manifest.json", "sw.js",
    "privacy.html", "privacidad.html", "icons", "fonts"];

// ── Puerta de calidad: colisión de globales con Tauri ────────────────────────────────────────
//
// Tauri inyecta globales en `window` con `Object.defineProperty` (no configurables) antes de que
// corra ningún script nuestro — `isTauri` entre ellos. En un script clásico, un `const`/`let`/`class`
// de nivel superior con uno de esos nombres NO da un error de ejecución depurable: revienta el
// fichero entero con un SyntaxError de *parseo*, así que ni su primera línea llega a correr. La app
// renderiza perfecta (HTML y CSS no dependen del JS) pero la interfaz queda muerta — solo responde
// el textarea, que es nativo. Ver `dbv-specs-ops/docs/NATIVE_DESKTOP_APPS.md` §3.
//
// Esto ya se coló hasta la Microsoft Store y a los instaladores de macOS y Linux (`const isTauri`,
// v0.2.0). Por eso es un fallo de build y no un comentario: el comentario ya existía y no lo impidió.
//
// La comprobación NO usa una regex sobre el código. Una heurística de texto se come las formas
// indentada, `const { isTauri } = ...` y `const a = 1, isTauri = 2`, y las tres son igual de letales.
// En vez de aproximar el parseo, lo ejecutamos: instanciamos el script en un contexto que declara
// los mismos globales que Tauri y dejamos que el propio motor de JS dicte sentencia. Un SyntaxError
// es un fallo real (colisión o sintaxis rota); cualquier otro error significa que el script pasó la
// instanciación y solo se queja de que aquí no hay DOM, que es lo esperado.
const TAURI_INJECTED_GLOBALS = [
    "isTauri", "__TAURI__", "__TAURI_INTERNALS__", "__TAURI_IIFE__",
    "__TAURI_EVENT_PLUGIN_INTERNALS__", "__TAURI_OS_PLUGIN_INTERNALS__", "__TAURI_PATTERN__",
];

function findFatalError(source) {
    const context = vm.createContext({});
    for (const name of TAURI_INJECTED_GLOBALS) {
        vm.runInContext(`Object.defineProperty(globalThis, ${JSON.stringify(name)}, { value: true });`, context);
    }

    const antes = new Set(vm.runInContext("Object.getOwnPropertyNames(globalThis)", context));

    try {
        vm.runInContext(source, context);
    } catch (error) {
        // `instanceof` NO vale aqui: el error nace en el realm del contexto `vm`, asi que su
        // constructor no es el SyntaxError de este realm y la comprobacion daria siempre false.
        if (error.name === "SyntaxError") return error.message;
        // Cualquier otro error (tipicamente `document is not defined`) significa que el fichero paso
        // la instanciacion y solo se queja de que aqui no hay DOM. Seguimos: las fugas de mas abajo
        // ya se han producido, porque `var` y `function` se enganchan al objeto global al instanciar.
    }

    // Segunda comprobacion, y la que de verdad vigila la regla de la IIFE. La de arriba solo salta
    // ante la CONJUNCION "fichero sin envolver Y nombre que Tauri tambien usa": un `.js` sin IIFE con
    // nombres inocentes la pasa limpio hoy y queda armado para el dia que alguien elija un nombre
    // colisionante. Un fichero correctamente envuelto no filtra NADA al objeto global; uno sin
    // envolver filtra sus `var` y sus `function`.
    //
    // Limitacion honesta, mejor escrita que fingida: un fichero sin envolver que solo declare
    // `const`/`let`/`class` no filtra nada y pasa las dos comprobaciones. Cubrir tambien ese caso
    // exigiria un chequeo estructural del top level, que no compensa por ahora.
    const fugas = vm.runInContext("Object.getOwnPropertyNames(globalThis)", context)
        .filter((name) => !antes.has(name));
    if (fugas.length > 0) {
        return `declara en el ambito global: ${fugas.join(", ")} (el fichero no esta envuelto en una IIFE)`;
    }

    return null;
}

// El otro invariante que este proyecto acaba de crear y que nadie vigilaba: con el JS encerrado en
// una IIFE, un `onclick=` inline no puede resolver la funcion y el boton queda inerte SIN ningun
// error en consola — el mismo sintoma que costo la v0.2.0, y mas facil de reintroducir todavia,
// porque escribir `onclick=` es lo que cualquiera hace por defecto al anadir un boton a HTML plano.
// Aqui una expresion regular SI es la herramienta correcta: buscamos un atributo HTML literal, no
// estamos aproximando la gramatica de un lenguaje.
const MANEJADOR_INLINE = /\son[a-z]+\s*=\s*["']/gi;

function findInlineHandlers(source) {
    const encontrados = [...source.matchAll(MANEJADOR_INLINE)].map((m) => m[0].trim());
    return encontrados.length > 0 ? [...new Set(encontrados)] : null;
}

// Sobre la lista de assets, no sobre un nombre de fichero codificado a mano: cualquier `.js` que se
// añada mañana al bundle queda cubierto por construcción, sin que nadie tenga que acordarse.
for (const asset of assets.filter((name) => name.endsWith(".js"))) {
    const fatal = findFatalError(await readFile(join(repoRoot, asset), "utf8"));
    if (fatal) {
        console.error(`
${asset} incumple la regla de ámbito global:

    ${fatal}

Los scripts clásicos comparten un único ámbito, y ahí Tauri inyecta nombres propios. Una colisión
rompe el fichero entero en *parseo* — la app abre y renderiza, pero ningún botón responde — y un
fichero sin envolver es esa colisión esperando a que alguien elija el nombre equivocado.

Envuelve el fichero en su propia IIFE: \`(function () {\` … \`})();\`
Ver dbv-specs-ops/docs/ARCHITECTURE.md, sección Estilo de Código.
`);
        process.exit(1);
    }
}

for (const asset of assets.filter((name) => name.endsWith(".html"))) {
    const inline = findInlineHandlers(await readFile(join(repoRoot, asset), "utf8"));
    if (inline) {
        console.error(`
${asset} tiene manejadores de eventos inline: ${inline.join(", ")}

Con el JS encerrado en una IIFE, un atributo inline no puede resolver la función porque esta ya no
es global: el control queda inerte y no aparece ningún error en consola. Cablea el evento con
addEventListener desde dentro de la IIFE — ver dbv-specs-ops/docs/ARCHITECTURE.md, Estilo de Código.
`);
        process.exit(1);
    }
}

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

for (const asset of assets) {
    await cp(join(repoRoot, asset), join(outDir, asset), { recursive: true });
}

console.log(`Frontend sincronizado en ${outDir} (${assets.length} entradas)`);
