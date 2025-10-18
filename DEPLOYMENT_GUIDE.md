# Deployment Guide - Service Provider Search

> Complete guide for deploying frontend and backend to production

## 📋 Table of Contents

- [Deployment Options Overview](#deployment-options-overview)
- [Option 1: Render.com (Easiest, Free)](#option-1-rendercom-easiest-free)
- [Option 2: Railway + Netlify](#option-2-railway--netlify)
- [Option 3: Single Server (DigitalOcean/AWS)](#option-3-single-server-digitaloceanaws)
- [Option 4: Fly.io (Both Services)](#option-4-flyio-both-services)
- [Option 5: Cloudflare Pages + Railway](#option-5-cloudflare-pages--railway)
- [Environment Variables Reference](#environment-variables-reference)
- [Post-Deployment Checklist](#post-deployment-checklist)
- [Monitoring and Maintenance](#monitoring-and-maintenance)

---

## 🎯 Deployment Options Overview

| Option | Frontend | Backend | Database | Cost | Difficulty | Best For |
|--------|----------|---------|----------|------|------------|----------|
| **Render.com** | Static Site | Web Service | PostgreSQL | Free tier available | ⭐ Easy | Beginners, MVPs |
| **Railway + Netlify** | Netlify | Railway | Railway PG | $5-10/mo | ⭐⭐ Easy | Production apps |
| **Single Server** | Nginx | Node.js | PostgreSQL | $5-10/mo | ⭐⭐⭐ Medium | Full control |
| **Fly.io** | Static | Web Service | Fly PG | Free tier | ⭐⭐ Easy | Global apps |
| **CF Pages + Railway** | CF Pages | Railway | Railway PG | $5-10/mo | ⭐⭐ Easy | High traffic |

### Recommendation by Use Case

- **Just testing/learning**: Render.com (completely free)
- **Small production app**: Railway + Netlify
- **Need full control**: Single Server (DigitalOcean)
- **Global audience**: Fly.io or Cloudflare Pages
- **High traffic**: Cloudflare Pages + Railway

---

## Option 1: Render.com (Easiest, Free)

> **Best for**: Beginners, MVPs, testing  
> **Cost**: Free tier available (services sleep after 15min inactivity)  
> **Time**: 15-20 minutes

### Prerequisites

- GitHub account
- Both repositories pushed to GitHub

### Step 1: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Authorize Render to access your repositories

### Step 2: Deploy PostgreSQL Database

1. **Dashboard** → **New** → **PostgreSQL**
2. Configure:
   - **Name**: `service-provider-db`
   - **Database**: `service_provider_db`
   - **User**: `apiuser`
   - **Region**: Choose closest to your users
   - **Plan**: Free
3. Click **Create Database**
4. Wait 2-3 minutes for provisioning
5. **Copy the Internal Database URL** (starts with `postgres://`)

### Step 3: Deploy Backend API

1. **Dashboard** → **New** → **Web Service**
2. Connect your GitHub repository: `service-provider-search-api`
3. Configure:
   - **Name**: `service-provider-api`
   - **Region**: Same as database
   - **Branch**: `main` (or `master`)
   - **Root Directory**: Leave empty
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Plan**: Free

4. **Environment Variables** (click "Advanced"):

```bash
NODE_ENV=production
DATABASE_TYPE=postgres
DATABASE_HOST=<from internal DB URL>
DATABASE_PORT=5432
DATABASE_USERNAME=<from internal DB URL>
DATABASE_PASSWORD=<from internal DB URL>
DATABASE_NAME=service_provider_db
DATABASE_SYNCHRONIZE=false
DATABASE_SSL_ENABLED=true
DATABASE_REJECT_UNAUTHORIZED=false

API_PREFIX=api/v1
APP_FALLBACK_LANGUAGE=en
APP_HEADER_LANGUAGE=x-custom-lang

AUTH_JWT_SECRET=<generate random 32-char string>
AUTH_JWT_TOKEN_EXPIRES_IN=15m
AUTH_REFRESH_SECRET=<generate random 32-char string>
AUTH_REFRESH_TOKEN_EXPIRES_IN=3650d

BACKEND_DOMAIN=https://service-provider-api.onrender.com
FRONTEND_DOMAIN=https://service-provider-frontend.onrender.com

FILE_DRIVER=local
MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_DEFAULT_EMAIL=noreply@example.com
MAIL_DEFAULT_NAME=ServiceProvider
```

**Generate secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

5. Click **Create Web Service**
6. Wait 5-10 minutes for build and deployment
7. **Copy your API URL**: `https://service-provider-api.onrender.com`

### Step 4: Run Database Migrations

1. Go to your backend service on Render
2. Click **Shell** (top right)
3. Run:
```bash
npm run migration:run
npm run seed:run:relational
```

### Step 5: Deploy Frontend

1. **Dashboard** → **New** → **Static Site**
2. Connect your GitHub repository: `service-provider-frontend`
3. Configure:
   - **Name**: `service-provider-frontend`
   - **Branch**: `master` (or `main`)
   - **Root Directory**: Leave empty
   - **Build Command**: `cd client && npm install && npm run build`
   - **Publish Directory**: `client/dist`

4. **Environment Variables**:
```bash
VITE_API_URL=https://service-provider-api.onrender.com/api/v1
```

5. Click **Create Static Site**
6. Wait 3-5 minutes for deployment

### Step 6: Update Backend CORS

1. Go back to backend service
2. Update `FRONTEND_DOMAIN` environment variable:
```bash
FRONTEND_DOMAIN=https://service-provider-frontend.onrender.com
```
3. Service will auto-redeploy

### Step 7: Test Deployment

1. Open: `https://service-provider-frontend.onrender.com`
2. Test search functionality
3. Login to admin: `admin@example.com` / `secret`
4. Upload Excel file

### ⚠️ Free Tier Limitations

- Services sleep after 15 minutes of inactivity
- First request after sleep takes ~30 seconds to wake up
- 750 hours/month per service (enough for 1 service 24/7)

### 💰 Upgrade to Paid (Optional)

- **Starter Plan**: $7/month per service
- Always-on (no sleeping)
- More resources
- Custom domains

---

## Option 2: Railway + Netlify

> **Best for**: Production apps, better performance  
> **Cost**: ~$10/month  
> **Time**: 15-20 minutes

### Step 1: Deploy Backend to Railway

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. **New Project** → **Deploy from GitHub repo**
4. Select `service-provider-search-api`
5. Railway auto-detects NestJS

6. **Add PostgreSQL**:
   - Click **New** → **Database** → **Add PostgreSQL**
   - Railway automatically creates `DATABASE_URL`

7. **Add Environment Variables**:
```bash
NODE_ENV=production
DATABASE_TYPE=postgres
# DATABASE_URL is auto-provided by Railway

API_PREFIX=api/v1
AUTH_JWT_SECRET=<generate>
AUTH_JWT_TOKEN_EXPIRES_IN=15m
AUTH_REFRESH_SECRET=<generate>
AUTH_REFRESH_TOKEN_EXPIRES_IN=3650d

BACKEND_DOMAIN=${{RAILWAY_PUBLIC_DOMAIN}}
FRONTEND_DOMAIN=https://your-app.netlify.app

FILE_DRIVER=local
```

8. **Settings** → **Generate Domain**
9. Copy your Railway URL: `https://your-app.up.railway.app`

10. **Run migrations**:
    - Click **Service** → **Shell**
    ```bash
    npm run migration:run
    npm run seed:run:relational
    ```

### Step 2: Deploy Frontend to Netlify

1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub
3. **Add new site** → **Import from Git**
4. Select `service-provider-frontend`
5. Configure:
   - **Build command**: `cd client && npm install && npm run build`
   - **Publish directory**: `client/dist`
   - **Environment variables**:
     ```bash
     VITE_API_URL=https://your-app.up.railway.app/api/v1
     ```

6. Click **Deploy site**
7. Copy your Netlify URL: `https://your-app.netlify.app`

8. **Update Railway backend**:
   - Go back to Railway
   - Update `FRONTEND_DOMAIN` to your Netlify URL
   - Service auto-redeploys

### Custom Domains (Optional)

**Netlify:**
1. Domain settings → Add custom domain
2. Update DNS records with your provider

**Railway:**
1. Settings → Custom Domain
2. Add CNAME record to your DNS

---

## Option 3: Single Server (DigitalOcean/AWS)

> **Best for**: Full control, production apps  
> **Cost**: $6-12/month  
> **Time**: 45-60 minutes

### Prerequisites

- VPS (DigitalOcean Droplet, AWS EC2, Linode, etc.)
- Ubuntu 22.04 LTS
- Root or sudo access
- Domain name (optional but recommended)

### Step 1: Initial Server Setup

```bash
# SSH into your server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Create non-root user
adduser deploy
usermod -aG sudo deploy
su - deploy
```

### Step 2: Install Dependencies

```bash
# Install Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
sudo npm install -g pnpm

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Git
sudo apt install -y git
```

### Step 3: Setup PostgreSQL

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE service_provider_db;
CREATE USER apiuser WITH PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE service_provider_db TO apiuser;
\c service_provider_db
CREATE EXTENSION pg_trgm;
\q
```

### Step 4: Deploy Backend

```bash
# Create app directory
sudo mkdir -p /var/www
sudo chown deploy:deploy /var/www
cd /var/www

# Clone repository
git clone https://github.com/aihassan1/service-provider-search-api.git
cd service-provider-search-api

# Install dependencies
npm install

# Create .env file
nano .env
```

**Add to .env:**
```bash
NODE_ENV=production
DATABASE_TYPE=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=apiuser
DATABASE_PASSWORD=secure_password_here
DATABASE_NAME=service_provider_db
DATABASE_SYNCHRONIZE=false

API_PREFIX=api/v1
AUTH_JWT_SECRET=<generate>
AUTH_JWT_TOKEN_EXPIRES_IN=15m
AUTH_REFRESH_SECRET=<generate>
AUTH_REFRESH_TOKEN_EXPIRES_IN=3650d

BACKEND_DOMAIN=https://api.yourdomain.com
FRONTEND_DOMAIN=https://yourdomain.com

FILE_DRIVER=local
```

```bash
# Run migrations
npm run migration:run
npm run seed:run:relational

# Build application
npm run build

# Start with PM2
pm2 start dist/main.js --name api
pm2 save
pm2 startup
```

### Step 5: Deploy Frontend

```bash
cd /var/www
git clone https://github.com/aihassan1/service-provider-frontend.git
cd service-provider-frontend

# Create .env.local
echo "VITE_API_URL=https://api.yourdomain.com/api/v1" > .env.local

# Install and build
pnpm install
cd client && pnpm build
```

### Step 6: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/service-provider
```

**Add this configuration:**
```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/service-provider-frontend/client/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/service-provider /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 7: Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificates
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# Auto-renewal is configured automatically
# Test renewal:
sudo certbot renew --dry-run
```

### Step 8: Setup Firewall

```bash
# Configure UFW
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### Step 9: Setup Automatic Deployments (Optional)

```bash
# Create deployment script
nano /var/www/deploy.sh
```

**Add:**
```bash
#!/bin/bash

# Backend
cd /var/www/service-provider-search-api
git pull origin main
npm install
npm run build
pm2 restart api

# Frontend
cd /var/www/service-provider-frontend
git pull origin master
pnpm install
cd client && pnpm build

echo "Deployment complete!"
```

```bash
chmod +x /var/www/deploy.sh

# Deploy with:
/var/www/deploy.sh
```

---

## Option 4: Fly.io (Both Services)

> **Best for**: Global distribution, low latency  
> **Cost**: Free tier available  
> **Time**: 20-30 minutes

### Step 1: Install Fly CLI

```bash
# macOS/Linux
curl -L https://fly.io/install.sh | sh

# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex

# Verify
fly version
```

### Step 2: Login and Setup

```bash
# Login
fly auth login

# Create organization (if first time)
fly orgs create personal
```

### Step 3: Deploy Backend

```bash
cd service-provider-search-api

# Initialize Fly app
fly launch --name service-provider-api --region lhr --no-deploy

# Create PostgreSQL
fly postgres create --name service-provider-db --region lhr

# Attach database to app
fly postgres attach service-provider-db -a service-provider-api

# Set environment variables
fly secrets set \
  NODE_ENV=production \
  API_PREFIX=api/v1 \
  AUTH_JWT_SECRET=$(openssl rand -hex 32) \
  AUTH_JWT_TOKEN_EXPIRES_IN=15m \
  AUTH_REFRESH_SECRET=$(openssl rand -hex 32) \
  AUTH_REFRESH_TOKEN_EXPIRES_IN=3650d \
  FILE_DRIVER=local

# Deploy
fly deploy

# Run migrations
fly ssh console -a service-provider-api
npm run migration:run
npm run seed:run:relational
exit

# Get URL
fly info
```

### Step 4: Deploy Frontend

```bash
cd service-provider-frontend

# Create fly.toml
cat > fly.toml << 'EOF'
app = "service-provider-frontend"
primary_region = "lhr"

[build]
  [build.args]
    VITE_API_URL = "https://service-provider-api.fly.dev/api/v1"

[env]
  PORT = "8080"

[[services]]
  http_checks = []
  internal_port = 8080
  processes = ["app"]
  protocol = "tcp"

  [[services.ports]]
    force_https = true
    handlers = ["http"]
    port = 80

  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443
EOF

# Create Dockerfile for frontend
cat > Dockerfile << 'EOF'
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY client/package*.json ./client/
RUN npm install
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN cd client && npm run build

FROM nginx:alpine
COPY --from=builder /app/client/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
EOF

# Create nginx.conf
cat > nginx.conf << 'EOF'
server {
    listen 8080;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

# Deploy
fly launch --name service-provider-frontend --no-deploy
fly deploy
```

---

## Option 5: Cloudflare Pages + Railway

> **Best for**: High traffic, global CDN  
> **Cost**: ~$5-10/month  
> **Time**: 15-20 minutes

### Step 1: Deploy Backend to Railway

Follow [Option 2: Railway + Netlify](#option-2-railway--netlify) - Step 1

### Step 2: Deploy Frontend to Cloudflare Pages

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. **Workers & Pages** → **Create application** → **Pages**
3. **Connect to Git** → Select `service-provider-frontend`
4. Configure:
   - **Build command**: `cd client && npm install && npm run build`
   - **Build output directory**: `client/dist`
   - **Environment variables**:
     ```bash
     VITE_API_URL=https://your-app.up.railway.app/api/v1
     NODE_VERSION=22
     ```

5. Click **Save and Deploy**
6. Your site will be available at: `https://service-provider-frontend.pages.dev`

### Custom Domain

1. **Custom domains** → **Set up a custom domain**
2. Follow DNS instructions
3. SSL is automatic

---

## 🔐 Environment Variables Reference

### Backend (.env)

```bash
# Required
NODE_ENV=production
DATABASE_TYPE=postgres
DATABASE_HOST=<your-db-host>
DATABASE_PORT=5432
DATABASE_USERNAME=<your-db-user>
DATABASE_PASSWORD=<your-db-password>
DATABASE_NAME=service_provider_db
DATABASE_SYNCHRONIZE=false

API_PREFIX=api/v1
AUTH_JWT_SECRET=<32-char-random-string>
AUTH_JWT_TOKEN_EXPIRES_IN=15m
AUTH_REFRESH_SECRET=<32-char-random-string>
AUTH_REFRESH_TOKEN_EXPIRES_IN=3650d

BACKEND_DOMAIN=<your-backend-url>
FRONTEND_DOMAIN=<your-frontend-url>

# Optional
DATABASE_SSL_ENABLED=true
DATABASE_REJECT_UNAUTHORIZED=false
FILE_DRIVER=local
MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_DEFAULT_EMAIL=noreply@example.com
```

### Frontend (.env or platform settings)

```bash
# Required
VITE_API_URL=<your-backend-url>/api/v1
```

---

## ✅ Post-Deployment Checklist

### Immediately After Deployment

- [ ] Backend health check: `curl https://your-api.com/`
- [ ] Frontend loads: Open `https://your-frontend.com`
- [ ] Search works: Try searching for providers
- [ ] Filters work: Test province/city/specialization filters
- [ ] Admin login works: `admin@example.com` / `secret`
- [ ] Create provider works
- [ ] Update provider works
- [ ] Delete provider works
- [ ] Excel upload works

### Security

- [ ] Change default admin password
- [ ] Rotate JWT secrets
- [ ] Enable HTTPS (SSL)
- [ ] Configure CORS properly
- [ ] Set secure database password
- [ ] Enable firewall (if using VPS)
- [ ] Setup database backups
- [ ] Review environment variables

### Performance

- [ ] Enable gzip compression
- [ ] Configure caching headers
- [ ] Setup CDN (if needed)
- [ ] Monitor response times
- [ ] Check database query performance

### Monitoring

- [ ] Setup error tracking (Sentry, Rollbar)
- [ ] Configure uptime monitoring (UptimeRobot, Pingdom)
- [ ] Setup log aggregation
- [ ] Configure alerts
- [ ] Monitor database size

---

## 📊 Monitoring and Maintenance

### Uptime Monitoring

**Free Options:**
- [UptimeRobot](https://uptimerobot.com) - Free for 50 monitors
- [Freshping](https://www.freshworks.com/website-monitoring/) - Free unlimited checks

**Setup:**
1. Create account
2. Add monitor for: `https://your-api.com/api/v1/providers/statistics`
3. Add monitor for: `https://your-frontend.com`
4. Configure email/SMS alerts

### Error Tracking

**Sentry (Recommended):**

```bash
# Backend
npm install @sentry/node

# Add to main.ts:
import * as Sentry from '@sentry/node';
Sentry.init({ dsn: 'your-sentry-dsn' });
```

```bash
# Frontend
pnpm add @sentry/react

# Add to main.tsx:
import * as Sentry from '@sentry/react';
Sentry.init({ dsn: 'your-sentry-dsn' });
```

### Database Backups

**Automated Backups:**

```bash
# Create backup script
nano /home/deploy/backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/home/deploy/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

pg_dump -U apiuser -h localhost service_provider_db > $BACKUP_DIR/backup_$DATE.sql
gzip $BACKUP_DIR/backup_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
```

```bash
chmod +x /home/deploy/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
0 2 * * * /home/deploy/backup-db.sh
```

### Log Management

**PM2 Logs (if using PM2):**
```bash
pm2 logs api
pm2 logs api --lines 100
pm2 logs api --err
```

**Nginx Logs:**
```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Performance Monitoring

**Free Options:**
- [New Relic](https://newrelic.com) - Free tier available
- [Datadog](https://www.datadoghq.com) - Free tier available

---

## 🔄 Updating Your Deployment

### Render.com

- Push to GitHub → Auto-deploys
- Or: Dashboard → Manual Deploy → Deploy latest commit

### Railway

- Push to GitHub → Auto-deploys
- Or: Dashboard → Deployments → Redeploy

### Netlify/Cloudflare Pages

- Push to GitHub → Auto-deploys
- Or: Dashboard → Trigger deploy

### Single Server

```bash
ssh deploy@your-server
/var/www/deploy.sh
```

---

## 💰 Cost Comparison

| Platform | Backend | Database | Frontend | Total/Month |
|----------|---------|----------|----------|-------------|
| **Render Free** | Free | Free | Free | $0 |
| **Render Paid** | $7 | $7 | Free | $14 |
| **Railway** | $5 | $5 | - | $10 |
| **Railway + Netlify** | $5 | $5 | Free | $10 |
| **DigitalOcean** | $6 | Included | Included | $6 |
| **Fly.io** | Free | Free | Free | $0 |
| **AWS Lightsail** | $5 | Included | Included | $5 |

---

## 🆘 Troubleshooting Deployment

### "Build failed"

- Check build logs
- Verify Node.js version
- Check package.json scripts
- Ensure all dependencies are in package.json

### "Database connection failed"

- Verify DATABASE_URL format
- Check database is running
- Verify SSL settings
- Check firewall rules

### "CORS errors"

- Update FRONTEND_DOMAIN in backend
- Check BACKEND_DOMAIN matches actual URL
- Verify API_PREFIX is correct

### "502 Bad Gateway"

- Check backend is running
- Verify port configuration
- Check Nginx/proxy settings
- Review backend logs

---

**Last Updated**: October 2025  
**Tested Platforms**: Render, Railway, Netlify, DigitalOcean, Fly.io, Cloudflare Pages

