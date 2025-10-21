@echo off
echo Starting Resume Parser Test Environment
echo ========================================

echo.
echo 1. Starting Resume Parser API Server...
start "Resume Parser API" cmd /k "cd /d d:\Projects\depiProject\Depi-Project\ai-models && python resume_praser.py"

echo.
echo 2. Waiting 3 seconds for API to start...
timeout /t 3 /nobreak > nul

echo.
echo 3. Starting React Client...
start "React Client" cmd /k "cd /d d:\Projects\depiProject\Depi-Project\client && npm run dev"

echo.
echo ========================================
echo Both servers are starting...
echo.
echo API Server: http://localhost:8000
echo React Client: http://localhost:5173
echo.
echo Press any key to close this window...
pause > nul