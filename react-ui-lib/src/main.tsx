import React from 'react';
import ReactDOM from 'react-dom/client';
import { Button } from '../lib/components/Button';
import { Card } from '../lib/components/Card';
import { Table } from '../lib/components/Table';

/**
 * Development playground for testing components
 * Run with: pnpm dev
 */

const sampleData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Agent' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Customer' },
];

const columns = [
  { key: 'id', header: 'ID', sortable: true },
  { key: 'name', header: 'Name', sortable: true },
  { key: 'email', header: 'Email' },
  { key: 'role', header: 'Role', render: (value: string) => <strong>{value}</strong> },
];

function App() {
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>React UI Library - Development Playground</h1>
      
      <section style={{ marginBottom: '2rem' }}>
        <h2>Buttons</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="danger">Danger Button</Button>
          <Button variant="primary" size="small">Small</Button>
          <Button variant="primary" size="large">Large</Button>
          <Button variant="primary" disabled>Disabled</Button>
        </div>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Card</h2>
        <Card 
          title="Example Card" 
          footer={<Button variant="primary">Action</Button>}
        >
          <p>This is the card content. You can put anything here.</p>
          <p>Cards are great for grouping related information.</p>
        </Card>
      </section>

      <section>
        <h2>Table</h2>
        <Table 
          columns={columns} 
          data={sampleData}
          onSort={(key, direction) => console.log(`Sort by ${key} ${direction}`)}
        />
      </section>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

