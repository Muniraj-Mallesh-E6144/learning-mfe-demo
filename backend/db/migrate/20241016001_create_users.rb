class CreateUsers < ActiveRecord::Migration[6.1]
  def change
    create_table :users do |t|
      t.string :name, null: false
      t.string :email, null: false
      t.string :role, null: false, default: 'customer'

      t.timestamps
    end

    add_index :users, :email, unique: true
    add_index :users, :role
  end
end

# LEARNING NOTES:
#
# This migration creates the users table in the database.
#
# 1. create_table :users - Creates a new table named 'users'
#
# 2. Column definitions:
#    - t.string :name - Creates a string column for the user's name
#    - null: false - This field cannot be empty (enforced at database level)
#    - default: 'customer' - If no role is specified, it defaults to 'customer'
#
# 3. t.timestamps - Automatically creates two columns:
#    - created_at: Records when the record was created
#    - updated_at: Records when the record was last updated
#    Rails automatically manages these fields
#
# 4. Indexes:
#    - add_index :users, :email, unique: true
#      * Creates an index on the email column for faster lookups
#      * unique: true ensures no two users can have the same email (at DB level)
#    - add_index :users, :role
#      * Creates an index on role for faster filtering (e.g., finding all agents)
#
# To run this migration: rails db:migrate
# To rollback: rails db:rollback

