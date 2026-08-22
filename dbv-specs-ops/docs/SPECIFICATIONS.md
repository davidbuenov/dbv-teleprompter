# 📋 Especificaciones: DBV Teleprompter

> **Fase:** `/spec` (Especificación)
> **Estado:** Validado (adopción retroactiva sobre app existente)
> **Última Revisión:** 2026-08-22

---

## 🎯 1. Contexto y Objetivos

- **Problema:** Los usuarios que necesitan leer un guion en voz alta (streamers, presentadores, grabaciones caseras) no tienen una herramienta simple, gratuita y offline para desplazar el texto a velocidad controlada. `[CONFIRMADO]`
- **Objetivo (Éxito):** Una app instalable — como PWA en navegador/móvil y como binario nativo de escritorio (Windows/macOS/Linux) — donde el usuario pega su texto, ajusta velocidad y tamaño de fuente, y lo lee con scroll automático, sin conexión a internet salvo la carga inicial de una fuente de Google Fonts. `[INFERIDO]`

## 👥 2. Usuarios y Escenarios

- **Perfil de Usuario:** Personas que graban vídeo/audio y necesitan leer un texto de forma natural (creadores de contenido, presentadores, uso personal). `[INFERIDO]`
- **Escenarios Clave:**
  - *Escenario A:* El usuario pega un guion largo, ajusta velocidad de scroll y tamaño de letra con atajos de teclado configurables, y lee mientras graba.
  - *Escenario B:* El usuario instala la app en el escritorio (Tauri) para tenerla como programa independiente, sin depender del navegador ni de estar online.

## ✨ 3. Funcionalidades Principales (Requisitos)

- [x] **Pegar y leer texto:** Área de texto grande donde pegar el guion.
- [x] **Velocidad de scroll ajustable:** Botones en pantalla + atajos de teclado configurables.
- [x] **Tamaño de fuente ajustable:** Botones en pantalla + atajos de teclado configurables.
- [x] **Atajos de teclado configurables:** Play/Pausa, velocidad, tamaño de fuente, nudge de texto, salir — personalizables y guardados en `localStorage`.
- [x] **Modo PWA:** Instalable en escritorio y móvil, funciona offline (app shell cacheada por Service Worker).
- [x] **Modo escritorio nativo (Tauri v2):** Empaquetado como binario nativo, en modo dual (no sustituye a la PWA). **Verificado funcionando en Windows** el 2026-08-22 (UI, controles, scroll, atajos, `localStorage`). Plataformas objetivo: Windows, macOS y Linux — macOS y Linux se compilan en CI y aún no se han probado sobre hardware real.
- [ ] **Publicación en tiendas:** Distribución en Microsoft Store y Uptodown. **Desbloqueado** — la validación funcional que lo condicionaba ya está hecha. Canal de distribución: GitHub Releases (los 3 workflows generan los instaladores) más las dos tiendas. Ver `docs/MARKETPLACE_PUBLISHING.md`.

## 🏗️ 4. Propuesta de Solución Técnica (Resumen)

- **Enfoque:** Arquetipo A (estática pura) según `docs/WEB_TO_DESKTOP_MIGRATION.md` — sin paso de build, sin backend. Tauri v2 envuelve el mismo `index.html`/`style.css`/`script.js` (`frontendDist` apuntando a la raíz, `withGlobalTauri: true`), sin reescribir nada en Rust más allá del core generado por la plantilla.
- **Dependencias Críticas:** Ninguna dependencia de red en tiempo de ejecución salvo la fuente de Google Fonts (pendiente decidir si se vendoriza).
- **Oportunidades de Skills y MCPs**: N/A — app sin backend ni datos externos que orquestar.
- **Sistema de Diseño:** No se ha definido `docs/DESIGN.md` todavía; el estilo actual vive en `style.css`. Opcional, no bloqueante.

### 4.1. Agent Readiness Checklist (Proyectos Web)

No aplica — `Agent Readiness (Web)` está marcado como `No` en `project.config.md`. Es una app cliente sin superficie de API pública que ofrecer a agentes externos.

## 🚫 5. Fuera de Alcance (Out of Scope)

- [ ] Sustituir o retirar el modo web/PWA — el modo dual es una decisión inamovible (ver `docs/WEB_TO_DESKTOP_MIGRATION.md` y `memory.md`).
- [ ] Backend, cuentas de usuario o sincronización en la nube — la app es 100% local/cliente.
- [ ] Sidecars o reescritura de lógica en Rust más allá del core de Tauri — no hay lógica de servidor que migrar (arquetipo A).

## ⚠️ 6. Riesgos y Mitigación

- **Riesgo:** El binario de escritorio compila en un entorno aislado pero no se ha probado como app real (ventana, atajos de teclado, `localStorage`, fuente web) — el `cargo check` verificado solo confirma que el *core* de Rust compila, no que la app funcione.
  - **Mitigación:** Ejecutar `npm run tauri dev` y probar manualmente el golden path antes de dar por cerrada la Fase 4/5 (ver `task.md`).
- **Riesgo:** Certificación en Microsoft Store o Uptodown puede rechazar el paquete por requisitos de identidad MSIX, firma o metadatos incompletos.
  - **Mitigación:** Seguir el checklist de `docs/MARKETPLACE_PUBLISHING.md` (guía basada en una publicación real previa, incluido un rechazo real) antes de enviar a certificación.
- **Riesgo de Seguridad y Privacidad (IA/Datos):** N/A — sin credenciales, sin backend, sin datos sensibles del usuario más allá de sus atajos de teclado en `localStorage`.
- **Riesgo de Consumo de Contexto de IA / Mal Rastreo de Bots:** N/A — no aplica, no hay Agent Readiness activo.

## ❓ 7. Preguntas Abiertas

- [ ] ¿Se vendoriza la fuente de Google Fonts localmente, o se acepta que la primera carga necesite red? (pendiente de Fase 4 del `MIGRATION_PROMPT.md`).
- [ ] ¿Hay presupuesto/intención de comprar un certificado de firma de código (Authenticode) o se va por la vía gratuita de auto-firma MSIX de Microsoft Store?

## 🧪 8. Criterios de Evaluación y Evals (No Deterministas)

- [ ] **Métricas de Output:** N/A — no hay componentes de IA/LLM en el propio producto (el uso de IA es solo para desarrollarlo).
- [ ] **Métricas de Trayectoria:** N/A.

---
**Instrucción para la IA:** No pases a la fase `/plan` hasta que las "Preguntas Abiertas" críticas hayan sido resueltas o tengan un camino de solución definido.
