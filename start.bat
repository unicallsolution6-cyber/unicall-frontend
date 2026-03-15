@echo off
echo Starting Unicall Application...

echo.
echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && node server.js"

echo.
echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo.
echo Starting Frontend Server...
start "Frontend Server" cmd /k "npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Use admin@unicall.com / admin123 to login as admin
echo Use user1@unicall.com / user123 to login as user
pause
