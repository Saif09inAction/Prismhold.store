# Deploy: Frontend (Vercel) + Backend (Render) + MongoDB Atlas

This project is set up for:

- **Frontend** → **Vercel** (static site)
- **Backend** → **Render** (Node.js API)
- **Database** → **MongoDB Atlas**

---

## 1. Database: MongoDB Atlas

1. Create a cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Get the connection string (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/prismhold?retryWrites=true&w=majority`).
3. Keep this for the **Backend** step.

---

## 2. Backend: Render

1. Go to [Render](https://render.com) → **New** → **Web Service**.
2. Connect your repo. Set:
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
3. **Environment variables** (Render dashboard → Environment):
   - `MONGO_URI` = your MongoDB Atlas connection string
   - `JWT_SECRET` = a long random string (e.g. `openssl rand -base64 32`)
   - `RAZORPAY_KEY_ID` = Razorpay Key ID (public key is sent to frontend by API)
   - `RAZORPAY_KEY_SECRET` = Razorpay Key Secret
   - `CORS_ORIGIN` = your Vercel frontend URL, e.g. `https://your-app.vercel.app`
   - Optionally: `GOOGLE_CLIENT_ID` for Google sign-in
4. Deploy. Note the service URL, e.g. `https://prismhold-api.onrender.com`.

---

## 3. Frontend: Vercel

1. **Set API URL in frontend**  
   Replace `YOUR_BACKEND_DOMAIN` with your Render service host (no `https://` or `.onrender.com` in the placeholder; the code already has the full URL pattern).

   In both:
   - `frontend/public/index.html`
   - `frontend/admin/admin.html`  
   (and `frontend/public/admin/index.html` if you use that copy)

   Set:
   ```js
   const API_BASE = "https://YOUR_ACTUAL_RENDER_SERVICE.onrender.com";
   ```
   Example: if Render URL is `https://prismhold-api.onrender.com`, then:
   ```js
   const API_BASE = "https://prismhold-api.onrender.com";
   ```

2. **Build CSS (optional but recommended)**  
   From repo root:
   ```bash
   npm run build-css
   ```
   This compiles Tailwind into `frontend/public/tailwind.css`. Commit that file so Vercel serves it.

3. **Deploy on Vercel**
   - [Vercel](https://vercel.com) → **Add New Project** → import your repo.
   - **Root Directory:** leave as `.` (repo root).
   - **Build Command:** `npm run build` (runs `build-css`).
   - **Output Directory:** `frontend/public`
   - **Install Command:** `npm install`
   - Deploy.

4. **Admin panel**  
   - Main admin page: `https://your-app.vercel.app/admin/` (serves `frontend/public/admin/index.html`).
   - Ensure the same `API_BASE` is set in that file (or in the source `frontend/admin/admin.html` before copying to `public/admin/index.html`).

---

## 4. After deploy

- **CORS:** Backend allows origins from `CORS_ORIGIN` (and the default list). Set `CORS_ORIGIN` on Render to your exact Vercel URL (e.g. `https://prismhold-store.vercel.app`).
- **Razorpay:** Frontend uses only the **public** key; it receives it from the backend when creating an order. Keep `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in Render env only.
- **No localhost:** All references to localhost have been removed from production code. Frontend talks only to `API_BASE` (Render).

---

## 5. Summary

| Component   | Where       | What to set |
|------------|-------------|-------------|
| Database   | MongoDB Atlas | Connection string → `MONGO_URI` on Render |
| Backend    | Render      | Root: `backend`, Start: `npm start`, env: `MONGO_URI`, `JWT_SECRET`, `CORS_ORIGIN`, Razorpay, etc. |
| Frontend   | Vercel      | Root: `.`, Build: `npm run build`, Output: `frontend/public`, and set `API_BASE` in HTML to your Render URL |

Replace placeholders:

- In **frontend HTML**: `YOUR_BACKEND_DOMAIN` → your Render service host (e.g. `prismhold-api` so the URL is `https://prismhold-api.onrender.com`).
- On **Render**: `YOUR_FRONTEND_DOMAIN` in `CORS_ORIGIN` → your Vercel app host (e.g. `prismhold-store.vercel.app`).

---

## 6. Local development

- **Backend only** at `http://localhost:3000`: from repo root run `npm start` (or `cd backend && npm start`). Opening `http://localhost:3000` in the browser shows a short JSON message, not the website — the backend is API-only.
- **To see the site locally**: serve the frontend and point it at your backend.
  1. In `frontend/public/index.html` (and `frontend/admin/admin.html`) set `API_BASE` to `"http://localhost:3000"` for local API.
  2. Serve the frontend, e.g. from repo root: `npx serve frontend/public -p 5000`
  3. Open `http://localhost:5000` for the store and `http://localhost:5000/admin/` for the admin panel.

**Chrome DevTools CSP message:** A message like *Connecting to 'http://localhost:3000/.well-known/appspecific/com.chrome.devtools.json' violates Content Security Policy* comes from Chrome DevTools, not your app. You can ignore it or disable that DevTools feature; it does not affect your app.
