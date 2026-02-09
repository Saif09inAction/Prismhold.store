require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const https = require('https');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Base URL - point to your main backend
const MAIN_API_URL = process.env.MAIN_API_URL || 'https://prismhold-store-ggcq-git-main-saif09inactions-projects.vercel.app';

// Helper function to make HTTP/HTTPS requests
function makeRequest(url, options, data) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const isHttps = urlObj.protocol === 'https:';
        const client = isHttps ? https : http;
        
        const requestOptions = {
            hostname: urlObj.hostname,
            port: urlObj.port || (isHttps ? 443 : 80),
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            }
        };
        
        const req = client.request(requestOptions, (res) => {
            let body = '';
            res.on('data', (chunk) => { body += chunk; });
            res.on('end', () => {
                try {
                    const parsed = body ? JSON.parse(body) : {};
                    resolve({ status: res.statusCode, data: parsed, headers: res.headers });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body, headers: res.headers });
                }
            });
        });
        
        req.on('error', reject);
        
        if (data) {
            req.write(typeof data === 'string' ? data : JSON.stringify(data));
        }
        
        req.end();
    });
}

// Proxy API requests to main backend
app.use('/api', async (req, res) => {
    try {
        const url = `${MAIN_API_URL}${req.path}`;
        const headers = { ...req.headers };
        delete headers.host; // Remove host header
        
        const result = await makeRequest(url, {
            method: req.method,
            headers: headers
        }, req.body && Object.keys(req.body).length > 0 ? req.body : undefined);
        
        // Forward response headers
        Object.keys(result.headers).forEach(key => {
            if (!['connection', 'transfer-encoding'].includes(key.toLowerCase())) {
                res.setHeader(key, result.headers[key]);
            }
        });
        
        res.status(result.status).json(result.data);
    } catch (error) {
        console.error('API Proxy Error:', error);
        res.status(500).json({ error: 'Failed to connect to backend API', details: error.message });
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
