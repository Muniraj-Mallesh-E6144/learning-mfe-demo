import React, { useState } from 'react';
import './Table.css';

export interface TableColumn<T = any> {
  /**
   * Unique key for the column (matches data key)
   */
  key: string;
  
  /**
   * Column header text
   */
  header: string;
  
  /**
   * Optional render function for custom cell content
   */
  render?: (value: any, row: T) => React.ReactNode;
  
  /**
   * Whether this column is sortable
   */
  sortable?: boolean;
}

export interface TableProps<T = any> {
  /**
   * Column definitions
   */
  columns: TableColumn<T>[];
  
  /**
   * Table data
   */
  data: T[];
  
  /**
   * Callback when sort changes
   */
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Table Component
 * 
 * A data table with sorting support.
 * 
 * @example
 * ```tsx
 * const columns = [
 *   { key: 'name', header: 'Name', sortable: true },
 *   { key: 'email', header: 'Email' },
 *   { 
 *     key: 'role', 
 *     header: 'Role',
 *     render: (value) => <Badge>{value}</Badge>
 *   }
 * ];
 * 
 * <Table columns={columns} data={users} onSort={handleSort} />
 * ```
 */
export const Table = <T extends Record<string, any>>({
  columns,
  data,
  onSort,
  className = ''
}: TableProps<T>) => {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortDirection(newDirection);
    onSort?.(key, newDirection);
  };

  const classNames = ['ui-table', className].filter(Boolean).join(' ');

  return (
    <div className={classNames}>
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                onClick={() => column.sortable && handleSort(column.key)}
                className={column.sortable ? 'ui-table__sortable' : ''}
              >
                <div className="ui-table__header-content">
                  {column.header}
                  {column.sortable && sortKey === column.key && (
                    <span className="ui-table__sort-icon">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="ui-table__empty">
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column) => {
                  const value = row[column.key];
                  return (
                    <td key={column.key}>
                      {column.render ? column.render(value, row) : value}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

// LEARNING NOTES:
//
// 1. Generic Type Parameter:
//    - <T extends Record<string, any>> allows any object type
//    - Provides type safety for data prop
//    - column.key must exist on T
//
// 2. useState Hook:
//    - Local state for sort key and direction
//    - Alternative: Controlled component (parent manages state)
//
// 3. Optional Chaining:
//    - onSort?.(key, newDirection)
//    - Only calls onSort if it's defined
//    - Prevents errors when callback is optional
//
// 4. Custom Render Function:
//    - column.render allows custom cell content
//    - Useful for badges, buttons, formatted dates, etc.
//
// 5. Empty State:
//    - {data.length === 0} shows message when no data
//    - colSpan={columns.length} makes cell span all columns

