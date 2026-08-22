# Backlog — DBV Teleprompter

## Contexto del Proyecto (Context Snapshot)
* **Objetivo**: Convertir la PWA `dbv-teleprompter` en app de escritorio nativa con Tauri v2, manteniendo el modo web/PWA (modo dual obligatorio), y adoptar `dbv-specs-ops` como framework de trabajo con Claude Code como IA de soporte.
* **Estado actual**: Adopción de `dbv-specs-ops` completada (Fase 2.2 de `MIGRATION_PROMPT.md`, hecha fuera de orden — se saltó al empezar la migración y se ha corregido ahora). El antiguo `task.md` de la raíz (bitácora paso a paso de `MIGRATION_PROMPT.md`) se ha fusionado aquí y se ha eliminado; este fichero es ahora la única fuente de verdad del backlog.
* **Última decisión técnica**: Ver `memory.md` — modo dual innegociable, arquetipo A sin bundler, publicación en tiendas pospuesta a validación funcional real de la app de escritorio.
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
- [ ] **Preparar publicación en Microsoft Store:** Seguir checklist de `dbv-specs-ops/docs/MARKETPLACE_PUBLISHING.md` (identidad MSIX, formulario de certificación). **Bloqueado hasta validar que la app funciona.**
- [ ] **Preparar publicación en Uptodown:** Seguir la parte correspondiente de `dbv-specs-ops/docs/MARKETPLACE_PUBLISHING.md`. **Bloqueado hasta validar que la app funciona.**
- [ ] **(Opcional, sin decidir)** Vendorizar la fuente de Google Fonts localmente para que el modo escritorio no dependa de red en el primer arranque.
- [ ] **(Opcional, sin decidir)** Añadir tests — hoy no hay ninguno.

---

## 🔄 Context Snapshot / Snapshot de Contexto

> **Last update / Última actualización:** 2026-08-22
> **Exact point / Punto exacto:** Fases 0-7 del `MIGRATION_PROMPT.md` cerradas. **La app de escritorio funciona y está verificada ejecutándola de verdad** (UI, controles, scroll, atajos, `localStorage`), con el modo web/PWA intacto. Se resolvió el bug que la tenía inservible: `frontendDist` apuntaba a la raíz del repo y arrastraba `src-tauri/target/` al árbol de assets — ahora hay un paso de sincronización a `src-tauri/frontend/`.
> **Pending / Pendiente:** Fase 8 a medias — documentación SDD actualizada, falta `README.md` y el tag de release.
> **Next step / Próximo paso:** Añadir sección de instalación de escritorio al `README.md`, luego `git tag v0.1.0 && git push origin v0.1.0` para que los 3 workflows generen el primer instalador.
