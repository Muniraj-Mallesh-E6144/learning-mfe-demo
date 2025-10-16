# Architecture Comparison: Real Freshservice vs Learning Demo

> **Purpose**: This document compares the real Freshservice microfrontend architecture with our simplified learning demo to help you understand both the production implementation and the core concepts.

---

## 📊 High-Level Architecture

### Real Freshservice (`itildesk` + `fs-react-mfe`)

```
┌──────────────────────────────────────────────────────────────────────┐
│                          Rails Backend (itildesk)                     │
│                      Ruby on Rails API-first backend                  │
│                     + Ember Frontend (frontend/)                      │
└──────────────────────────────────────────────────────────────────────┘
                                    ↓
┌──────────────────────────────────────────────────────────────────────┐
│                       Ember Host Application                          │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  render-react-component (Component)                            │  │
│  │  - Loads React MFE via Module Federation                       │  │
│  │  - Uses dynamic import() with eval()                           │  │
│  │  - Establishes MessageChannel for communication                │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
                                    ↓
┌──────────────────────────────────────────────────────────────────────┐
│               React Microfrontends (fs-react-mfe)                     │
│                        Nx Monorepo Structure                          │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  apps/host_main/                                               │  │
│  │  - Module Federation host                                      │  │
│  │  - Exposes: ./renderComponent, ./renderApp                     │  │
│  │  - Port: 5000                                                  │  │
│  └────────────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  modules/                                                       │  │
│  │  ├── admin/         (Journey configs, alerts, status pages)   │  │
│  │  ├── msp/           (Time entries widget)                      │  │
│  │  └── service-catalog/ (Shared fields)                          │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
                                    ↓
┌──────────────────────────────────────────────────────────────────────┐
│          React UI Component Library (fs-react-ui-library)             │
│  - Shared design system components                                    │
│  - 35+ components (Button, Table, Dialog, etc.)                       │
│  - Separate monorepo                                                  │
└──────────────────────────────────────────────────────────────────────┘
```

### Learning Demo

```
┌──────────────────────────────────────────────────────────────────────┐
│                    Rails Backend (backend/)                           │
│                    Simple API-only Rails app                          │
│                    Tickets + Users endpoints                          │
└──────────────────────────────────────────────────────────────────────┘
                                    ↓
┌──────────────────────────────────────────────────────────────────────┐
│                  Ember Host Application (ember-host/)                 │
│  - Simplified routing                                                 │
│  - Basic Module Federation integration                                │
│  - Inline React component mounting                                    │
└──────────────────────────────────────────────────────────────────────┘
                                    ↓
┌──────────────────────────────────────────────────────────────────────┐
│              React Microfrontend (react-mfe/)                         │
│  - Single Vite project (not Nx monorepo)                             │
│  - Module Federation plugin                                           │
│  - Exposes: ./TicketsList, ./UsersTable, ./TicketDetail              │
│  - Port: 3001                                                         │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 🔍 Detailed Comparison

### 1. **Project Structure**

| Aspect | Real Freshservice | Learning Demo |
|--------|------------------|---------------|
| **Backend** | Rails monolith with complex API | Simple Rails API |
| **Frontend Host** | Ember (34,000+ files) | Ember (minimal setup) |
| **React MFE** | Nx monorepo with multiple modules | Single Vite project |
| **Component Library** | Separate monorepo (`fs-react-ui-library`) | Inline components |
| **Ports** | Ember: 4000, React: 5000 | Ember: 4200, React: 3001, Backend: 3000 |

---

### 2. **Ember ↔ React Integration**

#### Real Freshservice (`render-react-component`)

**Location**: `itildesk/frontend/app/components/render-react-component/`

**Template** (`template.hbs`):
```handlebars
<div
  id={{@domElementSelectorId}}
  class={{@classNames}}
  {{did-insert this.loadReactRenderComponentBasedOnSetup}}
  {{will-destroy this.destroyMessageListener}}
  data-test-id="react-content-wrapper"
></div>
```

**Key Features**:
1. **Dynamic Module Loading**: Uses `eval()` for dynamic imports
2. **Module Federation**: Loads `remoteEntry.js` from React MFE
3. **MessageChannel API**: Bi-directional communication between Ember ↔ React
4. **Lifecycle Events**: `init`, `componentMounted`, `componentUnmounted`, `componentFullyLoaded`
5. **React Refresh (HMR)**: Supports hot module replacement in dev mode
6. **Analytics Tracking**: Tracks component load time and lifecycle

**Component Code** (simplified):
```javascript
export default class RenderReactComponentComponent extends Component {
  get REMOTE_ENTRY_URL() {
    return ENV.environment === 'development' 
      ? `${ENV.reactAssetUrl}/remoteEntry.js` 
      : window.REACT_URL;
  }

  @action
  async dynamicImport(modulePath) {
    return await eval(`import('${modulePath}')`);
  }

  @action
  async loadRemoteEntry(isDev) {
    let { get, init } = await this.dynamicImport(this.REMOTE_ENTRY_URL);
    await init();
    const component = await get('./renderComponent');
    await component().default({
      moduleName: this.args.moduleName,
      componentName: this.args.componentName,
      domElementSelectorId: this.domElementSelectorString,
      props: this.args.props,
    });
  }

  @action
  messageListener(e) {
    if (e.data.type === 'fs-react-mfe-host-main-init') {
      this.messagePort = e.ports[0];
      this.messagePort.onmessage = (msgEvent) => {
        const action = msgEvent?.data?.action;
        // Handle lifecycle and custom events
        this.args.messageCallback?.(msgEvent.data);
      };
    }
  }

  @action
  listenToReactMessage() {
    window.addEventListener('message', this.messageListener);
  }

  @action
  destroyMessageListener() {
    this.messagePort?.postMessage({ action: 'unmount' });
  }
}
```

**Usage Example**:
```handlebars
<RenderReactComponent
  @domElementSelectorId="react-time-entries-widget"
  @componentName="TimeEntriesWidget"
  @moduleName="msp"
  @props={{hash userId=this.userId}}
  @messageCallback={{this.handleMessage}}
  @eventLifecycleCallback={{this.handleLifecycle}}
  @trackComponentRenderTime={{true}}
/>
```

#### Learning Demo

**Simplified inline component**:
```handlebars
{{!-- users.hbs --}}
<div id="react-users-table" {{did-insert this.mountReactComponent}}></div>
```

```javascript
// routes/users.js
@action
async mountReactComponent() {
  const { UsersTable } = await import('http://localhost:3001/remoteEntry.js');
  // Mount directly (simplified)
}
```

**Key Differences**:
- ❌ No MessageChannel (learning demo is simpler)
- ❌ No lifecycle event tracking
- ❌ No HMR support
- ✅ Direct import (easier to understand)

---

### 3. **Module Federation Configuration**

#### Real Freshservice (`host_main/module-federation.config.ts`)

```typescript
import { type ModuleFederationOptions } from '@module-federation/vite/lib/utils/normalizeModuleFederationOptions';

const CONFIG: ModuleFederationOptions = {
  name: 'host_main',
  filename: 'remoteEntry.js',
  exposes: {
    './renderApp': './src/remote-entry.ts',
    './renderComponent': './src/remote-entry-rc.ts',  // 👈 Key entry point
  },
  shareStrategy: 'loaded-first', // On-demand loading
  dev: IS_DEV,
  dts: true,
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
```

**Key Points**:
1. **`./renderComponent`**: Special entry point for embedding individual components
2. **`shareStrategy: 'loaded-first'`**: Loads remotes on-demand (not eager)
3. **`dts: true`**: Generates TypeScript definitions
4. **Singleton React**: Ensures only one React instance

#### Learning Demo (`react-mfe/vite.config.ts`)

```javascript
federation({
  name: 'reactMfe',
  filename: 'remoteEntry.js',
  exposes: {
    './TicketsList': './src/components/TicketsList.tsx',
    './UsersTable': './src/components/UsersTable.tsx',
    './TicketDetail': './src/components/TicketDetail.tsx',
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
})
```

**Key Differences**:
- ❌ No `renderComponent` abstraction (exposes components directly)
- ❌ No `shareStrategy` configuration
- ❌ No TypeScript definitions
- ✅ Simpler for learning

---

### 4. **React MFE Structure**

#### Real Freshservice (Nx Monorepo)

```
fs-react-mfe/
├── apps/
│   └── host_main/                    # Main host application
│       ├── src/
│       │   ├── bootstrap.tsx          # App initialization
│       │   ├── remote-entry.ts        # Full app entry
│       │   ├── remote-entry-rc.ts     # Component entry 👈
│       │   ├── RenderComponent.tsx    # Component renderer
│       │   └── router.tsx             # TanStack Router
│       └── module-federation.config.ts
│
├── modules/                           # Feature modules (loaded on-demand)
│   ├── admin/
│   │   └── src/
│   │       ├── features/
│   │       │   ├── journeys/          # Journey configurations
│   │       │   ├── itom/              # Alert field manager
│   │       │   └── status-page/       # Status page templates
│   │       └── pages/                 # Route pages
│   ├── msp/
│   │   └── src/
│   │       └── features/
│   │           └── time-entries/      # Time entries widget
│   └── service-catalog/
│       └── src/
│           └── features/
│               └── shared-fields/     # Service catalog fields
│
├── libs/                              # Shared libraries
├── shared.config.ts                   # Shared Vite config
└── nx.json                            # Nx configuration
```

**Benefits**:
- 🎯 **Code organization**: Features are isolated in modules
- 🎯 **On-demand loading**: Modules loaded only when needed
- 🎯 **Independent deployment**: Each module can be deployed separately
- 🎯 **Shared configuration**: Centralized Vite and build configs

#### Learning Demo (Single Vite Project)

```
react-mfe/
├── src/
│   ├── components/
│   │   ├── TicketsList.tsx
│   │   ├── UsersTable.tsx
│   │   └── TicketDetail.tsx
│   ├── mockData.ts
│   └── main.tsx
└── vite.config.ts
```

**Trade-offs**:
- ❌ No module separation
- ❌ No lazy loading
- ✅ Easier to understand
- ✅ Faster to set up

---

### 5. **Component Mapping & Registry**

#### Real Freshservice

**Location**: `itildesk/frontend/app/constants/react/render-component-map.js`

```javascript
const REACT_COMPONENTS_MAP = {
  time_entries_widget: {
    moduleName: 'msp',
    selectorId: 'react-time-entries-widget',
    componentName: 'TimeEntriesWidget',
  },
  alert: {
    alertPayloadMapping: {
      moduleName: 'admin',
      selectorId: 'react-alert-payload-mapping',
      componentName: 'PayloadMapping'
    },
  },
  statusPage: {
    templates_selector_panel: {
      moduleName: 'statusPage',
      selectorId: 'template-picker-panel',
      componentName: 'TemplatePickerPanel',
    },
  },
};

const LIFECYCLE_EVENTS = {
  init: 'init',
  componentMounted: 'componentMounted',
  componentUnmounted: 'componentUnmounted',
  componentFullyLoaded: 'componentFullyLoaded',
};
```

**Purpose**:
- 📋 Central registry of all React components
- 📋 Maps component names to module names
- 📋 Ensures consistent DOM selector IDs
- 📋 Defines lifecycle events

#### Learning Demo

**No central registry** - Components are directly imported:
```javascript
const { TicketsList } = await import('http://localhost:3001/remoteEntry.js');
```

---

### 6. **Communication Patterns**

#### Real Freshservice (MessageChannel API)

**Ember → React Communication**:
```javascript
// Ember sends message to React
this.messagePort.postMessage({
  action: 'updateData',
  payload: { userId: 123 }
});
```

**React → Ember Communication**:
```javascript
// React sends message to Ember
messagePort.postMessage({
  action: 'dataFetched',
  payload: { count: 50 }
});
```

**Lifecycle Events**:
1. **`init`**: React component initialized
2. **`componentMounted`**: React component mounted to DOM
3. **`componentFullyLoaded`**: All data loaded
4. **`componentUnmounted`**: Component cleaned up

**Benefits**:
- ✅ Type-safe bi-directional communication
- ✅ Decoupled (Ember and React don't know about each other)
- ✅ Event-driven architecture
- ✅ Easy to test

#### Learning Demo

**Props-based communication** (one-way):
```javascript
// Ember passes props to React
this.reactComponent.mount({
  apiHost: 'http://localhost:3000',
  filter: 'open'
});
```

**No bi-directional communication** in learning demo.

---

### 7. **Environment Configuration**

#### Real Freshservice

**Ember Config** (`itildesk/frontend/config/development.js`):
```javascript
module.exports = function() {
  let ENV = {
    reactAssetUrl: 'http://localhost.freshservice-dev.com:5000',
    APP: {
      rootElement: 'body',
      renderInEmber: true,
      hostURL: 'http://localhost.freshservice-dev.com:4000',
      microservices: {
        oncall: {
          url: 'http://localhost.freshservice-dev.com:8080',
          headers: {
            'Authorization': 'Bearer <token>',
            'withCredentials': true
          }
        },
        journey: {
          url: 'http://localhost.freshservice-dev.com:8080',
        }
      },
    },
  };
  return ENV;
};
```

**React Config** (`fs-react-mfe/shared.config.ts`):
```typescript
const __BASE_DOMAIN__ = process.env.BASE_DOMAIN || 'localhost.freshservice-dev.com';

export const PORTS = {
  SHELL_APP: 5000,
};

export const BASE_URL = `http://${__BASE_DOMAIN__}`;
export const BASE_API_URL = `${BASE_URL}:4000/api/_`;
export const CDN_URL = IS_PRODUCTION
  ? 'https://assets18.freshservice.com/mfe'
  : 'https://assets18.freshgenie.com/mfe';
```

**Key Features**:
- 🌍 Domain-based routing (`localhost.freshservice-dev.com`)
- 🌍 CDN support for production
- 🌍 Microservices configuration
- 🌍 Environment-specific asset URLs

#### Learning Demo

**Simple hardcoded URLs**:
```javascript
// Ember: http://localhost:4200
// React: http://localhost:3001
// Backend: http://localhost:3000
```

---

### 8. **Build & Deploy**

#### Real Freshservice

**Build Pipeline**:
1. **Nx Monorepo**: Uses Nx to build affected projects only
2. **Module Federation**: Builds each module independently
3. **CDN Deployment**: Assets deployed to `assets18.freshservice.com/mfe`
4. **Version Management**: Each module versioned independently

**Commands**:
```bash
# Build affected projects
npx nx affected:build

# Build specific module
npx nx build admin

# Run tests
npx nx test admin
npx nx e2e host_main

# Generate dependency graph
npx nx graph
```

#### Learning Demo

**Simple builds**:
```bash
# Backend
cd backend && bundle exec rails server

# Ember
cd ember-host && pnpm start

# React MFE
cd react-mfe && pnpm dev
```

---

### 9. **Testing**

#### Real Freshservice

**Ember Tests** (`itildesk/frontend/tests/lib/react-mfe-test-utils.js`):
```javascript
// Mock React MFE for testing
export async function mountReactComponentForSelector(selectorId) {
  const channel = new MessageChannel();

  // Simulate MFE init event
  window.dispatchEvent(new MessageEvent('message', {
    data: {
      type: 'fs-react-mfe-host-main-init',
      domElementSelectorId: `#${selectorId}`,
    },
    ports: [channel.port2],
  }));

  // Simulate component mounted response
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
  const sinon = context.sinon || getSinonContext();
  
  // Stub eval() to intercept dynamic imports
  context.evalStub = sinon.stub(window, 'eval');
  
  // Mock remoteEntry interface
  context.remoteEntryStub = {
    get: sinon.stub().callsFake((path) => {
      if (path === './renderComponent') {
        return Promise.resolve(getComponentMock);
      }
      if (path === './unmountReact') {
        return Promise.resolve(() => {});
      }
      return Promise.resolve({});
    }),
    init: sinon.stub().resolves(),
  };

  // Capture props passed to React components
  context.evalStub.callsFake((args) => {
    if (args.includes('remoteEntry')) {
      return Promise.resolve(context.remoteEntryStub);
    }
  });
}
```

**Benefits**:
- ✅ Test Ember components without running React MFE
- ✅ Verify props passed to React
- ✅ Test MessageChannel communication
- ✅ Fast unit tests

#### Learning Demo

**No testing setup** - focused on learning architecture.

---

### 10. **UI Component Library**

#### Real Freshservice (`fs-react-ui-library`)

**Structure**:
```
fs-react-ui-library/
├── packages/
│   └── fs-react-ui-library-mcp/
│       └── knowledgebase/
│           └── components/
│               ├── Avatar.md
│               ├── Badge.md
│               ├── Button.md
│               ├── Card.md
│               ├── Checkbox.md
│               ├── DateTimePickers.md
│               ├── Dialog.md
│               ├── EmptyState.md
│               ├── ExpressionBuilder.md
│               ├── FieldManager.md
│               ├── FlashMessage.md
│               ├── InfiniteScrollLoader.md
│               ├── InlineMessage.md
│               ├── InputGroup.md
│               ├── KanbanBoard.md
│               ├── Label.md
│               ├── Menu.md
│               ├── Popover.md
│               ├── Radio.md
│               ├── RichTextEditor.md
│               ├── Select.md
│               ├── Spinner.md
│               ├── Switch.md
│               ├── Table.md
│               ├── Tabs.md
│               ├── TextArea.md
│               ├── TextInput.md
│               ├── Tooltip.md
│               └── Wizard.md
├── src/                     # Component implementations
├── docs/                    # Storybook documentation
├── .storybook/              # Storybook configuration
└── package.json
```

**35+ Production-Ready Components**:
- ✅ Design system aligned
- ✅ Storybook documentation
- ✅ Accessibility (ARIA)
- ✅ TypeScript
- ✅ Unit tests
- ✅ Reusable across all MFEs

#### Learning Demo

**Inline components** - no shared library.

---

## 🎯 Key Takeaways

### Real Freshservice Strengths
1. **Enterprise-scale**: Nx monorepo for managing 50+ projects
2. **On-demand loading**: Modules loaded only when needed
3. **Bi-directional communication**: MessageChannel API for robust Ember ↔ React communication
4. **Production-ready**: CDN deployment, versioning, monitoring
5. **Developer experience**: HMR, TypeScript, testing utilities
6. **Design system**: Shared component library across all MFEs

### Learning Demo Strengths
1. **Simplicity**: Easy to understand core concepts
2. **Quick setup**: Get started in minutes
3. **No complex tooling**: Standard Vite + Ember CLI
4. **Mock data**: Run without backend
5. **Clear documentation**: Step-by-step guides

---

## 📚 What You've Learned

Even with the simplified demo, you've mastered the **core concepts**:

### ✅ Architecture Patterns
- **Microfrontend architecture**: Breaking a monolith into smaller pieces
- **Module Federation**: Sharing code between applications at runtime
- **Host-remote pattern**: Ember as host, React as remote

### ✅ Integration Techniques
- **Dynamic imports**: Loading React components on-demand
- **DOM mounting**: Embedding React in Ember's DOM
- **Props passing**: Sending data from Ember to React

### ✅ Build Tools
- **Vite**: Fast development server with Module Federation
- **Ember CLI**: Traditional Ember build pipeline
- **Rails Asset Pipeline**: Serving static assets

### ✅ Communication Patterns
- **Props-based**: One-way data flow (learning demo)
- **Event-based**: MessageChannel API (real Freshservice)

---

## 🚀 Next Steps to Master the Real Architecture

### 1. **Upgrade to Nx Monorepo**
```bash
# Create Nx workspace
npx create-nx-workspace@latest fs-react-mfe --preset=react-monorepo

# Add modules
npx nx g @nx/react:library admin
npx nx g @nx/react:library msp
```

### 2. **Implement MessageChannel Communication**
Study `itildesk/frontend/app/components/render-react-component/component.js` and implement:
- Lifecycle events (`init`, `componentMounted`, etc.)
- Bi-directional messaging
- Event callbacks

### 3. **Add Component Registry**
Create a central map like `REACT_COMPONENTS_MAP` to manage all React components.

### 4. **Set Up Testing**
Implement the testing utilities from `itildesk/frontend/tests/lib/react-mfe-test-utils.js`.

### 5. **Build a Shared Component Library**
Create a separate repository for reusable React components.

---

## 🎤 Interview Talking Points

### When discussing microfrontend architecture:

1. **"In Freshservice, we use Module Federation to load React microfrontends on-demand into an Ember host application."**

2. **"The Ember host uses a `render-react-component` wrapper that dynamically imports the React MFE's `remoteEntry.js` using `eval()` and establishes bi-directional communication via MessageChannel API."**

3. **"We organize React MFEs in an Nx monorepo with feature modules like `admin`, `msp`, and `service-catalog`, each deployed independently to CDN."**

4. **"Communication between Ember and React happens through lifecycle events (`init`, `componentMounted`, `componentFullyLoaded`) and custom message passing via MessagePort."**

5. **"We use a central component registry (`REACT_COMPONENTS_MAP`) to map component names to modules, ensuring consistent DOM selectors and standardized loading patterns."**

6. **"The `shareStrategy: 'loaded-first'` configuration ensures React MFEs are loaded on-demand rather than eagerly, improving initial load time."**

7. **"In development, we support React Refresh (HMR) by dynamically injecting the Vite HMR runtime into the Ember app."**

8. **"For testing, we mock the Module Federation remoteEntry interface and MessageChannel communication, allowing fast unit tests without running the full React MFE."**

---

## 📖 Additional Resources

### From Real Codebase
- `itildesk/frontend/app/components/render-react-component/component.js` - Core integration logic
- `itildesk/frontend/tests/lib/react-mfe-test-utils.js` - Testing utilities
- `fs-react-mfe/apps/host_main/module-federation.config.ts` - Module Federation config
- `fs-react-mfe/shared.config.ts` - Shared build configuration

### From Learning Demo
- `learning-mfe-demo/START_HERE.md` - Quick start guide
- `learning-mfe-demo/docs/ARCHITECTURE.md` - Simplified architecture
- `learning-mfe-demo/docs/FRONTEND_ONLY_MODE.md` - Running without backend

---

**💡 Pro Tip**: Always start with the simplified learning demo to understand core concepts, then dive into the real codebase to see production patterns. The journey from simple to complex is the best way to learn!

**🎯 Interview Success Formula**:
1. Explain the **concept** (Module Federation, MessageChannel)
2. Show you've **implemented it** (learning demo)
3. Discuss **production patterns** (real Freshservice architecture)
4. Highlight **trade-offs** (simplicity vs. scalability)

Good luck with your interviews! 🚀

