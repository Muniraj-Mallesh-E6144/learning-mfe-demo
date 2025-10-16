# Ember Mock Data Mode

## ✅ Ember Now Works Without Backend!

The Ember host application now automatically uses mock data when the Rails backend isn't available.

## How It Works

### Automatic Fallback

```javascript
// In routes/dashboard.js
try {
  // Try real API
  const stats = await this.api.getDashboardStats();
  return { ...stats, usingMockData: false };
} catch (error) {
  // Backend down? Use mock data!
  console.warn('Backend not available, using mock data');
  return { ...mockDashboardStats, usingMockData: true };
}
```

### Visual Indicator

When using mock data, you'll see:
```
ℹ️ Using mock data (backend not connected)
```

## What Works Now

### Dashboard Page ✅
- Total tickets: 7
- Open tickets: 4
- In progress: 2
- Resolved: 1
- User stats
- Recent tickets list

### Users Page ✅
- 5 mock users
- React UsersTable component
- Sorting functionality
- Role badges

### Tickets Page ✅
- Full React MFE
- 7 mock tickets
- Filtering by status
- Ticket details

## Running Ember Without Backend

```bash
# Just start Ember - it will work!
cd /Users/mmallesh/Documents/Repos/learning-mfe-demo/ember-host
pnpm start

# Visit: http://localhost:4200
# Everything works with mock data!
```

## Mock Data Location

All mock data is in: `app/utils/mock-data.js`

```javascript
export const mockUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' },
  // ... 4 more users
];

export const mockDashboardStats = {
  total_tickets: 7,
  open_tickets: 4,
  // ... more stats
};
```

## Console Messages

Watch your browser console for:

```
[Dashboard] Backend not available, using mock data
[Users] Backend not available, using mock data
[TicketsList] Backend not available, using mock data
```

These are **expected and normal** when backend isn't running!

## Full Stack vs Frontend Only

### Frontend Only (Current)
- ✅ Ember: Uses mock data
- ✅ React MFE: Uses mock data
- ✅ All features work
- ✅ No Ruby/Rails needed

### Full Stack (After Ruby 3.1 Upgrade)
- ✅ Ember: Uses real API
- ✅ React MFE: Uses real API
- ✅ Real database
- ✅ Full CRUD operations

## When You Upgrade Ruby

Once you install Ruby 3.1 and start the Rails backend:

```bash
# Backend starts on port 3000
rails server -p 3000
```

Ember and React will **automatically switch** from mock data to real API calls!

No code changes needed - it just works! 🎉

## Customizing Mock Data

Edit `app/utils/mock-data.js`:

```javascript
// Add more users
export const mockUsers = [
  // ... existing users
  { id: 6, name: 'Your Name', email: 'you@example.com', role: 'admin' },
];

// Change stats
export const mockDashboardStats = {
  total_tickets: 100,
  // ... customize as needed
};
```

## Benefits

1. **Learn without backend** - Focus on frontend architecture
2. **Fast development** - No API delays
3. **Offline work** - No internet/backend needed
4. **Consistent data** - Same data every time
5. **Easy demos** - Show UI without backend setup

## When Backend Starts Working

The app automatically detects:
- If `fetch()` succeeds → Use real data
- If `fetch()` fails → Use mock data

Smart fallback! 🧠

---

**Now the entire frontend stack works without Ruby!** 🚀

