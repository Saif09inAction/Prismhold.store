# Backend

This directory contains all backend/server-side code for the Prism Hold e-commerce application.

## Files

- **`server.js`** - API-only Express server (for Render)
  - Serves only `/api/*` routes (no frontend)
  - Uses `MONGO_URI` / `MONGODB_URI`, `PORT`, `CORS_ORIGIN`
  - Handles authentication, payments (Razorpay), uploads (MongoDB)

- **`create-admin.js`** - Script to create admin users
  - Run with: `npm run create-admin`
  - Prompts for email, password, and display name
  - Creates or updates a user with admin privileges

## Directory Structure

```
backend/
├── server.js           # Main server file
├── create-admin.js     # Admin user creation script
├── uploads/            # Uploaded files (if using file storage)
└── README.md           # This file
```

## Environment Variables

Set in Render (or in root `.env` for local runs):

- `MONGO_URI` or `MONGODB_URI` - MongoDB connection string (e.g. MongoDB Atlas)
- `PORT` - Set by Render in production
- `JWT_SECRET` - Secret for JWT signing
- `CORS_ORIGIN` - Allowed frontend origin (e.g. `https://your-app.vercel.app`)
- `RAZORPAY_KEY_ID` - Razorpay Key ID (public key is sent to frontend by API)
- `RAZORPAY_KEY_SECRET` - Razorpay Key Secret
- `GOOGLE_CLIENT_ID` - (Optional) Google OAuth Client ID

## API Routes

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth login

### Products (Public)
- `GET /api/products` - Get all products
- `GET /api/products/recent` - Get recent products
- `GET /api/products/most-viewed` - Get most viewed products
- `GET /api/products/most-ordered` - Get most ordered products
- `GET /api/products/by-category/:category` - Get products by category

### User Routes (Protected)
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `GET /api/cart` - Get user cart
- `PUT /api/cart` - Update user cart
- `GET /api/addresses` - Get user addresses
- `POST /api/addresses` - Create address
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create order

### Admin Routes (Admin Only)
- `POST /api/admin/login` - Admin login
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/products` - Manage products
- `GET /api/admin/orders` - Manage orders
- `GET /api/admin/users` - Manage users
- `POST /api/admin/upload` - Upload images

### Payment Routes
- `POST /api/payments/razorpay/create-order` - Create Razorpay order
- `POST /api/payments/razorpay/verify` - Verify payment
- `POST /api/payments/razorpay/webhook` - Razorpay webhook handler

## Running the Backend

From the project root:

```bash
# Start server
npm start

# Start with auto-reload (development)
npm run dev

# Create admin user
npm run create-admin
```

## Dependencies

All dependencies are managed in the root `package.json`. The backend uses:

- Express.js - Web framework
- MongoDB/Mongoose - Database
- JWT - Authentication
- Razorpay - Payment processing
- Multer - File uploads
- Bcrypt - Password hashing
