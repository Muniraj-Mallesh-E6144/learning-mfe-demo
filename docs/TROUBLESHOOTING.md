# Troubleshooting Guide - Learning MFE Demo

This guide documents common issues and their solutions. Keep this updated as you encounter and solve new problems!

## Table of Contents

1. [Backend Issues](#backend-issues)
2. [Ember Issues](#ember-issues)
3. [React MFE Issues](#react-mfe-issues)
4. [Integration Issues](#integration-issues)
5. [Build Issues](#build-issues)
6. [Development Environment](#development-environment)

---

## Backend Issues

### Issue: Port 3000 Already in Use

**Error:**
```
Address already in use - bind(2) for "127.0.0.1" port 3000 (Errno::EADDRINUSE)
```

**Solution:**
```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)

# Or use a different port
rails server -p 3001
# Then update EMBER's API_HOST config
```

**Root Cause:** Another Rails server or Node app is using port 3000.

---

### Issue: Database Not Created

**Error:**
```
FATAL: database "learning_mfe_demo_development" does not exist
```

**Solution:**
```bash
cd backend
rails db:create
rails db:migrate
rails db:seed
```

**Prevention:** Always run `db:create` before `db:migrate` on first setup.

---

### Issue: Missing Dependencies/Gems

**Error:**
```
Could not find gem 'rack-cors' in locally installed gems
```

**Solution:**
```bash
cd backend
bundle install

# If that fails, try
bundle update
```

---

### Issue: CORS Not Working

**Symptom:** Frontend can't access API, CORS errors in browser console.

**Error:**
```
Access to fetch at 'http://localhost:3000/api/v1/users' from origin 
'http://localhost:4200' has been blocked by CORS policy
```

**Solution:**

1. Check `backend/config/initializers/cors.rb` exists
2. Verify origins include:
   ```ruby
   origins 'localhost:4200', 'localhost:5000', 'localhost:3000'
   ```
3. Restart Rails server after changing CORS config
4. Clear browser cache
5. Check with curl:
   ```bash
   curl -H "Origin: http://localhost:4200" \
        -H "Access-Control-Request-Method: GET" \
        -X OPTIONS \
        http://localhost:3000/api/v1/users
   ```

---

### Issue: Wrong Ruby Version

**Error:**
```
Your Ruby version is 3.0.0, but your Gemfile specified 3.1.0
```

**Solution:**
```bash
# Install correct Ruby version
rbenv install 3.1.0
rbenv local 3.1.0

# Verify
ruby -v

# Reinstall gems
bundle install
```

---

## Ember Issues

### Issue: Ember Octane Edition Configuration Error

**Error:**
```
You have configured your application to indicate that it is using the 'octane' edition, 
but the appropriate Octane features were not enabled
```

**Solution:**
This is already fixed! The project includes `config/optional-features.json` with:
```json
{
  "application-template-wrapper": false,
  "template-only-glimmer-components": true
}
```

If you still see this error:
```bash
cd ember-host
# Ensure the file exists
cat config/optional-features.json

# If missing, create it with the content above
```

---

### Issue: Port 4200 Already in Use

**Error:**
```
Port 4200 is already in use.
```

**Solution:**
```bash
# Kill process using port 4200
kill -9 $(lsof -ti:4200)

# Or use different port
ember serve --port 4201
```

---

### Issue: Module Not Found Errors

**Error:**
```
Error: Cannot find module 'ember-cli-babel'
```

**Solution:**
```bash
cd ember-host
rm -rf node_modules
pnpm install
```

**Prevention:** Always use `pnpm` (not npm or yarn) for consistency.

---

### Issue: Ember Build Fails

**Error:**
```
Build failed.
The Broccoli Plugin: [BroccoliMergeTrees] failed
```

**Solution:**
```bash
# Clean Ember temp files
cd ember-host
rm -rf dist tmp

# Clear cache
rm -rf .npm .cache

# Reinstall
rm -rf node_modules
pnpm install

# Rebuild
pnpm start
```

---

### Issue: Ember Inspector Not Working

**Symptom:** Ember tab missing in DevTools.

**Solution:**
1. Install [Ember Inspector](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
2. Ensure you're on `localhost:4200` (not 3000 or 5000)
3. Check console for Ember version
4. Restart browser

---

### Issue: Can't Access API from Ember

**Symptom:** API calls fail, network errors.

**Checklist:**
```bash
# 1. Is Rails running?
curl http://localhost:3000/api/v1/users

# 2. Check Ember config
cat ember-host/config/environment.js | grep API_HOST

# 3. Check browser DevTools Network tab
# Look for failed requests

# 4. Verify CORS (see Backend CORS section)
```

---

## React MFE Issues

### Issue: remoteEntry.js 404

**Error (in Ember):**
```
Failed to fetch dynamically imported module: 
http://localhost:5000/remoteEntry.js
```

**Solution:**
```bash
# 1. Ensure React MFE is running
cd react-mfe
pnpm dev
# Should see "Server running at http://localhost:5000"

# 2. Verify remoteEntry.js is accessible
curl http://localhost:5000/remoteEntry.js
# Should return JavaScript code

# 3. Check vite.config.ts has federation() plugin

# 4. Verify Ember's REACT_MFE_URL
# ember-host/config/environment.js
ENV.REACT_MFE_URL = 'http://localhost:5000'
```

**Root Cause:** React MFE dev server not running or Module Federation not configured.

---

### Issue: React Hook Errors

**Error:**
```
Error: Invalid hook call. Hooks can only be called inside the body 
of a function component.
```

**Cause:** Multiple React instances (Ember has one, React MFE has another).

**Solution:**
```bash
# 1. Check React versions match
cd ember-host && pnpm list react
cd react-mfe && pnpm list react
# Both should be 18.3.1

# 2. Verify Module Federation shared config
# react-mfe/vite.config.ts
shared: {
  react: { singleton: true },  # ← Must be singleton!
  'react-dom': { singleton: true }
}

# 3. Clear node_modules and reinstall
cd ember-host && rm -rf node_modules && pnpm install
cd react-mfe && rm -rf node_modules && pnpm install

# 4. Restart both dev servers
```

---

### Issue: React Component Not Rendering

**Symptom:** Ember loads, but React component doesn't appear.

**Debugging Steps:**
```javascript
// 1. Open browser console, look for these messages:
"[RenderReactComponent] Loading ComponentName..."
"[RenderReactComponent] ✓ Loaded ComponentName"
"[React MFE] Bootstrapping ComponentName..."
"[React MFE] ✓ Successfully mounted ComponentName"

// 2. Check Network tab for:
http://localhost:5000/remoteEntry.js (should be 200)
http://localhost:5000/assets/*.js (React component code)

// 3. Check DOM
// Look for <div id="your-selector-id"></div>
// Should contain React component

// 4. Check for JavaScript errors in console
```

**Common Causes:**
- React MFE not running (port 5000)
- Component name typo in Ember template
- DOM selector ID typo
- remoteEntry.js not accessible

---

### Issue: Props Not Passing to React

**Symptom:** React component renders but doesn't receive props.

**Checklist:**
```handlebars
{{!-- Ember template --}}
<RenderReactComponent
  @componentName="UsersTable"
  @moduleName="host_main"
  @domElementSelectorId="users-table-react"
  @props={{hash
    users=@model.users          {{!-- Make sure data exists --}}
    apiHost="http://localhost:3000"
  }}
/>
```

```javascript
// React component
console.log('Props received:', props);

// Check browser console for the log
```

**Common Issues:**
- Props not JSON-serializable (e.g., functions)
- Typo in prop name
- Data not loaded in Ember model() hook
- Using `this.props` instead of `@model.props` in Handlebars

---

### Issue: Module Federation Build Fails

**Error:**
```
[vite]: Rollup failed to resolve import "@module-federation/vite"
```

**Solution:**
```bash
cd react-mfe

# Reinstall @module-federation/vite
pnpm add -D @module-federation/vite

# If that doesn't work, check versions
pnpm list @module-federation/vite
# Should be 1.0.0 or later

# Clear cache and rebuild
rm -rf node_modules dist
pnpm install
pnpm build
```

---

## Integration Issues

### Issue: Communication Between Ember and React Fails

**Symptom:** MessageChannel not established.

**Debugging:**
```javascript
// In browser console:
// 1. Check for init message
window.addEventListener('message', (e) => {
  console.log('Message event:', e.data);
});

// 2. Look for these message types:
// - fs-react-mfe-host-main-init (Ember → React)
// - componentMounted (React → Ember)
```

**Solution:**
1. Verify `domElementSelectorId` matches between Ember and React
2. Check MessageChannel code in:
   - `ember-host/app/components/render-react-component/component.js`
   - `react-mfe/src/bootstrap-rc.tsx`
3. Ensure both are using matching event names

---

### Issue: React Component Doesn't Unmount

**Symptom:** Memory leak, multiple React instances.

**Solution:**
```javascript
// Ensure willDestroy is called in Ember component
@action
willDestroy() {
  if (this.messagePort) {
    this.messagePort.postMessage({ action: 'unmount' });
  }
  super.willDestroy();
}

// Ensure React listens for unmount
channel.port1.onmessage = (event) => {
  if (event.data.action === 'unmount') {
    root.unmount();
  }
};
```

---

## Build Issues

### Issue: Ember Production Build Fails

**Error:**
```
Build failed.
```

**Solution:**
```bash
cd ember-host

# Check for TypeScript errors
pnpm lint

# Clear temp files
rm -rf dist tmp

# Build
NODE_ENV=production pnpm build

# If specific error, check that file
```

---

### Issue: React MFE Production Build Missing remoteEntry.js

**Symptom:** `dist/remoteEntry.js` doesn't exist after build.

**Solution:**
```bash
cd react-mfe

# Check vite.config.ts has federation plugin
# Should have:
federation({
  name: 'host_main',
  filename: 'remoteEntry.js',  # ← This line
  exposes: { /* ... */ }
})

# Rebuild
rm -rf dist
pnpm build

# Verify output
ls -la dist/
# Should see remoteEntry.js
```

---

### Issue: UI Library Build Fails

**Error:**
```
Could not resolve entry module (index.ts).
```

**Solution:**
```bash
cd react-ui-lib

# Check vite.config.ts entries array
# Should list all component paths

# Rebuild
pnpm build

# Check dist/
ls -la dist/components/
# Should have Button/, Card/, Table/
```

---

## Development Environment

### Issue: Wrong Node Version

**Error:**
```
error: The engine "node" is incompatible with this module.
```

**Solution:**
```bash
# Check current version
node -v

# Install correct version (18+)
nvm install 18
nvm use 18

# Verify
node -v
# Should show v18.x.x

# Create .nvmrc in project root
echo "18" > .nvmrc

# Now nvm will auto-switch
nvm use
```

---

### Issue: pnpm Not Found

**Error:**
```
pnpm: command not found
```

**Solution:**
```bash
# Install pnpm globally
npm install -g pnpm

# Verify
pnpm -v

# If using nvm, pnpm is per-node-version
# Install for each Node version you use
```

---

### Issue: Permission Denied Errors

**Error:**
```
EACCES: permission denied, mkdir '/usr/local/lib/node_modules'
```

**Solution:**
```bash
# Option 1: Use nvm (recommended)
# nvm installs to user directory, no sudo needed

# Option 2: Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc
```

---

### Issue: Git Conflicts in package-lock.json

**Prevention:**
```bash
# Use pnpm (not npm) consistently
# pnpm-lock.yaml is easier to merge

# If conflicts occur:
rm pnpm-lock.yaml
pnpm install
```

---

## Performance Issues

### Issue: Slow Ember Build

**Solution:**
```bash
# Enable faster rebuilds
JOBS=4 ember serve

# Use production mode for faster builds
ember build --environment=production

# Check for large dependencies
pnpm list --depth=0
```

---

### Issue: React HMR Not Working

**Symptom:** Changes don't reflect without full reload.

**Solution:**
```bash
# 1. Check Vite HMR config
# vite.config.ts
server: {
  hmr: { overlay: true }
}

# 2. Clear browser cache
# 3. Check browser console for HMR errors
# 4. Restart dev server
```

---

## Checklist for "Nothing Works"

When everything seems broken:

```bash
# 1. Kill all processes
pkill -f "rails"
pkill -f "ember"
pkill -f "vite"

# 2. Check ports are free
lsof -ti:3000 && echo "Port 3000 in use"
lsof -ti:4200 && echo "Port 4200 in use"
lsof -ti:5000 && echo "Port 5000 in use"

# 3. Clean all projects
cd backend && rm -rf tmp log/*.log
cd ember-host && rm -rf dist tmp node_modules && pnpm install
cd react-mfe && rm -rf dist node_modules && pnpm install
cd react-ui-lib && rm -rf dist node_modules && pnpm install

# 4. Database reset
cd backend && rails db:reset

# 5. Start everything fresh
# Terminal 1: cd backend && rails server -p 3000
# Terminal 2: cd ember-host && pnpm start
# Terminal 3: cd react-mfe && pnpm dev

# 6. Open browser
open http://localhost:4200

# 7. Check console for errors
```

---

## Getting Help

### Useful Commands

```bash
# Check what's running on ports
lsof -i :3000
lsof -i :4200
lsof -i :5000

# Check Ruby version
ruby -v
which ruby

# Check Node version
node -v
which node

# Check pnpm version
pnpm -v

# Check Rails
rails -v

# Check Ember
cd ember-host && pnpm ember -v

# View logs
cd backend && tail -f log/development.log
```

### Debug Mode

```bash
# Rails with verbose logging
cd backend
RAILS_ENV=development rails server -p 3000

# Ember with debug
cd ember-host
DEBUG=* pnpm start

# Check environment variables
cd ember-host
cat config/environment.js | grep -A 5 "development"
```

---

## Document Your Issues!

When you encounter a new issue:

1. **Document the error** (full error message)
2. **Document what you tried** (commands run)
3. **Document the solution** (what actually worked)
4. **Add it to this file!**

This will help your future self and others learning the codebase.

---

## Additional Resources

- [Rails Debugging Guide](https://guides.rubyonrails.org/debugging_rails_applications.html)
- [Ember Debugging Guide](https://guides.emberjs.com/release/tutorial/part-2/debugging/)
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Vite Troubleshooting](https://vitejs.dev/guide/troubleshooting.html)
- [Module Federation Troubleshooting](https://webpack.js.org/concepts/module-federation/)

