import EmberRouter from '@ember/routing/router';
import config from 'ember-host/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  // Dashboard route (Ember-rendered)
  this.route('dashboard');
  
  // Users route (Ember with embedded React table)
  this.route('users');
  
  // Tickets routes (React MFE)
  this.route('tickets', function() {
    this.route('detail', { path: '/:ticket_id' });
  });
  
  // About page (simple Ember route)
  this.route('about');
});

// LEARNING NOTES:
//
// 1. Router.map():
//    - Defines all routes in the application
//    - this.route('name') creates a route at /name
//    - Nested routes: this.route('parent', function() { this.route('child'); })
//    - Result: /parent/child
//
// 2. Dynamic Segments:
//    - { path: '/:ticket_id' } creates a dynamic segment
//    - Accessible in route as params.ticket_id
//    - Example: /tickets/123 -> params.ticket_id = '123'
//
// 3. Route Structure:
//    - Each route has: route.js, controller.js, template.hbs
//    - Route: Loads data (model hook)
//    - Controller: Handles actions and computed properties
//    - Template: Renders the UI
//
// 4. URL Structure:
//    / -> application template
//    /dashboard -> dashboard template (nested in application)
//    /users -> users template
//    /tickets -> tickets index
//    /tickets/123 -> tickets detail
//
// 5. Why This Structure?
//    - Dashboard: Full Ember page
//    - Users: Ember page with embedded React table component
//    - Tickets: Full React MFE (but Ember manages the route)
//    - This shows all integration patterns

