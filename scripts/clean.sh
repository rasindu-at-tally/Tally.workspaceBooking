#!/bin/bash

# Office Booking Platform - Clean Script
# This script cleans up temporary files and caches

echo "=================================="
echo "Office Booking Platform - Clean"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Stop servers first
echo -e "${YELLOW}Stopping all servers...${NC}"
bash "$PROJECT_ROOT/scripts/stop.sh"
echo ""

# Confirm before cleaning
echo -e "${RED}This will remove:${NC}"
echo "  - Python virtual environment (backend/venv)"
echo "  - Node modules (frontend/node_modules)"
echo "  - Python cache files (__pycache__, *.pyc)"
echo "  - Log files (.pids)"
echo "  - Build artifacts"
echo ""
read -p "Are you sure you want to continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo -e "${YELLOW}Cleaning up...${NC}"

# Remove Python virtual environment
if [ -d "$PROJECT_ROOT/backend/venv" ]; then
    echo "Removing Python virtual environment..."
    rm -rf "$PROJECT_ROOT/backend/venv"
    echo -e "${GREEN}✓ Virtual environment removed${NC}"
fi

# Remove Node modules
if [ -d "$PROJECT_ROOT/frontend/node_modules" ]; then
    echo "Removing Node modules..."
    rm -rf "$PROJECT_ROOT/frontend/node_modules"
    echo -e "${GREEN}✓ Node modules removed${NC}"
fi

# Remove Python cache
echo "Removing Python cache files..."
find "$PROJECT_ROOT/backend" -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find "$PROJECT_ROOT/backend" -type f -name "*.pyc" -delete 2>/dev/null || true
find "$PROJECT_ROOT/backend" -type f -name "*.pyo" -delete 2>/dev/null || true
echo -e "${GREEN}✓ Python cache removed${NC}"

# Remove log files
if [ -d "$PROJECT_ROOT/.pids" ]; then
    echo "Removing log files..."
    rm -rf "$PROJECT_ROOT/.pids"
    echo -e "${GREEN}✓ Log files removed${NC}"
fi

# Remove test database
if [ -f "$PROJECT_ROOT/backend/test.db" ]; then
    echo "Removing test database..."
    rm -f "$PROJECT_ROOT/backend/test.db"
    echo -e "${GREEN}✓ Test database removed${NC}"
fi

# Remove frontend build
if [ -d "$PROJECT_ROOT/frontend/dist" ]; then
    echo "Removing frontend build..."
    rm -rf "$PROJECT_ROOT/frontend/dist"
    echo -e "${GREEN}✓ Frontend build removed${NC}"
fi

echo ""
echo -e "${GREEN}Clean up completed successfully!${NC}"
echo ""
echo "To set up the project again, run: ./scripts/setup.sh"

