# Backlog — DBV Teleprompter

## Contexto del Proyecto (Context Snapshot)
* **Objetivo**: Convertir la PWA `dbv-teleprompter` en app de escritorio nativa con Tauri v2, manteniendo el modo web/PWA (modo dual obligatorio), y adoptar `dbv-specs-ops` como framework de trabajo con Claude Code como IA de soporte.
* **Estado actual**: Adopción de `dbv-specs-ops` completada (Fase 2.2 de `MIGRATION_PROMPT.md`, hecha fuera de orden — se saltó al empezar la migración y se ha corregido ahora). El antiguo `task.md` de la raíz (bitácora paso a paso de `MIGRATION_PROMPT.md`) se ha fusionado aquí y se ha eliminado; este fichero es ahora la única fuente de verdad del backlog.
* **Última decisión técnica**: Ver `memory.md` — modo dual innegociable, arquetipo A sin bundler, publicación en tiendas pospuesta a validación funcional real de la app de escritorio.
* **Próximo paso**: Retomar la Fase 4 del `MIGRATION_PROMPT.md` de `dbv-tauri-starter` (conectar `script.js`/`index.html` al puente `window.__TAURI__`), luego probar la app de verdad con `npm run tauri dev`.

## Checklist de Tareas

- [x] **Fase 0 (migración Tauri) — Clasificación:** Arquetipo A (estática pura) confirmado leyendo el repo: `index.html`+`style.css`+`script.js` sin build ni servidor, PWA real (`manifest.json`+`sw.js`), sin llamadas de red en `script.js` salvo la fuente de Google Fonts, sin tags `v*.*.*` (cero riesgo de colisión con los workflows de release de la plantilla).
- [x] **Fase 1 (migración Tauri) — Decisiones:** 1.1 Licencias N/A (sin backend). 1.2 Modo dual obligatorio (PWA con demo pública usada en móvil, per `WEB_TO_DESKTOP_MIGRATION.md` §3). 1.3 Rust vs sidecar N/A (sin backend).
- [x] **Fase 2.1 (migración Tauri):** Rama `feat/tauri-desktop` creada y verificada.
- [x] **Fase 2.2 (migración Tauri) — Adopción `dbv-specs-ops`:** Framework completo copiado a `dbv-specs-ops/`, `CLAUDE.md` añadido en raíz, `docs/SPECIFICATIONS.md`, `docs/ARCHITECTURE.md`, `project.config.md`, `memory.md` y este `task.md` rellenados con contenido real del proyecto. (Se hizo fuera de orden — después de la Fase 3 en vez de antes — y se corrigió en esta sesión.)
- [x] **Fase 3 (migración Tauri):** `src-tauri/` y los 3 workflows de release (`release-windows.yml`, `release-linux.yml`, `release-macos.yml`) copiados desde `dbv-tauri-starter`; `tauri.conf.json` (`productName`, `identifier`, `frontendDist: ".."`) y `Cargo.toml` personalizados para "DBV Teleprompter"; `package.json` mínimo con `@tauri-apps/cli` (`npm install` sin vulnerabilidades). Verificado con `cargo check --manifest-path .\src-tauri\Cargo.toml --target-dir D:\temp\dbv-teleprompter-tauri-verify` → exit code 0.
- [ ] **Fase 4 (migración Tauri) — Conectar frontend:** Añadir el puente `window.__TAURI__` a `script.js` (en su propia IIFE si se crea un fichero nuevo). Decidir si se vendoriza la fuente de Google Fonts.
- [ ] **Probar la app de escritorio de verdad:** `npm run tauri dev`, verificar ventana, atajos de teclado, scroll, `localStorage` — no solo que compile el core Rust.
- [ ] **Fase 5 (migración Tauri, si aplica):** Comandos Rust custom — probablemente ninguno necesario (arquetipo A sin backend).
- [ ] **Preparar publicación en Microsoft Store:** Seguir checklist de `dbv-specs-ops/docs/MARKETPLACE_PUBLISHING.md` (identidad MSIX, formulario de certificación). **Bloqueado hasta validar que la app funciona.**
- [ ] **Preparar publicación en Uptodown:** Seguir la parte correspondiente de `dbv-specs-ops/docs/MARKETPLACE_PUBLISHING.md`. **Bloqueado hasta validar que la app funciona.**
- [ ] **(Opcional, sin decidir)** Vendorizar la fuente de Google Fonts localmente para que el modo escritorio no dependa de red en el primer arranque.
- [ ] **(Opcional, sin decidir)** Añadir tests — hoy no hay ninguno.

---

## 🔄 Context Snapshot / Snapshot de Contexto

> **Last update / Última actualización:** 2026-08-22
> **Exact point / Punto exacto:** `dbv-specs-ops/` adoptado y rellenado con contenido real del proyecto; `CLAUDE.md` creado en la raíz. La migración a Tauri sigue exactamente donde la dejó el `task.md` de la raíz: core Rust compilando en verificación aislada, `tauri.conf.json` con `frontendDist`/`withGlobalTauri` ya configurados, pero el puente JS↔Tauri todavía no existe.
> **Pending / Pendiente:** Ninguno de proceso — el `task.md` de la raíz se fusionó aquí y se eliminó.
> **Next step / Próximo paso:** Ejecutar la Fase 4 del `MIGRATION_PROMPT.md` de `dbv-tauri-starter`.
