#!/bin/bash

echo "Starting Unicall Application..."

echo ""
echo "Starting Backend Server..."
cd backend
node server.js &
BACKEND_PID=$!
cd ..

echo ""
echo "Waiting for backend to start..."
sleep 5

echo ""
echo "Starting Frontend Server..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "Both servers are running..."
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Use admin@unicall.com / admin123 to login as admin"
echo "Use user1@unicall.com / user123 to login as user"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to kill both processes
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit
}

# Set trap to cleanup on script exit
trap cleanup INT

# Wait for frontend process
wait $FRONTEND_PID
