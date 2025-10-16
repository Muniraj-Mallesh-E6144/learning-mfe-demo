import React from 'react';
import { UsersTable } from './components/UsersTable';
import { TicketsList } from './components/TicketsList';
import { TicketDetail } from './components/TicketDetail';

/**
 * Standalone App for Development
 * 
 * This is only used when running the React MFE in standalone mode (pnpm dev).
 * When integrated with Ember, components are loaded via bootstrap-rc.tsx.
 */
function App() {
  const [activeTab, setActiveTab] = React.useState<'users' | 'tickets' | 'detail'>('users');

  // Sample data for standalone mode
  const sampleUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'agent' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'customer' },
  ];

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>React MFE - Standalone Mode</h1>
        <p style={styles.subtitle}>This is the development view. In production, components are loaded by Ember.</p>
      </header>

      <nav style={styles.nav}>
        <button
          onClick={() => setActiveTab('users')}
          style={activeTab === 'users' ? styles.navButtonActive : styles.navButton}
        >
          Users Table
        </button>
        <button
          onClick={() => setActiveTab('tickets')}
          style={activeTab === 'tickets' ? styles.navButtonActive : styles.navButton}
        >
          Tickets List
        </button>
        <button
          onClick={() => setActiveTab('detail')}
          style={activeTab === 'detail' ? styles.navButtonActive : styles.navButton}
        >
          Ticket Detail
        </button>
      </nav>

      <main style={styles.main}>
        {activeTab === 'users' && (
          <UsersTable users={sampleUsers} apiHost="http://localhost:3000" />
        )}
        
        {activeTab === 'tickets' && (
          <TicketsList apiHost="http://localhost:3000" />
        )}
        
        {activeTab === 'detail' && (
          <TicketDetail ticketId="1" apiHost="http://localhost:3000" />
        )}
      </main>

      <footer style={styles.footer}>
        <p>React MFE | Module Federation | Vite</p>
        <p style={styles.footerNote}>
          Running on <strong>localhost:5000</strong>
        </p>
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    backgroundColor: '#3498db',
    color: 'white',
    padding: '2rem',
    textAlign: 'center',
  },
  title: {
    margin: '0 0 0.5rem 0',
    fontSize: '2rem',
  },
  subtitle: {
    margin: 0,
    opacity: 0.9,
    fontSize: '1rem',
  },
  nav: {
    display: 'flex',
    gap: '1rem',
    padding: '1rem 2rem',
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #ecf0f1',
  },
  navButton: {
    padding: '0.5rem 1rem',
    border: '1px solid #ecf0f1',
    borderRadius: '6px',
    backgroundColor: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  navButtonActive: {
    padding: '0.5rem 1rem',
    border: '1px solid #3498db',
    borderRadius: '6px',
    backgroundColor: '#3498db',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 600,
  },
  main: {
    flex: 1,
    padding: '2rem',
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto',
  },
  footer: {
    backgroundColor: '#2c3e50',
    color: 'white',
    padding: '1.5rem',
    textAlign: 'center',
  },
  footerNote: {
    opacity: 0.8,
    fontSize: '0.9rem',
    margin: '0.5rem 0 0 0',
  },
};

export default App;

