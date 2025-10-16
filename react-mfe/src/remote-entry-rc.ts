// remote-entry-rc.ts - Module Federation entry point for renderComponent
// This wrapper ensures proper export for Module Federation

import renderComponent from './renderComponent';

// Module Federation expects this specific export structure
// Ember will call: const module = await get('./renderComponent');
// Then access: module.default
export default renderComponent;

