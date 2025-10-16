# ⚡ Quick Git Commands - Copy & Paste Ready

## 🚀 Initialize & Push (5 Minutes)

### **Step 1: Initialize Git**
```bash
cd /Users/mmallesh/Documents/Repos/learning-mfe-demo
git init
```

### **Step 2: Configure Git** (Skip if already configured)
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### **Step 3: Stage All Files**
```bash
git add .
git status
```

### **Step 4: Create Initial Commit**
```bash
git commit -m "Initial commit: Microfrontend learning demo with production patterns

Features:
- Ember host with Octane patterns
- React microfrontend with Module Federation  
- MessageChannel bi-directional communication
- Production renderComponent pattern
- 40,000+ words of documentation
- Mock data fallback for frontend-only mode
- Based on real Freshservice architecture

Tech Stack:
- Ember.js 5.x, React 18.x, TypeScript
- Vite, Module Federation, Rails 6.1"
```

### **Step 5: Create GitHub Repository**

**Go to**: https://github.com/new

**Settings**:
- Name: `learning-mfe-demo`
- Description: `Microfrontend learning demo - Ember + React with Module Federation and production patterns`
- Visibility: ✅ **Public** (recommended for portfolio)
- ❌ **DO NOT** check "Add README" (we have one)

**Click**: "Create repository"

### **Step 6: Connect & Push**
Replace `YOUR_USERNAME` with your GitHub username:

```bash
git remote add origin https://github.com/YOUR_USERNAME/learning-mfe-demo.git
git branch -M main
git push -u origin main
```

---

## ✅ Verify Success

Visit: `https://github.com/YOUR_USERNAME/learning-mfe-demo`

You should see:
- ✅ All files uploaded
- ✅ Documentation visible
- ✅ README rendered on main page

---

## 📝 Future Updates

```bash
# Make changes to files

# Stage changes
git add .

# Commit
git commit -m "Description of changes"

# Push
git push
```

---

## 🏷️ Add Topics (After Pushing)

On GitHub, go to **Settings** → **Topics** and add:
```
microfrontends module-federation ember react typescript
vite architecture learning freshservice message-channel
frontend interview-prep
```

---

## 🎯 Quick Reference

```bash
# Check status
git status

# View changes
git diff

# View commit history
git log --oneline --graph --all

# Undo changes (before commit)
git checkout -- file.js

# Update from GitHub
git pull

# Create new branch
git checkout -b feature-name

# Switch branches
git checkout main
```

---

**🎉 Done! Your repository is live on GitHub!**

