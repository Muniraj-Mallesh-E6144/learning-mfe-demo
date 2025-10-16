'use strict';

module.exports = function (environment) {
  const ENV = {
    modulePrefix: 'ember-host',
    environment,
    rootURL: '/',
    locationType: 'history',
    
    EmberENV: {
      FEATURES: {
        // Enable any Ember feature flags here
      },
      EXTEND_PROTOTYPES: false,
    },

    APP: {
      // Application-specific config
    },

    // API Configuration
    API_HOST: 'http://localhost:3001',
    
    // React MFE Configuration
    REACT_MFE_URL: 'http://localhost:5000',
  };

  if (environment === 'development') {
    // Development-specific config
    ENV.API_HOST = 'http://localhost:3001';
    ENV.REACT_MFE_URL = 'http://localhost:5000';
  }

  if (environment === 'test') {
    // Test-specific config
    ENV.locationType = 'none';
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;
    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;
  }

  if (environment === 'production') {
    // Production config
    // These would be set by your deployment environment
    ENV.API_HOST = process.env.API_HOST || 'https://api.example.com';
    ENV.REACT_MFE_URL = process.env.REACT_MFE_URL || 'https://mfe.example.com';
  }

  return ENV;
};

// LEARNING NOTES:
//
// 1. Environment-specific Configuration:
//    - Different settings for dev, test, prod
//    - Accessed via: import ENV from 'ember-host/config/environment';
//
// 2. API_HOST:
//    - Where the Rails backend lives
//    - Changes per environment
//    - Used by the API service
//
// 3. REACT_MFE_URL:
//    - Where the React microfrontend is hosted
//    - Dev: localhost:5000 (Vite dev server)
//    - Prod: CDN or separate deployment
//
// 4. locationType:
//    - 'history': Uses HTML5 History API (clean URLs: /dashboard)
//    - 'hash': Uses hash fragments (/#/dashboard) - works without server config
//    - 'none': No URL changes (for tests)
//
// 5. rootURL:
//    - Base path for the app
//    - '/' means app is at domain root
//    - '/app/' if hosted at example.com/app/

