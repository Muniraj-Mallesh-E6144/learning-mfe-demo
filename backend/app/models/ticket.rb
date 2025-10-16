class Ticket < ApplicationRecord
  # Associations
  belongs_to :requester, class_name: 'User', optional: true
  belongs_to :agent, class_name: 'User', optional: true

  # Validations
  validates :title, presence: true
  validates :status, presence: true, inclusion: { in: %w[open in_progress resolved closed] }
  validates :priority, presence: true, inclusion: { in: %w[low medium high urgent] }

  # Scopes
  scope :open_tickets, -> { where(status: 'open') }
  scope :in_progress, -> { where(status: 'in_progress') }
  scope :resolved, -> { where(status: 'resolved') }
  scope :closed, -> { where(status: 'closed') }
  scope :urgent, -> { where(priority: 'urgent') }
  scope :high_priority, -> { where(priority: 'high') }
  scope :recent, -> { order(created_at: :desc) }

  # Instance methods
  def open?
    status == 'open'
  end

  def closed?
    status == 'closed' || status == 'resolved'
  end

  def urgent?
    priority == 'urgent'
  end
end

# LEARNING NOTES:
#
# 1. Associations:
#    - belongs_to :requester - Each ticket belongs to one user (who created it)
#    - belongs_to :agent - Each ticket can be assigned to one agent
#    - class_name: 'User' tells Rails both associations point to the User model
#    - optional: true allows tickets to exist without an agent (unassigned tickets)
#
# 2. Validations:
#    - Status must be one of: open, in_progress, resolved, closed
#    - Priority must be one of: low, medium, high, urgent
#
# 3. Scopes:
#    - Ticket.open_tickets returns all open tickets
#    - Ticket.urgent returns all urgent tickets
#    - Ticket.recent orders tickets by most recent first
#    - Scopes can be chained: Ticket.urgent.recent
#
# 4. Status Flow:
#    open -> in_progress -> resolved -> closed
#    This represents the typical lifecycle of a support ticket

