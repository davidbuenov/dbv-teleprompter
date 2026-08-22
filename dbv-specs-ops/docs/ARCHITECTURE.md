# 🏗 Arquitectura Técnica: DBV Teleprompter

> **Fase:** `/plan` (Planificación Técnica)
> **Estado:** Validado (adopción retroactiva sobre app existente)
> **Última Revisión:** 2026-08-22

---

## 🛠 Stack Tecnológico

| Capa | Tecnología | Justificación |
| --- | --- | --- |
| **Frontend** | HTML5 + CSS3 + JavaScript vanilla (ES, sin bundler) | App ya existente, sin paso de build; mantenerla simple evita añadir una toolchain innecesaria (arquetipo A de `WEB_TO_DESKTOP_MIGRATION.md`) |
| **PWA** | Web App Manifest + Service Worker (`sw.js`) | Instalación en móvil/escritorio y caché offline del app shell |
| **Escritorio nativo** | Tauri v2 (Rust 2021) | Empaqueta el mismo frontend estático en binario nativo sin reescribir lógica; `frontendDist` apunta directamente a la raíz del repo |
| **Persistencia** | `localStorage` del navegador/WebView | Único estado a guardar son los atajos de teclado configurables; no requiere BD |
| **Autenticación** | Ninguna | App 100% local sin cuentas de usuario |
| **Testing** | Ninguno todavía | Deuda técnica conocida — ver `docs/SPECIFICATIONS.md` §6 |
| **CI/CD** | GitHub Actions (`release-windows.yml`, `release-linux.yml`, `release-macos.yml`) | Copiados desde `dbv-tauri-starter`, generan los binarios multiplataforma en cada release |

---

## 📂 Estructura de Directorios

```text
/
├── index.html            # Único punto de entrada del frontend (web y escritorio)
├── style.css
├── script.js              # Toda la lógica de la app, vanilla JS
├── manifest.json          # Manifest de la PWA
├── sw.js                  # Service Worker (caché offline)
├── icons/                 # Iconos PWA
├── images/                # Capturas usadas en README.md
├── src-tauri/              # Core Rust de Tauri (generado por dbv-tauri-starter)
│   ├── tauri.conf.json     # frontendDist: "..", withGlobalTauri: true
│   ├── Cargo.toml
│   └── src/
├── .github/workflows/       # release-windows.yml, release-linux.yml, release-macos.yml
├── dbv-specs-ops/            # Framework SDD (este directorio)
└── package.json             # Mínimo, solo @tauri-apps/cli
```

> `dbv-specs-ops/task.md` es la única bitácora del proyecto (el `task.md` que vivía en la raíz, específico de la migración Tauri, se fusionó ahí y se eliminó).

---

## 🔑 Decisiones Técnicas Clave

### Seguridad

- **Autenticación:** N/A — sin backend ni cuentas.
- **Autorización:** N/A.
- **Datos sensibles:** Ninguno; `tauri.conf.json` tiene `security.csp: null` (heredado de la plantilla, revisar si se quiere endurecer antes de publicar en tiendas).

### Estilo de Código

- **Paradigma:** Imperativo/procedural simple en JS vanilla, sin frameworks.
- **Convenciones:** Cualquier fichero JS nuevo debe envolverse en su propia IIFE (los scripts clásicos comparten ámbito global; una colisión de identificador entre `script.js` y un fichero nuevo del puente Tauri rompe el parseo del segundo por completo — ver `docs/NATIVE_DESKTOP_APPS.md` §3).
- **Complejidad máxima por función:** No formalizada; el código actual es corto (310 líneas en `script.js`).

### Gestión de Estado

- Estado de UI en variables JS del propio `script.js`; único estado persistente son los atajos de teclado en `localStorage`.

---

## 🔗 Integraciones Externas

| Servicio | Propósito | Notas / Límites |
| --- | --- | --- |
| Google Fonts | Tipografía cosmética enlazada en `<head>` de `index.html` | Único punto de red de toda la app; pendiente decidir si se vendoriza para que el modo escritorio no dependa de conexión en el primer arranque (ver `docs/SPECIFICATIONS.md` §7) |

---

## ⚠️ Restricciones y Riesgos Técnicos

- **Restricción:** Modo dual web+escritorio es obligatorio — la PWA tiene demo pública en GitHub Pages y el propio README anuncia instalación en desktop y móvil; no se puede retirar el modo web sin romper ese caso de uso (ver `docs/WEB_TO_DESKTOP_MIGRATION.md` §3).
- **Riesgo:** El core de Tauri se ha verificado solo con `cargo check` en un `--target-dir` aislado; no se ha ejecutado `tauri dev` ni probado la app real todavía.
  - **Mitigación:** Fase de pruebas manuales antes de cerrar la migración (ver `task.md`).
- **Riesgo:** Publicación en Microsoft Store / Uptodown puede exigir requisitos de identidad de paquete (MSIX) o firma que hoy no están configurados en `tauri.conf.json`/`Cargo.toml`.
  - **Mitigación:** Checklist de `docs/MARKETPLACE_PUBLISHING.md` antes de generar el paquete de distribución final.

---

## 🤖 Agent Harness (Arnés del Agente)

### 1. Gestión de Contexto (Context Engineering)
- **Contexto Estático:** `CLAUDE.md` (raíz, punteroa `dbv-specs-ops/docs/MASTER_PROMPT.md`), `project.config.md`, `memory.md`, `docs/SPECIFICATIONS.md`, `docs/ARCHITECTURE.md` — cargados al inicio de cada sesión con Claude Code, que es la IA de soporte designada para este proyecto.
- **Contexto Dinámico / Skills:** Ninguno todavía — no hay `skills/` ni Agent Plugin definidos, no aplica dado que no hay Agent Readiness activo.

### 2. Herramientas y MCP (Model Context Protocol)
- **Servidores MCP Requeridos:** Ninguno — proyecto sin backend ni datos estructurados que consultar vía MCP.
- **Propósito:** N/A.
- **Configuración de Herramientas:** N/A.

### 3. Entorno de Ejecución (Sandboxing)
- **Aislamiento:** Desarrollo local directo (Windows), sin contenedor. Verificaciones de Rust usan `--target-dir` fuera del repo para no ensuciar `src-tauri/target/` durante pruebas aisladas.
- **Límites de Ejecución:** N/A — no hay comandos asíncronos de larga duración definidos hoy.
- **Aislamiento del Plugin:** N/A.

### 4. Guardrails Deterministas de Seguridad
- **Filtros de Código:** No configurados todavía (sin hooks de pre-commit ni linters). Pendiente si se decide añadir antes de publicar en tiendas.
- **Políticas de Commit/Push:** Ninguna automatizada; revisión manual antes de cada commit.

### 5. Interfaz Externa para Agentes (Agent Readiness)
- No aplica — `Agent Readiness (Web)` desactivado en `project.config.md`.

---

**Instrucción para la IA:** Respeta las decisiones y configuraciones del arnés documentadas aquí. Si necesitas desviarte por un motivo técnico o sugerir una nueva herramienta MCP/Skill para el proyecto, regístralo como "Decisión Técnica" en `memory.md` y obtén la aprobación del desarrollador.
