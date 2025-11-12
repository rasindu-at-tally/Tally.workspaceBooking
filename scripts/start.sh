#!/bin/bash

# Office Booking Platform - Start Script
# This script starts both frontend and backend servers

set -e  # Exit on error

echo "=================================="
echo "Office Booking Platform - Start"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Create PID file directory
mkdir -p "$PROJECT_ROOT/.pids"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down servers...${NC}"
    
    if [ -f "$PROJECT_ROOT/.pids/backend.pid" ]; then
        BACKEND_PID=$(cat "$PROJECT_ROOT/.pids/backend.pid")
        if ps -p $BACKEND_PID > /dev/null 2>&1; then
            kill $BACKEND_PID 2>/dev/null || true
            echo -e "${GREEN}✓ Backend stopped${NC}"
        fi
        rm -f "$PROJECT_ROOT/.pids/backend.pid"
    fi
    
    if [ -f "$PROJECT_ROOT/.pids/frontend.pid" ]; then
        FRONTEND_PID=$(cat "$PROJECT_ROOT/.pids/frontend.pid")
        if ps -p $FRONTEND_PID > /dev/null 2>&1; then
            kill $FRONTEND_PID 2>/dev/null || true
            echo -e "${GREEN}✓ Frontend stopped${NC}"
        fi
        rm -f "$PROJECT_ROOT/.pids/frontend.pid"
    fi
    
    # Kill any remaining child processes
    pkill -P $$ 2>/dev/null || true
    
    echo -e "${GREEN}Shutdown complete${NC}"
    exit 0
}

# Trap Ctrl+C and other termination signals
trap cleanup SIGINT SIGTERM EXIT

# Check if setup has been run
if [ ! -d "$PROJECT_ROOT/backend/venv" ] || [ ! -d "$PROJECT_ROOT/frontend/node_modules" ]; then
    echo -e "${RED}Error: Setup not complete. Please run ./scripts/setup.sh first${NC}"
    exit 1
fi

# Start backend
echo -e "${BLUE}Starting backend server...${NC}"
cd "$PROJECT_ROOT/backend"
source venv/bin/activate

# Check if backend is already running
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠ Port 8000 is already in use. Stopping existing process...${NC}"
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Start backend in background
nohup uvicorn main:app --reload --port 8000 > "$PROJECT_ROOT/.pids/backend.log" 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > "$PROJECT_ROOT/.pids/backend.pid"
echo -e "${GREEN}✓ Backend started on http://localhost:8000 (PID: $BACKEND_PID)${NC}"
echo -e "${GREEN}  API Docs: http://localhost:8000/api/docs${NC}"

# Wait a moment for backend to start
sleep 3

# Start frontend
echo -e "${BLUE}Starting frontend server...${NC}"
cd "$PROJECT_ROOT/frontend"

# Check if frontend is already running
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠ Port 5173 is already in use. Stopping existing process...${NC}"
    lsof -ti:5173 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Start frontend in background
nohup npm run dev > "$PROJECT_ROOT/.pids/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > "$PROJECT_ROOT/.pids/frontend.pid"
echo -e "${GREEN}✓ Frontend started on http://localhost:5173 (PID: $FRONTEND_PID)${NC}"

echo ""
echo "=================================="
echo -e "${GREEN}Application started successfully!${NC}"
echo "=================================="
echo ""
echo "Access the application:"
echo -e "  Frontend: ${BLUE}http://localhost:5173${NC}"
echo -e "  Backend:  ${BLUE}http://localhost:8000${NC}"
echo -e "  API Docs: ${BLUE}http://localhost:8000/api/docs${NC}"
echo ""
echo "Test Accounts:"
echo "  Admin: admin1@office.com / admin123"
echo "  User:  user1@office.com / user123"
echo ""
echo "Logs are available at:"
echo "  Backend:  .pids/backend.log"
echo "  Frontend: .pids/frontend.log"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"
echo ""

# Keep script running and show logs
tail -f "$PROJECT_ROOT/.pids/backend.log" "$PROJECT_ROOT/.pids/frontend.log" 2>/dev/null &
TAIL_PID=$!

# Wait for user interrupt
wait $TAIL_PID 2>/dev/null || true

