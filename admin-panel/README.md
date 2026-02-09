# Admin Panel - Standalone Deployment

This is a standalone admin panel that can be deployed separately from the main application.

## Features

- ✅ Independent deployment
- ✅ Connects to main backend API
- ✅ Full admin functionality
- ✅ Product management
- ✅ Order management
- ✅ User management
- ✅ Help requests management

## Quick Start

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` file:**
   ```
   PORT=3001
   MAIN_API_URL=https://your-main-backend.vercel.app
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

5. **Access admin panel:**
   ```
   http://localhost:3001
   ```

## Deployment

### Deploy to Vercel

1. **Push to GitHub:**
   ```bash
   git add admin-panel/
   git commit -m "Add standalone admin panel"
   git push
   ```

2. **Deploy on Vercel:**
   - Go to [Vercel](https://vercel.com)
   - Click "Add New Project"
   - Select your repository
   - **Root Directory**: Set to `admin-panel`
   - **Framework Preset**: Other
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)

3. **Set Environment Variables:**
   - `MAIN_API_URL`: Your main backend URL (e.g., `https://prismhold-store.vercel.app`)
   - `NODE_ENV`: `production`

4. **Deploy!**

### Deploy to Render

1. **Create new Web Service**
2. **Root Directory**: `admin-panel`
3. **Build Command**: (leave empty)
4. **Start Command**: `node server.js`
5. **Environment Variables**:
   - `MAIN_API_URL`: Your main backend URL
   - `PORT`: `3001` (or leave empty, Render sets it)

### Deploy to Railway

1. **Create new project**
2. **Root Directory**: `admin-panel`
3. **Start Command**: `node server.js`
4. **Environment Variables**:
   - `MAIN_API_URL`: Your main backend URL

## Configuration

### Environment Variables

- `PORT` - Server port (default: 3001)
- `MAIN_API_URL` - Your main backend API URL (required)

### API Connection

The admin panel connects to your main backend API. Make sure:

1. **Main backend is deployed and accessible**
2. **CORS is enabled** on main backend (should already be configured)
3. **MAIN_API_URL** points to the correct backend URL

## How It Works

1. Admin panel runs on its own server (port 3001 locally)
2. All API requests are proxied to your main backend
3. Admin panel HTML/CSS is served statically
4. Authentication tokens are stored in browser localStorage

## Access

After deployment, access your admin panel at:
- **Vercel**: `https://your-admin-panel.vercel.app`
- **Render**: `https://your-admin-panel.onrender.com`
- **Railway**: `https://your-admin-panel.railway.app`

## Login

Use your admin credentials:
- **Email**: `admin@gmail.com`
- **Password**: `admin12`

(Or whatever admin credentials you created)

## Troubleshooting

### API Connection Issues

If you see API errors:
1. Check `MAIN_API_URL` is set correctly
2. Verify main backend is accessible
3. Check CORS settings on main backend
4. Check browser console for specific errors

### CSS Not Loading

Make sure `tailwind.css` is in `admin-panel/public/` directory.

### Authentication Issues

- Clear browser localStorage
- Make sure you're using correct admin credentials
- Check that main backend is running and accessible

---

**Note**: This admin panel requires your main backend to be deployed and accessible. It acts as a frontend that connects to your main API.
