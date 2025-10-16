class CreateTickets < ActiveRecord::Migration[7.0]
  def change
    create_table :tickets do |t|
      t.string :title, null: false
      t.text :description
      t.string :status, null: false, default: 'open'
      t.string :priority, null: false, default: 'medium'
      t.references :requester, foreign_key: { to_table: :users }, null: true
      t.references :agent, foreign_key: { to_table: :users }, null: true

      t.timestamps
    end

    add_index :tickets, :status
    add_index :tickets, :priority
    add_index :tickets, [:status, :priority]
  end
end

# LEARNING NOTES:
#
# This migration creates the tickets table with foreign key relationships to users.
#
# 1. Column definitions:
#    - t.string :title - Short text for the ticket title
#    - t.text :description - Long text for detailed description
#    - t.string :status - Current status (open, in_progress, resolved, closed)
#    - t.string :priority - Priority level (low, medium, high, urgent)
#
# 2. Foreign Keys (Associations):
#    - t.references :requester
#      * Creates a 'requester_id' column that references the users table
#      * This is the user who created the ticket (usually a customer)
#      * foreign_key: { to_table: :users } enforces referential integrity
#      * null: true allows unassigned tickets
#
#    - t.references :agent
#      * Creates an 'agent_id' column that also references the users table
#      * This is the agent/admin assigned to the ticket
#      * null: true because tickets can be unassigned initially
#
# 3. Indexes:
#    - Single column indexes on status and priority for common queries
#    - Composite index [:status, :priority] for queries filtering by both
#      (e.g., "show me all urgent open tickets")
#
# 4. Why two foreign keys to the same table?
#    - A ticket has TWO relationships with users:
#      1. The person who created it (requester)
#      2. The person assigned to fix it (agent)
#    - This is called a "self-referential join" or "multiple associations"

