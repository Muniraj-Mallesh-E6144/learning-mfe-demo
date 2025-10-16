# Learning MFE Demo 🚀

> A comprehensive microfrontend architecture demonstration project that mirrors Freshservice's production setup.

## What is This?

This project is a **complete, working example** of a microfrontend architecture that combines:

- **Ruby on Rails** backend (like Freshservice's itildesk)
- **Ember.js** host application (legacy/main app)
- **React** microfrontend (modern features)
- **React UI Library** (shared components)
- **Webpack Module Federation** (runtime integration)

**Perfect for:** Senior frontend engineers learning microfrontend architecture, interview preparation, and understanding real-world integration patterns.

## Quick Start ⚡

```bash
# Clone or navigate to the project
cd learning-mfe-demo

# Terminal 1 - Backend
cd backend
bundle install
rails db:create db:migrate db:seed
rails server -p 3000

# Terminal 2 - Ember Host
cd ember-host
pnpm install
pnpm start

# Terminal 3 - React MFE
cd react-mfe
pnpm install
pnpm dev

# Open browser
open http://localhost:4200
```

**First time setup?** See [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md)

## Architecture Overview 🏗️

```
┌─────────────────────────────────────────────────────────────┐
│                  Browser (localhost:4200)                   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │         Ember Host Application                      │  │
│  │  ┌──────────────┐  ┌──────────────┐                │  │
│  │  │  Dashboard   │  │  Users Page  │                │  │
│  │  │  (Ember)     │  │ (Ember +     │                │  │
│  │  │              │  │  React Table)│                │  │
│  │  └──────────────┘  └──────────────┘                │  │
│  │                                                     │  │
│  │  ┌─────────────────────────────────────────┐       │  │
│  │  │  Tickets Page (Full React MFE)          │       │  │
│  │  │  - Loaded via Module Federation         │       │  │
│  │  │  - Communicates via MessageChannel      │       │  │
│  │  └─────────────────────────────────────────┘       │  │
│  └─────────────────────────────────────────────────────┘  │
│           │                           │                    │
│           │ Fetch API                 │ Dynamic Import     │
│           ▼                           ▼                    │
└───────────────────────────────────────────────────────────┘
            │                           │
            │                           │
┌───────────▼─────────────┐   ┌────────▼───────────────────┐
│  Rails Backend          │   │  React MFE                 │
│  (Port 3000)            │   │  (Port 5000)               │
│                         │   │                            │
│  /api/v1/users          │   │  remoteEntry.js            │
│  /api/v1/tickets        │   │  - UsersTable              │
│  /api/v1/dashboard      │   │  - TicketsList             │
│                         │   │  - TicketDetail            │
└─────────────────────────┘   └────────────────────────────┘
            │                           │
            │                           │ Uses Components
            │                           ▼
            │                 ┌──────────────────────────┐
            │                 │  React UI Library        │
            │                 │  - Button                │
            │                 │  - Card                  │
            │                 │  - Table                 │
            │                 └──────────────────────────┘
            │
            ▼
    ┌───────────────┐
    │  SQLite DB    │
    │  - users      │
    │  - tickets    │
    └───────────────┘
```

## Project Structure 📁

```
learning-mfe-demo/
├── 📂 backend/              Rails API backend
│   ├── app/
│   │   ├── controllers/     REST API endpoints
│   │   └── models/          User, Ticket models
│   ├── config/
│   │   ├── routes.rb        API routes
│   │   └── initializers/cors.rb  CORS configuration
│   └── README.md            Backend documentation
│
├── 📂 ember-host/           Ember host application
│   ├── app/
│   │   ├── components/
│   │   │   └── render-react-component/  ⭐ React bridge
│   │   ├── routes/          Ember routes
│   │   ├── services/        API service
│   │   └── templates/       Handlebars templates
│   ├── config/environment.js  Configuration
│   └── README.md            Ember documentation
│
├── 📂 react-ui-lib/         React component library
│   ├── lib/components/      Button, Card, Table
│   ├── vite.config.ts       Library build config
│   └── README.md            Component library docs
│
├── 📂 react-mfe/            React microfrontend
│   ├── src/
│   │   ├── components/      UsersTable, TicketsList, TicketDetail
│   │   └── bootstrap-rc.tsx  ⭐ Module Federation entry
│   ├── vite.config.ts       ⭐ Module Federation config
│   └── README.md            React MFE documentation
│
└── 📂 docs/                 Comprehensive documentation
    ├── GETTING_STARTED.md   Setup and first steps
    ├── TROUBLESHOOTING.md   Common issues and solutions
    └── ARCHITECTURE.md      Deep dive into architecture
```

⭐ = Key files for understanding the integration

## Key Features ✨

### 1. Three Integration Patterns

**Pattern A: Full Ember Page (Dashboard)**
- Traditional Ember route
- Ember handles everything
- Good for: Simple pages, legacy features

**Pattern B: Hybrid (Users Page)**
- Ember manages route and data
- React component embedded (UsersTable)
- Good for: Gradual migration, mixed complexity

**Pattern C: Full React MFE (Tickets)**
- Ember provides route shell
- React handles everything else
- Good for: New features, complex interactions

### 2. Module Federation

- **Runtime code sharing** between Ember and React
- **Independent deployment** of MFE
- **Shared React instance** (singleton pattern)
- **Lazy loading** of React code

### 3. Communication Patterns

- **MessageChannel API** for Ember ↔ React communication
- **Fetch API** for backend communication
- **Props passing** from Ember to React
- **Event callbacks** from React to Ember

### 4. Real-World Patterns

- **CORS configuration** for cross-origin requests
- **API-first** backend design
- **Component library** for reusability
- **Error boundaries** and loading states
- **TypeScript** for type safety

## Learning Path 📚

### Beginner (Week 1)
- [ ] Set up the project
- [ ] Understand each component's role
- [ ] Follow data flow from API to UI
- [ ] Read all README files

### Intermediate (Week 2)
- [ ] Study Module Federation config
- [ ] Understand render-react-component bridge
- [ ] Trace MessageChannel communication
- [ ] Make small changes to each layer

### Advanced (Week 3-4)
- [ ] Add a new API endpoint
- [ ] Create a new React component
- [ ] Build a full feature end-to-end
- [ ] Deploy to production

## Documentation 📖

| Document | Description |
|----------|-------------|
| [GETTING_STARTED.md](docs/GETTING_STARTED.md) | Setup instructions, prerequisites, verification |
| [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | Common issues and solutions |
| [backend/README.md](backend/README.md) | Rails API documentation |
| [ember-host/README.md](ember-host/README.md) | Ember host documentation |
| [react-ui-lib/README.md](react-ui-lib/README.md) | Component library documentation |
| [react-mfe/README.md](react-mfe/README.md) | React MFE documentation |

**Each file contains extensive learning notes and explanations!**

## Tech Stack 💻

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Backend | Ruby on Rails | 7.0 | REST API |
| Database | SQLite3 | 1.4 | Data storage (dev) |
| Host App | Ember.js | 5.4 | Main application, routing |
| Microfrontend | React | 18.3 | Modern UI components |
| UI Library | React | 18.3 | Shared components |
| Build Tool (Ember) | Ember CLI | 5.4 | Ember build system |
| Build Tool (React) | Vite | 5.4 | Fast React builds |
| Module Federation | @module-federation/vite | 1.0 | Runtime integration |
| Package Manager | pnpm | 8.0 | Fast, disk-efficient |
| Language | TypeScript | 5.5 | Type safety (React) |
| Language | Ruby | 3.1 | Backend logic |

## Key Concepts 🧠

### Module Federation
Runtime code sharing between JavaScript applications. Load React components from a remote source without bundling them.

### Microfrontends
Architecture pattern where independent teams build independent features that compose into a single application.

### Ember Host
The "container" or "shell" application that loads and coordinates microfrontends. Manages routing and shared state.

### MessageChannel API
Web API for bidirectional communication between JavaScript contexts. Used for Ember ↔ React communication.

### Singleton Pattern
Ensuring only one instance of a dependency (React) exists across host and remote to prevent conflicts.

## Interview Preparation 💼

### Questions You Should Be Able to Answer

1. **Why microfrontends?**
   - Independent teams, independent deployments
   - Gradual migration from legacy to modern
   - Technology diversity (Ember + React)

2. **How does Module Federation work?**
   - Runtime code loading via remoteEntry.js
   - Shared dependency management
   - Dynamic imports and initialization

3. **Why Ember + React?**
   - Ember is the legacy main app
   - React for new features (modern, team expertise)
   - Gradual migration without full rewrite

4. **How do they communicate?**
   - MessageChannel API for bidirectional communication
   - Props for data passing (Ember → React)
   - Events for callbacks (React → Ember)

5. **What are the trade-offs?**
   - Complexity vs flexibility
   - Bundle size vs independent deployment
   - Learning curve vs gradual migration

### Demo This During Interviews

1. **Show the architecture diagram** (above)
2. **Run the app** and show all three integration patterns
3. **Open DevTools** and show Module Federation in action
4. **Explain the code** in render-react-component and bootstrap-rc.tsx
5. **Discuss trade-offs** and alternative approaches

## Common Issues ⚠️

| Issue | Quick Fix | Details |
|-------|-----------|---------|
| Port in use | `kill -9 $(lsof -ti:PORT)` | [Troubleshooting](docs/TROUBLESHOOTING.md#port-issues) |
| CORS errors | Check cors.rb, restart Rails | [Troubleshooting](docs/TROUBLESHOOTING.md#cors-not-working) |
| React hooks error | Ensure singleton: true in federation | [Troubleshooting](docs/TROUBLESHOOTING.md#react-hook-errors) |
| Component not loading | Check all 3 servers running | [Troubleshooting](docs/TROUBLESHOOTING.md#react-component-not-rendering) |
| Database errors | `rails db:reset` | [Troubleshooting](docs/TROUBLESHOOTING.md#database-not-created) |

**Full troubleshooting guide:** [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)

## Contributing 🤝

This is a learning project! Feel free to:

- Add more components
- Improve documentation
- Fix bugs you find
- Add tests
- Enhance styling
- Add new features

The goal is learning, so **experiment and break things!**

## Comparison with Freshservice 🔄

| Aspect | This Demo | Freshservice (Real) |
|--------|-----------|---------------------|
| Backend | Rails API | Rails + Puma |
| Host App | Ember Octane | Ember (older version) |
| MFE Build | Vite + Module Federation | Vite + Module Federation |
| Database | SQLite | PostgreSQL |
| Deployment | Development only | Kubernetes, CDN |
| Scale | Single server | Distributed, multi-region |
| Auth | None | OAuth + JWT |
| Monitoring | Console logs | DataDog, Sentry |

**This demo focuses on the architecture patterns, not production infrastructure.**

## Next Steps 🎯

1. **Clone/Download** this repo
2. **Follow** [GETTING_STARTED.md](docs/GETTING_STARTED.md)
3. **Run** all three servers
4. **Explore** each component
5. **Read** the code comments (extensive learning notes!)
6. **Make changes** and see what breaks
7. **Build** something new

## Resources 📚

### Official Documentation
- [Rails Guides](https://guides.rubyonrails.org/)
- [Ember.js Guides](https://guides.emberjs.com/)
- [React Documentation](https://react.dev/)
- [Module Federation](https://webpack.js.org/concepts/module-federation/)
- [Vite](https://vitejs.dev/)

### Microfrontends
- [Micro Frontends](https://micro-frontends.org/) - Martin Fowler
- [Module Federation Examples](https://github.com/module-federation/module-federation-examples)
- [Microfrontend Architecture](https://martinfowler.com/articles/micro-frontends.html)

### Tools
- [Ember Inspector](https://github.com/emberjs/ember-inspector) - Browser extension
- [React DevTools](https://react.dev/learn/react-developer-tools) - Browser extension
- [Postman](https://www.postman.com/) - API testing

## License 📄

MIT License - Feel free to use this for learning, interviews, or as a base for your own projects.

## Acknowledgments 🙏

This project is inspired by **Freshservice's** real-world microfrontend architecture. Special thanks to the Freshworks engineering team for pioneering this approach in production.

---

**Ready to learn?** Start with [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md)!

**Having issues?** Check [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)!

**Questions?** All the code has extensive comments and learning notes!

---

Made with ❤️ for learning microfrontend architecture

