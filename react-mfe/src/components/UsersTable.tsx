import React from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface UsersTableProps {
  users: User[];
  apiHost?: string;
}

/**
 * UsersTable Component
 * 
 * Displays a table of users. This component is rendered inside Ember.
 * In the real fs-react-ui-library, this would use the Table component.
 * 
 * @example
 * ```tsx
 * <UsersTable users={users} apiHost="http://localhost:3000" />
 * ```
 */
export const UsersTable: React.FC<UsersTableProps> = ({ users }) => {
  const [sortKey, setSortKey] = React.useState<keyof User | null>(null);
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');

  const handleSort = (key: keyof User) => {
    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortDirection(newDirection);
  };

  const sortedUsers = React.useMemo(() => {
    if (!sortKey) return users;
    
    return [...users].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [users, sortKey, sortDirection]);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Users Table (React Component)</h3>
      <p style={styles.subtitle}>This table is rendered by React inside an Ember page</p>
      
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th} onClick={() => handleSort('id')}>
              ID {sortKey === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th style={styles.th} onClick={() => handleSort('name')}>
              Name {sortKey === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th style={styles.th} onClick={() => handleSort('email')}>
              Email {sortKey === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th style={styles.th} onClick={() => handleSort('role')}>
              Role {sortKey === 'role' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedUsers.map((user) => (
            <tr key={user.id} style={styles.tr}>
              <td style={styles.td}>{user.id}</td>
              <td style={styles.td}>{user.name}</td>
              <td style={styles.td}>{user.email}</td>
              <td style={styles.td}>
                <span style={getRoleBadgeStyle(user.role)}>
                  {user.role}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const getRoleBadgeStyle = (role: string): React.CSSProperties => {
  const baseStyle: React.CSSProperties = {
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase',
  };

  switch (role.toLowerCase()) {
    case 'admin':
      return { ...baseStyle, backgroundColor: '#f3e5f5', color: '#6a1b9a' };
    case 'agent':
      return { ...baseStyle, backgroundColor: '#e1f5fe', color: '#0277bd' };
    case 'customer':
      return { ...baseStyle, backgroundColor: '#e8eaf6', color: '#3f51b5' };
    default:
      return { ...baseStyle, backgroundColor: '#f5f5f5', color: '#757575' };
  }
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  title: {
    margin: '0 0 0.5rem 0',
    color: '#2c3e50',
  },
  subtitle: {
    margin: '0 0 1rem 0',
    color: '#7f8c8d',
    fontSize: '0.9rem',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white',
    boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  th: {
    padding: '1rem',
    textAlign: 'left',
    backgroundColor: '#f8f9fa',
    fontWeight: 600,
    color: '#7f8c8d',
    textTransform: 'uppercase',
    fontSize: '0.85rem',
    cursor: 'pointer',
    userSelect: 'none',
  },
  tr: {
    borderTop: '1px solid #ecf0f1',
  },
  td: {
    padding: '1rem',
  },
};

// LEARNING NOTES:
//
// 1. Props Interface:
//    - Defines the shape of data from Ember
//    - TypeScript ensures type safety
//    - users array matches backend API structure
//
// 2. useState Hook:
//    - sortKey: Which column is being sorted
//    - sortDirection: 'asc' or 'desc'
//    - Local state (not shared with Ember)
//
// 3. useMemo Hook:
//    - Memoizes sorted array
//    - Only re-sorts when users, sortKey, or sortDirection change
//    - Performance optimization
//
// 4. Inline Styles:
//    - Used for simplicity (no CSS files to manage)
//    - In production, use CSS modules or styled-components
//    - Easier to package as a component library
//
// 5. Event Handlers:
//    - onClick={() => handleSort('name')}
//    - Arrow function to pass parameters
//    - Updates local state, triggers re-render
//
// 6. Why This Pattern?
//    - Ember handles routing and data fetching
//    - React handles complex UI interactions
//    - Clear separation of concerns

