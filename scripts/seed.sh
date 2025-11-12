#!/bin/bash

# Office Booking Platform - Database Seed Script
# This script seeds the database with sample data

set -e  # Exit on error

echo "=================================="
echo "Office Booking Platform - Seed DB"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT/backend"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${RED}Error: Virtual environment not found. Please run ./scripts/setup.sh first${NC}"
    exit 1
fi

# Activate virtual environment
source venv/bin/activate

# Confirm before seeding
echo -e "${YELLOW}This will populate the database with sample data:${NC}"
echo "  - 2 admin users"
echo "  - 3 regular users"
echo "  - 20 desks (10 per location)"
echo "  - Sample bookings"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo -e "${YELLOW}Seeding database...${NC}"
python seed_data.py

echo ""
echo -e "${GREEN}Database seeded successfully!${NC}"

