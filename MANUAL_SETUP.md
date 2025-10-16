# Manual Setup Guide

Your system has Ruby 2.6.10, which requires some adjustments. Follow these steps:

## Step 1: Backend Setup

```bash
cd /Users/mmallesh/Documents/Repos/learning-mfe-demo/backend

# Install gems to vendor/bundle (no sudo needed)
bundle install --path vendor/bundle

# If bundle install fails, update bundler first:
gem install bundler --user-install
bundle install --path vendor/bundle

# Create and setup database
bundle exec rails db:create
bundle exec rails db:migrate  
bundle exec rails db:seed

# Start server
bundle exec rails server -p 3000
```

## Step 2: Ember Host

```bash
# New terminal
cd /Users/mmallesh/Documents/Repos/learning-mfe-demo/ember-host

# Install dependencies
pnpm install

# Start server
pnpm start
```

## Step 3: React MFE

```bash
# New terminal
cd /Users/mmallesh/Documents/Repos/learning-mfe-demo/react-mfe

# Install dependencies
pnpm install

# Start server
pnpm dev
```

## Step 4: Open Browser

```
http://localhost:4200
```

## If You Want to Upgrade Ruby (Optional)

### Install rbenv
```bash
brew install rbenv ruby-build
echo 'eval "$(rbenv init - zsh)"' >> ~/.zshrc
source ~/.zshrc
```

### Install Ruby 3.1.0
```bash
rbenv install 3.1.0
cd /Users/mmallesh/Documents/Repos/learning-mfe-demo/backend
rbenv local 3.1.0
```

### Then update Gemfile back
```ruby
# backend/Gemfile
ruby '3.1.0'
gem 'rails', '~> 7.0.0'
gem 'sqlite3', '~> 1.4'
```

And run: `bundle install`

## Current Configuration

Your project is configured for Ruby 2.6.10 with:
- Rails 6.1 (compatible with Ruby 2.6)
- SQLite3 1.3.13 (compatible with Ruby 2.6)

Everything will work fine for learning!

