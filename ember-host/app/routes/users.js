import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { mockUsers } from '../utils/mock-data';

export default class UsersRoute extends Route {
  @service api;

  async model() {
    try {
      // Try to fetch users from API
      const users = await this.api.getUsers();
      return { users, usingMockData: false };
    } catch (error) {
      // Backend not available, use mock data
      console.warn('[Users] Backend not available, using mock data');
      return { users: mockUsers, usingMockData: true };
    }
  }
}

