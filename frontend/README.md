# Frontend

This directory contains all frontend/client-side code for the Prism Hold e-commerce application.

## Directory Structure

```
frontend/
├── public/           # Public-facing frontend
│   ├── index.html    # Main customer-facing website
│   └── image.png     # Default images/assets
├── admin/            # Admin panel
│   └── admin.html    # Admin dashboard and management interface
└── README.md         # This file
```

## Files

### `public/index.html`
The main customer-facing e-commerce website. Features:
- Product catalog and browsing
- Shopping cart functionality
- User authentication (signup/login)
- Checkout and payment processing
- Order tracking
- User profile management

### `admin/admin.html`
The admin dashboard for managing the e-commerce platform. Features:
- Dashboard with statistics
- Product management (CRUD operations)
- Category management
- Order management and status updates
- User management
- Help request management
- Promo code management
- Hero section customization

## API Integration

Both frontend files communicate with the backend API. The API base URL is automatically detected based on the current domain, but can be overridden:

```javascript
// Override API URL (if needed)
window.__API_BASE_URL = 'https://your-backend-url.com/api';
```

## Development

The frontend files are served by the Express backend server. When running locally:

- Customer site: http://localhost:3000
- Admin panel: http://localhost:3000/admin

## Static Assets

Static assets (images, CSS, JavaScript) are served from the `public/` directory. The backend server automatically serves these files.

## Features

### Customer Site (`index.html`)
- ✅ Product browsing and search
- ✅ Shopping cart
- ✅ User authentication
- ✅ Checkout with Razorpay integration
- ✅ Order history
- ✅ Address management
- ✅ Promo code application
- ✅ Product recommendations

### Admin Panel (`admin.html`)
- ✅ Dashboard with key metrics
- ✅ Product CRUD operations
- ✅ Category management
- ✅ Order management
- ✅ User management
- ✅ Help request handling
- ✅ Image upload and management
- ✅ Promo code management
- ✅ Hero section customization

## Browser Support

The frontend uses modern JavaScript (ES6+) and should work in:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Notes

- The frontend is a single-page application (SPA) using vanilla JavaScript
- No build process required - files are served directly
- API calls use Fetch API
- Authentication tokens stored in localStorage
- Responsive design for mobile and desktop
