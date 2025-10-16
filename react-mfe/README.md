# React Microfrontend - Learning MFE Demo

## Overview
This is the **React microfrontend** that integrates with the Ember host application using **Webpack Module Federation**.

## What is Module Federation?

Module Federation is a Webpack 5 feature that allows:
- **Runtime Code Sharing**: Load JavaScript modules from remote applications at runtime
- **Independent Deployment**: Deploy MFE separately from the host
- **Shared Dependencies**: Share common libraries (React, React DOM) across apps
- **Lazy Loading**: Load MFE code only when needed

### Key Concepts

**Host Application**: The main app that loads remote modules (Ember in our case)
**Remote Application**: The MFE that exposes modules (this React app)
**Remote Entry**: A special file (remoteEntry.js) that serves as the entry point
**Exposed Modules**: Functions/components the MFE makes available to hosts
**Shared Modules**: Libraries shared between host and remote (React, React DOM)

## Architecture

```
┌─────────────────────────────────────────────────┐
│         Ember Host (localhost:4200)             │
│                                                 │
│  ┌─────────────────────────────────────────┐  │
│  │  render-react-component                 │  │
│  │  1. Dynamically imports remoteEntry.js  │  │
│  │  2. Calls init() to setup Module Fed    │  │
│  │  3. Calls get('./renderComponent')      │  │
│  │  4. Mounts React component             │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│        ↓ (dynamic import at runtime)            │
│                                                 │
└─────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────┐
│      React MFE (localhost:5000)                 │
│                                                 │
│  remoteEntry.js (Module Federation Manifest)    │
│                                                 │
│  Exposed:                                       │
│  - ./renderComponent → bootstrap-rc.tsx         │
│                                                 │
│  Shared:                                        │
│  - react (singleton)                            │
│  - react-dom (singleton)                        │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Module Federation Configuration

The heart of the integration is `vite.config.ts`:

```typescript
federation({
  name: 'host_main',
  filename: 'remoteEntry.js',
  exposes: {
    './renderComponent': './src/bootstrap-rc.tsx'
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true }
  }
})
```

**What this does:**
- **name**: Unique identifier for this MFE
- **filename**: The entry file that Ember imports
- **exposes**: Maps external paths to internal modules
- **shared**: Libraries shared with the host (prevents duplicate React)

## Project Structure

```
react-mfe/
├── src/
│   ├── components/
│   │   ├── UsersTable.tsx       # Users table component
│   │   ├── TicketsList.tsx      # Tickets list component
│   │   └── TicketDetail.tsx     # Ticket detail component
│   ├── bootstrap-rc.tsx         # Entry point for embedded components
│   ├── App.tsx                  # Standalone app entry
│   └── main.tsx                 # Dev mode entry
├── public/
├── vite.config.ts               # Vite + Module Federation config
├── tsconfig.json
├── package.json
└── README.md
```

## Setup

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Visit http://localhost:5000
```

The MFE runs on **port 5000** by default (must match Ember's REACT_MFE_URL).

### Development Modes

#### 1. Standalone Mode (Port 5000)
```bash
pnpm dev
# Open http://localhost:5000
# Useful for developing/testing React components in isolation
```

#### 2. Integrated Mode (Ember + React)
```bash
# Terminal 1: Rails backend
cd backend && rails server -p 3000

# Terminal 2: Ember host
cd ember-host && pnpm start

# Terminal 3: React MFE
cd react-mfe && pnpm dev

# Open http://localhost:4200 (Ember)
```

## Components

### 1. UsersTable
Displays users in a sortable table using the UI library.

**Props:**
```typescript
{
  users: User[];
  apiHost: string;
}
```

**Usage in Ember:**
```handlebars
<RenderReactComponent
  @componentName="UsersTable"
  @moduleName="host_main"
  @domElementSelectorId="users-table"
  @props={{hash users=@model.users apiHost="http://localhost:3000"}}
/>
```

### 2. TicketsList
Lists all tickets with filtering.

**Props:**
```typescript
{
  apiHost: string;
}
```

### 3. TicketDetail
Shows detailed ticket information.

**Props:**
```typescript
{
  ticketId: string;
  apiHost: string;
}
```

## How It Works: Step-by-Step

### 1. Build Time
When you run `pnpm build`:
```bash
vite build
# Generates:
# - dist/remoteEntry.js (Module Federation manifest)
# - dist/assets/*.js (React component code)
# - dist/assets/*.css (Styles)
```

### 2. Runtime (Ember loads React)

**Step 1**: Ember's `render-react-component` dynamically imports remoteEntry.js:
```javascript
const { get, init } = await import('http://localhost:5000/remoteEntry.js');
```

**Step 2**: Initialize Module Federation:
```javascript
await init();
```

This sets up the shared scope (React, ReactDOM).

**Step 3**: Get the exposed module:
```javascript
const renderComponentModule = await get('./renderComponent');
const renderComponent = renderComponentModule.default;
```

**Step 4**: Call the render function:
```javascript
await renderComponent({
  componentName: 'UsersTable',
  domElementSelectorId: '#users-table',
  props: { users, apiHost }
});
```

**Step 5**: React mounts into the DOM element:
```javascript
const root = ReactDOM.createRoot(element);
root.render(<UsersTable users={users} apiHost={apiHost} />);
```

### 3. Communication (Ember ↔ React)

Uses **MessageChannel API** for bidirectional communication:

```typescript
// React sends message to Ember
messagePort.postMessage({
  action: 'componentMounted',
  payload: { message: 'Component ready' }
});

// Ember sends message to React
messagePort.postMessage({
  action: 'updateProps',
  payload: { users: newUsers }
});
```

## Configuration Files

### vite.config.ts
```typescript
import { federation } from '@module-federation/vite';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'host_main',
      filename: 'remoteEntry.js',
      exposes: {
        './renderComponent': './src/bootstrap-rc.tsx'
      },
      shared: {
        react: { singleton: true, requiredVersion: '18.3.1' },
        'react-dom': { singleton: true, requiredVersion: '18.3.1' }
      }
    })
  ],
  server: {
    port: 5000,
    cors: true // Allow Ember to load remoteEntry.js
  },
  build: {
    target: 'esnext', // Module Federation requires ESNext
    assetsInlineLimit: 0 // Don't inline assets
  }
});
```

### tsconfig.json
TypeScript configuration for React + strict mode.

## Common Issues & Solutions

### Issue 1: remoteEntry.js 404 Error
**Error**: `Failed to fetch dynamically imported module: http://localhost:5000/remoteEntry.js`

**Solution**:
1. Ensure React MFE is running (`pnpm dev`)
2. Check port 5000 is available
3. Verify CORS is enabled in vite.config.ts

### Issue 2: React Hook Errors
**Error**: `Invalid hook call. Hooks can only be called inside the body of a function component`

**Cause**: Multiple React versions (Ember has one, React MFE has another)

**Solution**: Module Federation's `singleton: true` should prevent this. If it still happens:
```bash
# Check React versions
cd ember-host && pnpm list react
cd react-mfe && pnpm list react
# Should both be 18.3.1
```

### Issue 3: Props Not Updating
**Problem**: React component doesn't reflect prop changes from Ember

**Solution**: Ensure your component re-renders on prop changes:
```tsx
useEffect(() => {
  // React to prop changes
}, [props]);
```

### Issue 4: Build Output Missing
**Error**: `dist/` folder is empty or incomplete

**Solution**:
```bash
# Clean and rebuild
rm -rf dist
pnpm build
# Check dist/remoteEntry.js exists
```

### Issue 5: CORS Errors in Production
**Error**: `Cross-Origin Request Blocked`

**Solution**: Configure production server to send CORS headers:
```nginx
# Nginx example
add_header Access-Control-Allow-Origin *;
```

## Building for Production

```bash
# Build the MFE
pnpm build

# Output goes to dist/
# Deploy dist/ to CDN or web server
```

In production, update Ember's `REACT_MFE_URL`:
```javascript
// ember-host/config/environment.js
ENV.REACT_MFE_URL = 'https://cdn.example.com/react-mfe';
```

## Testing

### Unit Tests
```bash
# Add testing library
pnpm add -D @testing-library/react @testing-library/jest-dom vitest

# Run tests
pnpm test
```

### Integration Tests
Test in Ember context:
```bash
cd ember-host
# Ember tests can mock React components
pnpm test
```

## Key Learning Points

1. **Module Federation**: Runtime code sharing between apps
2. **Remote Entry**: Special file that exposes modules
3. **Shared Dependencies**: Singleton React prevents duplication
4. **Dynamic Imports**: eval('import(...)') bypasses build-time resolution
5. **MessageChannel**: Cross-context communication
6. **Build Target**: `esnext` required for Module Federation

## Interview Preparation Notes

**Q: What is Module Federation?**
A: A Webpack 5 feature that allows loading JavaScript modules from remote applications at runtime. It enables true microfrontend architecture with independent deployment and runtime integration.

**Q: How does it differ from iframe-based integration?**
A: Module Federation shares memory and JavaScript context, while iframes are completely isolated. MF allows shared dependencies, better performance, and easier communication.

**Q: What's the role of remoteEntry.js?**
A: It's the manifest file that describes what modules are exposed, what's shared, and how to load them. Think of it as an API surface for the microfrontend.

**Q: Why singleton: true for React?**
A: To ensure only one instance of React exists across host and remote. Multiple React instances cause hook errors and context problems.

**Q: How do you handle versioning?**
A: Use semver ranges in shared config. Module Federation can handle minor version differences. For major versions, you might need separate MFEs.

## Next Steps

After understanding this MFE:
1. See how it integrates with Ember (already configured)
2. Add new components and expose them
3. Experiment with communication patterns
4. Deploy to production environment

## References

- [Module Federation Docs](https://webpack.js.org/concepts/module-federation/)
- [@module-federation/vite](https://github.com/module-federation/vite)
- [MessageChannel API](https://developer.mozilla.org/en-US/docs/Web/API/MessageChannel)
- [Micro Frontends](https://micro-frontends.org/)

