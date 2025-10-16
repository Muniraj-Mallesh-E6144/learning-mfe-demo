# Upgrade Guide: From Learning Demo to Production Patterns

> **Goal**: Transform the simplified learning demo into a production-ready architecture similar to real Freshservice.

This guide walks you through implementing the real Freshservice patterns step-by-step.

---

## 📋 Prerequisites

- ✅ Completed the basic learning demo
- ✅ Read `ARCHITECTURE_COMPARISON.md`
- ✅ Read `MESSAGE_CHANNEL_GUIDE.md`
- ✅ Understand Module Federation basics

---

## 🎯 Upgrade Path Overview

```
Current (Learning Demo)           →    Production (Real Freshservice)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Single Vite project            →    Nx monorepo with modules
2. Direct component imports       →    render-react-component wrapper
3. Props-only communication       →    MessageChannel API
4. No lifecycle events            →    Full lifecycle tracking
5. Inline components              →    Separate component library
6. Manual imports                 →    Component registry
7. No HMR support                 →    React Refresh (HMR)
8. Basic testing                  →    MFE testing utilities
```

---

## Phase 1: Implement MessageChannel Communication

**Time**: ~2 hours  
**Difficulty**: ⭐⭐⭐

### Step 1.1: Update React MFE Entry Point

Create a new file that handles MessageChannel initialization:

```bash
cd /Users/mmallesh/Documents/Repos/learning-mfe-demo/react-mfe
```

**Create**: `src/remote-entry-rc.ts`

```typescript
// react-mfe/src/remote-entry-rc.ts
import React from 'react';
import ReactDOM from 'react-dom/client';

interface RenderComponentConfig {
  moduleName: string;
  componentName: string;
  domElementSelectorId: string;
  props: Record<string, any>;
}

// Map of available components
const COMPONENT_MAP = {
  TicketsList: () => import('./components/TicketsList'),
  UsersTable: () => import('./components/UsersTable'),
  TicketDetail: () => import('./components/TicketDetail'),
};

let messagePort: MessagePort | null = null;
let reactRoot: any = null;

async function renderComponent(config: RenderComponentConfig) {
  const { moduleName, componentName, domElementSelectorId, props } = config;

  console.log(`[React MFE] Rendering ${componentName} at ${domElementSelectorId}`);

  // Create MessageChannel
  const channel = new MessageChannel();
  messagePort = channel.port1;

  // Send init message with port2
  window.postMessage(
    {
      type: 'fs-react-mfe-host-main-init',
      domElementSelectorId,
    },
    window.location.origin,
    [channel.port2] // Transfer port2 to Ember
  );

  // Listen for messages from Ember
  messagePort.onmessage = (event) => {
    const { action, payload } = event.data;
    console.log(`[React MFE] Received action: ${action}`, payload);

    switch (action) {
      case 'updateProps':
        // Update component props
        updateComponent(payload);
        break;
      case 'unmount':
        // Unmount component
        unmountComponent();
        break;
      default:
        console.warn(`[React MFE] Unknown action: ${action}`);
    }
  };

  // Load and mount component
  const ComponentModule = await COMPONENT_MAP[componentName as keyof typeof COMPONENT_MAP]();
  const Component = ComponentModule.default;

  const container = document.querySelector(domElementSelectorId);
  if (!container) {
    console.error(`[React MFE] Container not found: ${domElementSelectorId}`);
    return;
  }

  // Wrap component to inject messagePort
  const WrappedComponent = () => {
    return React.createElement(Component, {
      ...props,
      messagePort, // Inject messagePort as prop
    });
  };

  reactRoot = ReactDOM.createRoot(container);
  reactRoot.render(React.createElement(WrappedComponent));

  // Notify Ember that component is mounted
  messagePort.postMessage({
    action: 'componentMounted',
    payload: {
      message: `${componentName} mounted`,
      domElementSelectorId,
    },
  });
}

function updateComponent(newProps: Record<string, any>) {
  // Re-render with new props
  console.log('[React MFE] Updating props:', newProps);
  // Implementation depends on your state management
}

function unmountComponent() {
  if (reactRoot) {
    reactRoot.unmount();
    reactRoot = null;
  }

  if (messagePort) {
    messagePort.postMessage({
      action: 'componentUnmounted',
    });
    messagePort.close();
    messagePort = null;
  }

  console.log('[React MFE] Component unmounted');
}

export default function initRenderComponent(config: RenderComponentConfig) {
  return renderComponent(config);
}
```

### Step 1.2: Update Module Federation Config

**Update**: `react-mfe/vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'reactMfe',
      filename: 'remoteEntry.js',
      exposes: {
        // Keep existing exports
        './TicketsList': './src/components/TicketsList.tsx',
        './UsersTable': './src/components/UsersTable.tsx',
        './TicketDetail': './src/components/TicketDetail.tsx',
        
        // Add new renderComponent entry point
        './renderComponent': './src/remote-entry-rc.ts', // 👈 NEW
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
      },
    }),
  ],
  build: {
    target: 'esnext',
  },
  server: {
    port: 5000, // Change from 3001 to match Freshservice
    cors: true,
  },
});
```

### Step 1.3: Create Ember `render-react-component` Component

**Create**: `ember-host/app/components/render-react-component/component.js`

```javascript
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import ENV from 'ember-host/config/environment';

export default class RenderReactComponentComponent extends Component {
  @tracked isLoading = true;
  messagePort = null;

  constructor() {
    super(...arguments);
    console.log('[Ember] RenderReactComponent constructor', {
      domElementSelectorId: this.args.domElementSelectorId,
      componentName: this.args.componentName,
      moduleName: this.args.moduleName,
    });
  }

  get REMOTE_ENTRY_URL() {
    return `${ENV.REACT_MFE_URL}/remoteEntry.js`;
  }

  get domElementSelectorString() {
    return `#${this.args.domElementSelectorId}`;
  }

  @action
  async dynamicImport(modulePath) {
    return await eval(`import('${modulePath}')`);
  }

  @action
  async loadRemoteEntry() {
    try {
      console.log('[Ember] Loading remoteEntry from:', this.REMOTE_ENTRY_URL);
      
      const { get, init } = await this.dynamicImport(this.REMOTE_ENTRY_URL);
      await init();
      
      const renderComponentModule = await get('./renderComponent');
      await renderComponentModule.default({
        moduleName: this.args.moduleName,
        componentName: this.args.componentName,
        domElementSelectorId: this.domElementSelectorString,
        props: this.args.props || {},
      });

      console.log('[Ember] Successfully loaded React component');
    } catch (error) {
      console.error('[Ember] Error loading React component:', error);
    }
  }

  @action
  messageListener = (event) => {
    if (
      event.data.type === 'fs-react-mfe-host-main-init' &&
      event.data.domElementSelectorId === this.domElementSelectorString
    ) {
      console.log('[Ember] Received init message from React');

      // Save the port React sent us
      this.messagePort = event.ports[0];

      // Listen for messages from React
      this.messagePort.onmessage = (msgEvent) => {
        const { action, payload } = msgEvent.data;
        console.log(`[Ember] Received from React: ${action}`, payload);

        // Handle lifecycle events
        if (action === 'componentMounted') {
          this.isLoading = false;
          this.args.onComponentMounted?.(payload);
        } else if (action === 'componentFullyLoaded') {
          this.args.onComponentFullyLoaded?.(payload);
        } else if (action === 'componentUnmounted') {
          this.args.onComponentUnmounted?.(payload);
        } else {
          // Custom events
          this.args.onMessage?.(msgEvent.data);
        }
      };

      // Remove global listener (we have the port now)
      window.removeEventListener('message', this.messageListener);
    }
  };

  @action
  listenToReactMessage() {
    window.addEventListener('message', this.messageListener);
  }

  @action
  loadReactComponent() {
    this.listenToReactMessage();
    this.loadRemoteEntry();
  }

  @action
  destroyMessageListener() {
    if (this.messagePort) {
      console.log('[Ember] Sending unmount action to React');
      this.messagePort.postMessage({ action: 'unmount' });
      this.messagePort.close();
      this.messagePort = null;
    }
    window.removeEventListener('message', this.messageListener);
  }

  // Method to send messages to React
  sendMessage(action, payload = {}) {
    if (this.messagePort) {
      this.messagePort.postMessage({ action, payload });
    } else {
      console.warn('[Ember] Cannot send message, messagePort not initialized');
    }
  }
}
```

**Create**: `ember-host/app/components/render-react-component/template.hbs`

```handlebars
<div
  id={{@domElementSelectorId}}
  class={{@classNames}}
  {{did-insert this.loadReactComponent}}
  {{will-destroy this.destroyMessageListener}}
  data-test-id="react-content-wrapper"
>
  {{#if this.isLoading}}
    <div class="loading-spinner">Loading {{@componentName}}...</div>
  {{/if}}
</div>
```

### Step 1.4: Update Ember Route to Use New Component

**Update**: `ember-host/app/routes/users.js`

```javascript
import Route from '@ember/routing/route';
import { action } from '@ember/object';

export default class UsersRoute extends Route {
  async model() {
    // Fetch users (or use mock data)
    try {
      const response = await fetch('http://localhost:3000/api/v1/users');
      return await response.json();
    } catch (error) {
      console.warn('[Users] Backend not available, using mock data');
      return [
        { id: 1, name: 'Alice Smith', email: 'alice@example.com', role: 'Agent' },
        { id: 2, name: 'Bob Johnson', email: 'bob@example.com', role: 'Requester' },
      ];
    }
  }

  @action
  handleComponentMounted(payload) {
    console.log('[Users Route] React UsersTable mounted', payload);
  }

  @action
  handleComponentFullyLoaded(payload) {
    console.log('[Users Route] React UsersTable fully loaded', payload);
  }

  @action
  handleMessage(data) {
    const { action, payload } = data;
    
    switch (action) {
      case 'userClicked':
        console.log('[Users Route] User clicked:', payload);
        // Navigate to user detail
        this.transitionTo('user-detail', payload.userId);
        break;
      
      case 'error':
        console.error('[Users Route] Error from React:', payload);
        break;
      
      default:
        console.log('[Users Route] Custom message:', data);
    }
  }
}
```

**Update**: `ember-host/app/templates/users.hbs`

```handlebars
<div class="page">
  <div class="header">
    <h1>👥 Users</h1>
    <p>Hybrid integration: Ember template + React table component</p>
  </div>

  <div class="content">
    {{!-- OLD WAY (simple): --}}
    {{!-- <div id="react-users-table" {{did-insert this.mountReactComponent}}></div> --}}

    {{!-- NEW WAY (production pattern): --}}
    <RenderReactComponent
      @domElementSelectorId="react-users-table"
      @componentName="UsersTable"
      @moduleName="main"
      @props={{hash users=@model}}
      @onComponentMounted={{this.handleComponentMounted}}
      @onComponentFullyLoaded={{this.handleComponentFullyLoaded}}
      @onMessage={{this.handleMessage}}
      @classNames="react-component-container"
    />
  </div>
</div>
```

### Step 1.5: Update React Component to Use MessagePort

**Update**: `react-mfe/src/components/UsersTable.tsx`

```typescript
import React, { useEffect, useState } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface UsersTableProps {
  users: User[];
  messagePort?: MessagePort; // 👈 NEW
}

const UsersTable: React.FC<UsersTableProps> = ({ users: initialUsers, messagePort }) => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [sortColumn, setSortColumn] = useState<keyof User>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    // Notify Ember that component is fully loaded
    if (messagePort) {
      messagePort.postMessage({
        action: 'componentFullyLoaded',
        payload: {
          userCount: users.length,
        },
      });
    }

    // Listen for messages from Ember
    if (messagePort) {
      messagePort.onmessage = (event) => {
        const { action, payload } = event.data;
        
        switch (action) {
          case 'updateProps':
            // Ember sent new props
            if (payload.users) {
              setUsers(payload.users);
            }
            break;
          
          case 'unmount':
            // Clean up
            console.log('[UsersTable] Unmounting');
            break;
        }
      };
    }

    return () => {
      if (messagePort) {
        messagePort.postMessage({
          action: 'componentUnmounted',
        });
      }
    };
  }, [messagePort]);

  const handleSort = (column: keyof User) => {
    const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(newDirection);

    const sorted = [...users].sort((a, b) => {
      const aVal = a[column];
      const bVal = b[column];
      
      if (aVal < bVal) return newDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return newDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setUsers(sorted);
  };

  const handleUserClick = (user: User) => {
    // Send message to Ember
    if (messagePort) {
      messagePort.postMessage({
        action: 'userClicked',
        payload: {
          userId: user.id,
          userName: user.name,
        },
      });
    }
  };

  return (
    <div style={styles.container}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th onClick={() => handleSort('name')} style={styles.th}>
              Name {sortColumn === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('email')} style={styles.th}>
              Email {sortColumn === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('role')} style={styles.th}>
              Role {sortColumn === 'role' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              style={styles.tr}
              onClick={() => handleUserClick(user)}
            >
              <td style={styles.td}>{user.name}</td>
              <td style={styles.td}>{user.email}</td>
              <td style={styles.td}>
                <span style={getRoleBadgeStyle(user.role)}>{user.role}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ... styles ...

export default UsersTable;
```

### Step 1.6: Test MessageChannel Communication

```bash
# Terminal 1 - React MFE
cd react-mfe && pnpm dev

# Terminal 2 - Ember Host
cd ember-host && pnpm start

# Visit: http://localhost:4200/users
```

**Expected Console Output**:

```
[Ember] RenderReactComponent constructor {domElementSelectorId: "react-users-table", ...}
[Ember] Loading remoteEntry from: http://localhost:5000/remoteEntry.js
[React MFE] Rendering UsersTable at #react-users-table
[Ember] Received init message from React
[Ember] Received from React: componentMounted {message: "UsersTable mounted", ...}
[Users Route] React UsersTable mounted {...}
[Ember] Received from React: componentFullyLoaded {userCount: 5}
[Users Route] React UsersTable fully loaded {userCount: 5}
```

**Click on a user**:
```
[Ember] Received from React: userClicked {userId: 1, userName: "Alice Smith"}
[Users Route] User clicked: {userId: 1, userName: "Alice Smith"}
```

---

## Phase 2: Create Component Registry

**Time**: ~1 hour  
**Difficulty**: ⭐⭐

### Step 2.1: Create Registry File

**Create**: `ember-host/app/constants/react-component-map.js`

```javascript
export const REACT_COMPONENTS_MAP = {
  tickets: {
    list: {
      moduleName: 'main',
      selectorId: 'react-tickets-list',
      componentName: 'TicketsList',
    },
    detail: {
      moduleName: 'main',
      selectorId: 'react-ticket-detail',
      componentName: 'TicketDetail',
    },
  },
  users: {
    table: {
      moduleName: 'main',
      selectorId: 'react-users-table',
      componentName: 'UsersTable',
    },
  },
};

export const LIFECYCLE_EVENTS = {
  init: 'init',
  componentMounted: 'componentMounted',
  componentUnmounted: 'componentUnmounted',
  componentFullyLoaded: 'componentFullyLoaded',
};

// Helper function to get component config
export function getReactComponentConfig(category, name) {
  const config = REACT_COMPONENTS_MAP[category]?.[name];
  if (!config) {
    throw new Error(`React component not found: ${category}.${name}`);
  }
  return config;
}
```

### Step 2.2: Use Registry in Routes

**Update**: `ember-host/app/templates/users.hbs`

```handlebars
{{#let (get-react-component-config "users" "table") as |config|}}
  <RenderReactComponent
    @domElementSelectorId={{config.selectorId}}
    @componentName={{config.componentName}}
    @moduleName={{config.moduleName}}
    @props={{hash users=@model}}
    @onComponentMounted={{this.handleComponentMounted}}
    @onMessage={{this.handleMessage}}
  />
{{/let}}
```

**Create helper**: `ember-host/app/helpers/get-react-component-config.js`

```javascript
import { helper } from '@ember/component/helper';
import { getReactComponentConfig } from 'ember-host/constants/react-component-map';

export function getReactComponentConfigHelper([category, name]) {
  return getReactComponentConfig(category, name);
}

export default helper(getReactComponentConfigHelper);
```

---

## Phase 3: Upgrade to Nx Monorepo (React MFE)

**Time**: ~3 hours  
**Difficulty**: ⭐⭐⭐⭐

### Step 3.1: Create Nx Workspace

```bash
cd /Users/mmallesh/Documents/Repos/learning-mfe-demo

# Backup existing react-mfe
mv react-mfe react-mfe-backup

# Create new Nx workspace
npx create-nx-workspace@latest react-mfe --preset=react-monorepo --packageManager=pnpm
cd react-mfe
```

### Step 3.2: Create Host App

```bash
npx nx g @nx/react:app host_main --directory=apps/host_main
```

### Step 3.3: Create Feature Modules

```bash
# Create modules
npx nx g @nx/react:library admin --directory=modules/admin --buildable
npx nx g @nx/react:library tickets --directory=modules/tickets --buildable
npx nx g @nx/react:library users --directory=modules/users --buildable
```

### Step 3.4: Configure Module Federation

**Create**: `apps/host_main/module-federation.config.ts`

```typescript
import { type ModuleFederationOptions } from '@module-federation/vite/lib/utils/normalizeModuleFederationOptions';

const CONFIG: ModuleFederationOptions = {
  name: 'host_main',
  filename: 'remoteEntry.js',
  exposes: {
    './renderComponent': './src/remote-entry-rc.ts',
  },
  shareStrategy: 'loaded-first',
  remotes: {},
  shared: {
    react: {
      requiredVersion: '18.3.1',
      singleton: true,
    },
    'react-dom': {
      requiredVersion: '18.3.1',
      singleton: true,
    },
  },
};

export default CONFIG;
```

### Step 3.5: Move Components to Modules

```bash
# Move TicketsList and TicketDetail to tickets module
mv ../react-mfe-backup/src/components/TicketsList.tsx modules/tickets/src/lib/
mv ../react-mfe-backup/src/components/TicketDetail.tsx modules/tickets/src/lib/

# Move UsersTable to users module
mv ../react-mfe-backup/src/components/UsersTable.tsx modules/users/src/lib/

# Update exports
# modules/tickets/src/index.ts
export { default as TicketsList } from './lib/TicketsList';
export { default as TicketDetail } from './lib/TicketDetail';

# modules/users/src/index.ts
export { default as UsersTable } from './lib/UsersTable';
```

### Step 3.6: Update Component Map

**Update**: `apps/host_main/src/remote-entry-rc.ts`

```typescript
const COMPONENT_MAP = {
  TicketsList: () => import('@learning-mfe/tickets').then(m => m.TicketsList),
  TicketDetail: () => import('@learning-mfe/tickets').then(m => m.TicketDetail),
  UsersTable: () => import('@learning-mfe/users').then(m => m.UsersTable),
};
```

### Step 3.7: Build and Run

```bash
# Build all modules
npx nx run-many --target=build --all

# Run host app
npx nx serve host_main
```

---

## Phase 4: Add React Refresh (HMR) Support

**Time**: ~1 hour  
**Difficulty**: ⭐⭐⭐

### Step 4.1: Update Ember Component

**Add to**: `ember-host/app/components/render-react-component/component.js`

```javascript
@action
async setupReactRefresh() {
  if (!window.__vite_plugin_react_preamble_installed__) {
    try {
      const RefreshRuntime = await this.dynamicImport(`${ENV.REACT_MFE_URL}/@react-refresh`);
      RefreshRuntime.default.injectIntoGlobalHook(window);
      window.$RefreshReg$ = () => {};
      window.$RefreshSig$ = () => (type) => type;
      window.__vite_plugin_react_preamble_installed__ = true;
      console.log('[Ember] React Refresh runtime loaded');
    } catch (error) {
      console.error('[Ember] Failed to load React Refresh runtime', error);
    }
  }
}

@action
loadReactComponent() {
  // Setup HMR in development
  if (ENV.environment === 'development') {
    this.setupReactRefresh();
  }

  this.listenToReactMessage();
  this.loadRemoteEntry();
}
```

---

## Phase 5: Add Testing Utilities

**Time**: ~2 hours  
**Difficulty**: ⭐⭐⭐⭐

### Step 5.1: Create MFE Test Utilities

**Create**: `ember-host/tests/helpers/react-mfe-test-utils.js`

```javascript
import { settled } from '@ember/test-helpers';

export async function mountReactComponentForSelector(selectorId) {
  const channel = new MessageChannel();

  window.dispatchEvent(new MessageEvent('message', {
    data: {
      type: 'fs-react-mfe-host-main-init',
      domElementSelectorId: `#${selectorId}`,
    },
    ports: [channel.port2],
  }));

  channel.port1.postMessage({
    action: 'componentMounted',
    payload: {
      message: 'Component Mounted',
      domElementSelectorId: `#${selectorId}`,
    },
  });

  await settled();

  return channel;
}

export function setupMfeStubs(context) {
  const sinon = context.sinon;
  
  context.evalStub = sinon.stub(window, 'eval');

  context.remoteEntryStub = {
    get: sinon.stub().callsFake((path) => {
      if (path === './renderComponent') {
        return Promise.resolve(() => ({
          default: ({ props }) => {
            context.capturedProps = props;
          }
        }));
      }
      return Promise.resolve({});
    }),
    init: sinon.stub().resolves(),
  };

  context.evalStub.callsFake((args) => {
    if (args.includes('remoteEntry')) {
      return Promise.resolve(context.remoteEntryStub);
    }
  });
}
```

### Step 5.2: Write Tests

**Create**: `ember-host/tests/integration/components/render-react-component-test.js`

```javascript
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMfeStubs, mountReactComponentForSelector } from 'ember-host/tests/helpers/react-mfe-test-utils';

module('Integration | Component | render-react-component', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders React component and establishes MessageChannel', async function(assert) {
    setupMfeStubs(this);

    this.set('handleMounted', (payload) => {
      assert.ok(true, 'Component mounted callback triggered');
      assert.equal(payload.message, 'Component Mounted');
    });

    await render(hbs`
      <RenderReactComponent
        @domElementSelectorId="test-component"
        @componentName="UsersTable"
        @moduleName="main"
        @props={{hash users=(array)}}
        @onComponentMounted={{this.handleMounted}}
      />
    `);

    const channel = await mountReactComponentForSelector('test-component');

    assert.ok(channel, 'MessageChannel created');
    assert.ok(this.capturedProps, 'Props captured');
  });

  test('it sends unmount message on destroy', async function(assert) {
    setupMfeStubs(this);

    await render(hbs`
      <RenderReactComponent
        @domElementSelectorId="test-component"
        @componentName="UsersTable"
        @moduleName="main"
        @props={{hash users=(array)}}
      />
    `);

    const channel = await mountReactComponentForSelector('test-component');

    let unmountReceived = false;
    channel.port1.onmessage = (event) => {
      if (event.data.action === 'unmount') {
        unmountReceived = true;
      }
    };

    // Destroy component
    await this.clearRender();

    assert.ok(unmountReceived, 'Unmount message sent');
  });
});
```

---

## Phase 6: Create Shared Component Library

**Time**: ~4 hours  
**Difficulty**: ⭐⭐⭐⭐

### Step 6.1: Create Library Repository

```bash
cd /Users/mmallesh/Documents/Repos/learning-mfe-demo
mkdir ui-library
cd ui-library

# Initialize pnpm workspace
pnpm init
```

**Create**: `package.json`

```json
{
  "name": "@learning-mfe/ui-library",
  "version": "1.0.0",
  "workspaces": ["packages/*"],
  "scripts": {
    "build": "pnpm -r run build",
    "dev": "pnpm -r run dev --parallel"
  }
}
```

### Step 6.2: Create Component Package

```bash
mkdir -p packages/components
cd packages/components
pnpm init
pnpm add react react-dom typescript vite @types/react @types/react-dom
```

**Create**: `packages/components/package.json`

```json
{
  "name": "@learning-mfe/components",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "vite build",
    "dev": "vite build --watch"
  }
}
```

### Step 6.3: Create Components

**Create**: `packages/components/src/Button/Button.tsx`

```typescript
import React from 'react';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  onClick,
  children,
}) => {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
```

**Create**: `packages/components/src/index.ts`

```typescript
export { Button } from './Button/Button';
export type { ButtonProps } from './Button/Button';
// Export more components...
```

### Step 6.4: Use in React MFE

```bash
cd react-mfe
pnpm add @learning-mfe/components@workspace:*
```

```typescript
// react-mfe/src/components/TicketsList.tsx
import { Button } from '@learning-mfe/components';

// Use in component
<Button variant="primary" onClick={handleCreate}>
  Create Ticket
</Button>
```

---

## ✅ Completion Checklist

- [ ] **Phase 1**: MessageChannel communication working
  - [ ] Ember sends messages to React
  - [ ] React sends messages to Ember
  - [ ] Lifecycle events tracked
  - [ ] Console logs show bidirectional communication

- [ ] **Phase 2**: Component registry implemented
  - [ ] Central `REACT_COMPONENTS_MAP` created
  - [ ] Helper function to get component config
  - [ ] All routes use registry

- [ ] **Phase 3**: Nx monorepo setup
  - [ ] Host app created
  - [ ] Modules created (admin, tickets, users)
  - [ ] Components moved to modules
  - [ ] Build and serve working

- [ ] **Phase 4**: React Refresh (HMR)
  - [ ] HMR setup in Ember
  - [ ] Changes in React hot reload

- [ ] **Phase 5**: Testing utilities
  - [ ] `react-mfe-test-utils.js` created
  - [ ] MFE stubs working
  - [ ] Tests passing

- [ ] **Phase 6**: Component library
  - [ ] Separate library repository
  - [ ] Components exported
  - [ ] Used in React MFE

---

## 🎓 What You've Learned

After completing all phases, you've implemented:

✅ **Production MessageChannel communication** - Bi-directional, type-safe, event-driven  
✅ **Component registry pattern** - Centralized management of React components  
✅ **Nx monorepo** - Scalable module architecture  
✅ **HMR support** - Fast development workflow  
✅ **Testing utilities** - Mock MFE for fast unit tests  
✅ **Shared component library** - Reusable UI components

You're now ready to discuss **real production microfrontend architecture** in interviews!

---

## 🚀 Next Steps

1. **Deploy to Production**: Add CI/CD pipeline, CDN deployment
2. **Add More Modules**: Create `admin`, `reports`, `settings` modules
3. **Performance Optimization**: Lazy loading, code splitting
4. **Monitoring**: Add error tracking, analytics
5. **Documentation**: Storybook for component library

---

**📖 Related Docs**:
- [ARCHITECTURE_COMPARISON.md](./ARCHITECTURE_COMPARISON.md) - Understand the real Freshservice architecture
- [MESSAGE_CHANNEL_GUIDE.md](./MESSAGE_CHANNEL_GUIDE.md) - Deep dive into MessageChannel API
- [START_HERE.md](../START_HERE.md) - Quick start guide

Good luck upgrading to production patterns! 🎉

