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
| **Escritorio nativo** | Tauri v2 (Rust 2021) | Empaqueta el mismo frontend estático en binario nativo sin reescribir lógica; `frontendDist` apunta a `src-tauri/frontend/`, una copia generada de los ficheros web de la raíz (ver ADR de 2026-08-22 en `memory.md`) |
| **Persistencia** | `localStorage` del navegador/WebView | Estado local: atajos de teclado (`teleprompterKeyConfig`), tema (`teleprompterTheme`), idioma (`teleprompterLang`), título del guion (`teleprompterScriptTitle`) y último texto (`teleprompterLastText`); no requiere BD |
| **Internacionalización (i18n)** | Vanilla JS declarativo (`data-i18n*`) + Diccionario de traducción | Cero dependencias; soporte dual ES/EN con detección por `navigator.language` |
| **Gestión de Archivos (E/S)** | File API nativa web (`FileReader`, `Blob`, Drag & Drop) | Funciona de forma transparente en Web y WebView de escritorio (Tauri) sin plugins pesados ni permisos invasivos |
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
├── scripts/
│   └── sync-frontend.mjs   # Copia los ficheros web de la raíz a src-tauri/frontend/
├── src-tauri/              # Core Rust de Tauri (generado por dbv-tauri-starter)
│   ├── tauri.conf.json     # frontendDist: "frontend", withGlobalTauri: true
│   ├── frontend/           # GENERADO, git-ignored — lo que Tauri embebe
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
- **Convenciones:** **Todo** fichero JS propio debe envolverse en su propia IIFE — `script.js` y `sw.js` incluidos, no solo los ficheros nuevos. Los scripts clásicos comparten un único ámbito global, y ahí Tauri ya inyecta nombres propios (`isTauri`, `__TAURI__`…) con `Object.defineProperty`: una colisión de identificador no da un error de ejecución depurable, rompe el fichero entero en *parseo* y ninguna de sus líneas llega a correr. Ver `docs/NATIVE_DESKTOP_APPS.md` §3.
  > Esta regla decía antes "cualquier fichero JS **nuevo**". Esa redacción eximía a `script.js` por ser preexistente, y fue lo que permitió que `const isTauri` entrara en su ámbito global en `9aae73e` y saliera publicado en la v0.2.0 con la interfaz muerta en Windows, macOS y Linux. La exención está retirada a propósito: no se reintroduce.
- **Prohibido `onclick=` (y cualquier `on*=`) inline en el HTML.** Es consecuencia directa de lo anterior: con el JS encerrado en una IIFE, un atributo inline no puede resolver la función porque esta ya no es global. Todo evento se cablea con `addEventListener` desde dentro de la IIFE, y **siempre con arrow explícita** (`() => changeSpeed(-0.1)`), nunca por referencia: `addEventListener('click', changeSpeed)` entregaría el objeto `Event` como argumento y produciría `NaN` de forma silenciosa.
- **Verificación automática:** `scripts/sync-frontend.mjs` corre en `beforeDevCommand`/`beforeBuildCommand` y aborta el build si algún `.js` del bundle no sobrevive a la instanciación con los globales de Tauri. Es una comprobación con el motor de JS real (`node:vm`), no una heurística de texto.
- **Complejidad máxima por función:** No formalizada; `script.js` ronda las 860 líneas.

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
- **Restricción:** `frontendDist` **no puede apuntar a la raíz del repo**, aunque sea la carpeta que GitHub Pages publica. La raíz contiene `src-tauri/`, y Tauri embebe recursivamente todo lo que hay bajo `frontendDist`: intenta leer `src-tauri/target/debug/.cargo-artifact-lock`, que Cargo mantiene bloqueado, y la compilación muere con `os error 33`. De ahí el paso de sincronización a `src-tauri/frontend/`.
- **Riesgo (resuelto):** El core de Tauri se había verificado solo con `cargo check`; la app real fallaba con `ERR_CONNECTION_REFUSED` contra `127.0.0.1` por la causa anterior.
  - **Mitigación aplicada:** `scripts/sync-frontend.mjs` + `beforeDevCommand`/`beforeBuildCommand`. Verificado el 2026-08-22 ejecutando la app: UI completa, controles, scroll, atajos y `localStorage` funcionando.
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
