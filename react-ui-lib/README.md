# React UI Component Library - Learning MFE Demo

## Overview
This is a **React component library** that provides reusable UI components for the microfrontend. It's similar to Freshservice's `@freshworks/fs-react-ui-library`.

## Why a Separate UI Library?

### Benefits
1. **Reusability**: Components can be used across multiple apps/MFEs
2. **Consistency**: Design system enforced at the library level
3. **Maintainability**: Single source of truth for UI components
4. **Testability**: Components tested in isolation
5. **Tree-shaking**: Import only what you need
6. **Storybook**: Visual documentation and development

### Real-World Pattern
- Google has Material-UI
- Ant Design for enterprise apps
- Freshworks has @freshworks/fs-ui-common and @freshworks/fs-react-ui-library
- This mirrors that architecture

## Architecture

### Component Structure
Each component follows this pattern:
```
lib/components/Button/
├── Button.tsx        # Component implementation
├── Button.stories.tsx # Storybook stories
├── Button.test.tsx   # Unit tests
├── types.ts          # TypeScript types
└── index.ts          # Exports
```

### Build Output
```
dist/
├── components/
│   ├── Button/
│   │   ├── index.es.js      # ES Module
│   │   ├── index.cjs.js     # CommonJS
│   │   └── index.d.ts       # TypeScript types
│   └── Card/
│       ├── index.es.js
│       ├── index.cjs.js
│       └── index.d.ts
└── styles/
    └── global.css
```

## Components

### 1. Button
Versatile button component with variants

**Usage:**
```tsx
import { Button } from '@learning-mfe/react-ui-lib/components/Button';

<Button variant="primary" onClick={handleClick}>
  Click Me
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'danger'
- `size`: 'small' | 'medium' | 'large'
- `disabled`: boolean
- `onClick`: () => void

### 2. Card
Container component for grouped content

**Usage:**
```tsx
import { Card } from '@learning-mfe/react-ui-lib/components/Card';

<Card title="User Profile" footer={<Button>Edit</Button>}>
  <p>Content goes here</p>
</Card>
```

### 3. Table
Data table with sorting

**Usage:**
```tsx
import { Table } from '@learning-mfe/react-ui-lib/components/Table';

<Table
  columns={[
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' }
  ]}
  data={users}
  onSort={handleSort}
/>
```

## Setup

### Installation

```bash
# Install dependencies
pnpm install

# Run Storybook (for development)
pnpm storybook

# Build the library
pnpm build
```

### Development Workflow

#### Using Storybook
```bash
pnpm storybook
# Visit http://localhost:6006
```

Storybook provides:
- Visual component browser
- Interactive props playground
- Documentation
- Accessibility testing
- Responsive testing

#### Building the Library
```bash
pnpm build
# Output goes to dist/
```

#### Linking for Local Development
```bash
# In react-ui-lib/
pnpm link

# In react-mfe/
pnpm link @learning-mfe/react-ui-lib
```

## Creating a New Component

### Step 1: Create Component File
```tsx
// lib/components/MyComponent/MyComponent.tsx
import React from 'react';
import { MyComponentProps } from './types';

export const MyComponent: React.FC<MyComponentProps> = ({ 
  title, 
  children 
}) => {
  return (
    <div className="my-component">
      <h3>{title}</h3>
      <div>{children}</div>
    </div>
  );
};
```

### Step 2: Create Types
```typescript
// lib/components/MyComponent/types.ts
export interface MyComponentProps {
  title: string;
  children: React.ReactNode;
}
```

### Step 3: Create Index
```typescript
// lib/components/MyComponent/index.ts
export { MyComponent } from './MyComponent';
export type { MyComponentProps } from './types';
```

### Step 4: Create Storybook Story
```tsx
// lib/components/MyComponent/MyComponent.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { MyComponent } from './MyComponent';

const meta: Meta<typeof MyComponent> = {
  title: 'Components/MyComponent',
  component: MyComponent,
};

export default meta;
type Story = StoryObj<typeof MyComponent>;

export const Default: Story = {
  args: {
    title: 'Hello World',
    children: 'Content goes here',
  },
};
```

### Step 5: Add to Vite Config
```typescript
// vite.config.ts
const entries = [
  // ... existing entries
  resolve(__dirname, 'lib/components/MyComponent'),
];
```

## TypeScript Configuration

The library is TypeScript-first:
- Strict type checking
- Generated `.d.ts` files
- IntelliSense support in consuming apps

## Styling Strategy

### CSS Modules (Recommended)
```tsx
// Button.module.css
.button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
}

.button-primary {
  background-color: #3498db;
  color: white;
}

// Button.tsx
import styles from './Button.module.css';

export const Button = () => (
  <button className={styles.button}>Click</button>
);
```

### Global Styles
```css
/* lib/styles/global.css */
:root {
  --primary-color: #3498db;
  --secondary-color: #2ecc71;
}
```

## Testing

```bash
# Run tests
pnpm test

# Coverage
pnpm test:coverage
```

## Publishing (Advanced)

```bash
# Build the library
pnpm build

# Publish to npm (or private registry)
npm publish --access public
```

For private registry:
```json
"publishConfig": {
  "registry": "https://your-registry.com"
}
```

## Common Issues & Solutions

### Issue 1: Module Not Found
**Error**: `Cannot find module '@learning-mfe/react-ui-lib/components/Button'`

**Solution**: 
1. Check the `exports` field in package.json
2. Ensure the component is built (`pnpm build`)
3. If using `pnpm link`, make sure you linked after building

### Issue 2: React Hook Rules Violation
**Error**: `Invalid hook call`

**Solution**: Ensure React versions match:
```bash
# In react-ui-lib and react-mfe
pnpm list react
# Versions should match (18.3.1)
```

### Issue 3: TypeScript Types Not Found
**Error**: `Could not find a declaration file for module`

**Solution**:
1. Run `pnpm build` (generates .d.ts files)
2. Check `types` field in package.json exports

### Issue 4: Styles Not Applied
**Error**: Components look unstyled

**Solution**: Import the CSS:
```tsx
import '@learning-mfe/react-ui-lib/styles/global.css';
```

## Key Learning Points

1. **Package Exports**: Modern way to define entry points
2. **Dual Builds**: ESM and CJS for compatibility
3. **TypeScript Declarations**: Auto-generated .d.ts files
4. **Tree Shaking**: Import only what you use
5. **Storybook**: Component development environment
6. **Peer Dependencies**: React is a peer (not bundled)

## Interview Preparation Notes

**Q: Why create a separate component library?**
A: To ensure consistency across multiple apps, enable reusability, provide a single source of truth, and allow independent versioning and testing of UI components.

**Q: What's the difference between dependencies and peerDependencies?**
A: Dependencies are bundled with your library. peerDependencies (like React) must be installed by the consuming app. This prevents multiple React versions and reduces bundle size.

**Q: How does tree-shaking work?**
A: Modern bundlers analyze ES modules and remove unused code. Our library exports each component separately, so if you only import Button, only Button's code is included in your bundle.

**Q: Why use Vite instead of Webpack?**
A: Vite is faster (uses native ESM in dev), simpler configuration, better DX. It still produces optimized production builds. Freshworks uses Vite for fs-react-ui-library.

**Q: How do you handle breaking changes?**
A: Semantic versioning (semver): Major.Minor.Patch. Major = breaking changes, Minor = new features, Patch = bug fixes. Consumers can pin to major versions.

## Next Steps

After understanding this library:
1. Create the React MFE that consumes these components
2. See how Module Federation shares React between apps
3. Integrate everything with the Ember host

## References

- [Vite Library Mode](https://vitejs.dev/guide/build.html#library-mode)
- [Storybook for React](https://storybook.js.org/docs/react/get-started/introduction)
- [Package Exports](https://nodejs.org/api/packages.html#package-entry-points)
- [TypeScript Library](https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html)

