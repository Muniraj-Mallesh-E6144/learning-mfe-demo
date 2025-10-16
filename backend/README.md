# Backend API - Learning MFE Demo

## Overview
This is a simplified Rails API backend that demonstrates how Freshservice's itildesk backend works. It provides REST APIs that are consumed by both Ember and React frontends.

## Architecture
- **Framework**: Ruby on Rails 7.0 (API mode)
- **Database**: SQLite3 (simpler for learning; production uses PostgreSQL)
- **Server**: Puma
- **CORS**: Enabled for cross-origin requests from Ember (port 4200) and React (port 5000)

## Key Concepts

### 1. API-First Design
The backend is built as an API-first application, meaning it only returns JSON (no server-rendered HTML). This allows it to serve multiple frontend frameworks (Ember, React, or both).

### 2. Routes Structure
- `/api/v1/*` - API endpoints
- `/` - Serves the Ember application (index.html)
- `/react/*` - Routes for React standalone mode

### 3. CORS Configuration
Cross-Origin Resource Sharing (CORS) is configured to allow:
- Ember frontend (localhost:4200)
- React MFE (localhost:5000)
- Integrated mode (localhost:3000)

## Setup

### Prerequisites
- Ruby 3.1.0 (use rbenv or rvm)
- Bundler gem

### Installation

```bash
# Install Ruby 3.1.0 (if using rbenv)
rbenv install 3.1.0
rbenv local 3.1.0

# Install dependencies
bundle install

# Setup database
rails db:create
rails db:migrate
rails db:seed

# Start the server
rails server -p 3000
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Users
- `GET /api/v1/users` - List all users
- `GET /api/v1/users/:id` - Get a specific user
- `POST /api/v1/users` - Create a new user
- `PUT /api/v1/users/:id` - Update a user
- `DELETE /api/v1/users/:id` - Delete a user

### Tickets
- `GET /api/v1/tickets` - List all tickets
- `GET /api/v1/tickets/:id` - Get a specific ticket
- `POST /api/v1/tickets` - Create a new ticket
- `PUT /api/v1/tickets/:id` - Update a ticket
- `DELETE /api/v1/tickets/:id` - Delete a ticket

### Dashboard Stats
- `GET /api/v1/dashboard/stats` - Get dashboard statistics

## Database Schema

### Users Table
```ruby
- id: integer (primary key)
- name: string
- email: string (unique)
- role: string (agent, admin, customer)
- created_at: datetime
- updated_at: datetime
```

### Tickets Table
```ruby
- id: integer (primary key)
- title: string
- description: text
- status: string (open, in_progress, resolved, closed)
- priority: string (low, medium, high, urgent)
- requester_id: integer (foreign key -> users)
- agent_id: integer (foreign key -> users)
- created_at: datetime
- updated_at: datetime
```

## Project Structure

```
backend/
├── app/
│   ├── controllers/
│   │   ├── application_controller.rb
│   │   └── api/
│   │       └── v1/
│   │           ├── users_controller.rb
│   │           ├── tickets_controller.rb
│   │           └── dashboard_controller.rb
│   ├── models/
│   │   ├── user.rb
│   │   └── ticket.rb
│   └── views/
├── config/
│   ├── routes.rb
│   ├── database.yml
│   ├── application.rb
│   └── initializers/
│       └── cors.rb
├── db/
│   ├── migrate/
│   ├── seeds.rb
│   └── schema.rb
├── Gemfile
└── README.md
```

## Testing the API

### Using curl

```bash
# Get all users
curl http://localhost:3000/api/v1/users

# Get a specific user
curl http://localhost:3000/api/v1/users/1

# Create a new user
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"user":{"name":"John Doe","email":"john@example.com","role":"agent"}}'

# Get dashboard stats
curl http://localhost:3000/api/v1/dashboard/stats
```

### Using Postman or Thunder Client
Import the endpoints and test them with a GUI tool.

## Common Issues & Solutions

### Issue 1: Port already in use
**Error**: `Address already in use - bind(2) for "127.0.0.1" port 3000`

**Solution**:
```bash
# Find the process using port 3000
lsof -ti:3000

# Kill the process
kill -9 <PID>

# Or use a different port
rails server -p 3001
```

### Issue 2: Database not created
**Error**: `database "learning_mfe_demo_development" does not exist`

**Solution**:
```bash
rails db:create
rails db:migrate
```

### Issue 3: CORS errors in browser
**Error**: `Access to fetch at 'http://localhost:3000/api/v1/users' from origin 'http://localhost:4200' has been blocked by CORS policy`

**Solution**: Check `config/initializers/cors.rb` and ensure the origins are properly configured.

### Issue 4: Ruby version mismatch
**Error**: `Your Ruby version is 3.0.0, but your Gemfile specified 3.1.0`

**Solution**:
```bash
# Install correct Ruby version
rbenv install 3.1.0
rbenv local 3.1.0

# Verify
ruby -v
```

## Key Learning Points

1. **API-Only Rails**: This backend doesn't render HTML views; it only returns JSON
2. **CORS Configuration**: Essential for allowing frontends on different ports to access the API
3. **RESTful Design**: Standard REST conventions for API endpoints
4. **Rails Conventions**: Following Rails naming and structure conventions
5. **Database Relationships**: Understanding ActiveRecord associations (User has_many Tickets)

## Next Steps

After setting up the backend:
1. Test all API endpoints manually
2. Set up the Ember frontend (which will be the host application)
3. Create the React UI library
4. Build the React microfrontend
5. Integrate everything together

## Interview Preparation Notes

**Q: How does the backend serve both Ember and React?**
A: The backend is framework-agnostic. It provides JSON APIs that any frontend can consume. The Ember and React apps make HTTP requests to the same API endpoints.

**Q: What's the difference between this and a monolithic Rails app?**
A: Traditional Rails apps render views on the server and return HTML. This API-only approach returns JSON data, allowing frontend frameworks to handle the UI rendering. This is the modern "separation of concerns" approach.

**Q: Why use CORS?**
A: When frontends run on different ports/domains during development (Ember on 4200, React on 5000, backend on 3000), browsers block cross-origin requests by default. CORS configuration explicitly allows these cross-origin requests.

**Q: How does this relate to microservices?**
A: While this is still a monolith, the architectural pattern (API-first, separation of frontend/backend) is a step toward microservices. In production, you might have separate services for users, tickets, etc., each with their own database.

