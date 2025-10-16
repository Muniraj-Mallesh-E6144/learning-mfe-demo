# Ember Host Application - Learning MFE Demo

## Overview
This is the **host application** in our microfrontend architecture. It's built with Ember.js and serves as the main container that integrates React microfrontends. Think of it as the "shell" or "container" app.

## Architecture Role

In the Freshservice architecture:
- **Ember Host** = Main application (routing, navigation, legacy features)
- **React MFEs** = New features built as microfrontends
- Communication via **MessageChannel API** (postMessage)

### Why Ember as the Host?

1. **Legacy Compatibility**: Freshservice's main app was originally built in Ember
2. **Gradual Migration**: Allows migrating to React feature-by-feature without a complete rewrite
3. **Routing Control**: Ember manages the main routing and navigation
4. **Shared Services**: Ember provides shared services (auth, API, etc.) to React MFEs

## Key Concepts

### 1. Ember Octane Edition
This uses Ember Octane (modern Ember):
- Glimmer Components (class-based with decorators)
- Tracked properties for reactivity
- Native JavaScript classes
- Template co-location

### 2. Component: render-react-component
This is the **bridge component** that loads React microfrontends:
- Dynamically imports the React remote entry
- Establishes MessageChannel for communication
- Passes props from Ember to React
- Handles lifecycle (mount/unmount)

### 3. Routes and Navigation
Ember manages the main routes:
- `/dashboard` - Dashboard (Ember)
- `/users` - Users list (Ember with React table component)
- `/tickets` - Tickets (React MFE)
- `/tickets/:id` - Ticket details (React MFE)

## Project Structure

```
ember-host/
├── app/
│   ├── components/
│   │   └── render-react-component/
│   │       ├── component.js        # Bridge to React MFEs
│   │       └── template.hbs
│   ├── controllers/
│   ├── routes/
│   │   ├── application.js
│   │   ├── dashboard.js
│   │   ├── users.js
│   │   └── tickets.js
│   ├── services/
│   │   └── api.js                  # API service for backend calls
│   ├── styles/
│   │   └── app.css
│   ├── templates/
│   │   ├── application.hbs
│   │   ├── dashboard.hbs
│   │   └── users.hbs
│   ├── app.js
│   ├── index.html
│   └── router.js
├── config/
│   └── environment.js              # Configuration (API URLs, React MFE URLs)
├── public/
├── tests/
├── ember-cli-build.js
├── package.json
└── README.md
```

## Setup

### Prerequisites
- Node.js 18+ 
- pnpm 8+

### Installation

```bash
# Install dependencies
pnpm install

# Start the development server
pnpm start

# Visit the app
open http://localhost:4200
```

The Ember app will run on port **4200** and will make API calls to the Rails backend on port **3000**.

## Configuration

### Environment Configuration
The `config/environment.js` file contains important settings:

```javascript
ENV.API_HOST = 'http://localhost:3000';
ENV.REACT_MFE_URL = 'http://localhost:5000';
```

- **API_HOST**: Where the Rails API is running
- **REACT_MFE_URL**: Where the React MFE is running

### Connecting to Backend
The app uses `ember-fetch` or `ember-data` to make API calls:

```javascript
// Using fetch
const response = await fetch('http://localhost:3000/api/v1/users');
const users = await response.json();
```

## Integrating React Microfrontends

### Step 1: Use the Bridge Component

In any Ember template, you can embed a React component:

```handlebars
<RenderReactComponent
  @componentName="Dashboard"
  @moduleName="host_main"
  @domElementSelectorId="react-dashboard"
  @props={{hash
    userId=this.currentUser.id
    apiUrl=this.apiUrl
  }}
  @eventLifecycleCallback={{this.handleReactLifecycle}}
/>
```

### Step 2: How It Works

1. **Dynamic Import**: The component dynamically imports the React remoteEntry.js
2. **Module Federation**: Uses Webpack Module Federation to load the React app
3. **MessageChannel**: Establishes two-way communication
4. **Props Passing**: Ember passes props to React as JSON
5. **Lifecycle Events**: React notifies Ember of mount/unmount/errors

### Step 3: Communication Flow

```
┌─────────────────────────────────────────────────────┐
│                  Ember Host (4200)                  │
│                                                     │
│  ┌───────────────────────────────────┐            │
│  │  render-react-component           │            │
│  │                                   │            │
│  │  1. Dynamic import remoteEntry.js │◄───────┐   │
│  │  2. Initialize Module Federation  │        │   │
│  │  3. Create MessageChannel         │        │   │
│  │  4. Pass props                    │        │   │
│  │  5. Listen for events             │        │   │
│  └───────────────┬───────────────────┘        │   │
│                  │                             │   │
│                  │ postMessage                 │   │
│                  ▼                             │   │
│      ┌─────────────────────────┐              │   │
│      │   React Component       │──────────────┘   │
│      │   (rendered in DOM)     │                  │
│      └─────────────────────────┘                  │
└─────────────────────────────────────────────────────┘
           │                        ▲
           │ API Calls              │ JSON Response
           ▼                        │
┌─────────────────────────────────────────────────────┐
│            Rails Backend (3000)                     │
│                                                     │
│  /api/v1/users    /api/v1/tickets                  │
└─────────────────────────────────────────────────────┘
```

## Key Files Explained

### app/components/render-react-component/component.js
This is the **most important file** for understanding MFE integration:
- Dynamically imports React remote entry
- Sets up MessageChannel for bidirectional communication
- Handles React HMR (Hot Module Replacement) in development
- Manages component lifecycle

### app/router.js
Defines all routes in the application:
```javascript
Router.map(function() {
  this.route('dashboard');
  this.route('users');
  this.route('tickets', function() {
    this.route('detail', { path: '/:ticket_id' });
  });
});
```

### app/services/api.js
Centralized service for API calls:
```javascript
export default class ApiService extends Service {
  @service fetch;
  
  async getUsers() {
    const response = await fetch('/api/v1/users');
    return response.json();
  }
}
```

## Development Workflow

### Running with Backend

**Terminal 1** (Rails backend):
```bash
cd backend
rails server -p 3000
```

**Terminal 2** (Ember host):
```bash
cd ember-host
pnpm start
```

**Terminal 3** (React MFE):
```bash
cd react-mfe
pnpm dev
```

Now visit http://localhost:4200

### Development Tips

1. **Ember Inspector**: Install the Ember Inspector browser extension for debugging
2. **Live Reload**: Ember auto-reloads on file changes
3. **API Proxy**: Configure proxy in `ember-cli-build.js` if needed
4. **React DevTools**: Still works for inspecting React components embedded in Ember

## Common Issues & Solutions

### Issue 1: API CORS Errors
**Error**: `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution**: Ensure Rails backend CORS is configured (see backend/config/initializers/cors.rb)

### Issue 2: React Component Not Loading
**Error**: React component doesn't appear

**Checklist**:
1. Is the React MFE running on port 5000?
2. Check browser console for import errors
3. Verify `REACT_MFE_URL` in config/environment.js
4. Check Network tab for remoteEntry.js request

### Issue 3: Props Not Passing to React
**Problem**: React component doesn't receive props

**Solution**: Ensure props are serializable (no functions, use hash helper):
```handlebars
{{!-- Good --}}
@props={{hash userId=123 name="John"}}

{{!-- Bad - functions can't be serialized --}}
@props={{hash onClick=this.handleClick}}
```

### Issue 4: Port Already in Use
**Error**: `Port 4200 is already in use`

**Solution**:
```bash
# Find process using port 4200
lsof -ti:4200

# Kill it
kill -9 <PID>

# Or use a different port
ember serve --port 4201
```

### Issue 5: pnpm Install Fails
**Error**: `ERR_PNPM_UNSUPPORTED_ENGINE`

**Solution**:
```bash
# Check Node version
node -v  # Should be 18+

# Use nvm to switch versions
nvm install 18
nvm use 18
```

## Testing

### Running Tests
```bash
# Run all tests
pnpm test

# Run tests in browser
ember test --server

# Run tests with specific filter
ember test --filter="unit"
```

### Testing React Integration
```bash
# Tests for render-react-component
pnpm test --filter="render-react-component"
```

## Building for Production

```bash
# Build optimized production bundle
pnpm build

# Output goes to dist/
# Copy dist/ to backend/public/ to serve from Rails
```

## Key Learning Points

1. **Ember Routing**: Ember manages the URL and navigation
2. **Component Communication**: MessageChannel API for Ember ↔ React communication
3. **Module Federation**: Webpack's way of loading remote JavaScript modules
4. **Dynamic Imports**: Using `eval('import(...)')` to load React at runtime
5. **Props Serialization**: Only JSON-serializable data can pass between Ember and React
6. **Lifecycle Management**: Properly mounting and unmounting React components

## Interview Preparation Notes

**Q: Why use Ember as the host instead of React?**
A: Legacy applications often can't be rewritten all at once. Ember serves as the stable host while teams gradually migrate features to React. This allows incremental modernization without downtime.

**Q: How does Ember communicate with React?**
A: Via the MessageChannel API (postMessage). Ember creates a message channel, passes one port to React, and both sides can send/receive messages. This works across different JavaScript contexts.

**Q: What is Module Federation?**
A: A Webpack feature that allows separately built JavaScript apps to share code at runtime. The React MFE exposes modules via a "remote entry," and Ember dynamically imports them.

**Q: Can React components access Ember services?**
A: Not directly. Ember must pass data as props or send it via postMessage. This maintains clear boundaries between the frameworks.

**Q: What happens if the React MFE fails to load?**
A: The bridge component catches errors and can show a fallback UI. In production, you'd have error boundaries and monitoring.

## Next Steps

After understanding this Ember host:
1. Create the React UI library
2. Build the React microfrontend  
3. Integrate them together
4. Test the full stack

## References

- [Ember.js Guides](https://guides.emberjs.com/)
- [Ember Octane](https://emberjs.com/editions/octane/)
- [Module Federation](https://webpack.js.org/concepts/module-federation/)
- [MessageChannel API](https://developer.mozilla.org/en-US/docs/Web/API/MessageChannel)

