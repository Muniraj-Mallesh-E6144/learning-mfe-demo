import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';

export default defineConfig({
  plugins: [
    react(),
    
    // Module Federation Plugin
    federation({
      // Name of this microfrontend
      name: 'host_main',
      
      // Name of the remote entry file
      filename: 'remoteEntry.js',
      
      // Modules exposed to host applications
      exposes: {
        './renderComponent': './src/remote-entry-rc.ts',  // Production pattern entry point (wrapped)
        './TicketsList': './src/components/TicketsList.tsx',  // Direct component access
        './UsersTable': './src/components/UsersTable.tsx',    // Direct component access
        './TicketDetail': './src/components/TicketDetail.tsx', // Direct component access
      },
      
      // Shared dependencies with host
      shared: {
        react: {
          singleton: true,  // Only one instance of React
          requiredVersion: '18.3.1',
        },
        'react-dom': {
          singleton: true,  // Only one instance of ReactDOM
          requiredVersion: '18.3.1',
        },
      },
    }),
  ],

  // Development server configuration
  server: {
    port: 5000,
    
    // Enable CORS for Ember to load remoteEntry.js
    cors: true,
    
    // Enable HMR
    hmr: {
      overlay: true,
    },
  },

  // Build configuration
  build: {
    // Module Federation requires ESNext
    target: 'esnext',
    
    // Minimum chunk size before code-splitting
    minify: 'esbuild',
    
    // Don't inline small assets (important for Module Federation)
    assetsInlineLimit: 0,
    
    // Output directory
    outDir: 'dist',
    
    // Generate sourcemaps for debugging
    sourcemap: true,
    
    // Rollup options
    rollupOptions: {
      output: {
        // Control chunk file names
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },

  // Preview server (for testing production build)
  preview: {
    port: 5000,
    cors: true,
  },
});

// LEARNING NOTES:
//
// 1. @module-federation/vite Plugin:
//    - Brings Module Federation to Vite
//    - Originally a Webpack 5 feature
//    - Allows runtime code sharing
//
// 2. federation() Configuration:
//    - name: Unique identifier for this MFE
//    - filename: Entry point file (remoteEntry.js)
//    - exposes: Map of external paths to internal modules
//    - shared: Dependencies shared with host (singleton React)
//
// 3. singleton: true:
//    - Ensures only ONE instance of React across host and remote
//    - Critical for React Context, Hooks to work properly
//    - Without this, you'll get "Invalid hook call" errors
//
// 4. requiredVersion:
//    - Specifies which version of the dependency
//    - Module Federation can handle version negotiation
//    - Warns if versions don't match
//
// 5. CORS: true:
//    - Allows Ember (localhost:4200) to fetch remoteEntry.js
//    - Required for cross-origin dynamic imports
//    - In production, configure properly (don't use wildcard *)
//
// 6. target: 'esnext':
//    - Module Federation uses modern JS features
//    - top-level await, dynamic import
//    - Required for Module Federation to work
//
// 7. assetsInlineLimit: 0:
//    - Prevents Vite from inlining small assets as base64
//    - Module Federation needs separate asset files
//
// 8. Port 5000:
//    - Must match REACT_MFE_URL in Ember config
//    - Consistent across dev and preview
//
// 9. How Module Federation Works:
//    a) Vite builds your app + generates remoteEntry.js
//    b) remoteEntry.js contains metadata about exposed modules
//    c) Host (Ember) dynamically imports remoteEntry.js
//    d) Host calls init() to set up shared scope
//    e) Host calls get('./renderComponent') to load the module
//    f) Module is executed in the shared React context
//
// 10. Why This Matters:
//     - No iframe isolation issues
//     - Shared memory space (better performance)
//     - Shared dependencies (smaller bundle)
//     - Independent deployment (MFE can deploy separately)

