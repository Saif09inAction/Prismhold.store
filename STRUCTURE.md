# 📁 Project Structure Guide

This document explains the organized folder structure of the Prism Hold project.

## Overview

The project is now organized into clear **backend** and **frontend** directories for better maintainability and deployment.

```
prismhold/
│
├── 📁 backend/              # Server-side code
│   ├── server.js            # Main Express.js server
│   ├── create-admin.js      # Admin user creation utility
│   ├── uploads/             # File uploads storage
│   └── README.md            # Backend documentation
│
├── 📁 frontend/             # Client-side code
│   ├── public/              # Public-facing website
│   │   ├── index.html      # Main customer website
│   │   └── image.png       # Default images/assets
│   ├── admin/               # Admin panel
│   │   └── admin.html      # Admin dashboard
│   └── README.md            # Frontend documentation
│
├── 📄 Configuration Files
│   ├── package.json         # Dependencies & scripts
│   ├── .env.example         # Environment variables template
│   ├── .gitignore          # Git ignore rules
│   ├── Procfile            # Deployment config (Heroku/Railway)
│   └── start.sh            # Local development startup script
│
└── 📚 Documentation
    ├── README.md            # Main documentation
    ├── DEPLOYMENT.md        # Deployment guide
    ├── DEPLOYMENT_CHECKLIST.md
    ├── QUICK_START.md       # Quick start guide
    └── STRUCTURE.md         # This file
```

## Backend (`/backend`)

**Purpose**: Contains all server-side logic and API endpoints.

### Key Files:

- **`server.js`** - Main Express server
  - Handles all API routes (`/api/*`)
  - Serves frontend files
  - Manages database connections (MongoDB)
  - Handles authentication (JWT)
  - Processes payments (Razorpay)
  - File upload handling

- **`create-admin.js`** - Utility script
  - Creates admin users in the database
  - Run with: `npm run create-admin`

- **`uploads/`** - File storage directory
  - Stores uploaded images/files
  - Served at `/uploads` endpoint

### How It Works:

The backend server:
1. Serves static files from `frontend/public/` at the root (`/`)
2. Serves admin panel from `frontend/admin/admin.html` at `/admin`
3. Provides API endpoints at `/api/*`
4. Handles file uploads and stores them in `backend/uploads/`

## Frontend (`/frontend`)

**Purpose**: Contains all client-side code and user interfaces.

### Structure:

#### `/frontend/public/`
Public-facing customer website:
- **`index.html`** - Main e-commerce site
  - Product catalog
  - Shopping cart
  - Checkout
  - User authentication
  - Order tracking

#### `/frontend/admin/`
Admin dashboard:
- **`admin.html`** - Admin management panel
  - Dashboard with statistics
  - Product management
  - Order management
  - User management
  - Settings

### How It Works:

- Frontend files are **served by the Express backend**
- No build process required - pure HTML/CSS/JavaScript
- API calls use Fetch API to communicate with backend
- Authentication tokens stored in browser localStorage

## File Paths & Serving

### Static File Serving

The Express server (`backend/server.js`) serves files as follows:

```javascript
// Public files (images, CSS, JS)
app.use(express.static(FRONTEND_PUBLIC_PATH));
// → Serves files from frontend/public/

// Uploaded files
app.use('/uploads', express.static(UPLOADS_PATH));
// → Serves files from backend/uploads/ at /uploads/

// Root route
app.get('/', ...) 
// → Serves frontend/public/index.html

// Admin route
app.get('/admin', ...)
// → Serves frontend/admin/admin.html
```

### URL Structure

When running locally (`http://localhost:3000`):

- `/` → `frontend/public/index.html` (Customer site)
- `/admin` → `frontend/admin/admin.html` (Admin panel)
- `/api/*` → Backend API endpoints
- `/uploads/*` → Uploaded files
- `/image.png` → Static assets from `frontend/public/`

## Running the Project

### Development

```bash
# Install dependencies (from project root)
npm install

# Start server (serves both frontend and backend)
npm start

# Development with auto-reload
npm run dev

# Create admin user
npm run create-admin
```

### Access Points

- **Customer Site**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **API Base**: http://localhost:3000/api

## Environment Variables

All environment variables are set in the **root `.env` file** (not in backend or frontend folders).

The backend reads these variables:
- `MONGODB_URI` - Database connection
- `PORT` - Server port
- `JWT_SECRET` - Authentication secret
- `RAZORPAY_KEY_ID` - Payment gateway key
- `RAZORPAY_KEY_SECRET` - Payment gateway secret

## Deployment

When deploying:

1. **All files are deployed together** (monorepo structure)
2. The deployment platform runs: `node backend/server.js`
3. Environment variables are set in the platform's dashboard
4. Frontend files are automatically served by the backend

### Platform-Specific Notes

- **Railway/Render/Heroku**: Use `Procfile` which points to `backend/server.js`
- **DigitalOcean/VPS**: Run `npm start` from project root
- **Docker**: Build from project root, run `backend/server.js`

## Benefits of This Structure

✅ **Clear Separation**: Backend and frontend are clearly separated  
✅ **Easy Navigation**: Easy to find files  
✅ **Scalable**: Easy to add more frontend/backend code  
✅ **Deployment Ready**: Works with all major platforms  
✅ **Maintainable**: Clear organization makes maintenance easier  

## Adding New Files

### Adding Backend Routes

Add new routes in `backend/server.js`:
```javascript
app.get('/api/new-route', (req, res) => {
    // Your code here
});
```

### Adding Frontend Pages

Add new HTML files in `frontend/public/` or `frontend/admin/`, then add routes in `backend/server.js`:
```javascript
app.get('/new-page', (req, res) => {
    res.sendFile(path.join(FRONTEND_PUBLIC_PATH, 'new-page.html'));
});
```

### Adding Static Assets

Place images, CSS, JS files in `frontend/public/` - they'll be automatically served.

## Migration Notes

If you're migrating from the old flat structure:

- ✅ All backend code moved to `/backend`
- ✅ All frontend code moved to `/frontend`
- ✅ Paths updated in `server.js`
- ✅ Package.json scripts updated
- ✅ All documentation updated

Everything should work exactly the same, just better organized!

---

**Need help?** Check the [README.md](./README.md) or [DEPLOYMENT.md](./DEPLOYMENT.md) for more information.
