import React, { useState, useEffect } from 'react';
import { mockTickets } from '../mockData';

interface Ticket {
  id: number;
  title: string;
  status: string;
  priority: string;
  requester?: {
    name: string;
    email: string;
  };
}

interface TicketsListProps {
  apiHost: string;
}

/**
 * TicketsList Component
 * 
 * Full React MFE that handles its own data fetching and state.
 * This demonstrates a complete feature built in React.
 */
export const TicketsList: React.FC<TicketsListProps> = ({ apiHost }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchTickets();
  }, [apiHost]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch from API
      const url = filter === 'all' 
        ? `${apiHost}/api/v1/tickets`
        : `${apiHost}/api/v1/tickets?status=${filter}`;
      
      try {
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        setTickets(data);
      } catch (fetchError) {
        // Backend not available, use mock data
        console.warn('[TicketsList] Backend not available, using mock data');
        
        // Filter mock data if needed
        const filteredMockTickets = filter === 'all' 
          ? mockTickets 
          : mockTickets.filter(t => t.status === filter);
        
        setTickets(filteredMockTickets);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tickets');
      console.error('[TicketsList] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    // Re-fetch with new filter
    fetchTickets();
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading tickets...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          <p>Error: {error}</p>
          <button onClick={fetchTickets} style={styles.button}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>🎫 Tickets (React MFE)</h2>
        <p style={styles.subtitle}>This entire view is rendered by React</p>
        {!apiHost.includes('localhost:3000') && (
          <div style={styles.mockDataBanner}>
            ℹ️ Using mock data (backend not connected)
          </div>
        )}
      </div>

      <div style={styles.filters}>
        <button
          onClick={() => handleFilterChange('all')}
          style={filter === 'all' ? styles.filterButtonActive : styles.filterButton}
        >
          All ({tickets.length})
        </button>
        <button
          onClick={() => handleFilterChange('open')}
          style={filter === 'open' ? styles.filterButtonActive : styles.filterButton}
        >
          Open
        </button>
        <button
          onClick={() => handleFilterChange('in_progress')}
          style={filter === 'in_progress' ? styles.filterButtonActive : styles.filterButton}
        >
          In Progress
        </button>
        <button
          onClick={() => handleFilterChange('resolved')}
          style={filter === 'resolved' ? styles.filterButtonActive : styles.filterButton}
        >
          Resolved
        </button>
      </div>

      <div style={styles.ticketList}>
        {tickets.length === 0 ? (
          <div style={styles.empty}>No tickets found</div>
        ) : (
          tickets.map((ticket) => (
            <div key={ticket.id} style={styles.ticketCard}>
              <div style={styles.ticketHeader}>
                <h3 style={styles.ticketTitle}>#{ticket.id} - {ticket.title}</h3>
                <div style={styles.badges}>
                  <span style={getStatusBadgeStyle(ticket.status)}>
                    {ticket.status}
                  </span>
                  <span style={getPriorityBadgeStyle(ticket.priority)}>
                    {ticket.priority}
                  </span>
                </div>
              </div>
              {ticket.requester && (
                <div style={styles.requester}>
                  <strong>Requester:</strong> {ticket.requester.name} ({ticket.requester.email})
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const getStatusBadgeStyle = (status: string): React.CSSProperties => {
  const baseStyle: React.CSSProperties = {
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase',
  };

  switch (status) {
    case 'open':
      return { ...baseStyle, backgroundColor: '#e3f2fd', color: '#1976d2' };
    case 'in_progress':
      return { ...baseStyle, backgroundColor: '#fff3e0', color: '#f57c00' };
    case 'resolved':
      return { ...baseStyle, backgroundColor: '#e8f5e9', color: '#388e3c' };
    case 'closed':
      return { ...baseStyle, backgroundColor: '#f3e5f5', color: '#7b1fa2' };
    default:
      return { ...baseStyle, backgroundColor: '#f5f5f5', color: '#757575' };
  }
};

const getPriorityBadgeStyle = (priority: string): React.CSSProperties => {
  const baseStyle: React.CSSProperties = {
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase',
  };

  switch (priority) {
    case 'urgent':
      return { ...baseStyle, backgroundColor: '#ffebee', color: '#c62828' };
    case 'high':
      return { ...baseStyle, backgroundColor: '#ffe0b2', color: '#e65100' };
    case 'medium':
      return { ...baseStyle, backgroundColor: '#fff9c4', color: '#f9a825' };
    case 'low':
      return { ...baseStyle, backgroundColor: '#e0f2f1', color: '#00796b' };
    default:
      return { ...baseStyle, backgroundColor: '#f5f5f5', color: '#757575' };
  }
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '1rem',
  },
  header: {
    marginBottom: '1.5rem',
  },
  title: {
    margin: '0 0 0.5rem 0',
    color: '#2c3e50',
  },
  subtitle: {
    margin: 0,
    color: '#7f8c8d',
    fontSize: '0.9rem',
  },
  filters: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
  },
  filterButton: {
    padding: '0.5rem 1rem',
    border: '1px solid #ecf0f1',
    borderRadius: '6px',
    backgroundColor: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  filterButtonActive: {
    padding: '0.5rem 1rem',
    border: '1px solid #3498db',
    borderRadius: '6px',
    backgroundColor: '#3498db',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 600,
  },
  ticketList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  ticketCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
    transition: 'transform 0.2s',
  },
  ticketHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.75rem',
    gap: '1rem',
  },
  ticketTitle: {
    margin: 0,
    fontSize: '1.1rem',
    color: '#2c3e50',
    flex: 1,
  },
  badges: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  requester: {
    color: '#7f8c8d',
    fontSize: '0.9rem',
  },
  loading: {
    textAlign: 'center',
    padding: '2rem',
    color: '#7f8c8d',
    fontSize: '1.1rem',
  },
  error: {
    textAlign: 'center',
    padding: '2rem',
    color: '#e74c3c',
  },
  button: {
    padding: '0.5rem 1rem',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginTop: '1rem',
  },
  empty: {
    textAlign: 'center',
    padding: '2rem',
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  mockDataBanner: {
    backgroundColor: '#fff3cd',
    color: '#856404',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    fontSize: '0.9rem',
    marginTop: '0.5rem',
    textAlign: 'center',
  },
};

// LEARNING NOTES:
//
// 1. Full MFE Pattern:
//    - React handles everything: data fetching, state, UI
//    - Ember just provides the route and container
//    - Self-contained feature
//
// 2. useEffect Hook:
//    - Runs after component mounts
//    - Fetches data from API
//    - Re-runs if apiHost changes
//
// 3. Loading States:
//    - loading: true while fetching
//    - error: Shows error message
//    - success: Shows tickets list
//    - Good UX pattern
//
// 4. Filtering:
//    - Local filter state
//    - Re-fetch data when filter changes
//    - Could also be client-side filtering
//
// 5. API Calls:
//    - Uses fetch API
//    - Could use axios or React Query in production
//    - Error handling with try/catch
//
// 6. Why Full React MFE?
//    - Complex feature with lots of interactions
//    - Team expertise in React
//    - Easier to test in isolation
//    - Can be reused in other apps

