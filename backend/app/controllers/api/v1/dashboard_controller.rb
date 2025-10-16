module Api
  module V1
    class DashboardController < ApplicationController
      # GET /api/v1/dashboard/stats
      # Returns dashboard statistics
      # This is used by both Ember and React frontends
      def stats
        stats = {
          total_tickets: Ticket.count,
          open_tickets: Ticket.where(status: 'open').count,
          in_progress_tickets: Ticket.where(status: 'in_progress').count,
          resolved_tickets: Ticket.where(status: 'resolved').count,
          closed_tickets: Ticket.where(status: 'closed').count,
          total_users: User.count,
          total_agents: User.where(role: ['agent', 'admin']).count,
          total_customers: User.where(role: 'customer').count,
          urgent_tickets: Ticket.where(priority: 'urgent').count,
          high_priority_tickets: Ticket.where(priority: 'high').count,
          recent_tickets: Ticket.order(created_at: :desc).limit(5).as_json(
            include: {
              requester: { only: [:id, :name, :email] }
            }
          )
        }

        render json: stats
      end
    end
  end
end

