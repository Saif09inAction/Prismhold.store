require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { randomUUID } = require('crypto');
const Razorpay = require('razorpay');

// Razorpay Payment Gateway Configuration
// Get these from Razorpay Dashboard: https://dashboard.razorpay.com
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'YOUR_KEY_ID';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'YOUR_KEY_SECRET';

// Validate Razorpay credentials
if (!RAZORPAY_KEY_ID || RAZORPAY_KEY_ID === 'YOUR_KEY_ID' || !RAZORPAY_KEY_SECRET || RAZORPAY_KEY_SECRET === 'YOUR_KEY_SECRET') {
    console.warn('⚠️  Razorpay credentials not configured. Payment features will not work.');
    console.warn('   Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file');
} else {
    console.log('✅ Razorpay credentials loaded successfully');
}

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET
});

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/prismhold';

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads - using memory storage to store in MongoDB
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Path configuration
const FRONTEND_PUBLIC_PATH = path.join(__dirname, '../frontend/public');
const FRONTEND_ADMIN_PATH = path.join(__dirname, '../frontend/admin');
const UPLOADS_PATH = path.join(__dirname, 'uploads');

// Serve static files from frontend/public (images, CSS, JS, etc.)
app.use(express.static(FRONTEND_PUBLIC_PATH));
app.use('/uploads', express.static(UPLOADS_PATH));

// Serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(FRONTEND_PUBLIC_PATH, 'index.html'));
});

// Serve admin.html for admin route
app.get('/admin', (req, res) => {
    res.sendFile(path.join(FRONTEND_ADMIN_PATH, 'admin.html'));
});


// MongoDB Connection
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('✅ Connected to MongoDB successfully');
}).catch(err => {
    console.error('❌ MongoDB connection error:', err);
    console.error('Please check your MONGODB_URI environment variable');
    // Don't exit - let the server start but log the error
    // API routes will handle the error gracefully
});

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB reconnected successfully');
});

// MongoDB Schemas
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: String, // null for Google OAuth users
    displayName: String,
    isAdmin: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const profileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    email: String,
    displayName: String
});

const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: Array, default: [] }
});

const addressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: String,
    street: String,
    city: String,
    zip: String,
    phone: String
});

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: Array,
    subtotal: Number,
    total: Number,
    discount: Number,
    payment: String,
    address: Object,
    status: { type: String, default: 'Pending' }, // Pending, Processing, Completed, Failed
    paymentStatus: { type: String, default: 'Pending' }, // Pending, Success, Failed
    razorpayOrderId: String, // Razorpay order ID
    razorpayPaymentId: String, // Razorpay payment ID
    razorpaySignature: String, // Razorpay payment signature
    createdAt: { type: Date, default: Date.now },
    date: String,
    promoCode: String
});

const productSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 }, // Discount percentage
    image: String, // Main image ID (MongoDB ObjectId)
    images: [String], // Multiple image IDs (MongoDB ObjectIds)
    category: String,
    material: String,
    description: String,
    details: [String],
    views: { type: Number, default: 0 },
    orders: { type: Number, default: 0 },
    favorites: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: String,
    coverImage: String, // Cover image for category
    createdAt: { type: Date, default: Date.now }
});

const helpRequestSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    email: String,
    name: String,
    subject: String,
    message: String,
    status: { type: String, default: 'Pending' }, // Pending, In Progress, Resolved
    replies: [{
        message: String,
        fromAdmin: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
});

const promoCodeSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, uppercase: true },
    description: String,
    discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    discountValue: { type: Number, required: true },
    applicableTo: { type: String, enum: ['all', 'specific'], default: 'all' },
    productIds: [{ type: Number }], // Only used if applicableTo is 'specific'
    minPurchase: { type: Number, default: 0 },
    maxDiscount: Number, // Maximum discount amount (for percentage)
    validFrom: { type: Date, default: Date.now },
    validUntil: Date,
    usageLimit: Number, // Total usage limit
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

// Image schema to store images in MongoDB
const imageSchema = new mongoose.Schema({
    filename: String,
    originalName: String,
    mimeType: String,
    data: Buffer, // Image binary data
    size: Number,
    createdAt: { type: Date, default: Date.now }
});

const heroSchema = new mongoose.Schema({
    title: { type: String, default: 'The Art of Accessory.' },
    subtitle: { type: String, default: 'HOLD Luxury in your HAND. Curated collections.' },
    brandTag: { type: String, default: 'PRISM HOLD' },
    textAlign: { type: String, enum: ['left', 'center', 'right'], default: 'center' },
    fontSize: { type: Number, default: 48 }, // Title font size (pixels) - kept for backward compatibility
    titleFontSize: { type: Number, default: 48 }, // Title font size (pixels)
    subtitleFontSize: { type: Number, default: 20 }, // Subtitle font size (pixels)
    fontWeight: { type: String, enum: ['normal', 'semibold', 'bold', 'bolder'], default: 'normal' },
    textDecoration: { type: String, enum: ['none', 'underline', 'line-through'], default: 'none' },
    color: { type: String, default: '#0f172a' },
    images: { type: [String], default: [] }, // Store image IDs (MongoDB ObjectIds)
    // Visibility controls
    showContainer: { type: Boolean, default: true }, // White container behind tagline
    showButton: { type: Boolean, default: true }, // Discover Collection button
    showBrandTag: { type: Boolean, default: true }, // Brand tag visibility
    showTitle: { type: Boolean, default: true }, // Title visibility
    showSubtitle: { type: Boolean, default: true }, // Subtitle visibility
    updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Profile = mongoose.model('Profile', profileSchema);
const Cart = mongoose.model('Cart', cartSchema);
const Address = mongoose.model('Address', addressSchema);
const Order = mongoose.model('Order', orderSchema);
const Product = mongoose.model('Product', productSchema);
const Category = mongoose.model('Category', categorySchema);
const HelpRequest = mongoose.model('HelpRequest', helpRequestSchema);
const PromoCode = mongoose.model('PromoCode', promoCodeSchema);
const Hero = mongoose.model('Hero', heroSchema);
const Image = mongoose.model('Image', imageSchema);

// Helper function to convert image ID/URL to proper URL
function convertImageToUrl(imageIdOrUrl) {
    if (!imageIdOrUrl) return null;
    // If it's already a URL (starts with /uploads/ or http), return as is
    if (typeof imageIdOrUrl === 'string' && (imageIdOrUrl.startsWith('/uploads/') || imageIdOrUrl.startsWith('http'))) {
        return imageIdOrUrl;
    }
    // If it's a MongoDB ObjectId (24 hex characters), convert to API URL
    if (typeof imageIdOrUrl === 'string' && /^[0-9a-fA-F]{24}$/.test(imageIdOrUrl)) {
        return `/api/images/${imageIdOrUrl}`;
    }
    return imageIdOrUrl;
}

// Helper function to convert product images
function convertProductImages(product) {
    const productObj = product.toObject ? product.toObject() : product;
    if (productObj.image) {
        productObj.image = convertImageToUrl(productObj.image);
    }
    if (productObj.images && Array.isArray(productObj.images)) {
        productObj.images = productObj.images.map(img => convertImageToUrl(img)).filter(Boolean);
    }
    return productObj;
}

// Helper function to convert hero images
function convertHeroImages(hero) {
    if (!hero) return hero;
    const heroObj = hero.toObject ? hero.toObject() : hero;
    if (heroObj.images && Array.isArray(heroObj.images)) {
        heroObj.images = heroObj.images.map(img => convertImageToUrl(img)).filter(Boolean);
    }
    return heroObj;
}

// JWT Authentication Middleware
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid token' });
    }
};

// Admin Authentication Middleware
const authenticateAdmin = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        if (!user.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid token' });
    }
};

// Auth Routes
app.post('/api/auth/signup', async (req, res) => {
    try {
        if (!checkMongoConnection()) {
            console.error('[API] MongoDB not connected for signup');
            return res.status(503).json({ 
                error: 'Database connection not available',
                details: 'Please check server configuration'
            });
        }
        
        const { email, password, displayName } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            email,
            password: hashedPassword,
            displayName
        });
        await user.save();

        // Create profile
        const profile = new Profile({
            userId: user._id,
            email,
            displayName
        });
        await profile.save();

        // Create cart
        const cart = new Cart({
            userId: user._id,
            items: []
        });
        await cart.save();

        const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        
        res.json({
            user: {
                uid: user._id.toString(),
                email: user.email,
                displayName: user.displayName
            },
            token
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Signup failed' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await User.findOne({ email });
        if (!user || !user.password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        
        res.json({
            user: {
                uid: user._id.toString(),
                email: user.email,
                displayName: user.displayName
            },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

app.post('/api/auth/google', async (req, res) => {
    try {
        const { idToken } = req.body;
        
        if (!idToken) {
            return res.status(400).json({ error: 'ID token is required' });
        }

        // Verify Google token (you'll need to set GOOGLE_CLIENT_ID)
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        
        let user = await User.findOne({ email: payload.email });
        
        if (!user) {
            user = new User({
                email: payload.email,
                displayName: payload.name,
                password: null // Google OAuth users don't have password
            });
            await user.save();

            // Create profile
            const profile = new Profile({
                userId: user._id,
                email: payload.email,
                displayName: payload.name
            });
            await profile.save();

            // Create cart
            const cart = new Cart({
                userId: user._id,
                items: []
            });
            await cart.save();
        }

        const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        
        res.json({
            user: {
                uid: user._id.toString(),
                email: user.email,
                displayName: user.displayName
            },
            token
        });
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(500).json({ error: 'Google authentication failed' });
    }
});

// Profile Routes
app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
        let profile = await Profile.findOne({ userId: req.user._id });
        if (!profile) {
            profile = new Profile({
                userId: req.user._id,
                email: req.user.email,
                displayName: req.user.displayName
            });
            await profile.save();
        }
        res.json(profile);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
});

app.put('/api/profile', authenticateToken, async (req, res) => {
    try {
        const { email, displayName } = req.body;
        await Profile.findOneAndUpdate(
            { userId: req.user._id },
            { email, displayName },
            { upsert: true, new: true }
        );
        res.json({ success: true });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Cart Routes
app.get('/api/cart', authenticateToken, async (req, res) => {
    try {
        let cart = await Cart.findOne({ userId: req.user._id });
        if (!cart) {
            cart = new Cart({ userId: req.user._id, items: [] });
            await cart.save();
        }
        res.json(cart);
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({ error: 'Failed to get cart' });
    }
});

app.put('/api/cart', authenticateToken, async (req, res) => {
    try {
        const { items } = req.body;
        await Cart.findOneAndUpdate(
            { userId: req.user._id },
            { items },
            { upsert: true, new: true }
        );
        res.json({ success: true });
    } catch (error) {
        console.error('Update cart error:', error);
        res.status(500).json({ error: 'Failed to update cart' });
    }
});

// Address Routes
app.get('/api/addresses', authenticateToken, async (req, res) => {
    try {
        const addresses = await Address.find({ userId: req.user._id });
        res.json(addresses.map(addr => ({
            id: addr._id.toString(),
            ...addr.toObject()
        })));
    } catch (error) {
        console.error('Get addresses error:', error);
        res.status(500).json({ error: 'Failed to get addresses' });
    }
});

app.post('/api/addresses', authenticateToken, async (req, res) => {
    try {
        const address = new Address({
            userId: req.user._id,
            ...req.body
        });
        await address.save();
        res.json({ id: address._id.toString(), ...address.toObject() });
    } catch (error) {
        console.error('Create address error:', error);
        res.status(500).json({ error: 'Failed to create address' });
    }
});

app.put('/api/addresses/:id', authenticateToken, async (req, res) => {
    try {
        const address = await Address.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            req.body,
            { new: true }
        );
        if (!address) {
            return res.status(404).json({ error: 'Address not found' });
        }
        res.json({ id: address._id.toString(), ...address.toObject() });
    } catch (error) {
        console.error('Update address error:', error);
        res.status(500).json({ error: 'Failed to update address' });
    }
});

app.delete('/api/addresses/:id', authenticateToken, async (req, res) => {
    try {
        const address = await Address.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });
        if (!address) {
            return res.status(404).json({ error: 'Address not found' });
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Delete address error:', error);
        res.status(500).json({ error: 'Failed to delete address' });
    }
});

// Order Routes
app.get('/api/orders', authenticateToken, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user._id })
            .sort({ createdAt: -1 });
        res.json(orders.map(order => ({
            id: order._id.toString(),
            ...order.toObject()
        })));
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Failed to get orders' });
    }
});

// Razorpay Payment Helper Functions
const crypto = require('crypto');

function verifyRazorpaySignature(orderId, paymentId, signature) {
    const text = orderId + '|' + paymentId;
    const generatedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(text)
        .digest('hex');
    return generatedSignature === signature;
}

app.post('/api/orders', authenticateToken, async (req, res) => {
    try {
        const order = new Order({
            userId: req.user._id,
            ...req.body,
            status: 'Pending',
            paymentStatus: 'Pending',
            createdAt: new Date(),
            date: new Date().toLocaleString()
        });
        await order.save();
        
        // Update product order counts
        if (order.items && order.items.length > 0) {
            for (const item of order.items) {
                await Product.findOneAndUpdate(
                    { id: item.id },
                    { $inc: { orders: item.quantity } }
                );
            }
        }
        
        res.json({ id: order._id.toString(), ...order.toObject() });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// Create Razorpay Order
app.post('/api/payments/razorpay/create-order', authenticateToken, async (req, res) => {
    try {
        // Check if Razorpay is configured
        if (!RAZORPAY_KEY_ID || RAZORPAY_KEY_ID === 'YOUR_KEY_ID' || !RAZORPAY_KEY_SECRET || RAZORPAY_KEY_SECRET === 'YOUR_KEY_SECRET') {
            return res.status(500).json({ error: 'Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env file' });
        }
        
        const { orderId, amount } = req.body;
        
        if (!orderId || !amount) {
            return res.status(400).json({ error: 'Order ID and amount are required' });
        }
        
        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }
        
        const order = await Order.findOne({ _id: orderId, userId: req.user._id });
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        const amountInPaisa = Math.round(amount * 100); // Razorpay uses paisa
        
        if (amountInPaisa < 100) { // Minimum 1 rupee
            return res.status(400).json({ error: 'Amount must be at least ₹1' });
        }
        
        // Validate Razorpay credentials first
        if (!RAZORPAY_KEY_ID || RAZORPAY_KEY_ID === 'YOUR_KEY_ID' || !RAZORPAY_KEY_SECRET || RAZORPAY_KEY_SECRET === 'YOUR_KEY_SECRET') {
            throw new Error('Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file');
        }
        
        // Validate Razorpay instance
        if (!razorpay) {
            throw new Error('Razorpay instance not initialized');
        }
        
        console.log('[Razorpay] Creating order:', { orderId, amount, amountInPaisa, userId: req.user._id });
        console.log('[Razorpay] Using Key ID:', RAZORPAY_KEY_ID ? RAZORPAY_KEY_ID.substring(0, 10) + '...' : 'NOT SET');
        console.log('[Razorpay] Key Secret exists:', !!RAZORPAY_KEY_SECRET);
        
        // Validate amount
        if (!amountInPaisa || amountInPaisa < 100) {
            throw new Error('Invalid order amount. Minimum amount is ₹1 (100 paisa)');
        }
        
        // Create Razorpay order
        console.log('[Razorpay] Calling razorpay.orders.create with:', {
            amount: amountInPaisa,
            currency: 'INR',
            receipt: `order_${orderId}`
        });
        
        const razorpayOrder = await razorpay.orders.create({
            amount: amountInPaisa,
            currency: 'INR',
            receipt: `order_${orderId}`,
            notes: {
                orderId: orderId.toString(),
                userId: req.user._id.toString(),
                email: req.user.email || ''
            }
        });
        
        console.log('[Razorpay] Order created successfully:', razorpayOrder.id);
        
        // Update order with Razorpay order ID
        await Order.findByIdAndUpdate(orderId, {
            razorpayOrderId: razorpayOrder.id,
            paymentStatus: 'Pending'
        });
        
        res.json({
            success: true,
            orderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            keyId: RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error('========================================');
        console.error('[Razorpay] Order creation error occurred!');
        console.error('[Razorpay] Error type:', typeof error);
        console.error('[Razorpay] Error constructor:', error?.constructor?.name);
        console.error('[Razorpay] Error keys:', Object.keys(error || {}));
        console.error('[Razorpay] Error message:', error?.message);
        console.error('[Razorpay] Error statusCode:', error?.statusCode);
        console.error('[Razorpay] Error description:', error?.description);
        console.error('[Razorpay] Error error:', error?.error);
        console.error('[Razorpay] Error code:', error?.code);
        console.error('[Razorpay] Error name:', error?.name);
        
        // Try to stringify error safely
        try {
            const errorStr = JSON.stringify(error, Object.getOwnPropertyNames(error), 2);
            console.error('[Razorpay] Full error object:', errorStr);
        } catch (stringifyError) {
            console.error('[Razorpay] Could not stringify error:', stringifyError);
            console.error('[Razorpay] Error as string:', String(error));
            // Try to get error properties manually
            if (error) {
                console.error('[Razorpay] Error properties:', {
                    message: error.message,
                    statusCode: error.statusCode,
                    description: error.description,
                    code: error.code,
                    name: error.name,
                    stack: error.stack?.substring(0, 500)
                });
            }
        }
        console.error('========================================');
        
        // Razorpay errors have a specific structure
        let errorMessage = 'Failed to create payment order';
        let statusCode = 500;
        
        // Try multiple ways to extract error message from Razorpay SDK
        // Razorpay SDK errors can have different structures:
        // 1. error.statusCode + error.description
        // 2. error.statusCode + error.error.description
        // 3. error.message (standard JS Error)
        // 4. error.error (nested error object)
        
        // Check for statusCode first (Razorpay API errors)
        if (error.statusCode) {
            statusCode = error.statusCode;
            // Try to get description from various locations
            errorMessage = error.description 
                || error.error?.description 
                || error.error?.message
                || error.message
                || `Razorpay API error (${error.statusCode})`;
                
            // Provide user-friendly messages for common status codes
            if (error.statusCode === 401) {
                errorMessage = 'Invalid Razorpay credentials. Please check your API keys in .env file';
            } else if (error.statusCode === 400) {
                errorMessage = error.description || error.error?.description || error.error?.message || 'Invalid request to Razorpay. Please check your order details.';
            } else if (error.statusCode === 429) {
                errorMessage = 'Too many requests. Please try again in a moment.';
            } else if (error.statusCode >= 500) {
                errorMessage = 'Razorpay server error. Please try again later.';
            }
        } 
        // Handle standard JavaScript errors
        else if (error.message) {
            errorMessage = error.message;
        }
        // Handle Razorpay error object structure (nested error)
        else if (error.error) {
            if (typeof error.error === 'string') {
                errorMessage = error.error;
            } else if (error.error.description) {
                errorMessage = error.error.description;
            } else if (error.error.message) {
                errorMessage = error.error.message;
            } else if (error.error.code) {
                errorMessage = `Razorpay error: ${error.error.code}`;
            } else {
                // Try to extract any meaningful info from error.error
                try {
                    const errorStr = JSON.stringify(error.error);
                    if (errorStr && errorStr !== '{}' && errorStr !== 'null') {
                        errorMessage = errorStr.substring(0, 200);
                    }
                } catch (e) {
                    errorMessage = 'Razorpay API error occurred';
                }
            }
        }
        // Fallback - ensure we always have a message
        else {
            const errorStr = String(error);
            errorMessage = (errorStr !== '[object Object]' && errorStr !== 'undefined') 
                ? errorStr 
                : 'Unknown error occurred while creating payment order. Please check server logs for details.';
        }
        
        // Final safety check - never send undefined or empty
        if (!errorMessage || errorMessage === 'undefined' || errorMessage.trim() === '' || typeof errorMessage !== 'string') {
            // Last resort: try to extract ANY information from the error
            if (error) {
                if (error.toString && error.toString() !== '[object Object]') {
                    errorMessage = error.toString();
                } else if (error.constructor && error.constructor.name) {
                    errorMessage = `${error.constructor.name}: An error occurred while creating payment order`;
                } else {
                    errorMessage = 'An unexpected error occurred while creating payment order. Please check server logs for details.';
                }
            } else {
                errorMessage = 'An unexpected error occurred while creating payment order. Please check server logs for details.';
            }
        }
        
        // Ensure errorMessage is a string and not "undefined"
        errorMessage = String(errorMessage);
        if (errorMessage === 'undefined' || errorMessage.trim() === '') {
            errorMessage = 'An unexpected error occurred while creating payment order. Please check server logs for details.';
        }
        
        console.error('[Razorpay] Final error message:', errorMessage);
        console.error('[Razorpay] Sending response with status:', statusCode);
        console.error('[Razorpay] Response payload:', JSON.stringify({ error: errorMessage }));
        
        // Always send a valid JSON response
        res.status(statusCode).json({ 
            error: errorMessage,
            success: false 
        });
    }
});

// Verify Razorpay Payment
app.post('/api/payments/razorpay/verify', authenticateToken, async (req, res) => {
    try {
        const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
        
        if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
            return res.status(400).json({ error: 'Missing payment details' });
        }
        
        const order = await Order.findOne({ _id: orderId, userId: req.user._id });
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        // Verify signature
        const isValidSignature = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
        
        if (!isValidSignature) {
            order.paymentStatus = 'Failed';
            order.status = 'Failed';
            await order.save();
            return res.status(400).json({ error: 'Invalid payment signature' });
        }
        
        // Verify payment with Razorpay
        try {
            const payment = await razorpay.payments.fetch(razorpayPaymentId);
            
            if (payment.status === 'captured' || payment.status === 'authorized') {
                order.paymentStatus = 'Success';
                order.status = 'Processing';
                order.razorpayOrderId = razorpayOrderId;
                order.razorpayPaymentId = razorpayPaymentId;
                order.razorpaySignature = razorpaySignature;
                await order.save();
                
                res.json({ success: true, message: 'Payment verified successfully' });
            } else {
                order.paymentStatus = 'Failed';
                order.status = 'Failed';
                await order.save();
                res.status(400).json({ error: 'Payment not completed' });
            }
        } catch (error) {
            console.error('Razorpay payment fetch error:', error);
            order.paymentStatus = 'Failed';
            order.status = 'Failed';
            await order.save();
            res.status(500).json({ error: 'Failed to verify payment' });
        }
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ error: 'Payment verification failed' });
    }
});

// Razorpay Webhook Handler
app.post('/api/payments/razorpay/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        const webhookSignature = req.headers['x-razorpay-signature'];
        const webhookBody = req.body.toString();
        
        // Verify webhook signature
        const expectedSignature = crypto
            .createHmac('sha256', RAZORPAY_KEY_SECRET)
            .update(webhookBody)
            .digest('hex');
        
        if (webhookSignature !== expectedSignature) {
            return res.status(400).json({ error: 'Invalid webhook signature' });
        }
        
        const event = JSON.parse(webhookBody);
        const { payload } = event;
        
        if (event.event === 'payment.captured' || event.event === 'payment.authorized') {
            const order = await Order.findOne({ razorpayOrderId: payload.payment.entity.order_id });
            if (order) {
                order.paymentStatus = 'Success';
                order.status = 'Processing';
                order.razorpayPaymentId = payload.payment.entity.id;
                await order.save();
            }
        } else if (event.event === 'payment.failed') {
            const order = await Order.findOne({ razorpayOrderId: payload.payment.entity.order_id });
            if (order) {
                order.paymentStatus = 'Failed';
                order.status = 'Failed';
                await order.save();
            }
        }
        
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Razorpay webhook error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

// Check Payment Status
app.get('/api/payments/razorpay/status/:orderId', authenticateToken, async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.orderId, userId: req.user._id });
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        if (!order.razorpayOrderId) {
            return res.json({
                paymentStatus: order.paymentStatus || 'Pending',
                orderStatus: order.status
            });
        }
        
        // Fetch payment status from Razorpay
        try {
            const razorpayOrder = await razorpay.orders.fetch(order.razorpayOrderId);
            const payments = await razorpay.orders.fetchPayments(order.razorpayOrderId);
            
            if (payments.items && payments.items.length > 0) {
                const payment = payments.items[0];
                if (payment.status === 'captured' || payment.status === 'authorized') {
                    order.paymentStatus = 'Success';
                    order.status = 'Processing';
                    if (!order.razorpayPaymentId) {
                        order.razorpayPaymentId = payment.id;
                    }
                    await order.save();
                } else if (payment.status === 'failed') {
                    order.paymentStatus = 'Failed';
                    order.status = 'Failed';
                    await order.save();
                }
            }
            
            res.json({
                paymentStatus: order.paymentStatus,
                orderStatus: order.status,
                razorpayOrder: razorpayOrder
            });
        } catch (error) {
            console.error('Razorpay status fetch error:', error);
            res.json({
                paymentStatus: order.paymentStatus || 'Pending',
                orderStatus: order.status
            });
        }
    } catch (error) {
        console.error('Payment status check error:', error);
        res.status(500).json({ error: 'Failed to check payment status' });
    }
});

app.put('/api/orders/:id', authenticateToken, async (req, res) => {
    try {
        const order = await Order.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            req.body,
            { new: true }
        );
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json({ id: order._id.toString(), ...order.toObject() });
    } catch (error) {
        console.error('Update order error:', error);
        res.status(500).json({ error: 'Failed to update order' });
    }
});

// ==================== ADMIN ROUTES ====================

// Admin Login
app.post('/api/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await User.findOne({ email });
        if (!user || !user.password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (!user.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id, email: user.email, isAdmin: true }, JWT_SECRET, { expiresIn: '7d' });
        
        res.json({
            user: {
                uid: user._id.toString(),
                email: user.email,
                displayName: user.displayName,
                isAdmin: true
            },
            token
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// ==================== PRODUCTS MANAGEMENT ====================
app.get('/api/admin/products', authenticateAdmin, async (req, res) => {
    try {
        const products = await Product.find().sort({ id: 1 });
        // Convert image IDs to URLs for admin panel
        const productsWithUrls = products.map(convertProductImages);
        res.json(productsWithUrls);
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ error: 'Failed to get products' });
    }
});

app.post('/api/admin/products', authenticateAdmin, async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.json(convertProductImages(product));
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

app.put('/api/admin/products/:id', authenticateAdmin, async (req, res) => {
    try {
        const product = await Product.findOneAndUpdate(
            { _id: req.params.id },
            req.body,
            { new: true }
        );
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(convertProductImages(product));
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

app.delete('/api/admin/products/:id', authenticateAdmin, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

// ==================== CATEGORIES MANAGEMENT ====================
app.get('/api/admin/categories', authenticateAdmin, async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.json(categories);
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Failed to get categories' });
    }
});

app.post('/api/admin/categories', authenticateAdmin, async (req, res) => {
    try {
        const category = new Category(req.body);
        await category.save();
        res.json(category);
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ error: 'Failed to create category' });
    }
});

app.put('/api/admin/categories/:id', authenticateAdmin, async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json(category);
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({ error: 'Failed to update category' });
    }
});

app.delete('/api/admin/categories/:id', authenticateAdmin, async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ error: 'Failed to delete category' });
    }
});

// ==================== ORDERS MANAGEMENT ====================
app.get('/api/admin/orders', authenticateAdmin, async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('userId', 'email displayName')
            .sort({ createdAt: -1 });
        res.json(orders.map(order => ({
            id: order._id.toString(),
            ...order.toObject()
        })));
    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({ error: 'Failed to get orders' });
    }
});

app.put('/api/admin/orders/:id/status', authenticateAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json({ id: order._id.toString(), ...order.toObject() });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

// ==================== USERS MANAGEMENT ====================
app.get('/api/admin/users', authenticateAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users.map(user => ({
            id: user._id.toString(),
            email: user.email,
            displayName: user.displayName,
            isAdmin: user.isAdmin,
            createdAt: user.createdAt
        })));
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to get users' });
    }
});

app.put('/api/admin/users/:id', authenticateAdmin, async (req, res) => {
    try {
        const { isAdmin, displayName } = req.body;
        const updateData = {};
        if (isAdmin !== undefined) updateData.isAdmin = isAdmin;
        if (displayName) updateData.displayName = displayName;
        
        const user = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({
            id: user._id.toString(),
            email: user.email,
            displayName: user.displayName,
            isAdmin: user.isAdmin,
            createdAt: user.createdAt
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

app.delete('/api/admin/users/:id', authenticateAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (user.isAdmin) {
            return res.status(400).json({ error: 'Cannot delete admin user' });
        }
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// ==================== HELP REQUESTS MANAGEMENT ====================
app.get('/api/admin/help-requests', authenticateAdmin, async (req, res) => {
    try {
        const requests = await HelpRequest.find()
            .populate('userId', 'email displayName')
            .sort({ createdAt: -1 });
        res.json(requests.map(req => ({
            id: req._id.toString(),
            ...req.toObject()
        })));
    } catch (error) {
        console.error('Get help requests error:', error);
        res.status(500).json({ error: 'Failed to get help requests' });
    }
});

app.post('/api/help-requests', authenticateToken, async (req, res) => {
    try {
        const helpRequest = new HelpRequest({
            userId: req.user._id,
            email: req.user.email,
            ...req.body
        });
        await helpRequest.save();
        res.json({ id: helpRequest._id.toString(), ...helpRequest.toObject() });
    } catch (error) {
        console.error('Create help request error:', error);
        res.status(500).json({ error: 'Failed to create help request' });
    }
});

app.get('/api/help-requests', authenticateToken, async (req, res) => {
    try {
        const requests = await HelpRequest.find({ userId: req.user._id })
            .sort({ createdAt: -1 });
        res.json(requests.map(req => ({
            id: req._id.toString(),
            ...req.toObject()
        })));
    } catch (error) {
        console.error('Get help requests error:', error);
        res.status(500).json({ error: 'Failed to get help requests' });
    }
});

app.post('/api/help-requests/:id/reply', authenticateToken, async (req, res) => {
    try {
        const { message } = req.body;
        const helpRequest = await HelpRequest.findOne({
            _id: req.params.id,
            userId: req.user._id
        });
        
        if (!helpRequest) {
            return res.status(404).json({ error: 'Help request not found' });
        }
        
        helpRequest.replies.push({
            message,
            fromAdmin: false,
            createdAt: new Date()
        });
        await helpRequest.save();
        
        res.json({ id: helpRequest._id.toString(), ...helpRequest.toObject() });
    } catch (error) {
        console.error('Add reply error:', error);
        res.status(500).json({ error: 'Failed to add reply' });
    }
});

app.post('/api/admin/help-requests/:id/reply', authenticateAdmin, async (req, res) => {
    try {
        const { message } = req.body;
        const helpRequest = await HelpRequest.findById(req.params.id);
        
        if (!helpRequest) {
            return res.status(404).json({ error: 'Help request not found' });
        }
        
        helpRequest.replies.push({
            message,
            fromAdmin: true,
            createdAt: new Date()
        });
        helpRequest.status = 'In Progress';
        await helpRequest.save();
        
        res.json({ id: helpRequest._id.toString(), ...helpRequest.toObject() });
    } catch (error) {
        console.error('Add admin reply error:', error);
        res.status(500).json({ error: 'Failed to add reply' });
    }
});

app.put('/api/admin/help-requests/:id', authenticateAdmin, async (req, res) => {
    try {
        const helpRequest = await HelpRequest.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!helpRequest) {
            return res.status(404).json({ error: 'Help request not found' });
        }
        res.json({ id: helpRequest._id.toString(), ...helpRequest.toObject() });
    } catch (error) {
        console.error('Update help request error:', error);
        res.status(500).json({ error: 'Failed to update help request' });
    }
});

app.delete('/api/admin/help-requests/:id', authenticateAdmin, async (req, res) => {
    try {
        const helpRequest = await HelpRequest.findByIdAndDelete(req.params.id);
        if (!helpRequest) {
            return res.status(404).json({ error: 'Help request not found' });
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Delete help request error:', error);
        res.status(500).json({ error: 'Failed to delete help request' });
    }
});

// ==================== ADMIN DASHBOARD STATS ====================
app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalOrders = await Order.countDocuments();
        const totalProducts = await Product.countDocuments();
        const pendingHelpRequests = await HelpRequest.countDocuments({ status: 'Pending' });
        
        const totalRevenue = await Order.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]);
        
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('userId', 'email displayName');
        
        res.json({
            totalUsers,
            totalOrders,
            totalProducts,
            pendingHelpRequests,
            totalRevenue: totalRevenue[0]?.total || 0,
            recentOrders: recentOrders.map(order => ({
                id: order._id.toString(),
                ...order.toObject()
            }))
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Failed to get stats' });
    }
});

// Helper function to check MongoDB connection
function checkMongoConnection() {
    return mongoose.connection.readyState === 1; // 1 = connected
}

// ==================== PUBLIC PRODUCTS ENDPOINT ====================
app.get('/api/products', async (req, res) => {
    try {
        if (!checkMongoConnection()) {
            console.error('[API] MongoDB not connected. Connection state:', mongoose.connection.readyState);
            return res.status(503).json({ 
                error: 'Database connection not available',
                details: 'Please check server logs and MongoDB connection'
            });
        }
        const products = await Product.find().sort({ id: 1 });
        console.log(`[API] GET /api/products - Returning ${products.length} products`);
        res.json(products);
    } catch (error) {
        console.error('Get products error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            error: 'Failed to get products',
            details: error.message 
        });
    }
});

app.get('/api/products/recent', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 }).limit(12);
        const productsWithUrls = products.map(convertProductImages);
        res.json(productsWithUrls);
    } catch (error) {
        console.error('Get recent products error:', error);
        res.status(500).json({ error: 'Failed to get recent products' });
    }
});

app.get('/api/products/most-viewed', async (req, res) => {
    try {
        const products = await Product.find().sort({ views: -1 }).limit(10);
        const productsWithUrls = products.map(convertProductImages);
        res.json(productsWithUrls);
    } catch (error) {
        console.error('Get most viewed error:', error);
        res.status(500).json({ error: 'Failed to get most viewed products' });
    }
});

app.get('/api/products/most-ordered', async (req, res) => {
    try {
        const products = await Product.find().sort({ orders: -1 }).limit(10);
        const productsWithUrls = products.map(convertProductImages);
        res.json(productsWithUrls);
    } catch (error) {
        console.error('Get most ordered error:', error);
        res.status(500).json({ error: 'Failed to get most ordered products' });
    }
});

app.get('/api/products/most-loved', async (req, res) => {
    try {
        const products = await Product.find().sort({ favorites: -1 }).limit(10);
        const productsWithUrls = products.map(convertProductImages);
        res.json(productsWithUrls);
    } catch (error) {
        console.error('Get most loved error:', error);
        res.status(500).json({ error: 'Failed to get most loved products' });
    }
});

app.post('/api/products/:id/view', async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        await Product.findOneAndUpdate(
            { id: productId },
            { $inc: { views: 1 } }
        );
        res.json({ success: true });
    } catch (error) {
        console.error('Increment view error:', error);
        res.status(500).json({ error: 'Failed to increment view' });
    }
});

app.get('/api/categories', async (req, res) => {
    try {
        if (!checkMongoConnection()) {
            console.error('[API] MongoDB not connected for categories');
            return res.status(503).json({ 
                error: 'Database connection not available',
                details: 'Please check server configuration'
            });
        }
        const categories = await Category.find().sort({ name: 1 });
        res.json(categories);
    } catch (error) {
        console.error('Get categories error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            error: 'Failed to get categories',
            details: error.message 
        });
    }
});

app.get('/api/categories/most-ordered', async (req, res) => {
    try {
        // Get categories with most orders
        const categoryStats = await Order.aggregate([
            { $unwind: '$items' },
            { $group: { _id: '$items.category', count: { $sum: '$items.quantity' } } },
            { $sort: { count: -1 } },
            { $limit: 3 }
        ]);
        
        const categoryNames = categoryStats.map(stat => stat._id).filter(Boolean);
        const categories = await Category.find({ name: { $in: categoryNames } });
        
        // Sort by order count
        const sortedCategories = categoryNames.map(name => 
            categories.find(cat => cat.name === name)
        ).filter(Boolean);
        
        res.json(sortedCategories);
    } catch (error) {
        console.error('Get most ordered categories error:', error);
        res.status(500).json({ error: 'Failed to get most ordered categories' });
    }
});

app.get('/api/products/by-category/:category', async (req, res) => {
    try {
        const products = await Product.find({ category: req.params.category }).sort({ orders: -1, views: -1 });
        const productsWithUrls = products.map(convertProductImages);
        res.json(productsWithUrls);
    } catch (error) {
        console.error('Get products by category error:', error);
        res.status(500).json({ error: 'Failed to get products by category' });
    }
});

// Recommendation endpoint
app.get('/api/products/recommendations', authenticateToken, async (req, res) => {
    try {
        // Get user's order history
        const userOrders = await Order.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(10);
        
        // Extract categories from user's orders
        const userCategories = new Set();
        userOrders.forEach(order => {
            order.items.forEach(item => {
                if (item.category) userCategories.add(item.category);
            });
        });
        
        // Get products from user's preferred categories
        let recommendations = await Product.find({ 
            category: { $in: Array.from(userCategories) }
        }).sort({ orders: -1, views: -1 }).limit(8);
        
        // If not enough recommendations, add most popular products
        if (recommendations.length < 8) {
            const popular = await Product.find({ 
                _id: { $nin: recommendations.map(p => p._id) }
            }).sort({ orders: -1, views: -1 }).limit(8 - recommendations.length);
            recommendations = [...recommendations, ...popular];
        }
        
        res.json(recommendations);
    } catch (error) {
        console.error('Get recommendations error:', error);
        // Return most popular if error
        try {
            const popular = await Product.find().sort({ orders: -1, views: -1 }).limit(8);
            res.json(popular);
        } catch (e) {
            res.status(500).json({ error: 'Failed to get recommendations' });
        }
    }
});

// ==================== IMAGE UPLOAD ====================
app.post('/api/admin/upload', authenticateAdmin, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        // Save image to MongoDB
        const image = new Image({
            filename: `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(req.file.originalname)}`,
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            data: req.file.buffer,
            size: req.file.size
        });
        
        await image.save();
        
        // Return image ID instead of file path
        res.json({ 
            url: `/api/images/${image._id}`,
            id: image._id.toString()
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
});

// ==================== IMAGE SERVING ====================
app.get('/api/images/:imageId', async (req, res) => {
    try {
        const image = await Image.findById(req.params.imageId);
        if (!image) {
            return res.status(404).json({ error: 'Image not found' });
        }
        
        // Set appropriate content type
        res.contentType(image.mimeType);
        res.send(image.data);
    } catch (error) {
        console.error('Image serve error:', error);
        res.status(500).json({ error: 'Failed to serve image' });
    }
});

// ==================== PROMO CODE MANAGEMENT ====================
app.get('/api/admin/promo-codes', authenticateAdmin, async (req, res) => {
    try {
        const promoCodes = await PromoCode.find().sort({ createdAt: -1 });
        res.json(promoCodes.map(pc => ({
            id: pc._id.toString(),
            ...pc.toObject()
        })));
    } catch (error) {
        console.error('Get promo codes error:', error);
        res.status(500).json({ error: 'Failed to get promo codes' });
    }
});

app.post('/api/admin/promo-codes', authenticateAdmin, async (req, res) => {
    try {
        const promoCode = new PromoCode({
            ...req.body,
            code: req.body.code.toUpperCase()
        });
        await promoCode.save();
        res.json({ id: promoCode._id.toString(), ...promoCode.toObject() });
    } catch (error) {
        console.error('Create promo code error:', error);
        res.status(500).json({ error: 'Failed to create promo code' });
    }
});

app.put('/api/admin/promo-codes/:id', authenticateAdmin, async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (updateData.code) updateData.code = updateData.code.toUpperCase();
        const promoCode = await PromoCode.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        if (!promoCode) {
            return res.status(404).json({ error: 'Promo code not found' });
        }
        res.json({ id: promoCode._id.toString(), ...promoCode.toObject() });
    } catch (error) {
        console.error('Update promo code error:', error);
        res.status(500).json({ error: 'Failed to update promo code' });
    }
});

app.delete('/api/admin/promo-codes/:id', authenticateAdmin, async (req, res) => {
    try {
        const promoCode = await PromoCode.findByIdAndDelete(req.params.id);
        if (!promoCode) {
            return res.status(404).json({ error: 'Promo code not found' });
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Delete promo code error:', error);
        res.status(500).json({ error: 'Failed to delete promo code' });
    }
});

// ==================== HERO SECTION MANAGEMENT ====================
app.get('/api/admin/hero', authenticateAdmin, async (req, res) => {
    try {
        const hero = await Hero.findOne().sort({ updatedAt: -1 });
        res.json(convertHeroImages(hero) || {});
    } catch (error) {
        console.error('Get hero admin error:', error);
        res.status(500).json({ error: 'Failed to get hero content' });
    }
});

app.put('/api/admin/hero', authenticateAdmin, async (req, res) => {
    try {
        const {
            title,
            subtitle,
            brandTag,
            textAlign,
            fontSize,
            titleFontSize,
            subtitleFontSize,
            fontWeight,
            textDecoration,
            color,
            images,
            showContainer,
            showButton,
            showBrandTag,
            showTitle,
            showSubtitle
        } = req.body;

        const payload = {
            ...(title !== undefined && { title }),
            ...(subtitle !== undefined && { subtitle }),
            ...(brandTag !== undefined && { brandTag }),
            ...(textAlign !== undefined && { textAlign }),
            ...(fontSize !== undefined && { fontSize }), // Keep for backward compatibility
            ...(titleFontSize !== undefined && { titleFontSize }),
            ...(subtitleFontSize !== undefined && { subtitleFontSize }),
            ...(fontWeight !== undefined && { fontWeight }),
            ...(textDecoration !== undefined && { textDecoration }),
            ...(color !== undefined && { color }),
            ...(Array.isArray(images) && { images: images.filter(Boolean) }),
            updatedAt: new Date()
        };

        // Always include boolean values if they are provided (even if false)
        // This ensures they are saved to the database
        if (showContainer !== undefined) {
            payload.showContainer = Boolean(showContainer);
        }
        if (showButton !== undefined) {
            payload.showButton = Boolean(showButton);
        }
        if (showBrandTag !== undefined) {
            payload.showBrandTag = Boolean(showBrandTag);
        }
        if (showTitle !== undefined) {
            payload.showTitle = Boolean(showTitle);
        }
        if (showSubtitle !== undefined) {
            payload.showSubtitle = Boolean(showSubtitle);
        }

        console.log('[Server] Updating hero with payload:', JSON.stringify(payload, null, 2));

        const hero = await Hero.findOneAndUpdate(
            {},
            { $set: payload },
            { upsert: true, new: true }
        );

        // Convert Mongoose document to plain object and convert image IDs to URLs
        const heroObj = convertHeroImages(hero);

        console.log('[Server] Hero updated, returning:', {
            showContainer: heroObj.showContainer,
            showButton: heroObj.showButton,
            showBrandTag: heroObj.showBrandTag,
            showTitle: heroObj.showTitle,
            showSubtitle: heroObj.showSubtitle,
            typeOfShowContainer: typeof heroObj.showContainer,
            fullObject: heroObj
        });

        res.json(heroObj);
    } catch (error) {
        console.error('Update hero admin error:', error);
        res.status(500).json({ error: 'Failed to update hero content' });
    }
});

// ==================== VALIDATE PROMO CODE (PUBLIC) ====================
app.post('/api/promo-code/validate', async (req, res) => {
    try {
        const { code, items, subtotal } = req.body;
        const promoCode = await PromoCode.findOne({ code: code.toUpperCase(), isActive: true });
        
        if (!promoCode) {
            return res.status(400).json({ error: 'Invalid promo code' });
        }
        
        // Check validity dates
        const now = new Date();
        if (promoCode.validFrom && now < promoCode.validFrom) {
            return res.status(400).json({ error: 'Promo code not yet valid' });
        }
        if (promoCode.validUntil && now > promoCode.validUntil) {
            return res.status(400).json({ error: 'Promo code expired' });
        }
        
        // Check usage limit
        if (promoCode.usageLimit && promoCode.usedCount >= promoCode.usageLimit) {
            return res.status(400).json({ error: 'Promo code usage limit reached' });
        }
        
        // Check minimum purchase
        if (promoCode.minPurchase && subtotal < promoCode.minPurchase) {
            return res.status(400).json({ error: `Minimum purchase of ₹${promoCode.minPurchase} required` });
        }
        
        // Check if applicable to specific products
        if (promoCode.applicableTo === 'specific' && promoCode.productIds.length > 0) {
            const itemIds = items.map(item => item.id);
            const hasApplicableProduct = itemIds.some(id => promoCode.productIds.includes(id));
            if (!hasApplicableProduct) {
                return res.status(400).json({ error: 'Promo code not applicable to selected products' });
            }
        }
        
        // Calculate discount
        let discount = 0;
        if (promoCode.discountType === 'percentage') {
            discount = (subtotal * promoCode.discountValue) / 100;
            if (promoCode.maxDiscount) {
                discount = Math.min(discount, promoCode.maxDiscount);
            }
        } else {
            discount = promoCode.discountValue;
        }
        
        discount = Math.min(discount, subtotal); // Can't discount more than subtotal
        
        res.json({
            valid: true,
            discount: Math.round(discount),
            discountType: promoCode.discountType,
            discountValue: promoCode.discountValue
        });
    } catch (error) {
        console.error('Validate promo code error:', error);
        res.status(500).json({ error: 'Failed to validate promo code' });
    }
});

// Public Hero data
app.get('/api/hero', async (req, res) => {
    try {
        if (!checkMongoConnection()) {
            console.error('[API] MongoDB not connected for hero');
            // Return default hero if DB not connected
            return res.json({
                title: 'The Art of Accessory.',
                subtitle: 'HOLD Luxury in your HAND. Curated collections.',
                brandTag: 'PRISM HOLD',
                textAlign: 'center',
                fontSize: 48,
                titleFontSize: 48,
                subtitleFontSize: 20,
                fontWeight: 'normal',
                textDecoration: 'none',
                color: '#0f172a',
                images: ['image.png'],
                showContainer: true,
                showButton: true,
                showBrandTag: true,
                showTitle: true,
                showSubtitle: true
            });
        }
        let hero = await Hero.findOne().sort({ updatedAt: -1 });
        if (!hero) {
            hero = {
                title: 'The Art of Accessory.',
                subtitle: 'HOLD Luxury in your HAND. Curated collections.',
                brandTag: 'PRISM HOLD',
                textAlign: 'center',
                fontSize: 48,
                titleFontSize: 48,
                subtitleFontSize: 20,
                fontWeight: 'normal',
                textDecoration: 'none',
                color: '#0f172a',
                images: ['image.png'],
                showContainer: true,
                showButton: true,
                showBrandTag: true,
                showTitle: true,
                showSubtitle: true
            };
        } else {
            hero = convertHeroImages(hero);
        }
        res.json(hero);
    } catch (error) {
        console.error('Get hero error:', error);
        res.status(500).json({ error: 'Failed to load hero content' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    const mongoStatus = checkMongoConnection() ? 'connected' : 'disconnected';
    const mongoState = mongoose.connection.readyState; // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
    res.json({ 
        status: 'ok', 
        message: 'Server is running',
        mongodb: {
            status: mongoStatus,
            readyState: mongoState,
            connected: checkMongoConnection()
        },
        environment: {
            nodeEnv: process.env.NODE_ENV || 'development',
            port: PORT,
            hasMongoUri: !!MONGODB_URI,
            hasJwtSecret: !!JWT_SECRET
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

