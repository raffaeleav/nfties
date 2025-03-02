const fs = require('fs');
const path = require('path');
const cors = require('cors');
const https = require('https');
const express = require('express');
const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');
const requestIp = require('request-ip');
const rateLimit = require("express-rate-limit");

const corsOptions = {
    origin: [ 'https://localhost:3000' ], 
    methods: [ 'GET', 'POST', 'OPTIONS' ], 
    allowedHeaders: [ 'Content-Type', 'Authorization'],
    credentials: true,
};

const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, '..', 'certificates', 'auth_node.com+5-key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '..', 'certificates', 'auth_node.com+5.pem')),
};

// 100 request every 10 mins for each user
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 100,
    keyGenerator: (req, res) => {
        return req.clientIp 
    },
});

const app = express();
app.use(express.json());
app.use(cors(corsOptions));
app.use(limiter);

const port = 434;

const released_nonces = [];

async function startNode() {
    app.get('/get-nonce', (req, res) => {
        const nonce = `timestamp: ${Date.now()}`;
        released_nonces.push(nonce); 

        res.json({ nonce });
    });

    app.post('/verify-nonce', (req, res) => {
        const { account, signature, nonce } = req.body;

        const index = released_nonces.indexOf(nonce);

        if (index > -1) {
            released_nonces.splice(index, 1);
        } 
        
        else {
            res.status(401).json({ success: false, error: 'nonce is not valid' });
            console.log('[error] nonce is not valid');
        }

        const recoveredAddress = ethers.verifyMessage(nonce, signature);

        if (recoveredAddress.toLowerCase() === account.toLowerCase()) {
            const token = jwt.sign({ account }, 'not-so-secret-key');
            res.json({ success: true, token });
        }

        else {
            res.status(401).json({ success: false, error: 'signature is not valid' });
            console.log('[error] signature is not valid');
        }
    });

    app.post('/verify-jwt', (req, res) => {
        const { token } = req.body;

        try {
            jwt.verify(token, 'not-so-secret-key');
            res.json({ success: true });
        }

        catch (error) {
            res.status(401).json({ success: false, error });
        }
    });

    https.createServer(httpsOptions, app).listen(port, () => {
        console.log('[log] authentication node listening on port ' + port);
    });
}

startNode();