import React from 'react';
import './Card.css';

export interface CardProps {
  /**
   * Card title
   */
  title?: string;
  
  /**
   * Card content
   */
  children: React.ReactNode;
  
  /**
   * Optional footer content
   */
  footer?: React.ReactNode;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Card Component
 * 
 * A container component for grouping related content.
 * 
 * @example
 * ```tsx
 * <Card title="User Profile" footer={<Button>Edit</Button>}>
 *   <p>John Doe</p>
 *   <p>john@example.com</p>
 * </Card>
 * ```
 */
export const Card: React.FC<CardProps> = ({
  title,
  children,
  footer,
  className = ''
}) => {
  const classNames = ['ui-card', className].filter(Boolean).join(' ');

  return (
    <div className={classNames}>
      {title && (
        <div className="ui-card__header">
          <h3 className="ui-card__title">{title}</h3>
        </div>
      )}
      
      <div className="ui-card__body">
        {children}
      </div>
      
      {footer && (
        <div className="ui-card__footer">
          {footer}
        </div>
      )}
    </div>
  );
};

// LEARNING NOTES:
//
// 1. Conditional Rendering:
//    - {title && <div>...</div>} only renders if title exists
//    - {footer && <div>...</div>} for optional footer
//
// 2. BEM Naming Convention:
//    - Block: ui-card
//    - Element: ui-card__header, ui-card__body
//    - Helps with CSS specificity and organization
//
// 3. Compound Components Pattern:
//    - Card is composed of header, body, footer
//    - Each section is optional
//    - Flexible but opinionated structure

