# Changelog — DBV Teleprompter

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

---

## [0.2.1] — 2026-08-30

### Added

- **Capturador global de errores de JavaScript**, inline y primero del `<head>`, que pinta el fallo en un banner rojo dentro de la propia página. Es la mitad no implementada de `docs/NATIVE_DESKTOP_APPS.md` §3: la IIFE cierra un mecanismo concreto de muerte silenciosa, pero el capturador hace **visible** cualquier otro. En un WebView de escritorio no hay DevTools que abrir, así que el banner es el equivalente práctico de la consola — y es lo que habría convertido el fallo de la v0.2.0 en obvio a los cinco segundos en vez de después de publicarlo.

### Fixed

- **La interfaz de escritorio estaba completamente muerta.** Tauri v2 define `window.isTauri` con `Object.defineProperty` antes de que corra ningún script propio; el `const isTauri` de nivel superior de `script.js` colisionaba con él y mataba el fichero entero con un `SyntaxError` de *parseo*, así que ni su primera línea llegaba a ejecutarse. La app renderizaba perfecta —HTML y CSS no dependen del JS— y solo respondía el `textarea`, que es nativo. Afectaba a **las tres plataformas** de la v0.2.0 (Microsoft Store, Uptodown y GitHub Releases: Windows, macOS y Linux), no solo a la Store.
- El enlace a la política de privacidad del pie apuntaba a un 404 en los dos modos: `privacy.html` y `privacidad.html` no viajaban en el bundle de escritorio ni estaban en la caché del Service Worker.

### Changed

- **`script.js` y `sw.js` van envueltos cada uno en su IIFE**, con cero declaraciones en el ámbito global. Elimina de raíz la clase de fallo por colisión con los globales de Tauri, en vez de protegerla nombre a nombre. Corrige de paso `docs/ARCHITECTURE.md`, que limitaba la regla a los ficheros JS *nuevos* y por tanto eximía a `script.js` — esa redacción es lo que autorizó el bug.
- **Eliminados los 10 atributos `onclick=` inline de `index.html`**, sustituidos por `addEventListener` cableado desde dentro de la IIFE, siempre con arrow explícita. `changeSpeed` y `changeFontSize` ganan una guarda `Number.isFinite`: si algún día se cablean por referencia, el `Event` llegaría como importe y produciría `NaN` en silencio.
- **Puerta de calidad en `scripts/sync-frontend.mjs`**, ejecutada en cada `dev`/`build` y en los tres workflows de release vía `tauri-action`. Comprueba tres cosas: (1) que cada `.js` del bundle sobreviva a la instanciación en un contexto `node:vm` con los globales que Tauri inyecta; (2) que **no filtre nada al ámbito global**, que es lo que de verdad vigila la regla de la IIFE — la comprobación (1) sola solo salta ante la conjunción "sin envolver *y* con un nombre colisionante", así que un fichero sin IIFE con nombres inocentes la pasaba limpio y quedaba armado; (3) que ningún `.html` del bundle tenga manejadores `on*=` inline, el invariante que este trabajo crea y que si no nadie sostendría. La (1) usa el motor de JS real, no una regex: una heurística de texto se comía las formas indentada, `const { x } = ...` y multi-declarador, las tres igual de letales.
- **Caché del Service Worker a `v4.0`, y `cache.addAll` con `cache: 'reload'`.** El refactor volvió `index.html` y `script.js` mutuamente obligatorios: un `index.html` viejo (con `onclick=`) servido junto a un `script.js` nuevo (con IIFE) da botones muertos y cero errores. Sin `'reload'`, los `fetch` de la reinstalación pasan por la caché HTTP del navegador y nada garantiza que ambos ficheros se revaliden en la misma ventana — reproduciría el fallo de la v0.2.0 en el canal PWA, y encima sin ser reproducible en local.

### Security

- El guion del usuario deja de pasar por `innerHTML`. Con `csp: null` y `withGlobalTauri: true`, un `<img onerror>` incrustado en un `.md` abierto tenía acceso a `window.__TAURI__.core.invoke` y a la red. Se usa `textContent`; el reemplazo por `<br>` era redundante porque `#teleprompter-text` ya declara `white-space: pre-wrap`.

## [0.2.0] — 2026-08-22

### Added (Versión Escritorio Nativa + Rediseño Studio Instrument)
- **Rediseño "Studio instrument"** de la pantalla de configuración, a partir de un handoff de alta fidelidad generado con Claude Design: header con marca, panel de guion sin caja (misma tipografía que la lectura), inspector lateral fijo con steppers segmentados y lista de atajos, barra de transporte inferior. Sustituye por completo la dirección visual del rediseño anterior — ver `dbv-specs-ops/docs/DESIGN.md`.
- **Tema oscuro/claro real**, con conmutador persistido en `localStorage` y sin flash de tema incorrecto al cargar (aplicado antes del primer pintado).
- **Fuentes de marca autoalojadas**: Newsreader (guion y lectura) y Nunito (lecturas numéricas), como `woff2` locales en `fonts/` — nunca CDN, el binario de escritorio debe funcionar sin red.
- Panel de configuración de teclas convertido de sección siempre visible a **panel deslizante** con velo, cerrable con `Esc`, clic fuera o el botón de cierre.
- **Internacionalización (i18n) completa (Español / Inglés)** en modo dual (Web + Escritorio): diccionario nativo en Vanilla JS (<2 KB) sin librerías externas, detección automática por `navigator.language`, selector manual interactivo en el header (`#lang-toggle`), persistencia en `localStorage` (`teleprompterLang`), traducción de toda la UI (`data-i18n*`), pluralización dinámica de palabras y tiempos (`N words · m:ss` / `N palabras · m:ss`), atajos y toasts.
- **Gestión de archivos y título interactivo del guion:** subtítulo editable con persistencia en `localStorage` (`teleprompterScriptTitle`), botones de Abrir (`.txt`, `.md`) y Guardar/Exportar (`.txt`), y soporte para arrastrar y soltar (drag & drop) archivos directamente sobre el área de texto.
- **Diálogos de archivo nativos del sistema operativo:** integración con `rfd` (Rust File Dialog) en Tauri y `showSaveFilePicker()` (File System Access API) en la Web para abrir la ventana nativa "Guardar como..." / "Abrir..." en vez de descargas automáticas a ciegas.
- **Iconografía de marca oficial:** icono personalizado generado con vector maestro `app-icon.svg` y distribuido vía `tauri icon` a todas las plataformas (`.ico`, `.icns`, Microsoft Store / Appx PNGs y PWA).
- **Selector de idioma segmentado en pastilla:** componente idéntico a DBV Markdown Reader (`[ (ES) | EN ]`) con estados activos resaltados.
- **Atajos de teclado universales de escritorio:** `⌘S`/`Ctrl+S` para guardar, `⌘O`/`Ctrl+O` para abrir, `⌘Enter`/`Ctrl+Enter` para iniciar teleprompter y `Escape` para salir/cerrar, funcionales incluso mientras se edita texto.
- **Soporte de menús nativos en macOS:** configuración de `tauri::menu::Menu::default()` para habilitar barra de menús del sistema y atajos estándar (`⌘Q`, `⌘W`, `⌘C`, `⌘V`, `⌘A`) en macOS.
- **Scrollbars oscuras personalizadas y ancho completo:** eliminación de la barra blanca del sistema, pista transparente, tiradores integrados con el tema activo y eliminación del límite `max-width: 64ch` para aprovechar el 100% de la pantalla.
- Estadísticas del guion en una sola línea (`N words · m:ss` / `N palabras · m:ss`), con el tiempo estimado recalculado también al cambiar la velocidad de scroll.

### Added
- Adopción del framework `dbv-specs-ops` v2.6.0 (Spec-Driven Development) en `dbv-specs-ops/`, con `CLAUDE.md` en la raíz como fichero de activación para Claude Code.
- Base de Tauri v2 para empaquetar la app como escritorio nativo (Windows/macOS/Linux) en modo dual junto a la PWA: `src-tauri/`, workflows de release en `.github/workflows/`, `package.json` mínimo con `@tauri-apps/cli`.
- `scripts/sync-frontend.mjs`: copia los ficheros estáticos de la raíz a `src-tauri/frontend/` (git-ignored) antes de cada `dev`/`build` de Tauri, vía `beforeDevCommand`/`beforeBuildCommand`.
- `.gitignore` en la raíz (no existía).
- **Rediseño completo de la pantalla de configuración** siguiendo el nuevo `dbv-specs-ops/docs/DESIGN.md`: identidad propia con el nombre correcto del producto (antes solo decía "Teleprompter"), logotipo, jerarquía con títulos de sección en versalitas, steppers segmentados en lugar de botones sueltos, atajos representados como teclas, y **modo oscuro automático** vía `prefers-color-scheme` — pensado para quien prepara una grabación en un estudio a oscuras. La vista de prompting en marcha se deja intacta a propósito. Créditos al autor con enlace a davidbuenov.com y al repositorio.
- **Contador de palabras y duración estimada** del guion (a 140 palabras/minuto), junto a la etiqueta del campo de texto.

### Changed
- Tipografía: se pasa a la *system font stack* y **se elimina la dependencia de Google Fonts**, el único recurso de red que tenía la app. El binario de escritorio ya no necesita conexión en el primer arranque para renderizar correctamente.
- `alert()` sustituido por un toast propio al guardar los atajos y al intentar arrancar sin texto: los diálogos nativos son ajenos al sistema de diseño y se comportan de forma irregular entre los WebViews de cada plataforma.
- El Service Worker ya **no se registra en la app de escritorio** (y se desregistra si quedó de una build previa): los assets ya viajan dentro del binario, así que no aportaba nada offline y sí causaba daño — al servir cache-first, una copia antigua de la interfaz sobrevivía a la actualización del binario.

### Fixed
- **La app de escritorio abría una ventana negra inservible con `ERR_CONNECTION_REFUSED` contra `127.0.0.1`.** `frontendDist` apuntaba a la raíz del repo, así que Tauri embebía recursivamente también `src-tauri/`, incluido su `target/` — sin `index.html` resoluble, y con la compilación rompiéndose al toparse con `target/debug/.cargo-artifact-lock` bloqueado por Cargo (`os error 33`). Ahora `frontendDist` apunta a `src-tauri/frontend/`, una copia limpia generada con solo los ficheros de la app. El modo web/PWA no se ve afectado: los ficheros siguen en la raíz, que es lo que GitHub Pages publica.

---

## [0.1.0] — 2025-05-23

### Added
- Versión inicial de la PWA: teleprompter con pegado de texto, velocidad y tamaño de fuente ajustables, atajos de teclado configurables guardados en `localStorage`, Service Worker para uso offline y manifest instalable.

---

## Enlaces de comparación

- [Sin publicar]: https://github.com/davidbuenov/dbv-teleprompter/compare/v0.2.1...HEAD
- [0.2.1]: https://github.com/davidbuenov/dbv-teleprompter/compare/v0.2.0...v0.2.1
- [0.2.0]: https://github.com/davidbuenov/dbv-teleprompter/releases/tag/v0.2.0

## How to read this file

- **Added** — new features or files.
- **Changed** — changes to existing functionality or documentation.
- **Deprecated** — features that will be removed in a future release.
- **Removed** — features removed in this release.
- **Fixed** — bug fixes.
- **Security** — security vulnerability fixes.
