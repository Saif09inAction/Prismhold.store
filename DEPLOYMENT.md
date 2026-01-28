# 🚀 Complete Deployment Guide for Prism Hold

This guide will walk you through deploying your Prism Hold e-commerce application step by step. **Don't worry if you're new to deployment - this guide is written for beginners!**

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Option 1: Deploy to Railway (Easiest - Recommended)](#option-1-deploy-to-railway-easiest---recommended)
3. [Option 2: Deploy to Render](#option-2-deploy-to-render)
4. [Option 3: Deploy to Heroku](#option-3-deploy-to-heroku)
5. [Option 4: Deploy to DigitalOcean](#option-4-deploy-to-digitalocean)
6. [Post-Deployment Steps](#post-deployment-steps)
7. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

Before deploying, make sure you have:

- ✅ A GitHub account (free)
- ✅ A MongoDB Atlas account (free tier available)
- ✅ A Razorpay account (for payments)
- ✅ Your project code ready

---

## Option 1: Deploy to Railway (Easiest - Recommended)

Railway is the easiest platform for beginners. It's free to start and handles most things automatically.

### Step 1: Create MongoDB Atlas Database

1. **Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)**
   - Sign up for a free account
   - Choose the FREE tier (M0 Sandbox)

2. **Create a Cluster**
   - Click "Build a Database"
   - Choose "M0 FREE" (Free tier)
   - Select a cloud provider and region (choose closest to you)
   - Click "Create"

3. **Set Up Database Access**
   - Go to "Database Access" in the left menu
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create a username and password (SAVE THESE!)
   - Set privileges to "Atlas admin"
   - Click "Add User"

4. **Set Up Network Access**
   - Go to "Network Access" in the left menu
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for now - you can restrict later)
   - Click "Confirm"

5. **Get Your Connection String**
   - Go to "Database" → Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
   - Replace `<password>` with your actual password
   - Replace `<dbname>` with `prismhold` (or any name you want)
   - **SAVE THIS STRING** - You'll need it!

### Step 2: Set Up Razorpay

1. **Go to [Razorpay Dashboard](https://dashboard.razorpay.com)**
   - Sign up or log in

2. **Get Your API Keys**
   - Go to Settings → API Keys
   - For testing: Use "Test Mode" keys
   - For production: Use "Live Mode" keys
   - Copy both:
     - Key ID (starts with `rzp_test_` or `rzp_live_`)
     - Key Secret (long string)
   - **SAVE THESE** - You'll need them!

3. **Set Up Webhook (For Production)**
   - Go to Settings → Webhooks
   - Add webhook URL: `https://your-app-name.railway.app/api/payments/razorpay/webhook`
   - Enable events: `payment.captured`, `payment.failed`, `payment.authorized`
   - Save

### Step 3: Push Code to GitHub

1. **Create a GitHub Repository**
   - Go to [GitHub](https://github.com)
   - Click "+" → "New repository"
   - Name it: `prismhold` (or any name)
   - Make it Public (or Private if you have GitHub Pro)
   - Click "Create repository"

2. **Push Your Code**
   ```bash
   # Open terminal in your project folder
   cd "/Users/saif/Downloads/prismhold v8 3"
   
   # Initialize git (if not already done)
   git init
   
   # Add all files
   git add .
   
   # Commit
   git commit -m "Initial commit"
   
   # Add your GitHub repository (replace YOUR_USERNAME with your GitHub username)
   git remote add origin https://github.com/YOUR_USERNAME/prismhold.git
   
   # Push to GitHub
   git branch -M main
   git push -u origin main
   ```

### Step 4: Deploy to Railway

1. **Go to [Railway](https://railway.app)**
   - Sign up with GitHub (click "Login with GitHub")
   - Authorize Railway

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `prismhold` repository
   - Railway will automatically detect it's a Node.js app

3. **Set Environment Variables**
   - Click on your project
   - Go to "Variables" tab
   - Add these variables one by one:

   ```
   MONGODB_URI=your_mongodb_atlas_connection_string_here
   PORT=3000
   JWT_SECRET=generate_a_random_string_here
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   ```

   **How to generate JWT_SECRET:**
   - Go to: https://www.random.org/strings/
   - Generate a 32-character random string
   - Or run in terminal: `openssl rand -base64 32`

4. **Deploy**
   - Railway will automatically start deploying
   - Wait for "Deploy Successful" message
   - Click on your project → "Settings" → "Generate Domain"
   - Copy your app URL (e.g., `https://prismhold-production.up.railway.app`)

5. **Update Frontend API URL**
   - Go to your GitHub repository
   - Edit `index.html` and `admin.html`
   - Find `API_BASE_URL` (search for it)
   - Change it to your Railway URL:
     ```javascript
     const API_BASE_URL = 'https://your-app-name.railway.app';
     ```
   - Commit and push:
     ```bash
     git add .
     git commit -m "Update API URL for production"
     git push
     ```
   - Railway will automatically redeploy

6. **Create Admin User**
   - SSH into your Railway instance (or use Railway's CLI)
   - Or temporarily add a script to create admin
   - Better: Use Railway's "Deploy Logs" → "Run Command" feature
   - Run: `node create-admin.js` (you'll need to set up environment variables first)

### Step 5: Test Your Deployment

1. Visit your Railway URL
2. Test the homepage
3. Try creating an account
4. Test admin panel: `https://your-url.railway.app/admin`

---

## Option 2: Deploy to Render

Render is another easy platform, similar to Railway.

### Step 1-2: Same as Railway (MongoDB Atlas + Razorpay)

### Step 3: Deploy to Render

1. **Go to [Render](https://render.com)**
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select your `prismhold` repo

3. **Configure Service**
   - Name: `prismhold` (or any name)
   - Region: Choose closest to you
   - Branch: `main`
   - Root Directory: Leave empty
   - Build Command: `npm install`
   - Start Command: `node server.js`

4. **Set Environment Variables**
   - Scroll down to "Environment Variables"
   - Add all the same variables as Railway:
     ```
     MONGODB_URI=your_mongodb_atlas_connection_string
     PORT=3000
     JWT_SECRET=your_random_secret
     RAZORPAY_KEY_ID=your_razorpay_key_id
     RAZORPAY_KEY_SECRET=your_razorpay_key_secret
     ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Your app will be at: `https://prismhold.onrender.com`

6. **Update Frontend**
   - Same as Railway - update `API_BASE_URL` in `index.html` and `admin.html`
   - Push to GitHub (Render auto-deploys)

---

## Option 3: Deploy to Heroku

Heroku is popular but requires a credit card for some features (free tier is limited).

### Step 1-2: Same as Railway (MongoDB Atlas + Razorpay)

### Step 3: Deploy to Heroku

1. **Install Heroku CLI**
   - Download from: https://devcenter.heroku.com/articles/heroku-cli
   - Or: `brew install heroku/brew/heroku` (Mac)

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create Heroku App**
   ```bash
   heroku create prismhold
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set MONGODB_URI="your_mongodb_atlas_connection_string"
   heroku config:set JWT_SECRET="your_random_secret"
   heroku config:set RAZORPAY_KEY_ID="your_razorpay_key_id"
   heroku config:set RAZORPAY_KEY_SECRET="your_razorpay_key_secret"
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

6. **Open Your App**
   ```bash
   heroku open
   ```

7. **Update Frontend**
   - Get your Heroku URL: `https://prismhold.herokuapp.com`
   - Update `API_BASE_URL` in HTML files
   - Push to GitHub

---

## Option 4: Deploy to DigitalOcean

This is more advanced but gives you full control. Good for learning.

### Step 1: Create Droplet

1. **Go to [DigitalOcean](https://www.digitalocean.com)**
   - Sign up (get $200 free credit with referral)

2. **Create Droplet**
   - Click "Create" → "Droplets"
   - Choose Ubuntu 22.04
   - Choose Basic plan ($6/month minimum)
   - Choose a region
   - Add SSH key (or create password)
   - Click "Create Droplet"

### Step 2: Connect to Server

```bash
# Connect via SSH (replace YOUR_IP with your droplet IP)
ssh root@YOUR_IP
```

### Step 3: Install Node.js

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Verify installation
node --version
npm --version
```

### Step 4: Install MongoDB (or use MongoDB Atlas)

**Option A: Use MongoDB Atlas (Recommended - Easier)**
- Just use your MongoDB Atlas connection string

**Option B: Install MongoDB on Server**
```bash
# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt update
apt install -y mongodb-org
systemctl start mongod
systemctl enable mongod
```

### Step 5: Set Up Your App

```bash
# Install Git
apt install -y git

# Clone your repository
cd /var/www
git clone https://github.com/YOUR_USERNAME/prismhold.git
cd prismhold

# Install dependencies
npm install

# Create .env file
nano .env
# Paste your environment variables (same as Railway)
# Press Ctrl+X, then Y, then Enter to save
```

### Step 6: Install PM2 (Process Manager)

```bash
# Install PM2 globally
npm install -g pm2

# Start your app
cd /var/www/prismhold
pm2 start server.js --name prismhold

# Make PM2 start on boot
pm2 startup
pm2 save
```

### Step 7: Set Up Nginx (Web Server)

```bash
# Install Nginx
apt install -y nginx

# Create Nginx config
nano /etc/nginx/sites-available/prismhold
```

Paste this configuration:

```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/prismhold /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Step 8: Set Up SSL (HTTPS)

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace YOUR_DOMAIN with your domain)
certbot --nginx -d YOUR_DOMAIN

# Certbot will automatically configure HTTPS
```

---

## Post-Deployment Steps

### 1. Update Razorpay Webhook URL

1. Go to Razorpay Dashboard → Settings → Webhooks
2. Update webhook URL to: `https://your-domain.com/api/payments/razorpay/webhook`
3. Save

### 2. Create Admin User

**Option A: Using Railway/Render CLI**
```bash
# Set environment variables first
export MONGODB_URI="your_connection_string"
export JWT_SECRET="your_secret"

# Run create-admin script
node create-admin.js
```

**Option B: Using MongoDB Atlas**
1. Go to MongoDB Atlas → Browse Collections
2. Find `users` collection
3. Insert a document manually:
```json
{
  "email": "admin@example.com",
  "password": "hashed_password_here",
  "displayName": "Admin",
  "isAdmin": true,
  "createdAt": new Date()
}
```
(You'll need to hash the password using bcrypt)

**Option C: Add Temporary Admin Route**
Add this to `server.js` temporarily (REMOVE AFTER USE!):
```javascript
app.post('/api/create-admin-temp', async (req, res) => {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ error: 'Not allowed in production' });
    }
    // ... admin creation code
});
```

### 3. Test Everything

- [ ] Homepage loads
- [ ] User registration works
- [ ] User login works
- [ ] Products display
- [ ] Cart works
- [ ] Checkout works
- [ ] Payment integration works
- [ ] Admin panel accessible
- [ ] Admin can manage products
- [ ] Admin can view orders

### 4. Set Up Custom Domain (Optional)

1. **Buy a Domain** (from Namecheap, GoDaddy, etc.)

2. **Point Domain to Your Server**
   - Go to your domain registrar
   - Add DNS records:
     - Type: A Record
     - Name: @ (or www)
     - Value: Your server IP (for DigitalOcean) or CNAME to Railway/Render URL

3. **Update Railway/Render**
   - Railway: Settings → Domains → Add Custom Domain
   - Render: Settings → Custom Domains → Add

4. **Update Environment Variables**
   - Update `API_BASE_URL` in HTML files to use your custom domain

---

## Troubleshooting

### Problem: App won't start

**Solution:**
- Check logs: Railway/Render → Logs tab
- Check environment variables are set correctly
- Make sure MongoDB connection string is correct
- Check PORT is set (Railway/Render sets this automatically)

### Problem: MongoDB connection fails

**Solution:**
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0` (all IPs)
- Check connection string has correct password
- Make sure database user has correct permissions

### Problem: Payment not working

**Solution:**
- Verify Razorpay keys are correct (Test vs Live mode)
- Check webhook URL is correct
- Check Razorpay dashboard for error logs
- Verify environment variables are set

### Problem: Admin panel not accessible

**Solution:**
- Make sure you created an admin user
- Check admin user has `isAdmin: true` in database
- Clear browser cache and localStorage
- Try logging out and back in

### Problem: Images not loading

**Solution:**
- Check uploads folder exists
- Verify file permissions
- Check image URLs in database
- Make sure static file serving is configured

### Problem: CORS errors

**Solution:**
- Update CORS settings in `server.js`:
```javascript
app.use(cors({
    origin: ['https://your-frontend-domain.com', 'https://your-backend-domain.com'],
    credentials: true
}));
```

---

## Security Checklist

Before going live, make sure:

- [ ] `JWT_SECRET` is a strong random string
- [ ] MongoDB password is strong
- [ ] Razorpay keys are production keys (not test)
- [ ] `.env` file is in `.gitignore` (never commit it!)
- [ ] CORS is configured for your domain only
- [ ] HTTPS is enabled (SSL certificate)
- [ ] Admin routes are protected
- [ ] File upload size limits are set
- [ ] Rate limiting is considered (for production)

---

## Need Help?

If you get stuck:

1. Check the logs (Railway/Render → Logs)
2. Check browser console (F12 → Console)
3. Verify all environment variables are set
4. Make sure MongoDB Atlas is accessible
5. Test API endpoints directly (use Postman or curl)

---

## Quick Reference: Environment Variables

```bash
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/prismhold
PORT=3000
JWT_SECRET=your-strong-random-secret-here
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret_here
GOOGLE_CLIENT_ID=your_google_client_id (optional)
```

---

**Congratulations! 🎉 Your app should now be live!**

Remember to:
- Monitor your app regularly
- Keep dependencies updated
- Backup your database regularly
- Monitor server logs for errors

Good luck with your deployment! 🚀
