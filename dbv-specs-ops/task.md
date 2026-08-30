# Backlog — DBV Teleprompter

## Contexto del Proyecto (Context Snapshot)
* **Objetivo**: Convertir la PWA `dbv-teleprompter` en app de escritorio nativa con Tauri v2, manteniendo el modo web/PWA (modo dual obligatorio), y adoptar `dbv-specs-ops` como framework de trabajo con Claude Code como IA de soporte.
* **Estado actual**: Migración a Tauri v2 verificada y funcionando (Fases 0-7 del `MIGRATION_PROMPT.md` cerradas). Pantalla de setup rediseñada dos veces; la vigente es "Studio instrument" (ver `docs/DESIGN.md`).
* **Última decisión técnica**: Ver `memory.md` — modo dual innegociable, arquetipo A sin bundler, tema oscuro/claro real con fuentes de marca autoalojadas.
* **Próximo paso**: Actualizar `README.md` con la sección de instalación de escritorio y publicar el primer instalador (`git tag v0.1.0`). Después, checklist de tiendas.

## Checklist de Tareas

- [x] **Fase 0 (migración Tauri) — Clasificación:** Arquetipo A (estática pura) confirmado leyendo el repo: `index.html`+`style.css`+`script.js` sin build ni servidor, PWA real (`manifest.json`+`sw.js`), sin llamadas de red en `script.js` salvo la fuente de Google Fonts, sin tags `v*.*.*` (cero riesgo de colisión con los workflows de release de la plantilla).
- [x] **Fase 1 (migración Tauri) — Decisiones:** 1.1 Licencias N/A (sin backend). 1.2 Modo dual obligatorio (PWA con demo pública usada en móvil, per `WEB_TO_DESKTOP_MIGRATION.md` §3). 1.3 Rust vs sidecar N/A (sin backend).
- [x] **Fase 2.1 (migración Tauri):** Rama `feat/tauri-desktop` creada y verificada.
- [x] **Fase 2.2 (migración Tauri) — Adopción `dbv-specs-ops`:** Framework completo copiado a `dbv-specs-ops/`, `CLAUDE.md` añadido en raíz, `docs/SPECIFICATIONS.md`, `docs/ARCHITECTURE.md`, `project.config.md`, `memory.md` y este `task.md` rellenados con contenido real del proyecto. (Se hizo fuera de orden — después de la Fase 3 en vez de antes — y se corrigió en esta sesión.)
- [x] **Fase 3 (migración Tauri):** `src-tauri/` y los 3 workflows de release (`release-windows.yml`, `release-linux.yml`, `release-macos.yml`) copiados desde `dbv-tauri-starter`; `tauri.conf.json` (`productName`, `identifier`, `frontendDist: ".."`) y `Cargo.toml` personalizados para "DBV Teleprompter"; `package.json` mínimo con `@tauri-apps/cli` (`npm install` sin vulnerabilidades). Verificado con `cargo check --manifest-path .\src-tauri\Cargo.toml --target-dir D:\temp\dbv-teleprompter-tauri-verify` → exit code 0.
- [x] **Fase 4 (migración Tauri) — Conectar frontend:** `withGlobalTauri: true` y rama "sin bundler" del prompt. No hace falta tocar `script.js`: la app no llama a ningún comando Tauri, así que no hay puente `window.__TAURI__` que añadir. Si en el futuro se añade un fichero JS nuevo, debe ir en su propia IIFE (aviso del prompt para scripts clásicos). **`frontendDist` NO apunta a la raíz** sino a `src-tauri/frontend/`, generado por `scripts/sync-frontend.mjs` — ver el ADR del 2026-08-22 en `memory.md` para el porqué.
- [x] **Fase 5 (capa de adaptación):** N/A — solo aplica a apps con llamadas a `invoke()`/backend; esta app no tiene ninguna.
- [x] **Fase 6 (backend):** N/A — arquetipo A, sin backend que reescribir ni empaquetar como sidecar.
- [x] **Fase 7 (migración Tauri) — Verificación real (2026-08-22):** Ejecutada de verdad, no dada por hecha. Resultados:
  - [x] La app nativa arranca y **la interfaz responde** (no solo renderiza): UI completa con título, textarea, controles y footer de atajos.
  - [x] Funcionalidad principal en escritorio: entrada de texto OK; botones `+` de velocidad `1.0 → 1.3` y de fuente `40 → 44` OK; `Start Prompter` entra en vista negra a 44px con indicador rojo; scroll automático avanza; `Escape` vuelve a setup conservando texto y ajustes.
  - [x] `localStorage` persiste entre relanzamientos del proceso (el texto sobrevive al cierre). Velocidad y fuente vuelven a sus valores por defecto porque el código nunca las guardó — comportamiento original de la PWA, no regresión de Tauri.
  - [x] **El modo web sigue funcionando**: ficheros de la raíz intactos, los 6 recursos (`index.html`, `style.css`, `script.js`, `manifest.json`, `sw.js`, `icons/`) sirven HTTP 200. GitHub Pages sin tocar.
  - [x] Sidecar: N/A (no hay).
  - [x] `cargo test` pasa: 2/2 en `tauri_app_lib`, 0 fallos.
  - [x] `git status` no muestra `src-tauri/target/` ni `src-tauri/frontend/` — ambos ignorados correctamente.
- [x] **Fase 8 (migración Tauri) — Cierre:** Documentación actualizada (`SPECIFICATIONS.md`, `ARCHITECTURE.md`, `memory.md`, `CHANGELOG.md`, `NATIVE_APPS_RELEASE_CI.md`, `README.md`) ✅. Listo para publicar el primer release con `git tag v0.2.0 && git push origin v0.2.0`.
- [x] **Internacionalización (i18n) en modo dual (2026-08-22):** Implementación de soporte multilingüe (Español e Inglés) nativo en Vanilla JS sin dependencias (<2 KB). Detección automática por `navigator.language`, selector interactivo en header (`.header-actions`), persistencia en `localStorage` (`teleprompterLang`), traducción completa de la UI (`data-i18n*`), panel de atajos, toasts y estimación de tiempo. Sincronizado a Tauri con `sync-frontend.mjs` y caché PWA actualizada a v3.1.
- [x] **Gestión de archivos y título interactivo (2026-08-22):** Input interactivo de título persistido en `localStorage` (`teleprompterScriptTitle`), botones de Abrir (`.txt`, `.md`) y Guardar (`.txt`), soporte de arrastrar y soltar (drag & drop), capa dual nativa y traducciones asociadas. Sincronizado a Tauri y caché PWA v3.2.
- [x] **DoD de Experiencia de Escritorio Pulida (2026-08-22):**
  - [x] Diálogos nativos del SO (`rfd` en Rust, `showSaveFilePicker` en Web).
  - [x] Iconografía de marca generada con `app-icon.svg` y `tauri icon` para todas las plataformas.
  - [x] Selector segmentado en pastilla ES/EN (`.segmented-switcher` estilo DBV Markdown Reader).
  - [x] Atajos universales (`⌘S`/`Ctrl+S`, `⌘O`/`Ctrl+O`, `⌘Enter`, `Escape`) y menú nativo en macOS (`tauri::menu::Menu::default()`).
  - [x] Scrollbars oscuras (`::-webkit-scrollbar`) y ancho fluido al 100% de la ventana.
  - [x] Incorporada la sección §7 (DoD) en `docs/NATIVE_DESKTOP_APPS.md` y §8 en `docs/WEB_TO_DESKTOP_MIGRATION.md`.
- [ ] **v0.2.1 — Fase A (spec):** Corregir `docs/ARCHITECTURE.md` (IIFE obligatoria en *todos* los ficheros JS, no solo los nuevos; prohibido `onclick=` inline; recuento de líneas obsoleto; `frontendDist`) y registrar en `docs/SPECIFICATIONS.md` §6 el riesgo materializado. Es la causa raíz: la spec estrecha autorizaba el bug.
- [ ] **v0.2.1 — Fase B (envoltura):** `script.js` y `sw.js` envueltos cada uno en su IIFE. Cero declaraciones en ámbito global. Sin reindentar.
- [ ] **v0.2.1 — Fase C (cableado):** Sustituir los 10 `onclick=` de `index.html` por `addEventListener` dentro del `DOMContentLoaded`, siempre con arrow explícita (nunca por referencia: el Event llegaría como argumento numérico y produciría `NaN` — riesgo R1). Guarda `Number.isFinite` en `changeSpeed` y `changeFontSize`.
- [ ] **v0.2.1 — Fase D (test):** Puerta de build en verde, reconstruir MSIX y verificar sobre `target/appx/x64/` (no sobre `target/release/`, es otra compilación): 4 steppers sin `NaN`, los 10 controles vivos, diálogo nativo, privacidad, scroll. Y el SW registrando en modo web.
- [ ] **v0.2.1 — Fase E (cierre):** `/code-simplify` del nuevo diff y `/ship` con checklist de marketplace ampliado a Uptodown (macOS `.dmg` + Windows `.exe`), no solo Microsoft Store.
- [ ] **Preparar publicación en Microsoft Store:** Seguir checklist de `dbv-specs-ops/docs/MARKETPLACE_PUBLISHING.md` (identidad MSIX, formulario de certificación).
- [ ] **Preparar publicación en Uptodown:** Seguir la parte correspondiente de `dbv-specs-ops/docs/MARKETPLACE_PUBLISHING.md`.

---

## 🔄 Context Snapshot / Snapshot de Contexto

> **Last update / Última actualización:** 2026-08-30
> **Exact point / Punto exacto:** v0.2.0 publicada en Microsoft Store, Uptodown y GitHub Releases con la interfaz MUERTA en las tres plataformas (`const isTauri` colisionaba con un global de Tauri y mataba `script.js` entero en parseo). Arreglo mínimo aplicado y verificado sobre el binario real; puerta de build añadida en `sync-frontend.mjs`. `/spec` y `/plan` de la v0.2.1 completados — ver `implementation_plan.md`.
> **Pending / Pendiente:** Aprobación del plan y ejecución de las Fases A-E. El MSIX 0.2.1 ya construido queda invalidado en cuanto se toque `script.js`.
> **Next step / Próximo paso:** `/build` — Fase A (corregir `ARCHITECTURE.md`), luego envoltura IIFE y cableado de los 10 `onclick`.
