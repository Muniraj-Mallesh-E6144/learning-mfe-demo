class ApplicationController < ActionController::API
  # This serves as the base controller for all API controllers
  
  # Serve the Ember app's index.html for non-API routes
  # This method is called when someone visits the root URL or any Ember route
  def index
    # In development, this won't be used much since Ember runs on its own port (4200)
    # In production, you'd build the Ember app and put the dist files in public/
    render html: '<h1>Learning MFE Demo API</h1><p>Visit <a href="http://localhost:4200">localhost:4200</a> for the Ember app</p>'.html_safe
  end

  private

  # Handle common errors
  def render_error(message, status = :unprocessable_entity)
    render json: { error: message }, status: status
  end

  def render_not_found(message = 'Resource not found')
    render json: { error: message }, status: :not_found
  end
end

