#!/usr/bin/env bash
# =============================================================================
# DBV Teleprompter — PWA + app de escritorio para leer texto en scroll
# Copyright (c) 2026 David Bueno Vallejo
# Licensed under the MIT License. See LICENSE for details.
# Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
# =============================================================================
#
# Para el servidor del modo web arrancado por start.sh.

set -euo pipefail
cd "$(dirname "$0")"

if [ ! -f .server.pid ]; then
    echo "No hay servidor registrado (.server.pid no existe)."
    exit 0
fi

PID="$(cat .server.pid)"
echo "Parando el servidor (PID $PID)..."
kill "$PID" 2>/dev/null || echo "El proceso ya no estaba vivo."
rm -f .server.pid
echo "Servidor parado."
