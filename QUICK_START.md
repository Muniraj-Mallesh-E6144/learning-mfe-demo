# Quick Start Guide - Ruby Version Fix

## ⚠️ Your Current Situation

You have **Ruby 2.6.10**, which is too old for this project. Modern Rails requires Ruby 2.7+.

## 🎯 Best Solution: Install Ruby 3.1

### Option 1: Using Homebrew + rbenv (Recommended)

```bash
# Install rbenv (Ruby version manager)
brew install rbenv ruby-build

# Add rbenv to your shell
echo 'eval "$(rbenv init - zsh)"' >> ~/.zshrc
source ~/.zshrc

# Install Ruby 3.1.0
rbenv install 3.1.0

# Set it for this project
cd /Users/mmallesh/Documents/Repos/learning-mfe-demo/backend
rbenv local 3.1.0

# Verify
ruby -v
# Should show: ruby 3.1.0
```

### Option 2: Using Homebrew Directly

```bash
# Install Ruby 3.1 directly
brew install ruby@3.1

# Add to PATH
echo 'export PATH="/usr/local/opt/ruby@3.1/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Verify
ruby -v
```

## ✅ After Installing Ruby 3.1

### 1. Update Gemfile
```bash
cd /Users/mmallesh/Documents/Repos/learning-mfe-demo/backend

# The Gemfile will work with Ruby 3.1 automatically
# Or manually update it to:
```

Edit `backend/Gemfile`:
```ruby
source 'https://rubygems.org'

ruby '3.1.0'

gem 'rails', '~> 7.0.0'
gem 'sqlite3', '~> 1.4'
# ... rest of the file
```

### 2. Run Setup

```bash
# Remove old gems
rm -rf vendor/bundle

# Install with new Ruby version
bundle install

# Setup database
rails db:create db:migrate db:seed

# Start server (Terminal 1)
rails server -p 3000
```

### 3. Setup Frontend

```bash
# Terminal 2 - Ember
cd /Users/mmallesh/Documents/Repos/learning-mfe-demo/ember-host
pnpm install
pnpm start

# Terminal 3 - React MFE
cd /Users/mmallesh/Documents/Repos/learning-mfe-demo/react-mfe
pnpm install
pnpm dev
```

### 4. Open Browser

```
http://localhost:4200
```

## 🚀 Why Upgrade Ruby?

- **Ruby 2.6** is end-of-life (no security updates)
- **Rails 7** requires Ruby 2.7+
- **Modern gems** require Ruby 2.7+
- **Better performance** and features in Ruby 3.1

## ⏱️ How Long Does This Take?

- Installing rbenv: 2 minutes
- Installing Ruby 3.1: 5-10 minutes
- Setting up project: 5 minutes
- **Total: ~15-20 minutes**

## 🆘 Need Help?

If you can't upgrade Ruby right now, you have alternatives:

### Alternative 1: Focus on Frontend Only

The frontend (Ember + React) doesn't need Ruby. You can:
1. Skip the backend for now
2. Use mock data in the frontend
3. Focus on learning the MFE integration patterns

### Alternative 2: Use Docker

```bash
# Coming soon - Docker setup that handles Ruby for you
```

## 📞 Installation Help

### Check Your Current Ruby

```bash
ruby -v
which ruby
```

### Check if rbenv is installed

```bash
rbenv --version
```

### If rbenv install fails

```bash
# On macOS, you might need Xcode Command Line Tools
xcode-select --install
```

## ✅ Success Checklist

- [ ] Ruby 3.1.0 installed
- [ ] Gems installed (`bundle install` works)
- [ ] Database created (`rails db:create`)
- [ ] Migrations ran (`rails db:migrate`)
- [ ] Seed data loaded (`rails db:seed`)
- [ ] Server starts (`rails server -p 3000`)
- [ ] Can access http://localhost:3000/api/v1/users

## 🎓 Learning Note

Dealing with Ruby versions is a **real-world skill**! In production:
- Teams use version managers (rbenv, rvm)
- Projects specify Ruby versions
- CI/CD enforces version requirements
- Docker containers standardize environments

This is valuable learning!

---

**Ready?** Start with: `brew install rbenv ruby-build`

