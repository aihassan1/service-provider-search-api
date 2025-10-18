# Local Setup Guide - Service Provider Search

> Complete guide to run both frontend and backend locally on your machine

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Running Both Together](#running-both-together)
- [Testing the Application](#testing-the-application)
- [Troubleshooting](#troubleshooting)
- [Common Commands](#common-commands)

---

## 🔧 Prerequisites

### Required Software

Install the following before starting:

#### 1. **Node.js** (v18 or v22)

```bash
# Check if installed
node --version

# If not installed, download from:
# https://nodejs.org/

# Or use nvm (recommended):
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 22
nvm use 22
```

#### 2. **pnpm** (Package Manager)

```bash
# Install pnpm globally
npm install -g pnpm

# Verify installation
pnpm --version
```

#### 3. **PostgreSQL** (v14 or higher)

**On macOS:**
```bash
# Using Homebrew
brew install postgresql@14
brew services start postgresql@14
```

**On Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**On Windows:**
- Download from: https://www.postgresql.org/download/windows/
- Run installer and follow instructions
- Make sure PostgreSQL service is running

#### 4. **Git**

```bash
# Check if installed
git --version

# If not installed:
# macOS: brew install git
# Ubuntu: sudo apt install git
# Windows: https://git-scm.com/download/win
```

---

## 🗄️ Backend Setup

### Step 1: Clone Backend Repository

```bash
# Clone the repository
git clone https://github.com/aihassan1/service-provider-search-api.git
cd service-provider-search-api
```

### Step 2: Install Dependencies

```bash
# Install all Node.js packages
npm install

# This will take 2-3 minutes
```

### Step 3: Setup PostgreSQL Database

#### Create Database and User

```bash
# Access PostgreSQL
sudo -u postgres psql

# Or on macOS/Windows:
psql postgres
```

#### Run these SQL commands:

```sql
-- Create database
CREATE DATABASE service_provider_db;

-- Create user
CREATE USER apiuser WITH PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE service_provider_db TO apiuser;

-- Connect to database
\c service_provider_db

-- Enable pg_trgm extension for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Exit
\q
```

### Step 4: Configure Environment Variables

```bash
# Copy example env file
cp env-example .env

# Edit .env file
nano .env
# Or use your preferred editor: code .env, vim .env, etc.
```

#### Update these values in `.env`:

```bash
# Node Environment
NODE_ENV=development

# Database Configuration
DATABASE_TYPE=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=apiuser
DATABASE_PASSWORD=your_secure_password
DATABASE_NAME=service_provider_db
DATABASE_SYNCHRONIZE=false
DATABASE_MAX_CONNECTIONS=100
DATABASE_SSL_ENABLED=false
DATABASE_REJECT_UNAUTHORIZED=false
DATABASE_CA=
DATABASE_KEY=
DATABASE_CERT=

# API Configuration
API_PREFIX=api/v1
APP_FALLBACK_LANGUAGE=en
APP_HEADER_LANGUAGE=x-custom-lang

# Authentication
AUTH_JWT_SECRET=your_random_secret_key_here_change_this
AUTH_JWT_TOKEN_EXPIRES_IN=15m
AUTH_REFRESH_SECRET=your_refresh_secret_key_here_change_this
AUTH_REFRESH_TOKEN_EXPIRES_IN=3650d

# Backend URL
BACKEND_DOMAIN=http://localhost:3000

# Frontend URL (for CORS)
FRONTEND_DOMAIN=http://localhost:3001

# File Upload (optional - can leave as is)
FILE_DRIVER=local
ACCESS_KEY_ID=
SECRET_ACCESS_KEY=
AWS_S3_REGION=
AWS_DEFAULT_S3_BUCKET=

# Mail Configuration (optional - not needed for basic functionality)
MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_USER=
MAIL_PASSWORD=
MAIL_IGNORE_TLS=true
MAIL_SECURE=false
MAIL_REQUIRE_TLS=false
MAIL_DEFAULT_EMAIL=noreply@example.com
MAIL_DEFAULT_NAME=Api
MAIL_CLIENT_PORT=1080

# Worker Configuration
WORKER_HOST=redis://localhost:6379/1
```

#### Generate Secure Secrets:

```bash
# Generate random secrets for JWT
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy output and paste as AUTH_JWT_SECRET

node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy output and paste as AUTH_REFRESH_SECRET
```

### Step 5: Run Database Migrations

```bash
# Run migrations to create tables
npm run migration:run

# Seed initial data (creates admin user)
npm run seed:run:relational
```

**Default Admin Credentials:**
- Email: `admin@example.com`
- Password: `secret`

### Step 6: Start Backend Server

```bash
# Start in development mode (with hot reload)
npm run start:dev

# You should see:
# [Nest] INFO [NestApplication] Nest application successfully started
# Server running on http://localhost:3000
```

### Step 7: Verify Backend is Running

Open a new terminal and test:

```bash
# Test health endpoint
curl http://localhost:3000/

# Test API endpoint
curl http://localhost:3000/api/v1/providers/statistics

# You should see JSON response with provider statistics
```

---

## 💻 Frontend Setup

### Step 1: Clone Frontend Repository

```bash
# Open a NEW terminal window/tab
# Navigate to your projects folder
cd ~/projects  # or wherever you keep projects

# Clone the repository
git clone https://github.com/aihassan1/service-provider-frontend.git
cd service-provider-frontend
```

### Step 2: Install Dependencies

```bash
# Install all packages
pnpm install

# This will take 2-3 minutes
```

### Step 3: Configure Environment Variables

```bash
# Create .env.local file
nano .env.local
# Or: code .env.local, vim .env.local, etc.
```

#### Add this content:

```bash
# Backend API URL
VITE_API_URL=http://localhost:3000/api/v1
```

### Step 4: Start Frontend Server

```bash
# Start development server
pnpm dev

# You should see:
# VITE v7.x.x  ready in xxx ms
# ➜  Local:   http://localhost:3001/
# ➜  Network: http://192.168.x.x:3001/
```

### Step 5: Open in Browser

```bash
# Open your browser and navigate to:
http://localhost:3001

# You should see the Service Provider Search homepage
```

---

## 🚀 Running Both Together

### Option 1: Using Two Terminal Windows

**Terminal 1 - Backend:**
```bash
cd service-provider-search-api
npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd service-provider-frontend
pnpm dev
```

### Option 2: Using tmux (Linux/macOS)

```bash
# Install tmux if not installed
# macOS: brew install tmux
# Ubuntu: sudo apt install tmux

# Start tmux session
tmux new -s dev

# Split window horizontally
Ctrl+b then "

# In top pane (backend):
cd service-provider-search-api
npm run start:dev

# Switch to bottom pane
Ctrl+b then ↓

# In bottom pane (frontend):
cd service-provider-frontend
pnpm dev

# Detach from session: Ctrl+b then d
# Reattach: tmux attach -t dev
```

### Option 3: Using VS Code

1. Open VS Code
2. Open both projects in workspace:
   - File → Add Folder to Workspace → Select `service-provider-search-api`
   - File → Add Folder to Workspace → Select `service-provider-frontend`
3. Open integrated terminal (Ctrl+`)
4. Split terminal (Ctrl+Shift+5)
5. In left terminal: `cd service-provider-search-api && npm run start:dev`
6. In right terminal: `cd service-provider-frontend && pnpm dev`

### Option 4: Using npm-run-all (Advanced)

Create a parent folder and use concurrently:

```bash
# Create parent folder
mkdir service-provider-app
cd service-provider-app

# Clone both repos
git clone https://github.com/aihassan1/service-provider-search-api.git backend
git clone https://github.com/aihassan1/service-provider-frontend.git frontend

# Create package.json in parent folder
cat > package.json << 'EOF'
{
  "name": "service-provider-app",
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "cd backend && npm run start:dev",
    "dev:frontend": "cd frontend && pnpm dev"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
EOF

# Install concurrently
npm install

# Run both with one command
npm run dev
```

---

## 🧪 Testing the Application

### 1. Test Backend API

```bash
# Get statistics
curl http://localhost:3000/api/v1/providers/statistics

# Search providers
curl "http://localhost:3000/api/v1/providers/search?q=جراحة&limit=5"

# Get filters
curl http://localhost:3000/api/v1/providers/filters

# Login as admin
curl -X POST http://localhost:3000/api/v1/auth/email/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"secret"}'
```

### 2. Test Frontend

Open browser to `http://localhost:3001` and test:

**Public Features:**
- [ ] Homepage loads with search interface
- [ ] Search for "جراحة" returns results
- [ ] Filter by province (e.g., "القاهرة")
- [ ] Filter by specialization (e.g., "أطفال")
- [ ] Pagination works (Next/Previous)
- [ ] Click on provider to see details

**Admin Features:**
- [ ] Navigate to `http://localhost:3001/login`
- [ ] Login with `admin@example.com` / `secret`
- [ ] Redirects to admin dashboard
- [ ] View statistics tab
- [ ] View providers list tab
- [ ] Create new provider
- [ ] Edit existing provider
- [ ] Delete provider
- [ ] Upload Excel file (use sample file)

### 3. Import Sample Data

If you want to test with the original 4,346 providers:

```bash
# Download the sample Excel file
# (You should have nextcareexcelsheet.xlsx)

# Open frontend at http://localhost:3001/login
# Login as admin
# Go to "Upload" tab
# Select the Excel file
# Click "Upload File"
# Wait for import to complete
```

---

## 🔧 Troubleshooting

### Backend Issues

#### Issue: "Cannot connect to database"

**Solution:**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list  # macOS

# Start PostgreSQL if stopped
sudo systemctl start postgresql  # Linux
brew services start postgresql@14  # macOS

# Verify database exists
psql -U apiuser -d service_provider_db -h localhost
# Enter password when prompted
```

#### Issue: "Port 3000 already in use"

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or change port in .env:
# Add: PORT=3001
```

#### Issue: "Migration failed"

**Solution:**
```bash
# Drop and recreate database
sudo -u postgres psql
DROP DATABASE service_provider_db;
CREATE DATABASE service_provider_db;
GRANT ALL PRIVILEGES ON DATABASE service_provider_db TO apiuser;
\c service_provider_db
CREATE EXTENSION IF NOT EXISTS pg_trgm;
\q

# Re-run migrations
npm run migration:run
npm run seed:run:relational
```

#### Issue: "Module not found"

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Frontend Issues

#### Issue: "Network Error" when searching

**Solution:**
```bash
# Check VITE_API_URL in .env.local
cat .env.local
# Should be: VITE_API_URL=http://localhost:3000/api/v1

# Verify backend is running
curl http://localhost:3000/api/v1/providers/statistics

# Check browser console (F12) for CORS errors
# If CORS error, verify FRONTEND_DOMAIN in backend .env
```

#### Issue: "Port 3001 already in use"

**Solution:**
```bash
# Find and kill process
lsof -i :3001  # macOS/Linux
kill -9 <PID>

# Or use different port
pnpm dev --port 3002
# Then update FRONTEND_DOMAIN in backend .env
```

#### Issue: "Module not found" or build errors

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Clear Vite cache
rm -rf node_modules/.vite
```

### Database Issues

#### Issue: "pg_trgm extension not found"

**Solution:**
```bash
# Connect to database
psql -U apiuser -d service_provider_db -h localhost

# Enable extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

# Verify
\dx
# Should show pg_trgm in the list
```

#### Issue: "Authentication failed for user"

**Solution:**
```bash
# Reset user password
sudo -u postgres psql
ALTER USER apiuser WITH PASSWORD 'new_password';
\q

# Update .env with new password
```

---

## 📝 Common Commands

### Backend Commands

```bash
# Development
npm run start:dev          # Start with hot reload
npm run start:debug        # Start with debugger
npm run build              # Build for production
npm run start:prod         # Start production build

# Database
npm run migration:generate -- src/database/migrations/MigrationName
npm run migration:create -- src/database/migrations/MigrationName
npm run migration:run      # Run pending migrations
npm run migration:revert   # Revert last migration
npm run seed:run:relational  # Seed database

# Testing
npm run test               # Run unit tests
npm run test:e2e           # Run e2e tests
npm run lint               # Lint code
npm run format             # Format code
```

### Frontend Commands

```bash
# Development
pnpm dev                   # Start dev server
pnpm build                 # Build for production
pnpm preview               # Preview production build

# Code Quality
pnpm type-check            # Check TypeScript types
pnpm lint                  # Lint code (if configured)

# Dependencies
pnpm install               # Install dependencies
pnpm update                # Update dependencies
pnpm add <package>         # Add new package
```

### PostgreSQL Commands

```bash
# Access database
psql -U apiuser -d service_provider_db -h localhost

# Inside psql:
\l                         # List databases
\c service_provider_db     # Connect to database
\dt                        # List tables
\d service_provider        # Describe table
\dx                        # List extensions
SELECT COUNT(*) FROM service_provider;  # Count records
\q                         # Quit
```

---

## 🎯 Quick Start Summary

**For the impatient - minimal steps:**

```bash
# 1. Setup PostgreSQL
sudo -u postgres psql
CREATE DATABASE service_provider_db;
CREATE USER apiuser WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE service_provider_db TO apiuser;
\c service_provider_db
CREATE EXTENSION pg_trgm;
\q

# 2. Backend
git clone https://github.com/aihassan1/service-provider-search-api.git
cd service-provider-search-api
npm install
cp env-example .env
# Edit .env with database credentials
npm run migration:run
npm run seed:run:relational
npm run start:dev

# 3. Frontend (new terminal)
git clone https://github.com/aihassan1/service-provider-frontend.git
cd service-provider-frontend
pnpm install
echo "VITE_API_URL=http://localhost:3000/api/v1" > .env.local
pnpm dev

# 4. Open browser
# http://localhost:3001
```

---

## 📚 Additional Resources

- **Backend Repository**: https://github.com/aihassan1/service-provider-search-api
- **Frontend Repository**: https://github.com/aihassan1/service-provider-frontend
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **NestJS Docs**: https://docs.nestjs.com/
- **React Docs**: https://react.dev/
- **Vite Docs**: https://vitejs.dev/

---

## 🆘 Getting Help

If you encounter issues not covered here:

1. Check the error message carefully
2. Search GitHub issues in the respective repository
3. Check browser console (F12) for frontend errors
4. Check backend logs in terminal
5. Verify all services are running (PostgreSQL, backend, frontend)
6. Try restarting everything from scratch

---

**Last Updated**: October 2025  
**Tested On**: macOS 14, Ubuntu 22.04, Windows 11

