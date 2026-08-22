# Changelog — DBV Teleprompter

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

---

## [Sin publicar] / [Unreleased]

### Added
- Adopción del framework `dbv-specs-ops` v2.6.0 (Spec-Driven Development) en `dbv-specs-ops/`, con `CLAUDE.md` en la raíz como fichero de activación para Claude Code.
- Base de Tauri v2 para empaquetar la app como escritorio nativo (Windows/macOS/Linux) en modo dual junto a la PWA: `src-tauri/`, workflows de release en `.github/workflows/`, `package.json` mínimo con `@tauri-apps/cli`.
- `scripts/sync-frontend.mjs`: copia los ficheros estáticos de la raíz a `src-tauri/frontend/` (git-ignored) antes de cada `dev`/`build` de Tauri, vía `beforeDevCommand`/`beforeBuildCommand`.
- `.gitignore` en la raíz (no existía) y `.taurignore` para acotar el watcher de `tauri dev`.

### Fixed
- **La app de escritorio abría una ventana negra inservible con `ERR_CONNECTION_REFUSED` contra `127.0.0.1`.** `frontendDist` apuntaba a la raíz del repo, así que Tauri embebía recursivamente también `src-tauri/`, incluido su `target/` — sin `index.html` resoluble, y con la compilación rompiéndose al toparse con `target/debug/.cargo-artifact-lock` bloqueado por Cargo (`os error 33`). Ahora `frontendDist` apunta a `src-tauri/frontend/`, una copia limpia generada con solo los ficheros de la app. El modo web/PWA no se ve afectado: los ficheros siguen en la raíz, que es lo que GitHub Pages publica.

---

## [0.1.0] — 2025-05-23

### Added
- Versión inicial de la PWA: teleprompter con pegado de texto, velocidad y tamaño de fuente ajustables, atajos de teclado configurables guardados en `localStorage`, Service Worker para uso offline y manifest instalable.

---

## How to read this file

- **Added** — new features or files.
- **Changed** — changes to existing functionality or documentation.
- **Deprecated** — features that will be removed in a future release.
- **Removed** — features removed in this release.
- **Fixed** — bug fixes.
- **Security** — security vulnerability fixes.
