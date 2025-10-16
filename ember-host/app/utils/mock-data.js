/**
 * Mock Data for Ember (when backend not available)
 * 
 * Same data as React MFE mockData.ts for consistency
 */

export const mockUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'agent' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'agent' },
  { id: 4, name: 'Alice Williams', email: 'alice@example.com', role: 'customer' },
  { id: 5, name: 'Charlie Brown', email: 'charlie@example.com', role: 'customer' },
];

export const mockDashboardStats = {
  total_tickets: 7,
  open_tickets: 4,
  in_progress_tickets: 2,
  resolved_tickets: 1,
  closed_tickets: 0,
  total_users: 5,
  total_agents: 3,
  total_customers: 2,
  urgent_tickets: 1,
  high_priority_tickets: 3,
  recent_tickets: [
    {
      id: 1,
      title: 'Cannot access my account',
      status: 'open',
      priority: 'high',
      requester: { id: 4, name: 'Alice Williams', email: 'alice@example.com' }
    },
    {
      id: 2,
      title: 'Software installation issue',
      status: 'in_progress',
      priority: 'medium',
      requester: { id: 5, name: 'Charlie Brown', email: 'charlie@example.com' }
    },
    {
      id: 3,
      title: 'Data export not working',
      status: 'open',
      priority: 'urgent',
      requester: { id: 4, name: 'Alice Williams', email: 'alice@example.com' }
    },
  ]
};

// LEARNING NOTE:
// Ember doesn't have built-in TypeScript, so this is plain JavaScript.
// We're exporting the same mock data structure as the React MFE
// for consistency across the application.

