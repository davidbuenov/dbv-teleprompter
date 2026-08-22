# 🎨 Sistema de Diseño: DBV Teleprompter

> **Fase:** `/spec` (Especificación Visual)
> **Estado:** Validado
> **Última Revisión:** 2026-08-22 (v2 — sustituye por completo a la versión anterior, ver §Historial)
> **Aplica a:** Pantalla de configuración (setup). La vista de prompting en marcha hereda solo color y tipografía — ver "Visión General".

---

> 📐 Inspirado en el estándar **[design.md](https://github.com/google-labs-code/design.md)** de Google Labs — un formato abierto para describir identidades visuales a agentes de codificación.

---

```yaml
# ────────────────────────────────────────────────
# DESIGN TOKENS — Legibles por la IA y por máquina
# ────────────────────────────────────────────────
version: alpha
name: "DBV Teleprompter"
description: "Studio instrument — panel de control de estudio: matte black por defecto, guion protagonista al centro, ajustes en un inspector lateral fijo, acción principal en una barra de transporte inferior."

colors:
  bg:  "#0e0e10"   # Fondo de la app y de la vista de lectura
  s:   "#17171a"   # Inspector, barra de transporte, paneles
  s2:  "#212126"   # Fondo de steppers y <kbd>
  b:   "rgba(255,255,255,.10)"   # Todos los bordes y filetes
  fg:  "#f3f1ed"   # Guion, títulos, valores
  fg2: "rgba(243,241,237,.52)"   # Etiquetas y texto secundario
  a:   "#e05a3f"   # Acción primaria, línea de foco, punto de estado — rojo de equipo de grabación

dark:
  # El tema oscuro ES la paleta por defecto (:root); no hay overrides que listar aquí.
  # La tabla "Claro" de más abajo son los overrides que sí se aplican, bajo [data-theme="light"].

light:
  bg:  "#eae8e3"
  s:   "#fbfaf8"
  s2:  "#f1efeb"
  b:   "rgba(0,0,0,.12)"
  fg:  "#151517"
  fg2: "rgba(21,21,23,.55)"
  a:   "#c8402a"

typography:
  script:
    fontFamily: "Newsreader, Georgia, serif"
    fontWeight: 300
    fontSize: "23px (20px móvil, 22px tablet)"
    lineHeight: 1.64
  numericReadout:
    fontFamily: "Nunito, ui-monospace, monospace"
    fontWeight: 500
    fontSize: "32px (22-26px según breakpoint)"
    fontVariantNumeric: tabular-nums
  eyebrow:
    fontFamily: "ui-monospace, Menlo, monospace"
    fontWeight: 500
    fontSize: 10.5px
    letterSpacing: "0.15em"
    textTransform: uppercase
  ui:
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
    fontWeight: "500-600"
    fontSize: "12-14px"

rounded:
  sm: 6px    # <kbd>
  md: 8px    # botones de header, campos del panel de teclas
  lg: 11px   # steppers, botones de acción
  xl: 13px   # steppers en tablet

spacing:
  xs: 2px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 22px
  xxl: 24px
  xxxl: 30px

components:
  stepper:
    description: "Grupo −/valor/+ de 44×44px por botón, radio 11px, fondo s2, lectura numérica Nunito 500 tabular"
  primary-button:
    backgroundColor: "{colors.a}"
    textColor: "#fff"
    rounded: "{rounded.lg}"
  ghost-button:
    backgroundColor: transparent
    border: "1px solid {colors.b}"
    textColor: "{colors.fg2}"
    rounded: "{rounded.md}"
  kbd:
    backgroundColor: "{colors.s2}"
    border: "1px solid {colors.b}"
    rounded: "{rounded.sm}"
  slide-in-panel:
    description: "Panel de configuración de teclas: overlay + panel de 360px desde la derecha, transform 220ms"
```

---

## Visión General

La app tiene **dos pantallas con propósitos opuestos**.

La **pantalla de setup** es un instrumento de estudio: tres bandas verticales (header, guion + inspector, barra de transporte), sin scroll de página, matte black por defecto. Idea rectora: **el editor ya ES el prompter** — el textarea usa la misma familia (Newsreader 300), el mismo cuerpo relativo y la misma medida que la vista de lectura, así que lo que se escribe se ve tal como se leerá. Eso elimina la necesidad de "previsualizar".

La **vista de prompting en marcha** conserva su geometría exacta de siempre (posición, triángulo de foco, transform de scroll) y **su negro puro cableado** (`#000`/`#fff`/`red`), independiente del tema activo del panel de configuración: el máximo contraste mientras se graba de verdad importa más que la coherencia visual con la pantalla de setup. Lo único que sí hereda del rediseño es la familia tipográfica (`--f`, Newsreader), para que "el editor ya sea el prompter" también en la fuente.

---

## 🎨 Colores

- **`--a` (rojo `#e05a3f` oscuro / `#c8402a` claro):** el único color con carga — rojo de equipo de grabación. Se usa en tres sitios y en ninguno más: botón `Start prompter`, punto de la marca y de estado "Ready", línea de foco de la vista de lectura.
- **`--bg` / `--s` / `--s2`:** tres niveles de profundidad — fondo de página, panel elevado (inspector, transporte, paneles), y superficie de controles (steppers, `<kbd>`).
- **`--fg` / `--fg2`:** texto principal (guion, valores, títulos) y texto secundario (etiquetas mono en versalitas, hints). `--fg2` nunca baja de 11px.
- **`--b`:** un único tono de borde para todo — filetes, bordes de botones, separadores. Siempre 1px, nunca 2px.

### Modo Oscuro / Claro

- **Por defecto: oscuro.** `:root` define directamente los tokens oscuros; `[data-theme="light"]` los sobreescribe. Es la dirección inversa de la sesión de diseño anterior (que era clara por defecto) — ver Historial.
- **Conmutador real**, persistido en `localStorage` (`teleprompterTheme`). Sin él, se usa `prefers-color-scheme`.
- **Sin flash de tema incorrecto:** un script inline en el `<head>` de `index.html`, antes de cargar `style.css`, lee el valor guardado (o el del sistema) y fija `data-theme` en el `<html>` sincrónicamente, antes del primer pintado.
- **Sin transición de color** al conmutar: es un cambio de estado, no una animación decorativa.

---

## ✍️ Tipografía

- **Guion y vista de lectura:** `Newsreader`, peso 300, **autoalojada** (`fonts/newsreader-300-latin.woff2` + `-latin-ext.woff2`, cubre acentos españoles). No se usa la CDN de Google: el binario de escritorio debe funcionar sin red, decisión que ya existía de una sesión anterior y que este rediseño mantiene y extiende (antes se había eliminado Google Fonts sin más; ahora se reintroduce pero autoalojada).
- **Lecturas numéricas** (velocidad, tamaño de fuente): `Nunito` peso 500, autoalojada igual que Newsreader. `font-variant-numeric: tabular-nums` para que la cifra no salte de ancho al cambiar.
- **Interfaz** (botones, "While running"): *system font stack* (`Helvetica Neue`/system-ui) — sin autoalojar, no hace falta.
- **Etiquetas, `<kbd>`, estadísticas del guion:** pila monoespaciada (`ui-monospace, Menlo, monospace`), versalitas con `letter-spacing: .15em` para las etiquetas de sección ("SCRIPT", "SCROLL SPEED", "WHILE RUNNING").

---

## 🧩 Componentes Clave

### Layout de la pantalla de setup
Tres bandas verticales en `100dvh`, sin scroll de página:
- **Header (62px):** marca (cuadrado 28×28 + punto `--a`) + título/subtítulo + conmutador de tema + botón `Keys`.
- **Guion + inspector:** `grid-template-columns: 1fr 318px`. El textarea flota sin caja ni borde (`background:transparent`), medida legible `max-width:64ch`. El inspector (`--s`) agrupa los dos steppers y la lista "While running".
- **Barra de transporte (78px):** punto + etiqueta de estado ("Ready"), `Configure keys` y `Start prompter` (único botón primario de la pantalla).

### Steppers
Grupo `−`/valor/`+`: botones de 44×44px (52×52 en tablet), radio 11px, fondo `--s2`. La lectura numérica central usa Nunito tabular. Los antiguos hints de tecla bajo cada stepper desaparecen — los atajos se consolidan en la lista "While running" del inspector, evitando la confusión de que parecieran botones.

### Panel de configuración de teclas
Ya no es una sección siempre visible: es un **panel deslizante** (360px, desde la derecha, `transform` 220ms) con velo semitransparente. Se abre desde el header o la barra de transporte; se cierra con la `×`, clic en el velo o `Esc`. Misma lista de 8 campos en una sola columna, mismos `saveKeyConfig()`/`loadKeyConfig()`. Los créditos al autor (antes en la pantalla principal) viven ahora al final de este panel.

### Botones
- **Primary:** fondo `--a`, radio 11px. Uno solo por pantalla (`Start prompter`).
- **Ghost:** borde 1px `--b`, fondo transparente. El resto de acciones.

---

## ✨ Movimiento e Interacción

- **Micro-interacciones:** 120ms, `cubic-bezier(0.4,0,0.2,1)`.
- **Panel de teclas:** 220ms al entrar/salir.
- **Toast:** 200ms.
- **Reducción de movimiento:** `prefers-reduced-motion` anula todas las transiciones.

---

## 📌 Decisiones de Diseño

- **2026-08-22 — Sustitución completa del rediseño anterior por la dirección "Studio instrument".** El usuario trajo un handoff de alta fidelidad generado con Claude Design (`temp/design_handoff_teleprompter_1a/`, tres direcciones exploradas, aprobada la `1a`). Se implementó con fidelidad exacta a los tokens del handoff — colores, tipografías, medidas — y se retiran los tokens de la sesión anterior (azul `#2563EB`, claro por defecto, sans-serif system-ui para el guion). Este documento sustituye íntegramente al anterior; la tabla de tokens de arriba es la única vigente.
- **2026-08-22 — La vista de prompting en marcha NO hereda tema; sigue en negro puro cableado.** El handoff de diseño pedía heredar `--bg`/`--fg`/`--a` además de la tipografía, y así se implementó primero — pero el usuario, al ver la captura en tema claro (fondo beige durante la grabación), pidió explícitamente volver a negro/blanco/rojo fijos. Máximo contraste real durante la grabación gana sobre la coherencia visual con el panel de configuración. Solo la familia tipográfica (`--f`, Newsreader) se mantiene heredada.
- **2026-08-22 — Fuentes autoalojadas en vez de retiradas.** La sesión anterior había eliminado Google Fonts sin sustituto. Este rediseño reintroduce tipografía de marca (Newsreader, Nunito) pero **autoalojada** como `woff2` en `fonts/`, manteniendo la garantía de que el binario de escritorio funciona sin red.
- **2026-08-22 — Estadísticas del guion en una sola línea, dependientes de la velocidad.** `"<n> words · m:ss"`, con el tiempo estimado recalculado como `palabras / 150 · 60 / velocidad` — cambiar la velocidad de scroll actualiza el tiempo mostrado, no solo escribir texto nuevo.
- **2026-08-22 — Fuente del guion, por defecto "Untitled script", sin funcionalidad de renombrado.** El handoff la incluye como subtítulo de marca; no se implementa una función real de nombrar guiones (fuera de alcance — "solo capa visual, no se añade funcionalidad nueva").

---

**Instrucción para la IA:** Lee y respeta los tokens y decisiones definidos en este fichero. Si necesitas crear un componente no definido aquí, extrapola coherentemente desde los tokens existentes y registra la nueva decisión como "Decisión de Diseño" en este mismo archivo con fecha y justificación. La vista de prompting (`#teleprompter-view`, `#teleprompter-text`, `#focus-indicator`) mantiene su estructura y geometría intactas — solo hereda color y tipografía del tema activo.
