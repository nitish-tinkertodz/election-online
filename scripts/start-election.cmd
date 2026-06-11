@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..") do set "REPO_ROOT=%%~fI"

set "NODE_DIR="
if exist "%ProgramFiles%\nodejs\node.exe" set "NODE_DIR=%ProgramFiles%\nodejs"
if not defined NODE_DIR if defined ProgramFiles(x86) if exist "%ProgramFiles(x86)%\nodejs\node.exe" set "NODE_DIR=%ProgramFiles(x86)%\nodejs"

if not defined NODE_DIR (
  for /f "delims=" %%I in ('where node.exe 2^>nul') do (
    for %%J in ("%%I") do set "NODE_DIR=%%~dpJ"
    goto :node_found
  )
)

:node_found
if not defined NODE_DIR (
  echo Node.js could not be located.
  echo Run scripts\install-prerequisites.cmd first.
  pause
  exit /b 1
)

set "PATH=%NODE_DIR%;%PATH%"
set "NPM_CMD=%NODE_DIR%\npm.cmd"

if not exist "%NPM_CMD%" (
  echo npm.cmd was not found at "%NPM_CMD%".
  echo Run scripts\install-prerequisites.cmd again.
  pause
  exit /b 1
)

if not exist "%REPO_ROOT%\.next\BUILD_ID" (
  echo The production build is missing.
  echo Run scripts\install-prerequisites.cmd again.
  pause
  exit /b 1
)

cd /d "%REPO_ROOT%"
title Election Online Server
echo Starting Election Online from "%REPO_ROOT%"
echo Keep this window open while voting is in progress.
echo.

call "%NPM_CMD%" run start:lan
set "EXIT_CODE=%ERRORLEVEL%"

echo.
echo Election Online stopped with exit code %EXIT_CODE%.
pause
exit /b %EXIT_CODE%
