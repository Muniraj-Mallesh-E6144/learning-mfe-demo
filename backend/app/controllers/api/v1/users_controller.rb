module Api
  module V1
    class UsersController < ApplicationController
      before_action :set_user, only: [:show, :update, :destroy]

      # GET /api/v1/users
      # Returns all users with pagination support
      def index
        @users = User.all
        render json: @users
      end

      # GET /api/v1/users/:id
      # Returns a specific user
      def show
        render json: @user
      end

      # POST /api/v1/users
      # Creates a new user
      # Expected params: { user: { name: "", email: "", role: "" } }
      def create
        @user = User.new(user_params)

        if @user.save
          render json: @user, status: :created
        else
          render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PUT/PATCH /api/v1/users/:id
      # Updates an existing user
      def update
        if @user.update(user_params)
          render json: @user
        else
          render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/users/:id
      # Deletes a user
      def destroy
        @user.destroy
        head :no_content
      end

      private

      def set_user
        @user = User.find_by(id: params[:id])
        render_not_found('User not found') unless @user
      end

      def user_params
        params.require(:user).permit(:name, :email, :role)
      end
    end
  end
end

