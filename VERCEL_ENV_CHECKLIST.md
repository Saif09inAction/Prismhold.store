# ✅ Vercel Environment Variables Checklist

Make sure these are set in **Vercel Dashboard → Settings → Environment Variables**:

## Required Variables

```
MONGODB_URI=mongodb+srv://saifsalmani224_db_user:L8gAUZ6BA9WsQr4t@prismhold.0wv3qh6.mongodb.net/prismhold?retryWrites=true&w=majority
```

**⚠️ IMPORTANT:** 
- Must include `/prismhold` (database name) before the `?`
- Password must be correct: `L8gAUZ6BA9WsQr4t`
- No spaces or extra characters

```
JWT_SECRET=Qp7wJg9zN4tL2yF8cR0uVb3xK6mH1sD5aB7cD9eF1gH3iJ5kL7mN9oP1qR3sT5
```

```
RAZORPAY_KEY_ID=rzp_test_S7Cvcbo4hOcrBI
```

```
RAZORPAY_KEY_SECRET=guIOEOlvq5mlkavmhXHwUyJ2
```

```
NODE_ENV=production
```

## How to Set in Vercel

1. Go to: https://vercel.com/dashboard
2. Click your project: `prismhold_store`
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - **Key**: `MONGODB_URI`
   - **Value**: `mongodb+srv://saifsalmani224_db_user:L8gAUZ6BA9WsQr4t@prismhold.0wv3qh6.mongodb.net/prismhold?retryWrites=true&w=majority`
   - **Environment**: Select "Production", "Preview", and "Development"
5. Repeat for all variables above
6. Click **Save**
7. **Redeploy** your project (or wait for auto-deploy)

## Test After Deployment

Visit: `https://your-vercel-url.vercel.app/api/health`

Should return:
```json
{
  "status": "ok",
  "mongodb": {
    "status": "connected",
    "readyState": 1
  }
}
```

If `mongodb.status` is `"disconnected"`, check:
- ✅ MongoDB URI is correct
- ✅ Password is correct
- ✅ Database name `/prismhold` is included
- ✅ MongoDB Atlas Network Access allows `0.0.0.0/0`
