# 🎨 Sistema de Diseño: DBV Teleprompter

> **Fase:** `/spec` (Especificación Visual)
> **Estado:** Validado
> **Última Revisión:** 2026-08-22
> **Aplica a:** Pantalla de configuración (setup). La vista de prompting en marcha queda deliberadamente fuera — ver "Visión General".

---

> 📐 Inspirado en el estándar **[design.md](https://github.com/google-labs-code/design.md)** de Google Labs — un formato abierto para describir identidades visuales a agentes de codificación.

---

```yaml
# ────────────────────────────────────────────────
# DESIGN TOKENS — Legibles por la IA y por máquina
# ────────────────────────────────────────────────
version: alpha
name: "DBV Teleprompter"
description: "Herramienta de estudio: sobria, de alto contraste y sin ruido. La interfaz se aparta para que el guion sea el protagonista."

colors:
  primary:      "#1E40AF"   # Azul profundo de marca
  secondary:    "#475569"   # Slate — soporte, bordes, estados secundarios
  accent:       "#2563EB"   # Azul vivo — el único motor de interacción
  neutral:      "#F8FAFC"   # Fondo base
  surface:      "#FFFFFF"   # Tarjetas y contenedores
  on-primary:   "#FFFFFF"
  on-surface:   "#0F172A"   # Texto principal
  on-neutral:   "#64748B"   # Texto secundario / mutado
  error:        "#DC2626"
  success:      "#059669"
  warning:      "#D97706"

dark:
  primary:      "#3B82F6"
  secondary:    "#94A3B8"
  accent:       "#60A5FA"
  neutral:      "#0B1120"   # Gris azulado muy profundo, no negro puro
  surface:      "#151C2C"
  on-primary:   "#0B1120"
  on-surface:   "#E2E8F0"
  on-neutral:   "#94A3B8"

typography:
  heading:
    fontFamily: "system-ui"
    fontSize:   1.75rem
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  subheading:
    fontFamily: "system-ui"
    fontSize:   0.8125rem
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.06em"   # Versalitas para títulos de sección
  body:
    fontFamily: "system-ui"
    fontSize:   1rem
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "system-ui"
    fontSize:   0.9375rem
    fontWeight: 500
  caption:
    fontFamily: "system-ui"
    fontSize:   0.8125rem
    fontWeight: 400

rounded:
  none: 0px
  sm:   6px
  md:   10px
  lg:   16px
  xl:   20px
  full: 9999px

spacing:
  xs:  4px
  sm:  8px
  md:  16px
  lg:  24px
  xl:  40px
  xxl: 72px

components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor:       "{colors.on-primary}"
    rounded:         "{rounded.md}"
    padding:         "13px 28px"
  button-secondary:
    backgroundColor: "transparent"
    textColor:       "{colors.on-surface}"
    rounded:         "{rounded.md}"
    padding:         "13px 22px"
    border:          "1px solid {colors.secondary}"
  card:
    backgroundColor: "{colors.surface}"
    rounded:         "{rounded.xl}"
    padding:         "{spacing.xl}"
  input:
    backgroundColor: "{colors.neutral}"
    textColor:       "{colors.on-surface}"
    rounded:         "{rounded.md}"
    border:          "1px solid transparent"
  input-focus:
    border:          "1px solid {colors.accent}"
    ring:            "3px rgba(37, 99, 235, 0.15)"
  stepper:
    description:     "Grupo -/valor/+ como una sola pastilla segmentada, no tres controles sueltos"
    backgroundColor: "{colors.neutral}"
    rounded:         "{rounded.md}"
  kbd:
    description:     "Tecla física: fondo surface, borde 1px, sombra inferior de 1px"
    rounded:         "{rounded.sm}"
```

---

## Visión General

La app tiene **dos pantallas con propósitos opuestas, y el sistema de diseño solo gobierna una**.

La **vista de prompting** (texto blanco sobre negro, indicador rojo) es funcional y está terminada: su fealdad aparente *es* el diseño correcto — máximo contraste, cero distracción, nada que compita con el guion. **No se toca.**

La **pantalla de setup** es donde vive esta identidad: sobria, con aire, jerarquía clara y densidad baja. El usuario suele estar aquí un minuto antes de grabar, a menudo con prisa y a veces en un estudio a oscuras. Debe encontrar todo de un vistazo y no ser deslumbrado. De ahí el modo oscuro automático y la ausencia total de decoración.

---

## 🎨 Colores

- **Primary (`#1E40AF`):** azul profundo de marca. Wordmark y elementos de identidad. Nunca en fondos de página completa.
- **Secondary (`#475569`):** slate. Bordes, separadores y texto de soporte.
- **Accent (`#2563EB`):** el único motor de interacción — CTA principal, foco de inputs, valores activos de los steppers, enlaces. Reservado para acciones, jamás como decoración.
- **Neutral (`#F8FAFC`):** base de la página y fondo de campos. Ligeramente frío para que el blanco de la tarjeta destaque como superficie elevada.
- **Surface (`#FFFFFF`):** la tarjeta que contiene toda la configuración.
- **Error / Success / Warning:** solo feedback del sistema (p. ej. confirmación al guardar atajos).

### Modo Oscuro

- **Estrategia:** paleta propia, no inversión. Fondos en gris azulado profundo (`#0B1120`) en lugar de negro puro, para evitar halos alrededor del texto y no chocar con el negro absoluto de la vista de prompting. El azul de marca sube en luminosidad (`#3B82F6` / `#60A5FA`) para mantener contraste WCAG AA sobre fondo oscuro.
- **Activación:** automática vía `prefers-color-scheme`. Sin conmutador manual: es una app que se abre y se usa en un minuto, un ajuste más sería ruido.

---

## ✍️ Tipografía

- **Fuente principal:** *system font stack* (`Segoe UI Variable` en Windows, `SF Pro` en macOS, `Inter`/`Roboto` en Linux). **Decisión deliberada: se eliminó la dependencia de Google Fonts.** Era el único recurso de red de toda la app y obligaba al binario de escritorio a tener conexión en el primer arranque para renderizar correctamente. Las fuentes de sistema son excelentes, cargan instantáneamente y no producen layout shift. Esto resuelve la pregunta abierta sobre vendorizar la tipografía: no hay nada que vendorizar.
- **Escala:** progresión modular suave. Headings con tracking negativo (`-0.02em`); títulos de sección en versalitas con tracking positivo (`0.06em`) para separarlos sin necesidad de reglas ni tamaños grandes.
- **Cifras:** los valores numéricos de los controles usan `font-variant-numeric: tabular-nums` para que no bailen al incrementarse.
- **No usar:** más de una familia tipográfica. Pesos por debajo de 400.

---

## 🧩 Componentes Clave

### Botones
- **Primary:** fondo accent, radio md. **Uno solo por pantalla** (`Start Prompter`). Es el grito — solo uno debe gritar.
- **Secondary:** contorno de 1px sobre transparente. Para acciones importantes pero no primarias (`Configure Keys`).
- **Stepper (`−` / valor / `+`):** los tres elementos forman **una sola pastilla segmentada**, no tres controles sueltos flotando. Es el cambio de mayor impacto visual frente al diseño anterior.

### Tarjeta
- Surface, radio xl, sombra difusa y muy suave (`0 1px 3px` + `0 12px 32px` a baja opacidad). Sin borde en claro; borde sutil de 1px en oscuro, donde la sombra no se percibe.

### Teclas (`<kbd>`)
- Los atajos se representan como teclas físicas, no como texto en negrita. Un borde de 1px y 1px de sombra inferior bastan para leerlas como pulsables sin recargar.

### Formularios
- Inputs sobre fondo neutral con borde transparente; en focus el borde pasa a accent y aparece un halo de 3px. Nunca fondos coloreados.

---

## ✨ Movimiento e Interacción

- **Duración base:** `180ms` para micro-interacciones (hover, focus). `260ms` para aparición de paneles (configuración de teclas, toast).
- **Easing:** `cubic-bezier(0.4, 0, 0.2, 1)`.
- **Principio:** las animaciones son funcionales. El único movimiento no estrictamente informativo es el ligero desplazamiento del CTA en hover, que confirma que es pulsable.
- **Reducción de movimiento:** `prefers-reduced-motion` anula todas las transiciones y transformaciones.

---

## 📌 Decisiones de Diseño

- **2026-08-22 — Rediseño de la pantalla de setup.** El diseño original (2025) usaba una paleta *flat* heredada de la época (`#3498db`, `#2c3e50`, `#ecf0f1`) que había envejecido mal, con controles sueltos sin agrupar y jerarquía plana. Se rediseñó por completo manteniendo el HTML compatible con `script.js` (todos los `id` y los `onclick` inline intactos). Se corrigió además el título, que decía solo "Teleprompter" en lugar del nombre real del producto.
- **2026-08-22 — Eliminada la dependencia de Google Fonts.** Ver sección de Tipografía. Cierra la pregunta abierta nº 7 de `SPECIFICATIONS.md`.
- **2026-08-22 — `alert()` sustituido por un toast propio** al guardar los atajos. Los diálogos nativos del navegador son ajenos al sistema de diseño y, dentro de un WebView de Tauri, tienen comportamiento irregular entre plataformas (ver `NATIVE_DESKTOP_APPS.md` §6.2). Un toast en HTML se comporta igual en los cuatro entornos.
- **2026-08-22 — Añadido contador de palabras y duración estimada.** No es decoración: para quien prepara una grabación, saber que su guion dura ~2:40 a 140 palabras/minuto es información de trabajo. Se ubica junto a la etiqueta del campo de texto, donde se lee sin buscarla.

---

**Instrucción para la IA:** Lee y respeta los tokens y decisiones definidos en este fichero. Si necesitas crear un componente no definido aquí, extrapola coherentemente desde los tokens existentes y registra la nueva decisión como "Decisión de Diseño" en este mismo archivo con fecha y justificación. **La vista de prompting (`#teleprompter-view`, `#teleprompter-text`, `#focus-indicator`) está fuera del alcance de este sistema y no debe modificarse.**
