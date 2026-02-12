# Prism Hold – Tech Stack & Workflow

## Technologies Used

### Backend
| Technology | Purpose |
|------------|--------|
| **Node.js** | Runtime (JavaScript on the server) |
| **JavaScript** | Backend language (all backend code is `.js`) |
| **Express.js** | Web framework (routes, middleware, static files) |
| **MongoDB** | Database (products, users, orders, etc.) |
| **Mongoose** | ODM to talk to MongoDB (schemas, models) |
| **JWT** (jsonwebtoken) | Auth tokens for users and admin |
| **bcryptjs** | Hashing passwords |
| **Razorpay** | Payment gateway (create order, verify, webhook) |
| **Google Auth Library** | Google sign-in |
| **Multer** | File uploads (product images) |
| **CORS** | Allow frontend to call API from same or different origin |
| **dotenv** | Load env vars from `.env` |

Backend entry point: `backend/server.js` (single Express app).

---

### Frontend (Customer Site & Admin Panel)
| Technology | Purpose |
|------------|--------|
| **HTML5** | Structure (e.g. `frontend/public/index.html`, `frontend/admin/admin.html`) |
| **CSS** | Styling: Tailwind CSS (utility classes) + custom CSS in `<style>` |
| **JavaScript** | All UI logic (vanilla JS in `<script>`, no React/Vue) |
| **Tailwind CSS** | Built from `frontend/src/input.css` → `frontend/dist/tailwind.css` |
| **Lucide Icons** | Icons via CDN (`lucide` script) |
| **Razorpay Checkout** | Payment UI via `checkout.razorpay.com` script |

So: **frontend = HTML + CSS + JavaScript** (no separate frontend framework).

---

### Summary Table
| Layer | Languages / Tech |
|-------|-------------------|
| **Frontend** | HTML, CSS, JavaScript (Tailwind, Lucide, Razorpay script) |
| **Backend** | JavaScript (Node.js, Express, Mongoose, JWT, Razorpay, etc.) |
| **Database** | MongoDB (via Mongoose) |
| **Payments** | Razorpay (backend API + frontend Checkout script) |

---

## Project Workflow

### 1. Single app (main repo)

- One **Express server** (`backend/server.js`) does everything:
  - Serves **static files** (HTML, CSS, images) from `frontend/public` and `frontend/admin`.
  - Exposes **REST API** under `/api/...`.
  - Sends **customer site** on `/` and **admin panel** on `/admin`.

### 2. Request flow (customer)

1. User opens the site → server sends `frontend/public/index.html`.
2. Browser loads HTML, Tailwind CSS, and scripts (Lucide, Razorpay).
3. Inline JS runs: detects API base URL, then calls e.g. `GET /api/products`, `GET /api/categories`, `GET /api/hero`.
4. Server reads from **MongoDB** (via Mongoose) and returns JSON.
5. Frontend JS renders products, hero, categories, etc.
6. Auth: signup/login (and optionally Google) → backend returns **JWT** → frontend stores it (e.g. localStorage) and sends `Authorization: Bearer <token>` on later API calls.
7. Cart, profile, addresses, orders → all via **REST API** with JWT.
8. Checkout: backend creates Razorpay order → frontend opens Razorpay Checkout → user pays → frontend calls backend to **verify** payment → backend updates order and (optionally) handles **webhook**.

So: **Frontend (HTML/CSS/JS) ↔ Backend (Express/Node) ↔ MongoDB**. Payments go through **Razorpay**.

### 3. Request flow (admin)

1. Admin opens `/admin` (or the standalone admin app) → server sends admin HTML.
2. Admin logs in → `POST /api/admin/login` → backend returns JWT (admin).
3. All admin actions use that JWT and hit **REST API**:
   - Products, categories: CRUD.
   - Orders: list, update status.
   - Users: list, toggle admin, delete.
   - Help requests: list, reply, status.
   - Hero, promo codes, uploads, stats.
4. Admin panel is still **HTML + CSS + JavaScript**; it just calls the same backend with an admin token.

### 4. Standalone admin panel (`admin-panel/`)

- **admin-panel** is a separate small **Express app** (Node.js again).
- It serves only the admin UI and **proxies** all `/api/*` requests to your **main backend** (using `MAIN_API_URL`).
- So: **same frontend stack** (HTML/CSS/JS), **same backend API**; only the “host” of the admin UI is different (separate deploy).

### 5. Build step (CSS)

- Tailwind: source is `frontend/src/input.css`; build output is `frontend/dist/tailwind.css`, and a copy goes to `frontend/public/tailwind.css`.
- Scripts: `npm run build-css` (and often `postinstall` / `vercel-build`). No JS bundler (no Webpack/Vite) for the main app.

---

## Flow Diagram (high level)

```
[Browser]
   │
   │  GET /          →  index.html (customer site)
   │  GET /admin     →  admin.html (admin panel)
   │  GET /api/*     →  JSON (products, auth, orders, etc.)
   │
   ▼
[Express - backend/server.js]
   │
   ├── Static: frontend/public, frontend/admin, uploads
   ├── Auth: JWT (user + admin)
   ├── Razorpay: create order, verify, webhook
   └── Data
          │
          ▼
      [MongoDB]
```

---

## In one sentence

**Frontend:** HTML, CSS, and JavaScript (Tailwind, Lucide, Razorpay). **Backend:** Node.js and JavaScript (Express, Mongoose, JWT, Razorpay). **Workflow:** One Express app serves the site and the API; the browser talks to `/api/*` and stores a JWT; MongoDB holds all data; payments are handled by Razorpay.
