# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

# Clear existing data (useful for development)
puts "Clearing existing data..."
Ticket.destroy_all
User.destroy_all

# Create Users
puts "Creating users..."

# Admins
admin = User.create!(
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin'
)

# Agents
agent1 = User.create!(
  name: 'Agent John',
  email: 'john@example.com',
  role: 'agent'
)

agent2 = User.create!(
  name: 'Agent Sarah',
  email: 'sarah@example.com',
  role: 'agent'
)

agent3 = User.create!(
  name: 'Agent Mike',
  email: 'mike@example.com',
  role: 'agent'
)

# Customers
customer1 = User.create!(
  name: 'Customer Alice',
  email: 'alice@customer.com',
  role: 'customer'
)

customer2 = User.create!(
  name: 'Customer Bob',
  email: 'bob@customer.com',
  role: 'customer'
)

customer3 = User.create!(
  name: 'Customer Charlie',
  email: 'charlie@customer.com',
  role: 'customer'
)

customer4 = User.create!(
  name: 'Customer Diana',
  email: 'diana@customer.com',
  role: 'customer'
)

puts "Created #{User.count} users"

# Create Tickets
puts "Creating tickets..."

tickets_data = [
  {
    title: 'Cannot access my account',
    description: 'I forgot my password and the reset link is not working',
    status: 'open',
    priority: 'high',
    requester: customer1,
    agent: nil
  },
  {
    title: 'Software installation issue',
    description: 'Need help installing the new version of the software',
    status: 'in_progress',
    priority: 'medium',
    requester: customer2,
    agent: agent1
  },
  {
    title: 'Data export not working',
    description: 'When I try to export data to CSV, I get an error message',
    status: 'open',
    priority: 'urgent',
    requester: customer3,
    agent: agent2
  },
  {
    title: 'Billing question',
    description: 'I was charged twice this month, need clarification',
    status: 'resolved',
    priority: 'high',
    requester: customer1,
    agent: agent1
  },
  {
    title: 'Feature request: Dark mode',
    description: 'Would love to have a dark mode option in the application',
    status: 'open',
    priority: 'low',
    requester: customer4,
    agent: nil
  },
  {
    title: 'Email notifications not received',
    description: 'Not getting email notifications for ticket updates',
    status: 'in_progress',
    priority: 'medium',
    requester: customer2,
    agent: agent3
  },
  {
    title: 'Report generation takes too long',
    description: 'Monthly reports are taking over 5 minutes to generate',
    status: 'open',
    priority: 'high',
    requester: customer3,
    agent: agent2
  },
  {
    title: 'Mobile app crashes on startup',
    description: 'The mobile app crashes immediately after opening on iOS',
    status: 'in_progress',
    priority: 'urgent',
    requester: customer1,
    agent: agent1
  },
  {
    title: 'API documentation unclear',
    description: 'The authentication section in API docs needs more examples',
    status: 'resolved',
    priority: 'low',
    requester: customer4,
    agent: agent3
  },
  {
    title: 'Dashboard widgets not loading',
    description: 'Several dashboard widgets show loading spinner indefinitely',
    status: 'closed',
    priority: 'medium',
    requester: customer2,
    agent: agent2
  }
]

tickets_data.each do |ticket_data|
  Ticket.create!(ticket_data)
end

puts "Created #{Ticket.count} tickets"

puts "\n=== Seed Data Summary ==="
puts "Total Users: #{User.count}"
puts "  - Admins: #{User.where(role: 'admin').count}"
puts "  - Agents: #{User.where(role: 'agent').count}"
puts "  - Customers: #{User.where(role: 'customer').count}"
puts "\nTotal Tickets: #{Ticket.count}"
puts "  - Open: #{Ticket.where(status: 'open').count}"
puts "  - In Progress: #{Ticket.where(status: 'in_progress').count}"
puts "  - Resolved: #{Ticket.where(status: 'resolved').count}"
puts "  - Closed: #{Ticket.where(status: 'closed').count}"
puts "\n=== Seed Complete! ==="

# LEARNING NOTES:
#
# 1. Purpose of seed file:
#    - Provides sample data for development and testing
#    - Makes it easy to reset the database to a known state
#    - Run with: rails db:seed
#
# 2. destroy_all vs delete_all:
#    - destroy_all runs callbacks and validations (slower but safer)
#    - delete_all is a direct SQL DELETE (faster but skips callbacks)
#
# 3. create! vs create:
#    - create! raises an error if validation fails (good for seeds)
#    - create returns false if validation fails (good for user input)
#
# 4. Data relationships:
#    - Some tickets have agents assigned, some don't (unassigned)
#    - Different statuses and priorities for realistic testing
#    - Customer1 has multiple tickets (realistic scenario)
#
# 5. Resetting the database:
#    rails db:reset  # Drops, creates, migrates, and seeds
#    rails db:seed   # Just runs the seed file

