# 👋 README FIRST

## You Have Ruby 2.6 - Need to Upgrade!

Your system has Ruby 2.6.10, which is too old for this project.

### ⚡ Quick Fix (15 minutes)

```bash
# Install rbenv (Ruby version manager)
brew install rbenv ruby-build

# Add to shell
echo 'eval "$(rbenv init - zsh)"' >> ~/.zshrc
source ~/.zshrc

# Install Ruby 3.1
rbenv install 3.1.0

# Set for this project
cd backend
rbenv local 3.1.0
ruby -v  # Should show 3.1.0

# Now run setup
bundle install
rails db:create db:migrate db:seed
rails server -p 3000
```

### 📖 Full Instructions

See **[QUICK_START.md](QUICK_START.md)** for detailed steps and alternatives.

### ⚠️ Why Can't I Use Ruby 2.6?

- Ruby 2.6 is end-of-life (no security updates)
- Rails 7 requires Ruby 2.7+
- Modern gems don't support Ruby 2.6
- You'll learn modern Ruby version management!

### 🎯 After Upgrading

1. Backend will work perfectly
2. Follow the main [README.md](README.md)
3. Complete the learning project
4. Master microfrontend architecture!

---

**Start here**: [QUICK_START.md](QUICK_START.md)

