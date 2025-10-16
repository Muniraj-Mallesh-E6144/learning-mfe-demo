# Be sure to restart your server when you modify this file.

# Avoid CORS issues when API is called from the frontend app.
# Handle Cross-Origin Resource Sharing (CORS) in order to accept cross-origin AJAX requests.

# Read more: https://github.com/cyu/rack-cors

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # Allow requests from Ember (port 4200), React MFE (port 5000), and integrated mode (port 3000)
    origins 'localhost:4200', 'localhost:5000', 'localhost:3000', '127.0.0.1:4200', '127.0.0.1:5000', '127.0.0.1:3000'

    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true
  end
end

# LEARNING NOTE:
# CORS (Cross-Origin Resource Sharing) is a security feature implemented by browsers.
# By default, browsers block requests from one origin (domain:port) to another.
# 
# In our architecture:
# - Backend API: localhost:3000
# - Ember Frontend: localhost:4200 (development)
# - React MFE: localhost:5000 (development)
# 
# Without CORS configuration, the browser would block API requests from Ember and React
# to the backend because they're on different ports (different origins).
#
# This middleware tells the browser: "It's okay to allow requests from these specific origins"

