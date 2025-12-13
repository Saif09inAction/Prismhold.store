# Prism Hold - MongoDB Migration

This project has been migrated from Firebase to MongoDB with a Node.js/Express backend.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (running on localhost:27017)
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Start MongoDB

Make sure MongoDB is running on your local machine:

```bash
# On macOS with Homebrew
brew services start mongodb-community

# Or run directly
mongod --dbpath /path/to/your/data/directory
```

### 3. Configure Environment Variables (Optional)

Create a `.env` file in the root directory:

```env
MONGODB_URI=mongodb://localhost:27017/prismhold
PORT=3000
JWT_SECRET=your-secret-key-change-in-production
GOOGLE_CLIENT_ID=your-google-client-id (optional, for Google OAuth)

# Razorpay Payment Gateway Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### 4. Start the Backend Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

The server will start on `http://localhost:3000`
admin panel :- http://localhost:3000/admin
### 5. Open the Frontend

Open `index.html` in your browser, or serve it using a local server:

```bash
# Using Python
python3 -m http.server 8000

# Using Node.js http-server
npx http-server -p 8000
```

Then open `http://localhost:8000` in your browser.

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/google` - Google OAuth login (requires setup)

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

### Cart
- `GET /api/cart` - Get user's cart
- `PUT /api/cart` - Update user's cart

### Addresses
- `GET /api/addresses` - Get all user addresses
- `POST /api/addresses` - Create new address
- `PUT /api/addresses/:id` - Update address
- `DELETE /api/addresses/:id` - Delete address

### Orders
- `GET /api/orders` - Get all user orders
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order (e.g., cancel)

## Database Structure

The MongoDB database uses the following collections:

- `users` - User accounts
- `profiles` - User profile information
- `carts` - Shopping carts
- `addresses` - Delivery addresses
- `orders` - Order history

## Migration Notes

### What Changed

1. **Authentication**: Replaced Firebase Auth with JWT-based authentication
2. **Database**: Replaced Firestore with MongoDB
3. **Real-time Updates**: Replaced Firebase `onSnapshot` with polling (every 2 seconds)
4. **API Calls**: All database operations now go through REST API endpoints

### Razorpay Payment Integration Setup

### Prerequisites
1. Sign up for Razorpay at [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Get your API credentials:
   - Key ID (from Settings → API Keys)
   - Key Secret (from Settings → API Keys)

### Installation
Install Razorpay Node.js SDK:

```bash
npm install razorpay
```

### Environment Variables
Add these to your `.env` file or set them as environment variables:

```env
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### Configuration Steps
1. **For Test Mode:**
   - Use Test Mode credentials from Razorpay Dashboard
   - Test Mode toggle should be ON in dashboard

2. **For Production:**
   - Use Live Mode credentials from Razorpay Dashboard
   - Test Mode toggle should be OFF in dashboard
   - Configure webhook URL in Razorpay Dashboard: `https://yourdomain.com/api/payments/razorpay/webhook`
   - Enable webhook events: `payment.captured`, `payment.failed`, `payment.authorized`

### Payment Flow
1. User places order → Order created with status "Pending"
2. Razorpay order created → Server creates Razorpay order
3. Payment modal opens → Razorpay checkout modal appears
4. User completes payment → Payment processed by Razorpay
5. Payment verification → Server verifies payment signature
6. Order status updated → "Processing" on success, "Failed" on failure

### Testing
- Use Razorpay test credentials (Test Mode ON)
- Test with test cards: 4111 1111 1111 1111 (any future expiry, any CVV)
- Test UPI: success@razorpay (for success), failure@razorpay (for failure)
- Verify webhook handling in Razorpay dashboard logs

## Features

- ✅ User registration and login
- ✅ Shopping cart persistence
- ✅ Address management
- ✅ Order placement and tracking
- ✅ Profile management
- ⚠️ Google OAuth (needs additional setup)

## Troubleshooting

### MongoDB Connection Issues

If you see connection errors:
1. Verify MongoDB is running: `mongosh` or `mongo`
2. Check the connection string in `server.js` or `.env`
3. Ensure MongoDB is accessible on port 27017

### CORS Issues

If you encounter CORS errors when accessing the API:
- The server is configured to allow all origins in development
- For production, update CORS settings in `server.js`

### Authentication Issues

- Clear browser localStorage if you experience auth issues
- Check that the JWT_SECRET is set (default is used if not set)
- Verify the API_BASE_URL in `index.html` matches your server URL

## Production Deployment

For production deployment:

1. Set secure environment variables
2. Use a production MongoDB instance (MongoDB Atlas, etc.)
3. Update `API_BASE_URL` in `index.html` to your production server URL
4. Enable HTTPS
5. Configure proper CORS settings
6. Set up Google OAuth credentials if needed

## Admin Panel

### Setting Up Admin Access

1. Create an admin user by running:
   ```bash
   npm run create-admin
   ```
   Follow the prompts to enter email, password, and name.

2. Access the admin panel at:
   ```
   http://localhost:3000/admin
   ```

3. Login with your admin credentials.

### Admin Features

- **Dashboard**: Overview with statistics and recent orders
- **Products Management**: Add, edit, and delete products
- **Categories Management**: Manage product categories
- **Orders Management**: View all orders and update order status
- **Users Management**: View users, toggle admin status, delete users
- **Help Requests**: View and manage customer help requests

### Admin API Endpoints

All admin endpoints require authentication with an admin token:

- `POST /api/admin/login` - Admin login
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/products` - List all products
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product
- `GET /api/admin/categories` - List all categories
- `POST /api/admin/categories` - Create category
- `PUT /api/admin/categories/:id` - Update category
- `DELETE /api/admin/categories/:id` - Delete category
- `GET /api/admin/orders` - List all orders
- `PUT /api/admin/orders/:id/status` - Update order status
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/:id` - Update user (toggle admin, etc.)
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/help-requests` - List all help requests
- `PUT /api/admin/help-requests/:id` - Update help request status
- `DELETE /api/admin/help-requests/:id` - Delete help request

## Support

For issues or questions, check the server logs and browser console for error messages.

