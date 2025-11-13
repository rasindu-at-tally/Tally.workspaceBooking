#!/bin/bash

# Office Booking Platform - Development Script
# This is the main script that sets up and runs everything

set -e  # Exit on error

echo "=================================="
echo "Office Booking Platform"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Check if setup is needed
NEEDS_SETUP=false

if [ ! -d "$PROJECT_ROOT/backend/venv" ]; then
    NEEDS_SETUP=true
    echo -e "${YELLOW}Backend virtual environment not found${NC}"
fi

if [ ! -d "$PROJECT_ROOT/frontend/node_modules" ]; then
    NEEDS_SETUP=true
    echo -e "${YELLOW}Frontend dependencies not found${NC}"
fi

if [ ! -f "$PROJECT_ROOT/backend/.env" ]; then
    NEEDS_SETUP=true
    echo -e "${YELLOW}Backend .env file not found${NC}"
fi

# Run setup if needed
if [ "$NEEDS_SETUP" = true ]; then
    echo ""
    echo -e "${BLUE}Running initial setup...${NC}"
    echo ""
    bash "$PROJECT_ROOT/scripts/setup.sh"
    echo ""
fi

# Start the application
echo -e "${BLUE}Starting application...${NC}"
echo ""
bash "$PROJECT_ROOT/scripts/start.sh"



