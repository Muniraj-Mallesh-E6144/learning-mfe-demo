import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class TicketsRoute extends Route {
  @service api;

  async model() {
    // This route doesn't fetch data since React MFE handles it
    // But we return API host for React to use
    return {
      apiHost: this.api.apiHost
    };
  }
}

// LEARNING NOTE:
// For routes rendered by React MFE, the Ember route is minimal.
// It just provides any necessary context (like API URLs) to React.
// React handles its own data fetching using React Query or similar.

