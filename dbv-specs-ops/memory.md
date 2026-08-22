# 🧠 Memory & Context

> **Frontera de uso (Memory vs. Tasks):**
> - `task.md` → progreso **operativo**: checklist de tareas, Snapshot de Contexto (el paso exacto siguiente), y estado de la sesión.
> - `memory.md` → contexto **cualitativo y temático**: conocimiento persistente, decisiones técnicas profundas, lecciones, y el área del producto en foco (no el paso específico).
> Si hay info que sirva para los dos, prioriza: datos con fecha/paso exacto → `task.md`; razonamiento/por-qué/lecciones → `memory.md`.
>
> *Instrucción para la IA: Consulta este archivo al inicio de cada sesión para recuperar el hilo técnico. Actualiza las secciones correspondientes cuando el workflow lo indique (triggers en `/plan`, `/build`, `/test` y gate en `/ship`).*

## 🎯 Contexto Activo
- **Estado actual del desarrollo:** Migración de la PWA a app de escritorio nativa con Tauri v2 (dual web+escritorio), siguiendo `dbv-tauri-starter`. Adopción retroactiva del framework `dbv-specs-ops` completada en esta sesión.
- **Foco inmediato:** Completar la Fase 4 (conectar `script.js`/`index.html` al puente `window.__TAURI__`) y probar la app de escritorio de verdad (no solo `cargo check` aislado) antes de preparar la publicación en Microsoft Store y Uptodown.

## 🏗️ Log de Decisiones Técnicas (ADR Ligero)

- **2026-08-22 - Adopción de `dbv-specs-ops` a mitad de migración Tauri:** La migración a Tauri se había empezado sin ejecutar la Fase 2.2 del `MIGRATION_PROMPT.md` (adoptar `dbv-specs-ops`), a pesar de que el propio `task.md` de la migración ya admitía que faltaba por hacer. Se detectó y corrigió antes de seguir con la Fase 4, para no acumular más deuda de proceso. Se copió el framework completo (no solo los 3 ficheros mínimos del `ADOPTION_PROMPT.md`) porque el usuario pidió explícitamente activar a Claude como IA de soporte (implica `CLAUDE.md` en raíz + `docs/MASTER_PROMPT.md`) y ya tiene intención de publicar en tiendas (implica `docs/NATIVE_APPS_RELEASE_CI.md` y `docs/MARKETPLACE_PUBLISHING.md`, que son justo los documentos que el framework generó a partir de una publicación real previa de David en Microsoft Store/Uptodown con otro proyecto Tauri).
- **2026-08-22 - Modo dual web+escritorio es innegociable:** La PWA tiene demo pública en GitHub Pages y el README anuncia instalación en desktop y móvil. Retirar el modo web rompería ese caso de uso — no se contempla como opción, ni siquiera a futuro.
- **2026-08-22 - Sin bundler, sin reescritura en Rust:** Arquetipo A (estática pura) según `docs/WEB_TO_DESKTOP_MIGRATION.md`. `frontendDist` apunta directamente a la raíz del repo; no hay backend que migrar a comandos `#[tauri::command]` ni justificación para un sidecar.
- **2026-08-22 - Publicación en tiendas pospuesta a validación funcional:** Antes de tocar `docs/MARKETPLACE_PUBLISHING.md` en serio (identidad MSIX, firma, formularios de Uptodown), hay que confirmar que el binario generado por Tauri funciona igual que la PWA — hoy solo se ha verificado que el *core* Rust compila (`cargo check`), no que la app arranque y funcione.

## ⚠️ Lecciones Aprendidas / Errores Evitados

- **[Gate de migración saltado]:** Un `task.md` de migración puede documentar honestamente que falta un paso (Fase 2.2) y aun así el "Estado actual" avanzar como si no faltara. Al retomar una migración desde un fichero de continuidad, releer también las fases marcadas como pendientes en la Fase 0, no solo la sección "Estado actual tras esta sesión".

## 🗺️ Mapa de Relaciones

- **`script.js`:** Contiene toda la lógica de la app (teleprompter, atajos configurables, `localStorage`). Único fichero JS hoy — cualquier fichero nuevo (p.ej. el puente Tauri) debe ir en su propia IIFE para no colisionar con él en el ámbito global compartido de los scripts clásicos.
- **`src-tauri/`:** Core Rust generado por `dbv-tauri-starter`, sin comandos custom todavía. `tauri.conf.json` ya tiene `frontendDist: ".."` y `withGlobalTauri: true`, adelantado respecto al resto de la Fase 4.

---

## 🧹 Política de Mantenimiento

*Aplicar en cada `/ship` de tipo Major, o cuando este fichero supere las 200 líneas activas:*

- **Consolida** decisiones relacionadas en una sola entrada.
- **Archiva** lecciones ya internalizadas en el código: muévelas a `memory.archive.md` (créalo si no existe).
- **Elimina** entradas que describan decisiones revertidas o ya obsoletas.
- **Objetivo:** mantener `memory.md` por debajo de ~200 líneas activas para que la IA pueda leerlo íntegramente en cada sesión sin pérdida de atención.
