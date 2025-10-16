# Frontend-Only Mode Guide

## Why This Exists

If you don't have Ruby 3.1 set up yet (or don't want to run the backend), you can still learn everything about the microfrontend architecture using **mock data**.

## ✅ What Works Without Backend

The React MFE now automatically falls back to mock data when the backend isn't available:

- ✅ **TicketsList** - Shows 7 sample tickets
- ✅ **TicketDetail** - Shows ticket details
- ✅ **UsersTable** - You pass mock data from Ember
- ✅ **Module Federation** - Works perfectly
- ✅ **Component Architecture** - All patterns visible
- ✅ **Build Tools** - Vite, Ember CLI working

## 🚀 Quick Start

### Option 1: React MFE Standalone

```bash
cd /Users/mmallesh/Documents/Repos/learning-mfe-demo/react-mfe
pnpm dev

# Visit: http://localhost:5000
# ✅ Everything works with mock data!
```

You'll see:
- Tabs to switch between components
- Tickets list with filtering
- Ticket details
- All UI components working

### Option 2: With Ember (Partial)

```bash
# Terminal 1 - Ember
cd /Users/mmallesh/Documents/Repos/learning-mfe-demo/ember-host
pnpm start

# Terminal 2 - React MFE
cd /Users/mmallesh/Documents/Repos/learning-mfe-demo/react-mfe
pnpm dev

# Visit: http://localhost:4200
```

**What Works**:
- ✅ Ember navigation and routing
- ✅ Ember templates and styling
- ✅ React components with mock data
- ✅ Module Federation integration

**What Doesn't Work**:
- ⚠️ Dashboard stats (needs backend)
- ⚠️ Users page (needs backend for data)

## 📊 Mock Data

The mock data is defined in `react-mfe/src/mockData.ts`:

### Mock Tickets (7 tickets)
```typescript
- ID 1: "Cannot access my account" (open, high)
- ID 2: "Software installation issue" (in_progress, medium)
- ID 3: "Data export not working" (open, urgent)
- ID 4: "Billing question" (resolved, high)
- ID 5: "Feature request: Dark mode" (open, low)
- ID 6: "Email notifications not received" (in_progress, medium)
- ID 7: "Report generation takes too long" (open, high)
```

### Mock Users (5 users)
```typescript
- John Doe (admin)
- Jane Smith (agent)
- Bob Johnson (agent)
- Alice Williams (customer)
- Charlie Brown (customer)
```

## 🎓 What You'll Learn (Without Backend)

### 1. Module Federation ✅
- How remoteEntry.js works
- Shared dependencies (React singleton)
- Dynamic imports
- Build configuration

### 2. React Architecture ✅
- Component structure
- TypeScript interfaces
- State management (useState, useEffect)
- Props passing
- Styling patterns

### 3. Build Tools ✅
- Vite configuration
- Development server
- Hot Module Replacement (HMR)
- Production builds

### 4. Component Patterns ✅
- Loading states
- Error handling
- Fallback UI
- Conditional rendering

### 5. Ember Integration ✅
- render-react-component bridge
- DOM mounting
- Props serialization
- Lifecycle management

## 🔧 How Mock Data Works

The components automatically detect when the backend is unavailable:

```typescript
// In TicketsList.tsx
try {
  const response = await fetch(apiUrl);
  // Use real data
} catch (fetchError) {
  console.warn('Backend not available, using mock data');
  // Use mockTickets instead
}
```

When you see this banner:
```
ℹ️ Using mock data (backend not connected)
```

You know it's in mock mode!

## 📝 Adding Your Own Mock Data

Edit `react-mfe/src/mockData.ts`:

```typescript
export const mockTickets = [
  // Add your own tickets here
  {
    id: 8,
    title: 'My custom ticket',
    description: 'Testing mock data',
    status: 'open',
    priority: 'high',
    requester: {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
    },
  },
];
```

## 🎯 When to Use Each Mode

### Use Frontend-Only Mode When:
- ✅ Learning React and TypeScript
- ✅ Understanding Module Federation
- ✅ Studying component architecture
- ✅ Practicing without backend setup
- ✅ You don't have Ruby 3.1 yet

### Use Full Stack When:
- ✅ Learning API integration
- ✅ Understanding CORS
- ✅ Practicing full-stack development
- ✅ Testing real data flow
- ✅ Interview prep for full-stack roles

## 🚀 Upgrading to Full Stack

When you're ready for the backend:

```bash
# Install Ruby 3.1
brew install rbenv ruby-build
rbenv install 3.1.0

# Setup backend
cd backend
rbenv local 3.1.0
bundle install
rails db:create db:migrate db:seed
rails server -p 3000
```

Then the React MFE will automatically use real API data instead of mocks!

## 💡 Pro Tips

### 1. Test Both Modes
Toggle between mock and real data to see the difference:
- With backend: Real API calls
- Without backend: Instant mock data

### 2. Inspect Network Tab
Open DevTools → Network:
- With backend: See API requests
- Without backend: See fetch fail, then mock data kicks in

### 3. Console Logs
Watch the console for:
```
[TicketsList] Backend not available, using mock data
```

### 4. Mock Service Worker (Advanced)
For production-like mocking, consider [MSW](https://mswjs.io/):
```bash
pnpm add -D msw
# Intercepts fetch at network level
# More realistic than try/catch
```

## 🎓 Learning Checklist

Without backend, you can still learn:

- [ ] React components and hooks
- [ ] TypeScript interfaces
- [ ] Module Federation setup
- [ ] Vite configuration
- [ ] Component state management
- [ ] Error handling patterns
- [ ] Loading states
- [ ] Conditional rendering
- [ ] CSS-in-JS styling
- [ ] Build process
- [ ] Development server
- [ ] Hot Module Replacement

With backend, you'll additionally learn:

- [ ] REST API integration
- [ ] CORS configuration
- [ ] Fetch API usage
- [ ] Error handling for network requests
- [ ] Real data flow
- [ ] Backend integration patterns

## 🆘 Troubleshooting

### "Failed to fetch" Error

**Expected!** This means:
1. Backend isn't running
2. Mock data will be used automatically
3. Component still works perfectly

### Mock Data Not Showing

Check:
```typescript
// react-mfe/src/mockData.ts exists?
// Components import it?
import { mockTickets } from '../mockData';
```

### Want to Force Mock Data?

Even with backend running, you can force mocks:
```typescript
// Comment out the real fetch
// const response = await fetch(url);

// Use mock data directly
setTickets(mockTickets);
```

## 📚 Next Steps

1. **Explore React MFE in standalone mode**
   ```bash
   cd react-mfe && pnpm dev
   ```

2. **Read the code with mock data working**
   - Open `src/components/TicketsList.tsx`
   - See how fallback works
   - Understand the pattern

3. **When ready, upgrade Ruby and enable backend**
   - Follow [QUICK_START.md](../QUICK_START.md)
   - See real API integration

4. **Compare both modes**
   - Notice the differences
   - Understand trade-offs

---

**Frontend-only mode is perfect for learning the architecture without backend complexity!** 🚀

