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

import { cp, mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(repoRoot, "src-tauri", "frontend");

// Todo lo que la app necesita para funcionar. `sw.js` y `manifest.json` se copian también: son
// inertes bajo el protocolo de Tauri, pero mantienen los dos modos partiendo de ficheros idénticos.
const assets = ["index.html", "style.css", "script.js", "manifest.json", "sw.js", "icons"];

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

for (const asset of assets) {
    await cp(join(repoRoot, asset), join(outDir, asset), { recursive: true });
}

console.log(`Frontend sincronizado en ${outDir} (${assets.length} entradas)`);
