import React from 'react';
import './Button.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual variant of the button
   */
  variant?: 'primary' | 'secondary' | 'danger';
  
  /**
   * Size of the button
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * Button content
   */
  children: React.ReactNode;
}

/**
 * Button Component
 * 
 * A versatile button component with multiple variants and sizes.
 * 
 * @example
 * ```tsx
 * <Button variant="primary" onClick={() => alert('Clicked!')}>
 *   Click Me
 * </Button>
 * ```
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  children,
  className = '',
  ...props
}) => {
  const classNames = [
    'ui-button',
    `ui-button--${variant}`,
    `ui-button--${size}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <button className={classNames} {...props}>
      {children}
    </button>
  );
};

// LEARNING NOTES:
//
// 1. TypeScript Props Interface:
//    - Extends React.ButtonHTMLAttributes for all native button props
//    - Custom props with JSDoc comments for documentation
//    - Exported for use in consuming apps
//
// 2. React.FC<T>:
//    - Functional Component type with generic props
//    - Provides children type automatically
//    - Better TypeScript IntelliSense
//
// 3. Default Props:
//    - ES6 default parameters (variant = 'primary')
//    - Cleaner than defaultProps
//
// 4. className Composition:
//    - BEM naming: Block__Element--Modifier
//    - Allows custom classes via props
//    - filter(Boolean) removes empty strings
//
// 5. Spread Operator:
//    - {...props} passes all remaining props to button
//    - Supports onClick, disabled, type, etc.

