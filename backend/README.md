# Backend

This directory contains all backend/server-side code for the Prism Hold e-commerce application.

## Files

- **`server.js`** - Main Express.js server file
  - Handles all API routes
  - Serves frontend files
  - Manages database connections
  - Handles authentication and authorization
  - Processes payments via Razorpay

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

The backend requires these environment variables (set in root `.env` file):

- `MONGODB_URI` - MongoDB connection string
- `PORT` - Server port (default: 3000)
- `JWT_SECRET` - Secret for JWT token signing
- `RAZORPAY_KEY_ID` - Razorpay API Key ID
- `RAZORPAY_KEY_SECRET` - Razorpay API Secret
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
