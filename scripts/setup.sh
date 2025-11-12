#!/bin/bash

# Office Booking Platform - Setup Script
# This script sets up the development environment

set -e  # Exit on error

echo "=================================="
echo "Office Booking Platform - Setup"
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

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: Python 3 is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Python 3 found: $(python3 --version)${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js found: $(node --version)${NC}"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠ PostgreSQL CLI not found. Make sure PostgreSQL is installed and running.${NC}"
else
    echo -e "${GREEN}✓ PostgreSQL found${NC}"
fi

echo ""

# Backend setup
echo -e "${YELLOW}Setting up backend...${NC}"
cd "$PROJECT_ROOT/backend"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
    echo -e "${GREEN}✓ Virtual environment created${NC}"
else
    echo -e "${GREEN}✓ Virtual environment already exists${NC}"
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip > /dev/null
pip install -r requirements.txt > /dev/null
echo -e "${GREEN}✓ Python dependencies installed${NC}"

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating backend .env file..."
    cp .env.example .env
    echo -e "${GREEN}✓ Backend .env file created${NC}"
    echo -e "${YELLOW}⚠ Please update backend/.env with your database credentials${NC}"
else
    echo -e "${GREEN}✓ Backend .env file already exists${NC}"
fi

echo ""

# Frontend setup
echo -e "${YELLOW}Setting up frontend...${NC}"
cd "$PROJECT_ROOT/frontend"

# Install dependencies
echo "Installing Node.js dependencies..."
npm install > /dev/null 2>&1
echo -e "${GREEN}✓ Node.js dependencies installed${NC}"

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating frontend .env file..."
    cp .env.example .env
    echo -e "${GREEN}✓ Frontend .env file created${NC}"
else
    echo -e "${GREEN}✓ Frontend .env file already exists${NC}"
fi

echo ""

# Database setup
echo -e "${YELLOW}Setting up database...${NC}"
cd "$PROJECT_ROOT/backend"
source venv/bin/activate

# Check if database exists and create if needed
DB_NAME="office_booking"
if command -v psql &> /dev/null; then
    if psql -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
        echo -e "${GREEN}✓ Database '$DB_NAME' already exists${NC}"
    else
        echo "Creating database '$DB_NAME'..."
        createdb $DB_NAME 2>/dev/null || echo -e "${YELLOW}⚠ Could not create database. Please create it manually: createdb $DB_NAME${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Please create PostgreSQL database manually: createdb $DB_NAME${NC}"
fi

# Ask if user wants to seed the database
echo ""
read -p "Do you want to seed the database with sample data? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Seeding database..."
    python seed_data.py
    echo -e "${GREEN}✓ Database seeded successfully${NC}"
fi

echo ""
echo "=================================="
echo -e "${GREEN}Setup completed successfully!${NC}"
echo "=================================="
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your database credentials (if needed)"
echo "2. Run ./scripts/start.sh to start the application"
echo ""

