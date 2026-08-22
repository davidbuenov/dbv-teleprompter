# Changelog — DBV Teleprompter

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

---

## [Sin publicar] / [Unreleased]

### Added
- Adopción del framework `dbv-specs-ops` v2.6.0 (Spec-Driven Development) en `dbv-specs-ops/`, con `CLAUDE.md` en la raíz como fichero de activación para Claude Code.
- Base de Tauri v2 para empaquetar la app como escritorio nativo (Windows/macOS/Linux) en modo dual junto a la PWA: `src-tauri/`, workflows de release en `.github/workflows/`, `package.json` mínimo con `@tauri-apps/cli`.

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
