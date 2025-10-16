import Route from '@ember/routing/route';

export default class ApplicationRoute extends Route {
  // Application route is the root route
  // Any initialization logic goes here
  
  beforeModel() {
    console.log('[Application] App starting...');
  }
  
  model() {
    // Return any global data needed throughout the app
    return {
      appName: 'Learning MFE Demo',
      version: '1.0.0'
    };
  }
}

