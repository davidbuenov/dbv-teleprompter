#!/usr/bin/env bash
# =============================================================================
# DBV Teleprompter — PWA + app de escritorio para leer texto en scroll
# Copyright (c) 2026 David Bueno Vallejo
# Licensed under the MIT License. See LICENSE for details.
# Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
# =============================================================================
#
# Arranca el modo web/PWA en http://localhost:8080 y guarda el PID para stop.sh.
# La app de escritorio no necesita esto: es un binario y se abre directamente.

set -euo pipefail
cd "$(dirname "$0")"

if [ -f .server.pid ]; then
    echo "Ya hay un servidor arrancado (.server.pid existe). Ejecuta ./stop.sh primero."
    exit 1
fi

if ! command -v node >/dev/null 2>&1; then
    echo "Node.js no está en el PATH. Instálalo desde https://nodejs.org"
    exit 1
fi

echo "Arrancando DBV Teleprompter en modo web..."
node scripts/serve-web.mjs &
echo $! > .server.pid

echo "Servidor en http://localhost:8080  (./stop.sh para pararlo)"
