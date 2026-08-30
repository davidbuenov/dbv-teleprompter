@echo off
REM =============================================================================
REM DBV Teleprompter - PWA + app de escritorio para leer texto en scroll
REM Copyright (c) 2026 David Bueno Vallejo
REM Licensed under the MIT License. See LICENSE for details.
REM Built with dbv-specs-ops - https://github.com/davidbuenov/dbv-specs-ops
REM =============================================================================
REM
REM Arranca el modo web/PWA en http://localhost:8080 y guarda el PID para stop.cmd.
REM La app de escritorio no necesita esto: es un .exe y se abre a doble clic.
REM
REM Dos detalles que este fichero aprendio por las malas:
REM   - Va en CRLF y solo con ASCII. Un .cmd en LF hace que CMD mis-parsee lineas enteras,
REM     y los caracteres no-ASCII chocan con la codepage OEM de la consola.
REM   - El PID lo devuelve PowerShell con -PassThru. Un tasklist filtrando por node.exe no
REM     vale: devolveria todos los procesos node de la maquina, sin saber cual es el nuestro.

setlocal
cd /d "%~dp0"

if exist ".server.pid" (
    echo Ya hay un servidor arrancado ^(.server.pid existe^). Ejecuta stop.cmd primero.
    exit /b 1
)

where node >nul 2>nul
if errorlevel 1 (
    echo Node.js no esta en el PATH. Instalalo desde https://nodejs.org
    exit /b 1
)

echo Arrancando DBV Teleprompter en modo web...
powershell -NoProfile -Command "(Start-Process node -ArgumentList 'scripts/serve-web.mjs' -PassThru -WindowStyle Hidden).Id | Set-Content -NoNewline .server.pid"

if not exist ".server.pid" (
    echo No se pudo arrancar el servidor.
    exit /b 1
)

echo Servidor en http://localhost:8080  ^(stop.cmd para pararlo^)
endlocal
