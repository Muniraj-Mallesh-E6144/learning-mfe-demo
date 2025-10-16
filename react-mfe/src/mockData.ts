/**
 * Mock Data for Development
 * 
 * This file provides sample data when the backend isn't available.
 * Useful for frontend-only development and testing.
 */

export const mockUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'agent' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'agent' },
  { id: 4, name: 'Alice Williams', email: 'alice@example.com', role: 'customer' },
  { id: 5, name: 'Charlie Brown', email: 'charlie@example.com', role: 'customer' },
];

export const mockTickets = [
  {
    id: 1,
    title: 'Cannot access my account',
    description: 'I forgot my password and the reset link is not working',
    status: 'open',
    priority: 'high',
    requester: {
      id: 4,
      name: 'Alice Williams',
      email: 'alice@example.com',
    },
  },
  {
    id: 2,
    title: 'Software installation issue',
    description: 'Need help installing the new version of the software',
    status: 'in_progress',
    priority: 'medium',
    requester: {
      id: 5,
      name: 'Charlie Brown',
      email: 'charlie@example.com',
    },
    agent: {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
    },
  },
  {
    id: 3,
    title: 'Data export not working',
    description: 'When I try to export data to CSV, I get an error message',
    status: 'open',
    priority: 'urgent',
    requester: {
      id: 4,
      name: 'Alice Williams',
      email: 'alice@example.com',
    },
    agent: {
      id: 3,
      name: 'Bob Johnson',
      email: 'bob@example.com',
    },
  },
  {
    id: 4,
    title: 'Billing question',
    description: 'I was charged twice this month, need clarification',
    status: 'resolved',
    priority: 'high',
    requester: {
      id: 4,
      name: 'Alice Williams',
      email: 'alice@example.com',
    },
    agent: {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
    },
  },
  {
    id: 5,
    title: 'Feature request: Dark mode',
    description: 'Would love to have a dark mode option in the application',
    status: 'open',
    priority: 'low',
    requester: {
      id: 5,
      name: 'Charlie Brown',
      email: 'charlie@example.com',
    },
  },
  {
    id: 6,
    title: 'Email notifications not received',
    description: 'Not getting email notifications for ticket updates',
    status: 'in_progress',
    priority: 'medium',
    requester: {
      id: 5,
      name: 'Charlie Brown',
      email: 'charlie@example.com',
    },
    agent: {
      id: 3,
      name: 'Bob Johnson',
      email: 'bob@example.com',
    },
  },
  {
    id: 7,
    title: 'Report generation takes too long',
    description: 'Monthly reports are taking over 5 minutes to generate',
    status: 'open',
    priority: 'high',
    requester: {
      id: 4,
      name: 'Alice Williams',
      email: 'alice@example.com',
    },
    agent: {
      id: 3,
      name: 'Bob Johnson',
      email: 'bob@example.com',
    },
  },
];

// LEARNING NOTE:
// Mock data is essential for frontend development when:
// - Backend isn't ready yet
// - Backend is down or unavailable
// - Testing without making real API calls
// - Developing offline
// - Creating demos/screenshots
//
// In production, you'd use actual API calls.
// Many teams use tools like MSW (Mock Service Worker) for more sophisticated mocking.

