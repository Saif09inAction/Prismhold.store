# 🔧 Render Deployment Troubleshooting Guide

Your site is deployed but getting **500 Internal Server Errors** on all API endpoints. This guide will help you fix it.

## 🚨 Quick Diagnosis

First, check if your server is running properly:

1. **Visit your health check endpoint:**
   ```
   https://prismhold-store.onrender.com/api/health
   ```

2. **Check what it returns:**
   - If it shows MongoDB as `disconnected` → **MongoDB connection issue**
   - If it shows `hasMongoUri: false` → **Environment variables not set**
   - If it doesn't load → **Server not starting**

## 🔍 Common Issues & Fixes

### Issue 1: MongoDB Connection Failing

**Symptoms:**
- All API endpoints return 500 errors
- `/api/health` shows `mongodb.status: "disconnected"`

**Fix:**

1. **Check your MongoDB Atlas connection string:**
   - Go to [MongoDB Atlas](https://cloud.mongodb.com)
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - **IMPORTANT:** Replace `<password>` with your actual password
   - **IMPORTANT:** Add database name at the end: `...mongodb.net/prismhold` (or your DB name)

   Example:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/prismhold?retryWrites=true&w=majority
   ```

2. **Set Environment Variable on Render:**
   - Go to your Render dashboard
   - Click on your service
   - Go to "Environment" tab
   - Add/Update: `MONGODB_URI` = your connection string
   - Click "Save Changes"
   - Render will automatically redeploy

3. **Check MongoDB Atlas Network Access:**
   - Go to MongoDB Atlas → Network Access
   - Make sure `0.0.0.0/0` is whitelisted (allows all IPs)
   - Or add Render's IP if you know it

### Issue 2: Environment Variables Not Set

**Symptoms:**
- `/api/health` shows `hasMongoUri: false` or `hasJwtSecret: false`

**Fix:**

1. **Go to Render Dashboard:**
   - Click your service
   - Go to "Environment" tab

2. **Add these required variables:**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/prismhold
   PORT=3000
   JWT_SECRET=your-strong-random-secret-here
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   ```

3. **Generate JWT_SECRET:**
   - Use a strong random string (32+ characters)
   - Example: `Qp7wJg9zN4tL2yF8cR0uVb3xK6mH1sD5aB7cD9eF1gH3iJ5kL7mN9oP1qR3sT5`
   - Or generate online: https://www.random.org/strings/

4. **Save and Redeploy:**
   - Click "Save Changes"
   - Render will redeploy automatically

### Issue 3: Server Not Starting

**Symptoms:**
- Site shows "Application Error" or blank page
- `/api/health` doesn't load

**Fix:**

1. **Check Render Logs:**
   - Go to Render dashboard → Your service → "Logs" tab
   - Look for error messages
   - Common errors:
     - `Cannot find module` → Missing dependency
     - `Port already in use` → Port conflict
     - `MongoDB connection error` → Database issue

2. **Check Build Logs:**
   - Look at the "Build Logs" section
   - Make sure `npm install` completed successfully
   - Make sure `node backend/server.js` command works

3. **Verify Procfile:**
   - Should contain: `web: node backend/server.js`
   - Make sure it's committed to your repo

### Issue 4: Wrong MongoDB URI Format

**Symptoms:**
- MongoDB connection fails with authentication error

**Common Mistakes:**

❌ **Wrong:**
```
mongodb+srv://username:password@cluster.mongodb.net/
```

✅ **Correct:**
```
mongodb+srv://username:password@cluster.mongodb.net/prismhold?retryWrites=true&w=majority
```

**Key Points:**
- Must include database name (`/prismhold`)
- Password must be URL-encoded if it contains special characters
- Replace `<password>` placeholder with actual password

## 📋 Step-by-Step Fix Checklist

Follow these steps in order:

- [ ] **Step 1:** Check `/api/health` endpoint
  - Visit: `https://prismhold-store.onrender.com/api/health`
  - Note what it says about MongoDB

- [ ] **Step 2:** Verify MongoDB Atlas Setup
  - [ ] Database user exists
  - [ ] Password is correct
  - [ ] Network Access allows all IPs (`0.0.0.0/0`)
  - [ ] Connection string includes database name

- [ ] **Step 3:** Set Environment Variables on Render
  - [ ] `MONGODB_URI` is set correctly
  - [ ] `JWT_SECRET` is set (not the default)
  - [ ] `RAZORPAY_KEY_ID` is set
  - [ ] `RAZORPAY_KEY_SECRET` is set
  - [ ] `PORT` is set (usually 3000, but Render sets this automatically)

- [ ] **Step 4:** Check Render Logs
  - [ ] Look for MongoDB connection messages
  - [ ] Look for any error messages
  - [ ] Check if server started successfully

- [ ] **Step 5:** Test Again
  - [ ] Visit `/api/health` - should show MongoDB connected
  - [ ] Visit `/api/products` - should return products (or empty array)
  - [ ] Try signup - should work now

## 🧪 Testing Your Fix

After making changes:

1. **Wait for Render to redeploy** (usually 1-2 minutes)

2. **Test health endpoint:**
   ```bash
   curl https://prismhold-store.onrender.com/api/health
   ```
   Should return JSON with `mongodb.status: "connected"`

3. **Test products endpoint:**
   ```bash
   curl https://prismhold-store.onrender.com/api/products
   ```
   Should return JSON array (even if empty)

4. **Test signup:**
   ```bash
   curl -X POST https://prismhold-store.onrender.com/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123"}'
   ```

## 🆘 Still Not Working?

If you've tried everything above:

1. **Check Render Logs** - Look for specific error messages
2. **Check MongoDB Atlas Logs** - See if connection attempts are being made
3. **Verify your MongoDB URI** - Test it locally first
4. **Check Render Service Status** - Make sure service is running

## 📞 Getting Help

When asking for help, provide:

1. Output from `/api/health` endpoint
2. Recent logs from Render (last 50 lines)
3. Your MongoDB connection string format (without password)
4. Environment variables you've set (without values)

---

**Most Common Fix:** 90% of issues are solved by:
1. Setting `MONGODB_URI` correctly in Render environment variables
2. Making sure MongoDB Atlas allows connections from all IPs
3. Including database name in connection string

Good luck! 🚀
