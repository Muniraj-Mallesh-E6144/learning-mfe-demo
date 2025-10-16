#!/bin/bash

# Setup script for Learning MFE Demo
# This script sets up all components of the project

set -e  # Exit on error

echo "🚀 Learning MFE Demo - Setup Script"
echo "====================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."
echo ""

# Check Ruby
if ! command -v ruby &> /dev/null; then
    echo -e "${RED}❌ Ruby not found${NC}"
    echo "Please install Ruby 3.1.0 (recommended: use rbenv)"
    exit 1
fi
echo -e "${GREEN}✓${NC} Ruby $(ruby -v)"

# Check Bundler
if ! command -v bundle &> /dev/null; then
    echo -e "${YELLOW}⚠${NC} Bundler not found, installing..."
    gem install bundler
fi
echo -e "${GREEN}✓${NC} Bundler $(bundle -v)"

# Check Node
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found${NC}"
    echo "Please install Node.js 18+ (recommended: use nvm)"
    exit 1
fi
echo -e "${GREEN}✓${NC} Node $(node -v)"

# Check pnpm
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}⚠${NC} pnpm not found, installing..."
    npm install -g pnpm
fi
echo -e "${GREEN}✓${NC} pnpm $(pnpm -v)"

echo ""
echo "✅ All prerequisites met!"
echo ""

# Setup Backend
echo "📦 Setting up Backend (Rails)..."
cd backend
echo "  - Installing gems..."
bundle install --quiet
echo "  - Creating database..."
rails db:create > /dev/null 2>&1 || true
echo "  - Running migrations..."
rails db:migrate > /dev/null 2>&1
echo "  - Seeding database..."
rails db:seed > /dev/null 2>&1
echo -e "${GREEN}✓${NC} Backend setup complete"
cd ..
echo ""

# Setup Ember Host
echo "📦 Setting up Ember Host..."
cd ember-host
echo "  - Installing dependencies..."
pnpm install --silent
echo -e "${GREEN}✓${NC} Ember Host setup complete"
cd ..
echo ""

# Setup React UI Library
echo "📦 Setting up React UI Library..."
cd react-ui-lib
echo "  - Installing dependencies..."
pnpm install --silent
echo "  - Building library..."
pnpm build > /dev/null 2>&1
echo -e "${GREEN}✓${NC} React UI Library setup complete"
cd ..
echo ""

# Setup React MFE
echo "📦 Setting up React MFE..."
cd react-mfe
echo "  - Installing dependencies..."
pnpm install --silent
echo -e "${GREEN}✓${NC} React MFE setup complete"
cd ..
echo ""

echo "================================================"
echo "✨ Setup Complete! ✨"
echo "================================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Start the Backend (Terminal 1):"
echo -e "   ${BLUE}cd backend && rails server -p 3000${NC}"
echo ""
echo "2. Start the Ember Host (Terminal 2):"
echo -e "   ${BLUE}cd ember-host && pnpm start${NC}"
echo ""
echo "3. Start the React MFE (Terminal 3):"
echo -e "   ${BLUE}cd react-mfe && pnpm dev${NC}"
echo ""
echo "4. Open your browser:"
echo -e "   ${BLUE}http://localhost:4200${NC}"
echo ""
echo "📚 Documentation:"
echo "   - Getting Started: docs/GETTING_STARTED.md"
echo "   - Troubleshooting: docs/TROUBLESHOOTING.md"
echo "   - Main README: README.md"
echo ""
echo "Happy learning! 🎓"

