#!/bin/bash

# Office Booking Platform - Stop Script
# This script stops all running servers

echo "=================================="
echo "Office Booking Platform - Stop"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Stop backend
echo -e "${YELLOW}Stopping backend...${NC}"
if [ -f "$PROJECT_ROOT/.pids/backend.pid" ]; then
    BACKEND_PID=$(cat "$PROJECT_ROOT/.pids/backend.pid")
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        kill $BACKEND_PID 2>/dev/null || true
        sleep 1
        # Force kill if still running
        if ps -p $BACKEND_PID > /dev/null 2>&1; then
            kill -9 $BACKEND_PID 2>/dev/null || true
        fi
        echo -e "${GREEN}✓ Backend stopped${NC}"
    else
        echo -e "${YELLOW}⚠ Backend was not running${NC}"
    fi
    rm -f "$PROJECT_ROOT/.pids/backend.pid"
else
    echo -e "${YELLOW}⚠ No backend PID file found${NC}"
fi

# Kill any process on port 8000
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}Killing process on port 8000...${NC}"
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
fi

# Stop frontend
echo -e "${YELLOW}Stopping frontend...${NC}"
if [ -f "$PROJECT_ROOT/.pids/frontend.pid" ]; then
    FRONTEND_PID=$(cat "$PROJECT_ROOT/.pids/frontend.pid")
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        kill $FRONTEND_PID 2>/dev/null || true
        sleep 1
        # Force kill if still running
        if ps -p $FRONTEND_PID > /dev/null 2>&1; then
            kill -9 $FRONTEND_PID 2>/dev/null || true
        fi
        echo -e "${GREEN}✓ Frontend stopped${NC}"
    else
        echo -e "${YELLOW}⚠ Frontend was not running${NC}"
    fi
    rm -f "$PROJECT_ROOT/.pids/frontend.pid"
else
    echo -e "${YELLOW}⚠ No frontend PID file found${NC}"
fi

# Kill any process on port 5173
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}Killing process on port 5173...${NC}"
    lsof -ti:5173 | xargs kill -9 2>/dev/null || true
fi

# Clean up log files
rm -f "$PROJECT_ROOT/.pids/backend.log" "$PROJECT_ROOT/.pids/frontend.log"

echo ""
echo -e "${GREEN}All servers stopped successfully!${NC}"

