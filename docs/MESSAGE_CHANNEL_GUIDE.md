# MessageChannel Communication Guide

> **What is MessageChannel?** A browser API that creates a two-way communication pipe between different JavaScript contexts (e.g., iframes, workers, or in our case, Ember ↔ React).

---

## 🎯 Why Freshservice Uses MessageChannel

### The Problem
- **Ember** (host) and **React** (microfrontend) run in the same window but are loaded via Module Federation
- Need **bi-directional communication** (Ember → React and React → Ember)
- Want **type-safe, event-driven** communication without tight coupling

### The Solution: MessageChannel API

```javascript
// Create a channel with two ports
const channel = new MessageChannel();
const port1 = channel.port1; // One end
const port2 = channel.port2; // Other end

// Ember keeps port1
port1.onmessage = (event) => {
  console.log('Ember received:', event.data);
};

// React receives port2 (passed via window.postMessage)
port2.onmessage = (event) => {
  console.log('React received:', event.data);
};

// Now they can communicate
port1.postMessage({ from: 'Ember', message: 'Hello React!' });
port2.postMessage({ from: 'React', message: 'Hello Ember!' });
```

---

## 🔄 How It Works in Freshservice

### Step 1: Ember Initiates Connection

**Location**: `itildesk/frontend/app/components/render-react-component/component.js`

```javascript
@action
listenToReactMessage() {
  window.addEventListener('message', this.messageListener);
}

@action
messageListener(e) {
  // React announces it's ready with 'fs-react-mfe-host-main-init'
  if (
    e.data.type === 'fs-react-mfe-host-main-init' &&
    e.data.domElementSelectorId === this.domElementSelectorString
  ) {
    // Store the port React sent us
    this.messagePort = e.ports[0];
    
    // Listen to messages from React
    this.messagePort.onmessage = (msgEvent) => {
      const action = msgEvent?.data?.action;
      const lifecycleEvents = Object.values(LIFECYCLE_EVENTS);

      if (lifecycleEvents.includes(action)) {
        // Handle lifecycle events (init, mounted, unmounted)
        this.args.eventLifecycleCallback(msgEvent.data, this.messagePort);
      } else {
        // Handle custom events
        this.args.messageCallback?.(msgEvent.data);
      }

      this.analytics.trackMetrics(action);
    };

    // Remove the global listener (we have the port now)
    window.removeEventListener('message', this.messageListener);
  }
}
```

**What's Happening**:
1. Ember adds a global `message` listener to `window`
2. Waits for React to send an init message with a MessagePort
3. Once received, switches to using `messagePort.onmessage` (more direct)
4. Routes messages to appropriate callbacks (lifecycle vs. custom)

---

### Step 2: React Creates Channel and Sends Port

**Location**: `fs-react-mfe/apps/host_main/src/RenderComponent.tsx`

```javascript
// React side (conceptual - actual implementation in Freshservice)
function initializeReactMFE(config) {
  const { moduleName, componentName, domElementSelectorId, props } = config;

  // Create a new MessageChannel
  const channel = new MessageChannel();
  const port1 = channel.port1;
  const port2 = channel.port2;

  // Send init message to Ember with port2
  window.postMessage(
    {
      type: 'fs-react-mfe-host-main-init',
      domElementSelectorId,
    },
    window.location.origin,
    [port2] // Transfer port2 to Ember
  );

  // React keeps port1 for communication
  port1.onmessage = (event) => {
    const { action, payload } = event.data;
    
    switch (action) {
      case 'updateProps':
        // Update React component props
        updateComponent(payload);
        break;
      case 'unmount':
        // Clean up React component
        unmountComponent();
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  // Notify Ember that component mounted
  port1.postMessage({
    action: 'componentMounted',
    payload: {
      message: 'Component Mounted',
      domElementSelectorId,
    },
  });

  // Mount the actual React component
  mountReactComponent(domElementSelectorId, props);

  return port1;
}
```

**What's Happening**:
1. React creates a `MessageChannel` (two ports)
2. Sends an init message via `window.postMessage`, **transferring port2** to Ember
3. Keeps `port1` for receiving messages from Ember
4. Listens for actions like `updateProps`, `unmount`, etc.
5. Sends lifecycle events back to Ember (`componentMounted`, `componentFullyLoaded`)

---

## 📨 Message Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          1. Ember Loads MFE                         │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Ember: dynamicImport(remoteEntry.js)                           │ │
│  │ Ember: get('./renderComponent')                                │ │
│  │ Ember: component({ moduleName, componentName, props })         │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    2. React Creates MessageChannel                  │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ React: const channel = new MessageChannel()                    │ │
│  │ React: port1 (keep for itself)                                 │ │
│  │ React: port2 (send to Ember)                                   │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│               3. React Sends Init Message with Port2                │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ window.postMessage({                                           │ │
│  │   type: 'fs-react-mfe-host-main-init',                         │ │
│  │   domElementSelectorId: '#react-component'                     │ │
│  │ }, '*', [port2])  ← Transfer port2 to Ember                    │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│                 4. Ember Receives Port2, Saves It                   │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Ember: window.addEventListener('message', (e) => {             │ │
│  │   if (e.data.type === 'fs-react-mfe-host-main-init') {         │ │
│  │     this.messagePort = e.ports[0];  ← Save port2               │ │
│  │     this.messagePort.onmessage = ...                           │ │
│  │   }                                                             │ │
│  │ })                                                              │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    5. Bi-Directional Communication                  │
│  ┌─────────────────────────────┬─────────────────────────────────┐ │
│  │        Ember → React         │        React → Ember            │ │
│  ├─────────────────────────────┼─────────────────────────────────┤ │
│  │ this.messagePort.postMessage │ port1.postMessage({             │ │
│  │ ({                           │   action: 'componentMounted',   │ │
│  │   action: 'updateProps',     │   payload: { ... }              │ │
│  │   payload: { userId: 123 }   │ })                              │ │
│  │ })                           │                                 │ │
│  └─────────────────────────────┴─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Lifecycle Events

### Defined in `LIFECYCLE_EVENTS`

```javascript
const LIFECYCLE_EVENTS = {
  init: 'init',
  componentMounted: 'componentMounted',
  componentUnmounted: 'componentUnmounted',
  componentFullyLoaded: 'componentFullyLoaded',
};
```

### Typical Lifecycle Flow

```
1. init
   ↓
   React creates MessageChannel
   React sends port to Ember via window.postMessage
   ↓
2. componentMounted
   ↓
   React component rendered to DOM
   React sends 'componentMounted' to Ember
   ↓
3. componentFullyLoaded
   ↓
   React fetched all data
   React sends 'componentFullyLoaded' to Ember
   ↓
   ... user interaction, data updates ...
   ↓
4. componentUnmounted
   ↓
   Ember destroys the component
   Ember sends 'unmount' action to React
   React cleans up and sends 'componentUnmounted'
```

---

## 📝 Example: Time Entries Widget

### Ember Template

```handlebars
{{!-- itildesk/frontend/app/templates/time-entries.hbs --}}
<RenderReactComponent
  @domElementSelectorId="react-time-entries-widget"
  @componentName="TimeEntriesWidget"
  @moduleName="msp"
  @props={{hash
    ticketId=this.ticketId
    userId=this.currentUser.id
    canEdit=this.canEditTimeEntries
  }}
  @messageCallback={{this.handleReactMessage}}
  @eventLifecycleCallback={{this.handleLifecycle}}
  @trackComponentRenderTime={{true}}
/>
```

### Ember Route

```javascript
// itildesk/frontend/app/routes/time-entries.js
import Route from '@ember/routing/route';
import { action } from '@ember/object';

export default class TimeEntriesRoute extends Route {
  @action
  handleLifecycle(event, messagePort) {
    const { action, payload } = event;

    switch (action) {
      case 'componentMounted':
        console.log('[Lifecycle] React TimeEntriesWidget mounted');
        // Track analytics
        this.analytics.track('time_entries_widget_mounted');
        break;

      case 'componentFullyLoaded':
        console.log('[Lifecycle] React TimeEntriesWidget fully loaded');
        // Hide loading spinner
        this.isLoading = false;
        break;

      case 'componentUnmounted':
        console.log('[Lifecycle] React TimeEntriesWidget unmounted');
        break;
    }
  }

  @action
  handleReactMessage(data) {
    const { action, payload } = data;

    switch (action) {
      case 'timeEntryCreated':
        // React created a new time entry
        this.flashMessages.success('Time entry created!');
        this.refreshTicket();
        break;

      case 'timeEntryDeleted':
        // React deleted a time entry
        this.flashMessages.success('Time entry deleted!');
        this.refreshTicket();
        break;

      case 'error':
        // React encountered an error
        this.flashMessages.error(payload.message);
        break;
    }
  }

  // Ember can send messages back to React
  @action
  updateTicketId(newTicketId) {
    this.messagePort?.postMessage({
      action: 'updateProps',
      payload: {
        ticketId: newTicketId,
      },
    });
  }
}
```

### React Component (Simplified)

```typescript
// fs-react-mfe/modules/msp/src/features/time-entries/TimeEntriesWidget.tsx
import { useEffect, useRef } from 'react';

interface TimeEntriesWidgetProps {
  ticketId: number;
  userId: number;
  canEdit: boolean;
  messagePort: MessagePort; // Passed by RenderComponent wrapper
}

export function TimeEntriesWidget(props: TimeEntriesWidgetProps) {
  const { ticketId, userId, canEdit, messagePort } = props;
  const [timeEntries, setTimeEntries] = useState([]);

  useEffect(() => {
    // Listen for messages from Ember
    messagePort.onmessage = (event) => {
      const { action, payload } = event.data;

      switch (action) {
        case 'updateProps':
          // Ember sent new props
          handlePropsUpdate(payload);
          break;
        case 'unmount':
          // Ember is destroying the component
          cleanup();
          break;
      }
    };

    // Notify Ember that we're mounted
    messagePort.postMessage({
      action: 'componentMounted',
      payload: {
        message: 'TimeEntriesWidget mounted',
      },
    });

    return () => {
      // Notify Ember that we're unmounting
      messagePort.postMessage({
        action: 'componentUnmounted',
      });
    };
  }, []);

  useEffect(() => {
    // Fetch time entries
    fetchTimeEntries(ticketId).then((entries) => {
      setTimeEntries(entries);
      
      // Notify Ember that data is loaded
      messagePort.postMessage({
        action: 'componentFullyLoaded',
        payload: {
          count: entries.length,
        },
      });
    });
  }, [ticketId]);

  const handleCreateTimeEntry = async (entry) => {
    const newEntry = await createTimeEntry(entry);
    setTimeEntries([...timeEntries, newEntry]);

    // Notify Ember
    messagePort.postMessage({
      action: 'timeEntryCreated',
      payload: {
        timeEntry: newEntry,
      },
    });
  };

  const handleDeleteTimeEntry = async (entryId) => {
    await deleteTimeEntry(entryId);
    setTimeEntries(timeEntries.filter(e => e.id !== entryId));

    // Notify Ember
    messagePort.postMessage({
      action: 'timeEntryDeleted',
      payload: {
        entryId,
      },
    });
  };

  return (
    <div>
      <h2>Time Entries</h2>
      {timeEntries.map(entry => (
        <TimeEntryCard
          key={entry.id}
          entry={entry}
          onDelete={handleDeleteTimeEntry}
          canEdit={canEdit}
        />
      ))}
      {canEdit && (
        <CreateTimeEntryForm onSubmit={handleCreateTimeEntry} />
      )}
    </div>
  );
}
```

---

## 🧪 Testing MessageChannel Communication

### Location: `itildesk/frontend/tests/lib/react-mfe-test-utils.js`

```javascript
/**
 * Simulates React MFE mounting in tests
 */
export async function mountReactComponentForSelector(selectorId) {
  // Create a message channel
  const channel = new MessageChannel();

  // Simulate the MFE init event
  window.dispatchEvent(new MessageEvent('message', {
    data: {
      type: 'fs-react-mfe-host-main-init',
      domElementSelectorId: `#${selectorId}`,
    },
    ports: [channel.port2], // Pass port2 to the listener
  }));

  // Simulate React sending 'componentMounted'
  channel.port1.postMessage({
    action: 'componentMounted',
    payload: {
      message: 'Component Mounted',
      domElementSelectorId: `#${selectorId}`,
    },
  });

  await settled(); // Wait for Ember to process

  return channel;
}

/**
 * Usage in tests
 */
test('it renders TimeEntriesWidget and handles messages', async function(assert) {
  this.set('ticketId', 123);
  this.set('handleMessage', (data) => {
    if (data.action === 'timeEntryCreated') {
      assert.ok(true, 'Received timeEntryCreated message');
    }
  });

  await render(hbs`
    <RenderReactComponent
      @domElementSelectorId="react-time-entries-widget"
      @componentName="TimeEntriesWidget"
      @moduleName="msp"
      @props={{hash ticketId=this.ticketId}}
      @messageCallback={{this.handleMessage}}
    />
  `);

  // Simulate React mounting
  const channel = await mountReactComponentForSelector('react-time-entries-widget');

  // Simulate React sending a message
  channel.port1.postMessage({
    action: 'timeEntryCreated',
    payload: { timeEntry: { id: 1, hours: 2.5 } },
  });

  await settled();
});
```

---

## 🔒 Security Considerations

### Port Transfer
When using `postMessage` with ports, the port is **transferred** (not copied):

```javascript
window.postMessage(
  { type: 'init' },
  window.location.origin, // 👈 Always specify origin
  [port2] // 👈 Port is transferred
);
```

**After transfer**:
- React can no longer use `port2`
- Only Ember can use `port2`
- React keeps `port1`

### Origin Validation
In production, always validate the message origin:

```javascript
window.addEventListener('message', (event) => {
  // Validate origin
  if (event.origin !== 'https://yourcompany.freshservice.com') {
    return;
  }

  // Validate message type
  if (event.data.type !== 'fs-react-mfe-host-main-init') {
    return;
  }

  // Safe to process
  this.messagePort = event.ports[0];
});
```

---

## 🎯 Key Benefits of MessageChannel

### 1. **Type-Safe Communication**
Define message schemas:
```typescript
interface EmberToReactMessage {
  action: 'updateProps' | 'unmount';
  payload: Record<string, any>;
}

interface ReactToEmberMessage {
  action: 'componentMounted' | 'componentFullyLoaded' | 'componentUnmounted' | string;
  payload?: Record<string, any>;
}
```

### 2. **Decoupled Architecture**
- Ember doesn't need to know React internals
- React doesn't need to know Ember internals
- Easy to swap implementations

### 3. **Testable**
- Mock MessageChannel in tests
- Simulate message passing
- Test without running full MFE

### 4. **Performance**
- Direct port-to-port communication (no global event bus)
- No polling or intervals
- Event-driven (efficient)

### 5. **Scalability**
- Each MFE gets its own MessageChannel
- No message conflicts between MFEs
- Clean lifecycle management

---

## 🚀 Implementing MessageChannel in Learning Demo

### Phase 1: Create Channel (React Side)

```typescript
// react-mfe/src/initMessageChannel.ts
export function initMessageChannel(config: {
  moduleName: string;
  componentName: string;
  domElementSelectorId: string;
  props: Record<string, any>;
}) {
  const { domElementSelectorId, props } = config;

  // Create channel
  const channel = new MessageChannel();
  const port1 = channel.port1;

  // Send init message with port2
  window.postMessage(
    {
      type: 'fs-react-mfe-host-main-init',
      domElementSelectorId,
    },
    window.location.origin,
    [channel.port2]
  );

  // Listen for messages from Ember
  port1.onmessage = (event) => {
    console.log('[React] Received from Ember:', event.data);
    // Handle actions like 'updateProps', 'unmount'
  };

  // Notify Ember that component mounted
  port1.postMessage({
    action: 'componentMounted',
    payload: { domElementSelectorId },
  });

  return port1;
}
```

### Phase 2: Listen for Port (Ember Side)

```javascript
// ember-host/app/components/render-react-component.js
import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class RenderReactComponentComponent extends Component {
  @action
  loadReactComponent() {
    // Listen for React's init message
    window.addEventListener('message', this.messageListener);

    // Load React MFE (existing code)
    // ...
  }

  @action
  messageListener = (event) => {
    if (
      event.data.type === 'fs-react-mfe-host-main-init' &&
      event.data.domElementSelectorId === `#${this.args.domElementSelectorId}`
    ) {
      // Save the port React sent us
      this.messagePort = event.ports[0];

      // Listen for messages from React
      this.messagePort.onmessage = (msgEvent) => {
        console.log('[Ember] Received from React:', msgEvent.data);
        
        const { action, payload } = msgEvent.data;
        
        if (action === 'componentMounted') {
          this.args.onComponentMounted?.(payload);
        } else if (action === 'componentFullyLoaded') {
          this.args.onComponentFullyLoaded?.(payload);
        } else {
          this.args.onMessage?.(msgEvent.data);
        }
      };

      // Remove global listener
      window.removeEventListener('message', this.messageListener);
    }
  };

  willDestroy() {
    super.willDestroy();
    // Tell React to unmount
    this.messagePort?.postMessage({ action: 'unmount' });
  }
}
```

---

## 📚 Further Reading

### MDN Documentation
- [MessageChannel API](https://developer.mozilla.org/en-US/docs/Web/API/MessageChannel)
- [MessagePort API](https://developer.mozilla.org/en-US/docs/Web/API/MessagePort)
- [window.postMessage()](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)

### Real Freshservice Code
- `itildesk/frontend/app/components/render-react-component/component.js` - Ember side
- `fs-react-mfe/apps/host_main/src/RenderComponent.tsx` - React side
- `itildesk/frontend/tests/lib/react-mfe-test-utils.js` - Testing utilities

---

**🎯 Key Takeaway**: MessageChannel provides **robust, type-safe, bi-directional communication** between Ember and React in a production microfrontend architecture. It's more powerful than simple props passing, enabling rich interaction patterns and lifecycle management.

