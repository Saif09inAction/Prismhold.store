require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Base URL - point to your main backend
const MAIN_API_URL = process.env.MAIN_API_URL || 'https://prismhold-store-ggcq-git-main-saif09inactions-projects.vercel.app';

// Proxy API requests to main backend
app.use('/api', async (req, res) => {
    try {
        const response = await fetch(`${MAIN_API_URL}${req.path}`, {
            method: req.method,
            headers: {
                'Content-Type': 'application/json',
                ...req.headers,
                'host': undefined, // Remove host header
            },
            body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
        });
        
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        console.error('API Proxy Error:', error);
        res.status(500).json({ error: 'Failed to connect to backend API' });
    }
});

// Serve admin panel
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Admin Panel running on http://localhost:${PORT}`);
    console.log(`API Backend: ${MAIN_API_URL}`);
});
