# PRISM HOLD — Luxury Accessories E-Commerce

A full-stack e-commerce platform for luxury accessories (clutches, bags, jewelry). Live at [prismhold.store](https://prismhold.store).

---

## Tech Stack

### Backend
| Technology | Purpose |
|------------|--------|
| **Node.js** | Runtime |
| **Express.js** | Web framework, REST API |
| **MongoDB** | Database (products, users, orders) |
| **Mongoose** | ODM for MongoDB |
| **JWT** | Authentication (user & admin) |
| **Razorpay** | Payment gateway |
| **Firebase Admin** | Phone OTP & Google sign-in |
| **bcryptjs** | Password hashing |
| **Multer + Sharp** | Image uploads & compression |
| **Socket.io** | Real-time updates (optional) |

### Frontend
| Technology | Purpose |
|------------|--------|
| **HTML5** | Structure |
| **Tailwind CSS** | Styling (utility-first) |
| **Vanilla JavaScript** | UI logic (no framework) |
| **Lucide Icons** | Icons via CDN |
| **Razorpay Checkout** | Payment UI |

### Infrastructure
- **Frontend**: Vercel (static hosting)
- **Backend API**: Render (Node.js)
- **Database**: MongoDB Atlas
- **Auth**: JWT + Firebase (Email OTP, Phone OTP, Google)

---

## How It Works

### Architecture

```
[Browser / Customer]
        │
        │  HTTPS
        ▼
[Vercel] → frontend/public/index.html (static)
        │
        │  API calls (fetch)
        ▼
[Render] → backend/server.js (Express API)
        │
        ├── REST API (/api/*)
        ├── Auth (JWT, Firebase)
        ├── Razorpay (payments)
        └── Data
               │
               ▼
        [MongoDB Atlas]
```

### Request Flow

1. **Customer visits site** → Vercel serves `frontend/public/index.html`
2. **Page loads** → JavaScript fetches products, categories, hero content from API
3. **Auth** → User signs in (Email OTP, Phone OTP, or Google) → Backend returns JWT → Stored in localStorage
4. **Cart & checkout** → Frontend calls `/api/cart`, `/api/addresses`, `/api/orders` with JWT
5. **Payment** → Backend creates Razorpay order → Frontend opens Razorpay Checkout → User pays → Backend verifies signature → Order updated
6. **Admin** → Separate admin UI (`/admin` or `admin-panel/`) → Uses same API with admin JWT

### Authentication

- **Email OTP**: Backend sends 6-digit OTP via Resend/SMTP; user verifies; JWT issued
- **Phone OTP**: Firebase Auth (reCAPTCHA) sends SMS; backend verifies ID token; JWT issued
- **Google**: Firebase Auth popup/redirect; backend verifies ID token; JWT issued

### Payment Flow

1. User selects items → Proceeds to checkout
2. Backend creates Razorpay order (`POST /api/orders`)
3. Frontend opens Razorpay Checkout modal
4. User completes payment
5. Frontend calls `/api/payments/razorpay/verify` with payment details
6. Backend verifies signature, updates order status
7. Optional: Razorpay webhook for server-side confirmation

---

## Project Structure

```
prismhold/
├── backend/
│   ├── server.js              # Main Express app, all API routes
│   ├── create-admin.js        # Create admin user (npm run create-admin)
│   ├── fix-email-index.js     # MongoDB index fix for phone-only users
│   └── uploads/               # Uploaded images (or stored in MongoDB)
│
├── frontend/
│   ├── public/
│   │   ├── index.html         # Customer site (products, cart, checkout)
│   │   ├── tailwind.css       # Compiled Tailwind CSS
│   │   ├── config/
│   │   │   ├── api.js         # API base URL
│   │   │   └── firebase.js    # Firebase config for auth
│   │   └── admin/
│   │       └── index.html     # Admin panel (Vercel)
│   ├── admin/
│   │   └── admin.html         # Admin panel source
│   └── src/
│       └── input.css          # Tailwind source
│
├── admin-panel/               # Standalone admin (optional)
│   ├── server.js              # Proxies to main backend
│   └── public/index.html      # Admin UI
│
├── package.json
├── tailwind.config.js
├── .env.example
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 14+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone & Install

```bash
git clone https://github.com/Saif09inAction/Prismhold.store.git
cd Prismhold.store
npm install
```

### 2. Environment Variables

Create `.env` in the project root (see `.env.example`):

```env
MONGO_URI=mongodb://localhost:27017/prismhold
# or MongoDB Atlas: mongodb+srv://user:pass@cluster.mongodb.net/prismhold
PORT=3000
JWT_SECRET=your-secret-key-change-in-production
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Optional: Firebase (Phone OTP, Google)
FIREBASE_SERVICE_ACCOUNT_PATH=backend/serviceAccountKey.json

# Optional: Email OTP (Resend or SMTP)
RESEND_API_KEY=re_xxx
RESEND_FROM=Prism Hold <noreply@yourdomain.com>
```

### 3. Build CSS

```bash
npm run build-css
```

### 4. Start Server

```bash
npm start
```

- **Customer site**: http://localhost:3000
- **Admin panel**: http://localhost:3000/admin
- **API**: http://localhost:3000/api

### 5. Create Admin User

```bash
npm run create-admin
```

---

## API Overview

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/products` | GET | List products |
| `/api/categories` | GET | List categories |
| `/api/hero` | GET | Hero content |
| `/api/auth/firebase` | POST | Sign in with Firebase (Phone/Google) |
| `/api/auth/email-otp/send` | POST | Send email OTP |
| `/api/auth/email-otp/verify` | POST | Verify email OTP |
| `/api/profile` | GET/PUT | User profile |
| `/api/cart` | GET/PUT | Cart |
| `/api/addresses` | GET/POST/PUT/DELETE | Addresses |
| `/api/orders` | GET/POST | Orders |
| `/api/payments/razorpay/create` | POST | Create Razorpay order |
| `/api/payments/razorpay/verify` | POST | Verify payment |
| `/api/admin/*` | various | Admin-only (products, orders, users, etc.) |

---

## Features

### Customer
- Product catalog with search & filters
- Category-based browsing
- Shopping cart (persisted per user)
- Address management
- Checkout with Razorpay
- Order tracking
- Email OTP, Phone OTP, Google sign-in
- Help / Contact requests

### Admin
- Dashboard with stats
- Product CRUD (images, stock, categories)
- Category management
- Order management & status updates
- User management
- Hero content editor (brand, title, subtitle, images)
- Promo codes
- Help request replies

---

## Deployment

### Frontend (Vercel)

1. Connect repo to Vercel
2. **Root Directory**: `.`
3. **Build Command**: `npm run build`
4. **Output Directory**: `frontend/public`
5. Set `API_BASE_URL` in `frontend/public/index.html` (or via config) to your backend URL

### Backend (Render)

1. New Web Service → Connect repo
2. **Root Directory**: `backend` (if backend is in subfolder) or `.`
3. **Build**: `npm install`
4. **Start**: `node backend/server.js` or `npm start`
5. Set env vars: `MONGO_URI`, `JWT_SECRET`, `RAZORPAY_*`, `FIREBASE_*`, etc.

### MongoDB Atlas

Create cluster, get connection string, add to `MONGO_URI`.

---

## License

