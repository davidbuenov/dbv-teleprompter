@echo off
REM =============================================================================
REM DBV Teleprompter - PWA + app de escritorio para leer texto en scroll
REM Copyright (c) 2026 David Bueno Vallejo
REM Licensed under the MIT License. See LICENSE for details.
REM Built with dbv-specs-ops - https://github.com/davidbuenov/dbv-specs-ops
REM =============================================================================
REM
REM Para el servidor del modo web arrancado por start.cmd.
REM Va en CRLF y solo con ASCII, por el mismo motivo que start.cmd.

setlocal
cd /d "%~dp0"

if not exist ".server.pid" (
    echo No hay servidor registrado ^(.server.pid no existe^).
    exit /b 0
)

set /p PID=<.server.pid
echo Parando el servidor ^(PID %PID%^)...
taskkill /PID %PID% /T /F >nul 2>nul
del .server.pid
echo Servidor parado.
endlocal
