Rails.application.routes.draw do
  # API routes
  namespace :api do
    namespace :v1 do
      resources :users
      resources :tickets
      
      # Dashboard endpoint
      get 'dashboard/stats', to: 'dashboard#stats'
    end
  end

  # Serve Ember app from root
  # In development, Ember runs on port 4200, so this is mainly for production
  get '/', to: 'application#index'
  
  # Catch-all route for Ember routing (so browser refreshes work)
  # This ensures that all non-API routes serve the Ember app
  get '*path', to: 'application#index', constraints: ->(req) {
    !req.path.start_with?('/api') && req.format.html?
  }
end

