import http from 'http';
import fs from 'fs';
import crypto from 'crypto';
import WebSocket from 'ws';
import express from 'express';
import fileUpload from 'express-fileupload';

import { ConnectionManager } from './connection';
import { EncryptedMessagePayload } from './types';

const CER_PATH = process.env['CER_PATH'] || '/tmp';

const app = express();
const server = http.createServer(app);
const wsServer = new WebSocket.Server({ noServer: true });

app.use(fileUpload());
app.use(express.json());

const connectionManager = new ConnectionManager();

wsServer.on('connection', (ws: WebSocket, request: http.IncomingMessage, client: { userId: string }) => {
    connectionManager.addConnection(client.userId, ws);

    ws.on('message', (message: string) => {
        const payload: EncryptedMessagePayload = JSON.parse(message);
        connectionManager.sendMessage(payload.toUser, message);
    });

    ws.on('close', (code, reson) => {
        connectionManager.removeConnection(client.userId);
    });

    ws.send('Hi there, I am a WebSocket server');
});

app.post('/api/register', (req, res) => {
    if (!!req.files!.cer) {
        const cer: fileUpload.UploadedFile = req.files!.cer as fileUpload.UploadedFile;
        const userId = cer.md5;

        cer.mv(`${CER_PATH}/${userId}.pub`, (error) => {
            if (error) {
                console.error(`Upload file error: ${error}`);
                return res.status(500).end({ error: { message: 'Server error ' } });
            }

            res.status(201).send({ userId });
        });
    } else {
        res.status(400).send({ error: { message: 'Missing certificate' } });
    }
});

app.post('/api/login', async (req, res) => {
    const { accessToken, userId } = req.body;
    const publicKey = await fs.promises.readFile(`${CER_PATH}/${userId}.pub`);
    const planMessage = crypto.publicDecrypt(publicKey, Buffer.from(accessToken, 'base64'));
    const payload = JSON.parse(planMessage.toString());

    console.log(payload);
    
    res.end();
});

server.on('upgrade', async (request, socket, head) => {
    const userId = request.headers.userid;
    const accessToken = request.headers.accesstoken;

    let publicKey;

    try {
        publicKey = await fs.promises.readFile(`${CER_PATH}/${userId}.pub`);
    } catch (error) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
    }

    const planMessage = crypto.publicDecrypt(publicKey, Buffer.from(accessToken, 'base64'));
    const payload = JSON.parse(planMessage.toString());
    
    if (userId === payload.userId && (new Date().getTime() - new Date(payload.timestamp).getTime() < 1000000)) {
        wsServer.handleUpgrade(request, socket, head, function done(ws) {
            const client = { userId };
            wsServer.emit('connection', ws, request, client);
        });
    } else {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
    }
});

server.listen(8080, () => {
    console.log('Server start at port 8080');
});
