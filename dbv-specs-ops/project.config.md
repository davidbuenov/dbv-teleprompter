# 🪪 Project Config

> This file is read automatically by the AI at session start.
> If placeholders are detected, the AI will propose a complete setup draft with marked assumptions (`[ASSUMPTION: ...]`) for you to confirm in one single step.

---

## Project Identity

- **Name:** DBV Teleprompter
- **Description:** PWA de teleprompter ligera (pega texto, controla velocidad/tamaño de fuente), ahora también empaquetada como app de escritorio nativa con Tauri v2, en modo dual web+escritorio.
- **Author / Company:** David Bueno Vallejo · https://github.com/davidbuenov
- **License:** MIT
- **Languages:** HTML, CSS, JavaScript (vanilla, sin bundler), Rust (core mínimo de Tauri)
- **Technologies / Stack:** PWA (Service Worker + Web App Manifest), Tauri v2 (`tauri`, `tauri-plugin-opener`, `serde`/`serde_json`), sin backend ni base de datos
- **Agent Readiness (Web):** No
- **Framework Version:** 2.6.0


---

## Model Routing Guidelines (V2.5.0)

To optimize OpEx (Token Burn) and latency, refer to this routing strategy when executing project development tasks:

| Development Phase | Required Reasoning Complexity | Recommended Model Class | Example Models |
| --- | --- | --- | --- |
| `/spec` (Specifications) | Very High | Advanced Reasoning / Frontier Models | Gemini 3.1 Pro, Claude Opus 5, GPT-5.6 Sol |
| `/plan` (Planning / Architecture) | Very High | Advanced Reasoning / Frontier Models | Gemini 3.1 Pro, Claude Opus 5, GPT-5.6 Sol |
| `/build` (Code Implementation) | Medium | Fast, high-accuracy coding models | Gemini 3.5 Flash, Claude Sonnet 5, GPT-5.6 Terra |
| `/test` (Conventional Tests / Evals) | Medium-Low | Fast & cheap models | Gemini 2.5 Flash-Lite, Claude Haiku 5, GPT-5.6 Luna |
| `/code-simplify` (Security & Refactor) | High | Security-conscious reasoning models | Gemini 3.1 Pro, Claude Sonnet 5, GPT-5.6 Sol |
| `/ship` (Documentation, Changelog) | Low | Fast, text-optimized models | Gemini 2.5 Flash-Lite, Claude Haiku 5, GPT-5.6 Luna |

---

## File Header Template

All source files must include a header comment in the appropriate syntax for the language.
Use the fields above to generate it. Always include the framework credit line.

**Example (JavaScript / CSS):**
```
// =============================================================================
// DBV Teleprompter — PWA + app de escritorio para leer texto en scroll
// Copyright (c) 2026 David Bueno Vallejo
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================
```

**Example (Rust):**
```
// =============================================================================
// DBV Teleprompter — PWA + app de escritorio para leer texto en scroll
// Copyright (c) 2026 David Bueno Vallejo
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================
```

**Example (HTML):**
```
<!--
  DBV Teleprompter — PWA + app de escritorio para leer texto en scroll
  Copyright (c) 2026 David Bueno Vallejo
  Licensed under the MIT License. See LICENSE for details.
  Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
-->
```

---

> 🛠️ Framework SDD creado por **[David Bueno Vallejo](https://github.com/davidbuenov)** — libre y gratuito · [dbv-specs-ops](https://github.com/davidbuenov/dbv-specs-ops)
