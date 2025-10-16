import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { mockDashboardStats } from '../utils/mock-data';

export default class DashboardRoute extends Route {
  @service api;

  async model() {
    try {
      // Try to fetch dashboard stats from API
      const stats = await this.api.getDashboardStats();
      return { ...stats, usingMockData: false };
    } catch (error) {
      // Backend not available, use mock data
      console.warn('[Dashboard] Backend not available, using mock data');
      return { ...mockDashboardStats, usingMockData: true };
    }
  }
}

// LEARNING NOTES:
//
// 1. Route Model Hook:
//    - model() is called when entering the route
//    - Returns data that will be available in the template
//    - Async functions automatically work with Ember's router
//    - Route waits for Promise to resolve before rendering
//
// 2. Service Injection:
//    - @service api injects the ApiService
//    - Ember automatically finds services by name
//    - Services are singletons (same instance everywhere)
//
// 3. Error Handling:
//    - try/catch for async errors
//    - Return fallback data on error
//    - Could also use error route: setupController(controller, error)
//
// 4. Data Flow:
//    Route model() -> Controller -> Template
//    Template access via {{@model}} or {{this.model}}

