import Service from '@ember/service';
import ENV from 'ember-host/config/environment';

/**
 * API Service
 * 
 * Centralized service for making API calls to the Rails backend.
 * This demonstrates how to create reusable services in Ember.
 */
export default class ApiService extends Service {
  apiHost = ENV.API_HOST;

  /**
   * Generic fetch wrapper
   */
  async fetch(endpoint, options = {}) {
    const url = `${this.apiHost}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for CORS
    };

    try {
      const response = await fetch(url, { ...defaultOptions, ...options });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Handle no content responses
      if (response.status === 204) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error(`[API Service] Error fetching ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Users API
   */
  async getUsers() {
    return this.fetch('/api/v1/users');
  }

  async getUser(id) {
    return this.fetch(`/api/v1/users/${id}`);
  }

  async createUser(userData) {
    return this.fetch('/api/v1/users', {
      method: 'POST',
      body: JSON.stringify({ user: userData }),
    });
  }

  async updateUser(id, userData) {
    return this.fetch(`/api/v1/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ user: userData }),
    });
  }

  async deleteUser(id) {
    return this.fetch(`/api/v1/users/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Tickets API
   */
  async getTickets(filters = {}) {
    const query = new URLSearchParams(filters).toString();
    const endpoint = query ? `/api/v1/tickets?${query}` : '/api/v1/tickets';
    return this.fetch(endpoint);
  }

  async getTicket(id) {
    return this.fetch(`/api/v1/tickets/${id}`);
  }

  async createTicket(ticketData) {
    return this.fetch('/api/v1/tickets', {
      method: 'POST',
      body: JSON.stringify({ ticket: ticketData }),
    });
  }

  async updateTicket(id, ticketData) {
    return this.fetch(`/api/v1/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ticket: ticketData }),
    });
  }

  async deleteTicket(id) {
    return this.fetch(`/api/v1/tickets/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Dashboard API
   */
  async getDashboardStats() {
    return this.fetch('/api/v1/dashboard/stats');
  }
}

// LEARNING NOTES:
//
// 1. Ember Services:
//    - Singletons that live for the lifetime of the application
//    - Inject into routes, controllers, components with @service
//    - Perfect for shared logic like API calls, authentication, etc.
//
// 2. Service Benefits:
//    - Centralized API logic (DRY principle)
//    - Easy to test (mock the service)
//    - Consistent error handling
//    - Reusable across the app
//
// 3. Async/Await:
//    - Modern JavaScript async patterns
//    - Makes async code look synchronous
//    - try/catch for error handling
//
// 4. CORS Credentials:
//    - credentials: 'include' sends cookies with cross-origin requests
//    - Required for session-based auth
//    - Must match backend CORS config
//
// 5. Usage in Routes/Controllers:
//    import { inject as service } from '@ember/service';
//    @service api;
//    
//    async model() {
//      return this.api.getUsers();
//    }

