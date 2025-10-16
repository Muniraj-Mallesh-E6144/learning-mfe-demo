import React from 'react';
import ReactDOM from 'react-dom/client';
import { UsersTable } from './components/UsersTable';
import { TicketsList } from './components/TicketsList';
import { TicketDetail } from './components/TicketDetail';

/**
 * Component Registry
 * Maps component names to their implementations
 */
const COMPONENT_REGISTRY = {
  UsersTable,
  TicketsList,
  TicketDetail,
};

interface RenderComponentProps {
  /**
   * Name of the remote module (for multi-MFE setups)
   */
  moduleName: string;
  
  /**
   * Name of the component to render
   */
  componentName: string;
  
  /**
   * DOM selector where component should mount
   */
  domElementSelectorId: string;
  
  /**
   * Props to pass to the component
   */
  props?: Record<string, any>;
}

/**
 * Bootstrap function for rendering React components in Ember
 * 
 * This is the main entry point exposed via Module Federation.
 * It handles mounting React components into DOM elements and
 * establishing communication with the host (Ember).
 * 
 * @param config - Configuration for component rendering
 */
export default async function bootstrapRenderComponent({
  moduleName,
  componentName,
  domElementSelectorId,
  props = {},
}: RenderComponentProps) {
  console.log(`[React MFE] Bootstrapping ${componentName} from ${moduleName}`);

  // Get the component from registry
  const Component = COMPONENT_REGISTRY[componentName as keyof typeof COMPONENT_REGISTRY];
  
  if (!Component) {
    console.error(`[React MFE] Component "${componentName}" not found in registry`);
    console.error(`[React MFE] Available components:`, Object.keys(COMPONENT_REGISTRY));
    return;
  }

  // Get the DOM element
  const element = document.querySelector(domElementSelectorId);
  
  if (!element) {
    console.error(`[React MFE] DOM element "${domElementSelectorId}" not found`);
    return;
  }

  try {
    // Create MessageChannel for communication with Ember
    const channel = new MessageChannel();
    
    // Notify Ember that we're initializing
    window.dispatchEvent(new MessageEvent('message', {
      data: {
        type: 'fs-react-mfe-host-main-init',
        domElementSelectorId,
      },
      ports: [channel.port2],
    }));

    // Setup message listener (Ember -> React)
    channel.port1.onmessage = (event) => {
      const { action, payload } = event.data;
      console.log(`[React MFE] Received message from Ember: ${action}`, payload);
      
      // Handle unmount request
      if (action === 'unmount') {
        console.log(`[React MFE] Unmounting ${componentName}`);
        root.unmount();
      }
      
      // Handle prop updates
      if (action === 'updateProps') {
        console.log(`[React MFE] Updating props for ${componentName}`);
        // Re-render with new props
        root.render(
          <React.StrictMode>
            <Component {...payload} />
          </React.StrictMode>
        );
      }
    };

    // Create React root and render component
    const root = ReactDOM.createRoot(element);
    root.render(
      <React.StrictMode>
        <Component {...props} />
      </React.StrictMode>
    );

    // Notify Ember that component is mounted
    channel.port1.postMessage({
      action: 'componentMounted',
      payload: {
        message: 'Component successfully mounted',
        componentName,
        domElementSelectorId,
      },
    });

    console.log(`[React MFE] ✓ Successfully mounted ${componentName}`);
  } catch (error) {
    console.error(`[React MFE] ✗ Failed to mount ${componentName}:`, error);
    
    // Try to notify Ember of the error
    window.dispatchEvent(new MessageEvent('message', {
      data: {
        type: 'fs-react-mfe-error',
        componentName,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    }));
  }
}

// LEARNING NOTES:
//
// 1. Component Registry Pattern:
//    - Maps string names to component implementations
//    - Allows Ember to request components by name
//    - Easy to add new components
//
// 2. Module Federation Export:
//    - This file is exposed as './renderComponent'
//    - Ember dynamically imports this and calls the default export
//    - Must be a function that Ember can invoke
//
// 3. MessageChannel Communication:
//    - Creates a two-way communication channel
//    - Ember holds port2, React holds port1
//    - Both can send/receive messages
//    - Survives across different JavaScript contexts
//
// 4. React 18 API:
//    - createRoot (not ReactDOM.render)
//    - Enables Concurrent Features
//    - Better error boundaries
//
// 5. Error Handling:
//    - Try/catch for mount failures
//    - Console logging for debugging
//    - Notify Ember of errors via window message
//
// 6. Unmounting:
//    - Listen for 'unmount' message from Ember
//    - Call root.unmount() to clean up
//    - Prevents memory leaks
//
// 7. Dynamic Props:
//    - Component receives props from Ember
//    - Can update props via 'updateProps' message
//    - Re-renders component with new props

