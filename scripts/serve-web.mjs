// =============================================================================
// DBV Teleprompter — PWA + app de escritorio para leer texto en scroll
// Copyright (c) 2026 David Bueno Vallejo
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================
//
// Servidor estático mínimo para el modo web/PWA, sin dependencias externas.
//
// Por qué no `npx serve`: este proyecto es offline-first y el binario de escritorio no puede
// depender de la red ni para desarrollarse. Un servidor de 60 líneas sobre `node:http` evita
// una descarga en la primera ejecución y funciona igual en Windows, macOS y Linux.
//
// Para qué sirve de verdad: el Service Worker sólo se registra bajo HTTP(S), nunca con `file://`.
// Abrir `index.html` a doble clic NO ejerce el modo PWA. Este servidor es la única forma de
// probar el registro del worker, la caché y el comportamiento offline antes de publicar.

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.env.PORT) || 8080;

const TIPOS = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".woff2": "font/woff2",
};

createServer(async (req, res) => {
    // Sin caché: si el navegador reutiliza un `index.html` viejo con un `script.js` nuevo, el
    // síntoma es la interfaz muerta — el mismo fallo que costó la v0.2.0. En desarrollo eso es
    // ruido puro, así que se sirve siempre fresco.
    res.setHeader("Cache-Control", "no-store");

    // Registrar las peticiones no es adorno: es la única forma de ver desde fuera si el Service
    // Worker se instaló. Al instalarse dispara `cache.addAll` sobre las 13 URLs, y con
    // `cache: 'reload'` esas peticiones llegan marcadas como no-cache. Ver ese ramillete en el log
    // prueba el registro sin necesidad de abrir DevTools.
    const marca = req.headers["cache-control"] === "no-cache" ? " [SW addAll]" : "";
    console.log(`${new Date().toISOString().slice(11, 19)}  ${req.method} ${req.url}${marca}`);

    const ruta = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    const relativa = normalize(ruta === "/" ? "index.html" : ruta.slice(1));

    // Evita salir de la raíz del repo con `..`
    if (relativa.startsWith("..")) {
        res.writeHead(403).end("403 — fuera de la raíz del proyecto");
        return;
    }

    try {
        const contenido = await readFile(join(repoRoot, relativa));
        res.writeHead(200, { "Content-Type": TIPOS[extname(relativa)] || "application/octet-stream" });
        res.end(contenido);
    } catch {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        res.end(`404 — no encontrado: ${relativa}`);
    }
}).listen(port, () => {
    console.log(`DBV Teleprompter (modo web) en http://localhost:${port}`);
    console.log("El Service Worker sólo se registra bajo HTTP; con file:// no se ejerce el modo PWA.");
});
