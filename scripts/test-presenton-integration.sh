#!/bin/bash

# Test Presenton Integration
# This script verifies the complete Presenton setup

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "🧪 Testing Presenton Integration"
echo "================================="
echo ""

# Test 1: Check environment variables
echo "📋 Test 1: Checking environment variables..."
if [ -f .env.local ]; then
    echo -e "${GREEN}✓${NC} .env.local exists"
    
    if grep -q "PEXELS_API_KEY" .env.local; then
        echo -e "${GREEN}✓${NC} PEXELS_API_KEY found in .env.local"
    else
        echo -e "${RED}✗${NC} PEXELS_API_KEY not found in .env.local"
        exit 1
    fi
    
    if grep -q "NEXT_PUBLIC_ENABLE_PRESENTON" .env.local; then
        echo -e "${GREEN}✓${NC} NEXT_PUBLIC_ENABLE_PRESENTON found in .env.local"
    else
        echo -e "${YELLOW}⚠${NC} NEXT_PUBLIC_ENABLE_PRESENTON not found (optional)"
    fi
    
    if grep -q "PRESENTON_API_URL" .env.local; then
        echo -e "${GREEN}✓${NC} PRESENTON_API_URL found in .env.local"
    else
        echo -e "${YELLOW}⚠${NC} PRESENTON_API_URL not found (will use default)"
    fi
else
    echo -e "${RED}✗${NC} .env.local not found!"
    exit 1
fi

echo ""

# Test 2: Check Docker
echo "🐳 Test 2: Checking Docker..."
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓${NC} Docker is installed"
    
    if docker info &> /dev/null; then
        echo -e "${GREEN}✓${NC} Docker daemon is running"
    else
        echo -e "${RED}✗${NC} Docker daemon is not running"
        echo "  Please start Docker Desktop"
        exit 1
    fi
else
    echo -e "${RED}✗${NC} Docker is not installed"
    echo "  Download from: https://www.docker.com/products/docker-desktop"
    exit 1
fi

echo ""

# Test 3: Check Presenton container
echo "🔍 Test 3: Checking Presenton container..."
if docker ps --filter "name=presenton" --format "{{.Names}}" | grep -q "presenton"; then
    echo -e "${GREEN}✓${NC} Presenton container is running"
    
    HEALTH=$(docker inspect --format='{{.State.Health.Status}}' presenton 2>/dev/null || echo "unknown")
    if [ "$HEALTH" == "healthy" ]; then
        echo -e "${GREEN}✓${NC} Container health: healthy"
    else
        echo -e "${YELLOW}⚠${NC} Container health: $HEALTH"
    fi
else
    echo -e "${YELLOW}⚠${NC} Presenton container is not running"
    echo "  Starting container..."
    ./scripts/presenton-docker.sh start
    sleep 5
fi

echo ""

# Test 4: Test Presenton API
echo "🌐 Test 4: Testing Presenton API..."
if curl -f -s -o /dev/null http://localhost:5001/health; then
    echo -e "${GREEN}✓${NC} Presenton API is accessible at http://localhost:5001"
else
    echo -e "${RED}✗${NC} Cannot reach Presenton API at http://localhost:5001"
    echo "  Try: ./scripts/presenton-docker.sh start"
    exit 1
fi

echo ""

# Test 5: Test Pexels API key
echo "🖼️  Test 5: Testing Pexels API key..."
node scripts/test-pexels-api.js

echo ""
echo "================================="
echo -e "${GREEN}✅ All tests passed!${NC}"
echo ""
echo "Next steps:"
echo "1. Start your Next.js app: npm run dev"
echo "2. Open http://localhost:3000"
echo "3. Fill a brief and select 'Presenton (AI-Enhanced)'"
echo "4. Generate a test presentation"
echo ""

