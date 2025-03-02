const fs = require('fs');
const path = require('path');
const cors = require('cors');
const https = require('https');
const multer = require('multer');
const express = require('express');
const requestIp = require('request-ip');
const rateLimit = require("express-rate-limit");

/*
 * to connect to the ipfs swarm this code should be used (and specify type:module in package.json )
 * 
    import fs from 'fs';
    import path from 'path';
    import cors from 'cors';
    import https from 'https';
    import multer from 'multer';
    import express from 'express';
    import rateLimit from 'express-rate-limit';
    import { dirname } from 'path';
    import { tcp } from "@libp2p/tcp";
    import { fileURLToPath } from 'url';
    import { createLibp2p } from "libp2p";
    import { noise } from "@chainsafe/libp2p-noise";
    import { yamux } from "@chainsafe/libp2p-yamux";

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    // ...

    async function createNode() {
        const { createHelia } = await import('helia'); 
        const { unixfs } = await import('@helia/unixfs'); 

        const libp2p = await createLibp2p({
            addresses: {
                listen: [ 
                    "/ip4/127.0.0.1/tcp/0", 
                    // swarm address
                ],
            },
            transports: [ tcp() ],
            connectionEncryption: [ noise() ],
            streamMuxers: [ yamux() ],
        });

        await libp2p.start();

        const helia = await createHelia(
            libp2p,
        );
        const fs = unixfs(helia);
        
        return fs;
    }

    ...
 *
 */

const corsOptions = {
    origin: [ 'https://localhost:3000' ], 
    methods: [ 'GET', 'POST', 'OPTIONS' ], 
    allowedHeaders: [ 'Content-Type', 'Authorization'],
    credentials: true,
};

const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, '..', 'certificates', 'ipfs_node.com+5-key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '..', 'certificates', 'ipfs_node.com+5.pem')),
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
app.use(cors(corsOptions));
app.use(limiter)

const port = 433;

const upload = multer();

async function createNode() {
    const { createHelia } = await import('helia'); 
    const { unixfs } = await import('@helia/unixfs'); 

    const helia = await createHelia();
    const fs = unixfs(helia);
    
    return fs;
}

async function startNode() {
    const fs = await createNode();

    app.post('/upload-image', upload.single('file'), async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).send('No file uploaded');
            }
    
            const data = req.file.buffer;
            const cid = await fs.addBytes(data);
    
            console.log('[log] (/upload-image) file uploaded with cid: ' + cid);
            res.status(200).send(`${cid}`);
        } 
        
        catch (error) {
            console.log('[error] (/upload-image) upload failed: ' + error);
            res.status(500).send('file upload failed');
        }
    });

    app.get('/fetch-image',  async (req, res) => {
        try {
            const { cid } = req.query;

            if (!cid || typeof cid !== 'string') {
                return res.status(400).send('cid is required (and must be a string)');
            }

            let chunks = [];
            
            for await (const chunk of fs.cat(cid)) {
                chunks.push(chunk);
            }

            const buffer = Buffer.concat(chunks);

            res.status(200).send(buffer);
        } 
        
        catch (error) {
            console.log('[error] (/fetch-image) fetch failed: ' + error);
            res.status(500).send('failed to fetch file');
        }
    });

    app.post('/upload-metadata', upload.single('metadata'), async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).send('No file uploaded');
            }
            
            // since it is needed to store a json, it has to be encoded
            const data = JSON.parse(req.file.buffer.toString());
            const cid = await fs.addBytes(new TextEncoder().encode(JSON.stringify(data)));
    
            console.log('[log] (/upload-metadata) metadata uploaded with cid: ' + cid);
            res.status(200).send(`${cid}`);
        } 
        
        catch (error) {
            console.log('[error] (/upload-metadata) upload failed: ' + error);
            res.status(500).send('metadata upload failed');
        }
    });

    app.get('/fetch-metadata', async (req, res) => {
        try {
            const { cid } = req.query;

            if (!cid || typeof cid !== 'string') {
                return res.status(400).send('cid is required (and must be a string)');
            }

            let chunks = [];

            for await (const chunk of fs.cat(cid)) {
                chunks.push(chunk);
            }
            
            const metadata = new TextDecoder().decode(Buffer.concat(chunks));
            metadataJSON = JSON.parse(metadata.toString());

            res.status(200).json(metadataJSON);
        } 
        
        catch (error) {
            console.log('[error] (/fetch-metadata) fetch failed: ' + error);
            res.status(500).send('failed to fetch metadata');
        }
    });

    https.createServer(httpsOptions, app).listen(port, () => {
        console.log('[log] ipfs node listening on port ' + port);
    });
}

startNode();