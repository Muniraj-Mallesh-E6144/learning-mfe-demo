import React, { useState, useEffect } from 'react';
import { mockTickets } from '../mockData';

interface Ticket {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  requester?: {
    id: number;
    name: string;
    email: string;
  };
  agent?: {
    id: number;
    name: string;
    email: string;
  };
}

interface TicketDetailProps {
  ticketId: string;
  apiHost: string;
}

/**
 * TicketDetail Component
 * 
 * Shows detailed information about a single ticket.
 * Demonstrates routing parameter usage in React MFE.
 */
export const TicketDetail: React.FC<TicketDetailProps> = ({ ticketId, apiHost }) => {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTicket();
  }, [ticketId, apiHost]);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`${apiHost}/api/v1/tickets/${ticketId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        setTicket(data);
      } catch (fetchError) {
        // Backend not available, use mock data
        console.warn('[TicketDetail] Backend not available, using mock data');
        const mockTicket = mockTickets.find(t => t.id === parseInt(ticketId));
        if (mockTicket) {
          setTicket(mockTicket as Ticket);
        } else {
          throw new Error('Ticket not found');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ticket');
      console.error('[TicketDetail] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading ticket details...</div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          <p>Error: {error || 'Ticket not found'}</p>
          <button onClick={fetchTicket} style={styles.button}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Ticket #{ticket.id}</h2>
          <div style={styles.badges}>
            <span style={getStatusBadgeStyle(ticket.status)}>
              {ticket.status}
            </span>
            <span style={getPriorityBadgeStyle(ticket.priority)}>
              {ticket.priority}
            </span>
          </div>
        </div>

        <h3 style={styles.ticketTitle}>{ticket.title}</h3>
        
        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>Description</h4>
          <p style={styles.description}>{ticket.description || 'No description provided'}</p>
        </div>

        <div style={styles.infoGrid}>
          {ticket.requester && (
            <div style={styles.infoCard}>
              <h4 style={styles.infoTitle}>Requester</h4>
              <p style={styles.infoText}>
                <strong>{ticket.requester.name}</strong>
                <br />
                {ticket.requester.email}
              </p>
            </div>
          )}

          {ticket.agent && (
            <div style={styles.infoCard}>
              <h4 style={styles.infoTitle}>Assigned Agent</h4>
              <p style={styles.infoText}>
                <strong>{ticket.agent.name}</strong>
                <br />
                {ticket.agent.email}
              </p>
            </div>
          )}
        </div>

        <div style={styles.actions}>
          <button style={styles.button}>Update Status</button>
          <button style={{ ...styles.button, ...styles.buttonSecondary }}>Add Comment</button>
        </div>
      </div>
    </div>
  );
};

const getStatusBadgeStyle = (status: string): React.CSSProperties => {
  const baseStyle: React.CSSProperties = {
    padding: '0.5rem 1rem',
    borderRadius: '16px',
    fontSize: '0.875rem',
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
    padding: '0.5rem 1rem',
    borderRadius: '16px',
    fontSize: '0.875rem',
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
  card: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '2px solid #ecf0f1',
  },
  title: {
    margin: 0,
    color: '#7f8c8d',
    fontSize: '1.5rem',
  },
  badges: {
    display: 'flex',
    gap: '0.5rem',
  },
  ticketTitle: {
    margin: '0 0 2rem 0',
    fontSize: '1.75rem',
    color: '#2c3e50',
  },
  section: {
    marginBottom: '2rem',
  },
  sectionTitle: {
    margin: '0 0 1rem 0',
    color: '#7f8c8d',
    fontSize: '1rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  description: {
    margin: 0,
    color: '#2c3e50',
    lineHeight: 1.6,
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  infoCard: {
    backgroundColor: '#f8f9fa',
    padding: '1.5rem',
    borderRadius: '8px',
  },
  infoTitle: {
    margin: '0 0 0.75rem 0',
    color: '#7f8c8d',
    fontSize: '0.875rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  infoText: {
    margin: 0,
    color: '#2c3e50',
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid #ecf0f1',
  },
  button: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  buttonSecondary: {
    backgroundColor: '#95a5a6',
  },
  loading: {
    textAlign: 'center',
    padding: '3rem',
    color: '#7f8c8d',
    fontSize: '1.1rem',
  },
  error: {
    textAlign: 'center',
    padding: '3rem',
    color: '#e74c3c',
  },
};

// LEARNING NOTE:
// This component receives ticketId from the URL via Ember routing.
// Ember extracts :ticket_id from /tickets/:ticket_id and passes it as a prop.
// React then fetches the full ticket data from the API.

