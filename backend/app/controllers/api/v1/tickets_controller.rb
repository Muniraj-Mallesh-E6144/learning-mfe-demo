module Api
  module V1
    class TicketsController < ApplicationController
      before_action :set_ticket, only: [:show, :update, :destroy]

      # GET /api/v1/tickets
      # Returns all tickets, optionally filtered by status
      # Query params: ?status=open
      def index
        @tickets = Ticket.includes(:requester, :agent).all
        
        # Filter by status if provided
        if params[:status].present?
          @tickets = @tickets.where(status: params[:status])
        end

        # Filter by priority if provided
        if params[:priority].present?
          @tickets = @tickets.where(priority: params[:priority])
        end

        render json: @tickets.as_json(
          include: {
            requester: { only: [:id, :name, :email] },
            agent: { only: [:id, :name, :email] }
          }
        )
      end

      # GET /api/v1/tickets/:id
      # Returns a specific ticket with related user data
      def show
        render json: @ticket.as_json(
          include: {
            requester: { only: [:id, :name, :email, :role] },
            agent: { only: [:id, :name, :email, :role] }
          }
        )
      end

      # POST /api/v1/tickets
      # Creates a new ticket
      # Expected params: { ticket: { title: "", description: "", priority: "", requester_id: 1 } }
      def create
        @ticket = Ticket.new(ticket_params)
        @ticket.status ||= 'open'

        if @ticket.save
          render json: @ticket, status: :created
        else
          render json: { errors: @ticket.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PUT/PATCH /api/v1/tickets/:id
      # Updates an existing ticket
      def update
        if @ticket.update(ticket_params)
          render json: @ticket
        else
          render json: { errors: @ticket.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/tickets/:id
      # Deletes a ticket
      def destroy
        @ticket.destroy
        head :no_content
      end

      private

      def set_ticket
        @ticket = Ticket.find_by(id: params[:id])
        render_not_found('Ticket not found') unless @ticket
      end

      def ticket_params
        params.require(:ticket).permit(:title, :description, :status, :priority, :requester_id, :agent_id)
      end
    end
  end
end

