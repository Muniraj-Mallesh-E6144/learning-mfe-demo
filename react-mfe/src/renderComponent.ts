// renderComponent.ts - Production pattern entry point
// This matches the real Freshservice implementation

import React from 'react';
import ReactDOM from 'react-dom/client';

interface RenderConfig {
  moduleName: string;
  componentName: string;
  domElementSelectorId: string;
  props: Record<string, any>;
}

// Component registry - maps component names to their imports
const COMPONENT_MAP: Record<string, () => Promise<any>> = {
  UsersTable: () => import('./components/UsersTable'),
  TicketsList: () => import('./components/TicketsList'),
  TicketDetail: () => import('./components/TicketDetail'),
};

let reactRoot: any = null;
let messagePort: MessagePort | null = null;

/**
 * Main render function - called by Ember to render React components
 * This is the entry point that Ember loads via Module Federation
 */
export default async function renderComponent(config: RenderConfig) {
  const { moduleName, componentName, domElementSelectorId, props } = config;

  console.log(`[React MFE] renderComponent called:`, {
    moduleName,
    componentName,
    domElementSelectorId,
    propsKeys: Object.keys(props),
  });

  try {
    // Step 1: Create MessageChannel for communication with Ember
    const channel = new MessageChannel();
    messagePort = channel.port1;

    // Step 2: Send init message to Ember with port2
    console.log(`[React MFE] Sending init message to Ember`);
    window.postMessage(
      {
        type: 'fs-react-mfe-host-main-init',
        domElementSelectorId,
      },
      window.location.origin,
      [channel.port2] // Transfer port2 to Ember
    );

    // Step 3: Listen for messages from Ember
    messagePort.onmessage = (event) => {
      const { action, payload } = event.data;
      console.log(`[React MFE] Message from Ember: ${action}`, payload);

      switch (action) {
        case 'updateProps':
          // Ember wants to update props
          updateComponentProps(payload);
          break;
        case 'unmount':
          // Ember wants to unmount the component
          unmountComponent();
          break;
        default:
          console.warn(`[React MFE] Unknown action: ${action}`);
      }
    };

    // Step 4: Load the component
    const ComponentModule = await COMPONENT_MAP[componentName]?.();
    if (!ComponentModule) {
      throw new Error(`Component not found: ${componentName}`);
    }

    // Components use named exports, not default exports
    const Component = ComponentModule[componentName] || ComponentModule.default;
    if (!Component) {
      throw new Error(`Component "${componentName}" not exported from module`);
    }

    // Step 5: Get the DOM container
    const container = document.querySelector(domElementSelectorId);
    if (!container) {
      throw new Error(`Container not found: ${domElementSelectorId}`);
    }

    // Step 6: Render the React component
    console.log(`[React MFE] Rendering ${componentName} to ${domElementSelectorId}`);
    
    // Inject messagePort as prop so components can send messages to Ember
    const enhancedProps = {
      ...props,
      messagePort, // Components can use this to send messages
    };

    reactRoot = ReactDOM.createRoot(container);
    reactRoot.render(React.createElement(Component, enhancedProps));

    // Step 7: Notify Ember that component is mounted
    console.log(`[React MFE] Component mounted, sending notification to Ember`);
    messagePort.postMessage({
      action: 'componentMounted',
      payload: {
        message: `${componentName} mounted successfully`,
        domElementSelectorId,
        timestamp: new Date().toISOString(),
      },
    });

    // Step 8: Simulate componentFullyLoaded after a brief delay
    // (In real apps, this would be after data fetching)
    setTimeout(() => {
      if (messagePort) {
        messagePort.postMessage({
          action: 'componentFullyLoaded',
          payload: {
            componentName,
            timestamp: new Date().toISOString(),
          },
        });
      }
    }, 100);

  } catch (error) {
    console.error(`[React MFE] Error rendering ${componentName}:`, error);
    
    // Notify Ember about the error
    if (messagePort) {
      messagePort.postMessage({
        action: 'error',
        payload: {
          message: error instanceof Error ? error.message : 'Unknown error',
          componentName,
        },
      });
    }
    
    throw error;
  }
}

/**
 * Update component props (called when Ember sends 'updateProps' message)
 */
function updateComponentProps(newProps: Record<string, any>) {
  console.log('[React MFE] Updating props:', newProps);
  // TODO: Implement prop updates (requires state management)
  // For now, we'd need to re-render with new props
}

/**
 * Unmount the React component (called when Ember sends 'unmount' message)
 */
function unmountComponent() {
  console.log('[React MFE] Unmounting component');
  
  if (reactRoot) {
    reactRoot.unmount();
    reactRoot = null;
  }

  if (messagePort) {
    messagePort.postMessage({
      action: 'componentUnmounted',
      payload: {
        timestamp: new Date().toISOString(),
      },
    });
    messagePort.close();
    messagePort = null;
  }
}

// LEARNING NOTES:
//
// 1. This is the PRODUCTION PATTERN used in real Freshservice
//    - Ember calls renderComponent() instead of importing components directly
//    - Centralized rendering logic
//    - MessageChannel for bi-directional communication
//
// 2. Component Registry (COMPONENT_MAP):
//    - Maps component names to their imports
//    - Allows dynamic loading based on componentName string
//    - Easy to add new components
//
// 3. MessageChannel Flow:
//    - React creates channel and transfers port2 to Ember
//    - React keeps port1 for receiving messages
//    - Both can send/receive messages asynchronously
//
// 4. Lifecycle Events:
//    - componentMounted: React rendered to DOM
//    - componentFullyLoaded: All data fetched
//    - componentUnmounted: React cleaned up
//    - error: Something went wrong
//
// 5. Props Enhancement:
//    - We inject messagePort as a prop
//    - Components can use it to send custom messages to Ember
//    - Example: User clicked a button → send message to Ember
//
// 6. Why This Pattern?
//    - Consistent loading across all components
//    - Centralized error handling
//    - Lifecycle tracking
//    - Easy to add features (analytics, logging, etc.)
//

