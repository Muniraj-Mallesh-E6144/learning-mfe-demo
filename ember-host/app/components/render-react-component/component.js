import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import ENV from 'ember-host/config/environment';

/**
 * RenderReactComponent - Bridge component for loading React Microfrontends
 * 
 * This component dynamically loads and renders React components from a remote
 * microfrontend using Webpack Module Federation.
 * 
 * @param {string} componentName - Name of the React component to render
 * @param {string} moduleName - Name of the remote module (e.g., 'host_main')
 * @param {string} domElementSelectorId - Unique ID for the DOM element
 * @param {Object} props - Props to pass to the React component
 * @param {Function} eventLifecycleCallback - Callback for lifecycle events
 * @param {Function} messageCallback - Callback for custom messages
 * @param {boolean} devMode - Enable development mode (HMR)
 */
export default class RenderReactComponentComponent extends Component {
  @tracked isLoading = true;
  @tracked error = null;
  messagePort = null;

  constructor() {
    super(...arguments);
    this.validateProps();
  }

  /**
   * Validate required props
   */
  validateProps() {
    const required = ['componentName', 'moduleName', 'domElementSelectorId', 'props'];
    required.forEach(prop => {
      if (!this.args[prop]) {
        console.error(`[RenderReactComponent] Missing required prop: ${prop}`);
      }
    });
  }

  /**
   * Get the React MFE remote entry URL
   * In development: localhost:5000
   * In production: Configured via ENV or window variable
   */
  get remoteEntryUrl() {
    const devMode = this.args.devMode || ENV.environment === 'development';
    return devMode ? `${ENV.REACT_MFE_URL}/remoteEntry.js` : window.REACT_MFE_URL || `${ENV.REACT_MFE_URL}/remoteEntry.js`;
  }

  /**
   * Get DOM selector string
   */
  get domSelector() {
    return `#${this.args.domElementSelectorId}`;
  }

  /**
   * Dynamic import helper
   * Uses eval to bypass build-time module resolution
   */
  @action
  async dynamicImport(modulePath) {
    try {
      return await eval(`import('${modulePath}')`);
    } catch (error) {
      console.error('[RenderReactComponent] Dynamic import failed:', error);
      throw error;
    }
  }

  /**
   * Setup React Refresh (HMR) in development mode
   * This enables Hot Module Replacement for React components
   */
  @action
  async setupReactRefresh() {
    if (window.__vite_plugin_react_preamble_installed__) {
      return; // Already setup
    }

    try {
      const RefreshRuntime = await this.dynamicImport(`${ENV.REACT_MFE_URL}/@react-refresh`);
      RefreshRuntime.default.injectIntoGlobalHook(window);
      window.$RefreshReg$ = () => {};
      window.$RefreshSig$ = () => (type) => type;
      window.__vite_plugin_react_preamble_installed__ = true;
      console.log('[RenderReactComponent] React Refresh enabled');
    } catch (error) {
      console.warn('[RenderReactComponent] React Refresh setup failed:', error);
    }
  }

  /**
   * Load the React remote entry and render the component
   */
  @action
  async loadReactComponent() {
    const isDev = this.args.devMode || ENV.environment === 'development';

    try {
      console.log(`[RenderReactComponent] Loading ${this.args.componentName}...`);

      // Step 1: Setup React Refresh in dev mode
      if (isDev) {
        await this.setupReactRefresh();
      }

      // Step 2: Load the remote entry
      const { get, init } = await this.dynamicImport(this.remoteEntryUrl);
      
      // Step 3: Initialize Module Federation
      await init();

      // Step 4: Get the renderComponent function from the remote
      // Module Federation's get() returns a factory function
      const renderComponentFactory = await get('./renderComponent');
      const renderComponentModule = renderComponentFactory(); // Call the factory
      const renderComponent = renderComponentModule.default;

      // Step 5: Render the React component
      await renderComponent({
        moduleName: this.args.moduleName,
        componentName: this.args.componentName,
        domElementSelectorId: this.domSelector,
        props: this.args.props || {}
      });

      this.isLoading = false;
      console.log(`[RenderReactComponent] ✓ Loaded ${this.args.componentName}`);
    } catch (error) {
      this.error = error;
      this.isLoading = false;
      console.error(`[RenderReactComponent] ✗ Failed to load ${this.args.componentName}:`, error);
    }
  }

  /**
   * Setup MessageChannel for bidirectional communication
   * This allows Ember and React to send messages to each other
   */
  @action
  setupMessageChannel(event) {
    if (
      event.data.type === 'fs-react-mfe-host-main-init' &&
      event.data.domElementSelectorId === this.domSelector
    ) {
      console.log('[RenderReactComponent] MessageChannel established');
      
      this.messagePort = event.ports[0];
      
      // Listen for messages from React
      this.messagePort.onmessage = (msgEvent) => {
        const { action, payload } = msgEvent.data;
        
        console.log(`[RenderReactComponent] Message from React: ${action}`, payload);

        // Handle lifecycle events
        if (action === 'componentMounted') {
          this.args.eventLifecycleCallback?.(msgEvent.data, this.messagePort);
        } else if (action === 'componentUnmounted') {
          this.args.eventLifecycleCallback?.(msgEvent.data, this.messagePort);
        } else if (action === 'error') {
          console.error('[RenderReactComponent] React component error:', payload);
          this.args.eventLifecycleCallback?.(msgEvent.data, this.messagePort);
        } else {
          // Handle custom messages
          this.args.messageCallback?.(msgEvent.data);
        }
      };

      // Remove event listener after first connection
      window.removeEventListener('message', this.boundSetupMessageChannel);
    }
  }

  /**
   * Lifecycle: When component is inserted into the DOM
   */
  @action
  didInsert() {
    console.log(`[RenderReactComponent] Mounting ${this.args.componentName}...`);
    
    // Setup message listener
    this.boundSetupMessageChannel = this.setupMessageChannel.bind(this);
    window.addEventListener('message', this.boundSetupMessageChannel);
    
    // Load the React component
    this.loadReactComponent();
  }

  /**
   * Lifecycle: When component is removed from the DOM
   */
  @action
  willDestroy() {
    console.log(`[RenderReactComponent] Unmounting ${this.args.componentName}...`);
    
    // Tell React to unmount
    if (this.messagePort) {
      this.messagePort.postMessage({ action: 'unmount' });
    }
    
    // Cleanup message listener
    if (this.boundSetupMessageChannel) {
      window.removeEventListener('message', this.boundSetupMessageChannel);
    }
    
    super.willDestroy();
  }
}

// LEARNING NOTES:
//
// 1. Module Federation Flow:
//    - dynamicImport() loads the remoteEntry.js from React MFE
//    - remoteEntry.js contains the Module Federation manifest
//    - init() initializes the shared scope (React, ReactDOM, etc.)
//    - get('./renderComponent') retrieves the exposed module
//    - The module exports a function to render the component
//
// 2. MessageChannel API:
//    - Creates a two-way communication channel between Ember and React
//    - Uses postMessage for cross-context communication
//    - Each side holds one port of the channel
//    - Messages are serialized as JSON (must be serializable data)
//
// 3. Why eval() for dynamic import?
//    - Ember's build system resolves imports at build time
//    - We need to import from a URL that's only known at runtime
//    - eval() bypasses the build-time module resolver
//    - Alternative: Use import() directly if your build supports it
//
// 4. React Refresh (HMR):
//    - Vite (React MFE build tool) uses React Refresh for hot reloading
//    - We need to setup the Refresh runtime in Ember's window context
//    - This allows React components to update without full page reload
//    - Only enabled in development mode
//
// 5. Lifecycle Hooks:
//    - didInsert: Called when the component is added to the DOM
//    - willDestroy: Called before the component is removed
//    - We use these to mount/unmount React components properly
//
// 6. Error Handling:
//    - Try/catch around async operations
//    - @tracked properties for reactive error states
//    - Console logging for debugging
//    - Error callbacks to parent components

