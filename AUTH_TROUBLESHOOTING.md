# Auth Troubleshooting (Phone OTP, Google, reCAPTCHA)

## 1. E11000 duplicate key error (email: null)

**Cause:** MongoDB has an old non-sparse unique index on `email`, so only one user can have `email: null` (phone-only users).

**Fix (run once):**
```bash
node backend/fix-email-index.js
```
Requires `MONGO_URI` or `MONGODB_URI` in `.env`. Run from project root.

The backend also runs an automatic migration on startup to drop this index. If it still fails, run the script manually.

---

## 2. reCAPTCHA 401 Unauthorized

**Cause:** Your domain is not in the reCAPTCHA key's allowed domains.

**Fix:**
1. Go to [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. Select the key used for Firebase Phone Auth
3. Under **Domains**, add:
   - `prismhold.store`
   - `www.prismhold.store`
4. Save

---

## 3. Firebase init.json 404 (Google login)

**Symptom:** Blank white popup, `GET ...firebaseapp.com/__/firebase/init.json 404`.

**Possible fixes:**
- Try in a **different browser** or **incognito**
- Disable browser extensions that block scripts
- Ensure **prismhold.store** is in Firebase Console → Authentication → Authorized domains

---

## 4. Firebase auth is not configured (503)

**Cause:** Backend (Render) missing Firebase env vars.

**Required on Render:**
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY` (full key with `\n` as literal characters, in quotes)

Get these from Firebase Console → Project Settings → Service accounts → Generate new key.
