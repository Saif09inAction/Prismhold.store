# ✅ Deployment Checklist

Use this checklist to ensure you don't miss any steps when deploying.

## Before Deployment

- [ ] **MongoDB Atlas Setup**
  - [ ] Created MongoDB Atlas account
  - [ ] Created cluster (M0 Free tier is fine)
  - [ ] Created database user (saved username & password)
  - [ ] Whitelisted IP address (0.0.0.0/0 for all IPs)
  - [ ] Copied connection string
  - [ ] Tested connection string locally

- [ ] **Razorpay Setup**
  - [ ] Created Razorpay account
  - [ ] Got Test Mode API keys (for testing)
  - [ ] Got Live Mode API keys (for production)
  - [ ] Saved Key ID and Key Secret securely

- [ ] **Code Preparation**
  - [ ] All code is committed to Git
  - [ ] `.env` file is in `.gitignore` (not committed!)
  - [ ] Code pushed to GitHub
  - [ ] Tested locally - everything works

- [ ] **Environment Variables Prepared**
  - [ ] `MONGODB_URI` - MongoDB Atlas connection string
  - [ ] `PORT` - Usually 3000 (or auto-set by platform)
  - [ ] `JWT_SECRET` - Strong random string generated
  - [ ] `RAZORPAY_KEY_ID` - Your Razorpay Key ID
  - [ ] `RAZORPAY_KEY_SECRET` - Your Razorpay Key Secret
  - [ ] `GOOGLE_CLIENT_ID` - (Optional) If using Google OAuth

## During Deployment

- [ ] **Platform Setup**
  - [ ] Created account on deployment platform (Railway/Render/Heroku)
  - [ ] Connected GitHub repository
  - [ ] Platform detected Node.js app correctly

- [ ] **Environment Variables**
  - [ ] Added `MONGODB_URI` to platform
  - [ ] Added `JWT_SECRET` to platform
  - [ ] Added `RAZORPAY_KEY_ID` to platform
  - [ ] Added `RAZORPAY_KEY_SECRET` to platform
  - [ ] Verified all variables are set (no typos!)

- [ ] **Deployment**
  - [ ] Deployment started successfully
  - [ ] Build completed without errors
  - [ ] App is running (status shows "Running" or "Live")
  - [ ] Got deployment URL

## After Deployment

- [ ] **Testing**
  - [ ] Homepage loads correctly
  - [ ] Can create a new user account
  - [ ] Can login with created account
  - [ ] Products display correctly
  - [ ] Can add items to cart
  - [ ] Can proceed to checkout
  - [ ] Payment integration works (test with test card)
  - [ ] Admin panel accessible at `/admin`

- [ ] **Admin Setup**
  - [ ] Created admin user (using `create-admin.js` or manually)
  - [ ] Can login to admin panel
  - [ ] Admin can view dashboard
  - [ ] Admin can manage products
  - [ ] Admin can view orders

- [ ] **Razorpay Configuration**
  - [ ] Updated webhook URL in Razorpay dashboard
  - [ ] Webhook URL: `https://your-domain.com/api/payments/razorpay/webhook`
  - [ ] Enabled webhook events: `payment.captured`, `payment.failed`, `payment.authorized`
  - [ ] Tested webhook (check Razorpay dashboard logs)

- [ ] **Security**
  - [ ] `JWT_SECRET` is a strong random string (not default)
  - [ ] MongoDB password is strong
  - [ ] Using production Razorpay keys (not test keys)
  - [ ] HTTPS is enabled (SSL certificate)
  - [ ] `.env` file is NOT in repository

- [ ] **Optional: Custom Domain**
  - [ ] Purchased domain name
  - [ ] Added DNS records (A record or CNAME)
  - [ ] Configured custom domain in platform
  - [ ] SSL certificate generated automatically
  - [ ] Updated `API_BASE_URL` if needed (usually auto-detected)

## Post-Deployment Monitoring

- [ ] **Monitoring Setup**
  - [ ] Checked deployment logs for errors
  - [ ] Set up error monitoring (optional: Sentry, etc.)
  - [ ] Set up uptime monitoring (optional: UptimeRobot, etc.)

- [ ] **Documentation**
  - [ ] Saved deployment URL
  - [ ] Saved admin credentials securely
  - [ ] Documented any custom configurations

## Quick Test Commands

After deployment, test these endpoints:

```bash
# Health check
curl https://your-domain.com/api/health

# Get products (public)
curl https://your-domain.com/api/products

# Test admin login (replace with your credentials)
curl -X POST https://your-domain.com/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"yourpassword"}'
```

## Common Issues & Solutions

### Issue: App shows "Application Error"
- ✅ Check environment variables are all set
- ✅ Check MongoDB connection string is correct
- ✅ Check deployment logs for specific errors

### Issue: Can't connect to MongoDB
- ✅ Verify MongoDB Atlas IP whitelist includes all IPs (0.0.0.0/0)
- ✅ Check connection string has correct password
- ✅ Verify database user has correct permissions

### Issue: Payment not working
- ✅ Verify Razorpay keys are correct (check Test vs Live mode)
- ✅ Check webhook URL is correct in Razorpay dashboard
- ✅ Test with Razorpay test card: 4111 1111 1111 1111

### Issue: Admin panel not accessible
- ✅ Verify admin user exists in database
- ✅ Check admin user has `isAdmin: true`
- ✅ Clear browser cache and localStorage
- ✅ Try incognito/private browsing mode

---

**🎉 Once all items are checked, your app is ready for production!**
