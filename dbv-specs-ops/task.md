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
- [ ] **Fase 8 (migración Tauri) — Cierre:** Documentación actualizada (`SPECIFICATIONS.md`, `ARCHITECTURE.md`, `memory.md`, `CHANGELOG.md`) ✅. Pendiente: actualizar `README.md` con instrucciones de instalación de escritorio, y publicar el primer instalador con `git tag v0.1.0 && git push origin v0.1.0`.
- [x] **Rediseño "Studio instrument" de la pantalla de setup (2026-08-22):** A partir de un handoff de alta fidelidad de Claude Design. Ver `dbv-specs-ops/docs/DESIGN.md`. Incluye tema oscuro/claro persistido, fuentes Newsreader/Nunito autoalojadas en `fonts/` (cierra definitivamente la pregunta de Google Fonts — vendorizadas, no CDN, no eliminadas), panel de teclas convertido a overlay deslizante, estadísticas del guion dependientes de la velocidad. Verificado ejecutando la app: ambos temas, panel de teclas, steppers, vista de prompting heredando color/tipografía. `cargo test` 2/2. Modo web con los 9 recursos (incluidas las 4 fuentes) sirviendo 200.
- [ ] **Preparar publicación en Microsoft Store:** Seguir checklist de `dbv-specs-ops/docs/MARKETPLACE_PUBLISHING.md` (identidad MSIX, formulario de certificación).
- [ ] **Preparar publicación en Uptodown:** Seguir la parte correspondiente de `dbv-specs-ops/docs/MARKETPLACE_PUBLISHING.md`.
- [ ] **(Opcional, sin decidir)** Añadir tests — hoy no hay ninguno.

---

## 🔄 Context Snapshot / Snapshot de Contexto

> **Last update / Última actualización:** 2026-08-22
> **Exact point / Punto exacto:** Fases 0-7 del `MIGRATION_PROMPT.md` cerradas y verificadas. Pantalla de setup en su segundo rediseño ("Studio instrument", handoff de Claude Design), también verificado ejecutando la app en ambos temas.
> **Pending / Pendiente:** Fase 8 a medias — documentación SDD actualizada, falta `README.md` y el tag de release.
> **Next step / Próximo paso:** Añadir sección de instalación de escritorio al `README.md`, luego `git tag v0.1.0 && git push origin v0.1.0` para que los 3 workflows generen el primer instalador.
