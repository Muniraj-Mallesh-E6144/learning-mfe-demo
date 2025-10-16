import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class TicketsDetailRoute extends Route {
  @service api;

  model(params) {
    // Pass the ticket ID to React MFE
    // React will fetch the actual ticket data
    return {
      ticketId: params.ticket_id,
      apiHost: this.api.apiHost
    };
  }
}

// LEARNING NOTE:
// Dynamic segments (/:ticket_id) come through as params
// We pass these to React so it knows which ticket to load

