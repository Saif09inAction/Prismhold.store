# 🚀 Quick Start Guide

## For Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

Edit `.env` with your MongoDB connection string and other credentials.

### 3. Start the Server
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

### 4. Access the App
- Frontend: http://localhost:3000
- Admin Panel: http://localhost:3000/admin

### 5. Create Admin User
```bash
npm run create-admin
```

Follow the prompts to create your admin account.

---

## For Deployment

**👉 See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete step-by-step deployment instructions.**

**Quick Summary:**
1. Set up MongoDB Atlas (free tier available)
2. Set up Razorpay account
3. Push code to GitHub
4. Deploy to Railway/Render/Heroku
5. Set environment variables
6. Test your deployment

---

## Need Help?

- **Deployment Guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Deployment Checklist**: See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
- **Full Documentation**: See [README.md](./README.md)

---

## Project Structure

```
prismhold/
├── backend/            # Backend/server code
│   ├── server.js      # Main Express server
│   ├── create-admin.js # Admin user creation script
│   └── uploads/       # Uploaded files storage
│
├── frontend/          # Frontend/client code
│   ├── public/        # Public-facing website
│   │   └── index.html # Main customer website
│   └── admin/         # Admin panel
│       └── admin.html  # Admin dashboard
│
├── package.json       # Dependencies and scripts
├── .env.example       # Environment variables template
├── Procfile          # For Heroku/Railway deployment
└── DEPLOYMENT.md     # Complete deployment guide
```

---

## Environment Variables

Required variables (see `.env.example`):

- `MONGODB_URI` - MongoDB connection string
- `PORT` - Server port (default: 3000)
- `JWT_SECRET` - Secret for JWT tokens
- `RAZORPAY_KEY_ID` - Razorpay API Key ID
- `RAZORPAY_KEY_SECRET` - Razorpay API Secret
- `GOOGLE_CLIENT_ID` - (Optional) Google OAuth Client ID

---

**Happy coding! 🎉**
