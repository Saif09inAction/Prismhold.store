# 🚀 Vercel Deployment Guide

This guide will help you deploy your Prism Hold application to Vercel.

## Vercel Configuration

### Application Preset: **Node.js**

When setting up your project on Vercel:

1. **Framework Preset**: Select **"Other"** or **"Node.js"**
2. **Root Directory**: Leave as `.` (root)
3. **Build Command**: `npm run build-css` (or leave empty, it will run automatically)
4. **Output Directory**: Leave empty (not needed for Node.js)
5. **Install Command**: `npm install` (default)

## Environment Variables

Set these in Vercel Dashboard → Your Project → Settings → Environment Variables:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/prismhold?retryWrites=true&w=majority
JWT_SECRET=your-strong-random-secret-here
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
PORT=3000
NODE_ENV=production
```

## Deployment Steps

### Step 1: Connect to Vercel

1. Go to [Vercel](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "Add New Project"
4. Import your repository: `Saif09inAction/Prismhold.store`
5. **Project Name**: Use `prismhold_store` (with underscore, NO hyphens - Vercel doesn't allow hyphens!)

### Step 2: Configure Project Settings

**Framework Preset:** `Other` or `Node.js`

**Build Settings:**
- **Build Command**: `npm run build-css` (or leave empty)
- **Output Directory**: (leave empty)
- **Install Command**: `npm install` (default)
- **Root Directory**: `.` (root)

**Environment Variables:**
Add all the variables listed above.

### Step 3: Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Your app will be live at: `https://your-project-name.vercel.app`

## Important Notes

### Vercel Serverless Functions

Vercel uses serverless functions. Your Express app will work, but note:

- **Cold starts**: First request might be slower
- **Function timeout**: 10 seconds (Hobby), 60 seconds (Pro)
- **File uploads**: Use MongoDB GridFS or external storage (not local filesystem)

### File Uploads

Since Vercel uses serverless functions, local file storage won't persist. Your app already stores images in MongoDB, which is perfect for Vercel!

### API Routes

All `/api/*` routes will be handled by your Express server automatically via `vercel.json`.

### Static Files

- CSS files in `/frontend/dist/` are served automatically
- Images in `/frontend/public/` are served by Express
- Uploads are stored in MongoDB (not filesystem)

## Troubleshooting

### Issue: Build Fails

**Solution:**
- Check that `vercel.json` is in the root directory
- Ensure `package.json` has all dependencies
- Check build logs in Vercel dashboard

### Issue: API Routes Not Working

**Solution:**
- Verify `vercel.json` routes are correct
- Check that `backend/server.js` is the correct entry point
- Ensure environment variables are set

### Issue: MongoDB Connection Fails

**Solution:**
- Verify `MONGODB_URI` is set correctly in Vercel
- Check MongoDB Atlas Network Access allows Vercel IPs
- Use `0.0.0.0/0` to allow all IPs (for testing)

### Issue: Static Files Not Loading

**Solution:**
- Check that `frontend/dist/tailwind.css` exists
- Verify routes in `vercel.json` are correct
- Check that build command runs successfully

## Vercel vs Other Platforms

| Feature | Vercel | Railway/Render |
|---------|--------|----------------|
| **Best For** | Frontend + API | Full-stack apps |
| **Cold Starts** | Yes (serverless) | No (always-on) |
| **File Storage** | Not persistent | Persistent |
| **Free Tier** | Generous | Limited |
| **Deployment** | Git-based | Git-based |

## Quick Reference

**Application Preset:** `Node.js` or `Other`

**Build Command:** `npm run build-css`

**Start Command:** (not needed, handled by vercel.json)

**Environment Variables:** Set in Vercel Dashboard

---

**Your app is configured for Vercel!** 🎉

The `vercel.json` file handles all routing automatically.
