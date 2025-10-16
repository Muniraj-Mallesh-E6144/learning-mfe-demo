# Getting Started - Learning MFE Demo

## Overview

This project demonstrates a **microfrontend architecture** similar to Freshservice's production setup. It includes:

- **Backend**: Ruby on Rails API (port 3000)
- **Host App**: Ember.js (port 4200)
- **Microfrontend**: React with Module Federation (port 5000)
- **UI Library**: React component library

## Prerequisites

### Required Software

1. **Ruby 3.1.0**
   ```bash
   # Check version
   ruby -v
   
   # Install with rbenv (recommended)
   rbenv install 3.1.0
   rbenv local 3.1.0
   ```

2. **Node.js 18+**
   ```bash
   # Check version
   node -v
   
   # Install with nvm (recommended)
   nvm install 18
   nvm use 18
   ```

3. **pnpm 8+**
   ```bash
   # Install pnpm
   npm install -g pnpm
   
   # Check version
   pnpm -v
   ```

4. **Bundler** (for Ruby)
   ```bash
   gem install bundler
   ```

## Quick Start

### Option 1: Full Stack (Recommended for Learning)

Run all three servers simultaneously to see the full integration:

**Terminal 1 - Rails Backend:**
```bash
cd backend
bundle install
rails db:create db:migrate db:seed
rails server -p 3000

# Server running at http://localhost:3000
```

**Terminal 2 - Ember Host:**
```bash
cd ember-host
pnpm install
pnpm start

# Server running at http://localhost:4200
```

**Terminal 3 - React MFE:**
```bash
cd react-mfe
pnpm install
pnpm dev

# Server running at http://localhost:5000
```

**Open your browser:**
```
http://localhost:4200
```

You should see the Ember app with React components integrated!

### Option 2: Individual Components

#### Backend Only
```bash
cd backend
bundle install
rails db:create db:migrate db:seed
rails server -p 3000

# Test API
curl http://localhost:3000/api/v1/users
```

#### React MFE Standalone
```bash
cd react-mfe
pnpm install
pnpm dev

# Visit http://localhost:5000
```

#### React UI Library Development
```bash
cd react-ui-lib
pnpm install
pnpm dev

# Visit http://localhost:5173
```

## Port Reference

| Service | Port | URL |
|---------|------|-----|
| Rails Backend | 3000 | http://localhost:3000 |
| Ember Host | 4200 | http://localhost:4200 |
| React MFE | 5000 | http://localhost:5000 |
| React UI Lib Dev | 5173 | http://localhost:5173 |

## Project Structure

```
learning-mfe-demo/
├── backend/              # Rails API
│   ├── app/
│   │   ├── controllers/  # API endpoints
│   │   └── models/       # Data models
│   ├── config/
│   │   ├── routes.rb     # API routes
│   │   └── initializers/cors.rb  # CORS config
│   └── db/
│       ├── migrate/      # Database migrations
│       └── seeds.rb      # Sample data
│
├── ember-host/           # Ember host application
│   ├── app/
│   │   ├── components/
│   │   │   └── render-react-component/  # React bridge
│   │   ├── routes/       # Ember routes
│   │   ├── services/     # API service
│   │   └── templates/    # Handlebars templates
│   └── config/
│       └── environment.js  # Config (API URLs, etc.)
│
├── react-ui-lib/         # React component library
│   ├── lib/
│   │   └── components/   # Button, Card, Table
│   ├── vite.config.ts    # Library build config
│   └── package.json      # Exports configuration
│
├── react-mfe/            # React microfrontend
│   ├── src/
│   │   ├── components/   # UsersTable, TicketsList, etc.
│   │   ├── bootstrap-rc.tsx  # Module Federation entry
│   │   └── App.tsx       # Standalone mode
│   ├── vite.config.ts    # Module Federation config
│   └── package.json
│
└── docs/                 # Documentation
    ├── GETTING_STARTED.md
    ├── TROUBLESHOOTING.md
    └── ARCHITECTURE.md
```

## Verification Steps

### 1. Backend API
```bash
# Check if backend is running
curl http://localhost:3000/api/v1/users

# Expected: JSON array of users
```

### 2. Ember Host
```bash
# Visit Ember app
open http://localhost:4200

# You should see:
# - Navigation bar
# - Dashboard with stats
# - Links to Users and Tickets
```

### 3. React MFE Integration
```bash
# Visit Users page
open http://localhost:4200/users

# You should see:
# - Ember header
# - React table component (with sorting)
# - Data fetched from Rails API
```

### 4. Full React MFE
```bash
# Visit Tickets page
open http://localhost:4200/tickets

# You should see:
# - Tickets list (full React)
# - Filter buttons
# - Data fetched by React
```

## Development Workflow

### Making Changes to Backend

1. Edit Ruby files in `backend/app/`
2. Server auto-reloads
3. Test with curl or Postman
4. Frontend automatically sees changes

### Making Changes to Ember

1. Edit files in `ember-host/app/`
2. Browser auto-reloads (live reload)
3. Check browser console for errors
4. Use Ember Inspector extension

### Making Changes to React MFE

1. Edit files in `react-mfe/src/`
2. Browser auto-reloads (HMR)
3. Changes visible in Ember integration
4. Use React DevTools extension

### Making Changes to UI Library

1. Edit files in `react-ui-lib/lib/`
2. Run `pnpm build` in react-ui-lib
3. If using `pnpm link`, react-mfe sees changes
4. Otherwise, bump version and reinstall

## Common Commands

### Backend
```bash
# Start server
rails server -p 3000

# Reset database
rails db:reset

# Run migrations
rails db:migrate

# Generate new migration
rails g migration CreateNewTable

# Rails console
rails console
```

### Ember
```bash
# Start dev server
pnpm start

# Run tests
pnpm test

# Build for production
pnpm build

# Lint
pnpm lint
```

### React MFE
```bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### React UI Library
```bash
# Start Storybook
pnpm storybook

# Build library
pnpm build

# Run tests
pnpm test
```

## Testing the Integration

### Test 1: Data Flow
1. Visit http://localhost:4200/dashboard
2. Check stats are loaded from Rails
3. Click "Users" in nav
4. Verify React table shows users
5. Click column headers to sort

### Test 2: React MFE
1. Visit http://localhost:4200/tickets
2. Click filter buttons
3. Verify tickets filter correctly
4. Check browser console for:
   - "[React MFE] Bootstrapping..."
   - "[React MFE] ✓ Successfully mounted..."

### Test 3: API Integration
1. Open browser DevTools (Network tab)
2. Visit http://localhost:4200/users
3. See API call to http://localhost:3000/api/v1/users
4. Verify CORS headers present
5. Check response JSON

### Test 4: Module Federation
1. Visit http://localhost:4200/users
2. Open DevTools Console
3. See messages:
   - "[RenderReactComponent] Loading UsersTable..."
   - "[RenderReactComponent] ✓ Loaded UsersTable"
   - "[React MFE] Bootstrapping UsersTable..."
4. Open DevTools Network tab
5. See request to http://localhost:5000/remoteEntry.js

## Next Steps

1. **Read the Architecture docs**: `docs/ARCHITECTURE.md`
2. **Explore each component**: Open files and read the LEARNING NOTES
3. **Make changes**: Try modifying components
4. **Check Troubleshooting**: If you hit issues, see `docs/TROUBLESHOOTING.md`
5. **Build something**: Create a new component end-to-end

## Learning Path

### Week 1: Understanding the Parts
- [ ] Run the full stack
- [ ] Explore Rails API endpoints
- [ ] Navigate Ember app
- [ ] Inspect React components
- [ ] Read all README files

### Week 2: Making Changes
- [ ] Add a new API endpoint
- [ ] Create a new Ember route
- [ ] Build a new React component
- [ ] Add a component to UI library

### Week 3: Deep Dive
- [ ] Study Module Federation config
- [ ] Understand MessageChannel communication
- [ ] Explore build processes
- [ ] Read production deployment strategies

### Week 4: Advanced Topics
- [ ] Add authentication
- [ ] Implement error boundaries
- [ ] Add testing
- [ ] Deploy to staging

## Resources

### Official Docs
- [Rails Guides](https://guides.rubyonrails.org/)
- [Ember.js Guides](https://guides.emberjs.com/)
- [React Documentation](https://react.dev/)
- [Module Federation](https://webpack.js.org/concepts/module-federation/)
- [Vite Documentation](https://vitejs.dev/)

### Microfrontends
- [Micro Frontends](https://micro-frontends.org/)
- [Module Federation Examples](https://github.com/module-federation/module-federation-examples)

### Tools
- [Ember Inspector](https://github.com/emberjs/ember-inspector)
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Postman](https://www.postman.com/) or [Thunder Client](https://www.thunderclient.com/)

## Support

If you encounter issues:

1. Check `docs/TROUBLESHOOTING.md`
2. Verify all ports are available
3. Ensure all dependencies are installed
4. Check browser console for errors
5. Review terminal output for error messages

## Interview Preparation

Study these key concepts:

1. **Microfrontend Architecture**: Why and when to use it
2. **Module Federation**: How runtime code sharing works
3. **CORS**: Why it's needed and how to configure it
4. **API Design**: RESTful principles
5. **Framework Integration**: Ember ↔ React communication
6. **Build Tools**: Vite, Webpack, Ember CLI
7. **State Management**: Where state lives (Ember vs React)
8. **Deployment**: Independent vs monolithic deployment

## Contributing

Feel free to:
- Add more components
- Improve documentation
- Fix bugs
- Add tests
- Enhance styling

This is a learning project - experiment and break things!

