class User < ApplicationRecord
  # Associations
  has_many :requested_tickets, class_name: 'Ticket', foreign_key: 'requester_id', dependent: :destroy
  has_many :assigned_tickets, class_name: 'Ticket', foreign_key: 'agent_id', dependent: :nullify

  # Validations
  validates :name, presence: true
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :role, presence: true, inclusion: { in: %w[agent admin customer] }

  # Scopes
  scope :agents, -> { where(role: ['agent', 'admin']) }
  scope :customers, -> { where(role: 'customer') }

  # Instance methods
  def agent?
    role == 'agent' || role == 'admin'
  end

  def admin?
    role == 'admin'
  end

  def customer?
    role == 'customer'
  end
end

# LEARNING NOTES:
# 
# 1. Associations:
#    - has_many :requested_tickets - A user can create multiple tickets (as a requester/customer)
#    - has_many :assigned_tickets - A user can be assigned multiple tickets (as an agent)
#    - We use class_name and foreign_key because both associations point to the Ticket model
#    - dependent: :destroy means when a user is deleted, their requested tickets are also deleted
#    - dependent: :nullify means when a user is deleted, their assigned tickets remain but agent_id is set to null
#
# 2. Validations:
#    - presence: true - Field cannot be blank
#    - uniqueness: true - No two users can have the same email
#    - format: - Email must match a valid email pattern
#    - inclusion: - Role must be one of: agent, admin, or customer
#
# 3. Scopes:
#    - Scopes are reusable query methods
#    - User.agents returns all agents and admins
#    - User.customers returns all customers
#
# 4. Instance Methods:
#    - These are helper methods you can call on a user object
#    - Example: user.agent? returns true if user is an agent or admin

