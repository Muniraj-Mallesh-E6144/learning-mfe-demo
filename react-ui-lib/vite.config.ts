import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

// Component entry points
const entries = [
  'lib/components/Button',
  'lib/components/Card',
  'lib/components/Table',
];

const entryPaths = entries.map((entry) => resolve(__dirname, entry));

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['lib/**/*'],
      outDir: 'dist',
      insertTypesEntry: true,
    }),
  ],

  build: {
    lib: {
      entry: entryPaths,
      formats: ['es', 'cjs'],
      name: 'LearningMFEReactUILib',
      fileName: '[name]',
    },
    outDir: 'dist',
    
    rollupOptions: {
      // Externalize deps that shouldn't be bundled
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        // Provide global variables for UMD build
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
        // Preserve module structure
        preserveModules: false,
        // Asset file names
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            // Place CSS files alongside their components
            return '[name][extname]';
          }
          return 'assets/[name][extname]';
        },
      },
    },
    
    // Generate sourcemaps
    sourcemap: true,
    
    // Minify for production
    minify: 'esbuild',
  },

  // CSS handling
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
  },
});

// LEARNING NOTES:
//
// 1. Library Mode:
//    - build.lib tells Vite to build a library (not an app)
//    - entry: Array of entry points (one per component)
//    - formats: ['es', 'cjs'] builds both ESM and CommonJS
//
// 2. External Dependencies:
//    - React and ReactDOM are marked as external
//    - They won't be bundled with the library
//    - Consuming apps must provide them (peer dependencies)
//
// 3. vite-plugin-dts:
//    - Automatically generates TypeScript .d.ts files
//    - Enables IntelliSense in consuming apps
//    - insertTypesEntry adds types field to package.json
//
// 4. Multiple Entry Points:
//    - Each component is a separate entry
//    - Allows tree-shaking (import only what you need)
//    - Matches the package.json exports structure
//
// 5. Sourcemaps:
//    - sourcemap: true for debugging
//    - Helps when developing consuming apps
//
// 6. CSS Handling:
//    - CSS is bundled with each component
//    - CSS modules support for scoped styles
//    - localsConvention: 'camelCaseOnly' for TypeScript

