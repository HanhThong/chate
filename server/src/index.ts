import http from 'http';
import fs from 'fs';
import crypto from 'crypto';
import WebSocket from 'ws';
import express from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import mongoose from 'mongoose';
import { exit } from 'process';


import { ConnectionManager } from './connection';
import { EncryptedMessagePayload } from './types';
import { UserModel, MessageModel } from './model';

const mongodbUri = 'mongodb://root:EncryptProject@localhost:27017/encrypt_chat?authSource=admin';
mongoose.connect(mongodbUri, { useUnifiedTopology: true }, (error) => {
    if (error) {
        console.error(`Can't connect to database`);
        console.error(error);
        exit(1);
    } else {
        console.info('Connect to mongodb successfull');
    }
});

const CER_PATH = process.env['CER_PATH'] || '/tmp';

const app = express();
const server = http.createServer(app);
const wsServer = new WebSocket.Server({ noServer: true });

app.use(cors());
app.use(fileUpload());
app.use(express.json());

app.use('/cer', express.static(CER_PATH));

const connectionManager = new ConnectionManager();

wsServer.on('connection', (ws: WebSocket, request: http.IncomingMessage, client: { userId: string }) => {
    console.info(`A new connection from ${client.userId}`);
    connectionManager.addConnection(client.userId, ws);

    ws.on('message', (message: string) => {
        console.log(message);
        const payload: EncryptedMessagePayload = JSON.parse(message);
        connectionManager.sendMessage(payload.toUser, message);
    });

    ws.on('close', (code, reson) => {
        console.info(`Client ${client.userId} is disconnected`);
        connectionManager.removeConnection(client.userId);
    });

    ws.send('Hi there, I am a WebSocket server');
});

app.post('/api/register', (req, res) => {
    const { fullName, userName } = req.body;

    if (!!req.files!.publicKey && !!fullName && !!userName) {
        const publicKey: fileUpload.UploadedFile = req.files!.publicKey as fileUpload.UploadedFile;
        publicKey.mv(`${CER_PATH}/${userName}.pub`, async (error) => {
            if (error) {
                console.error(`Upload file error: ${error}`);
                return res.status(500).end({ error: { message: 'Server error ' } });
            }

            try {
                const user = await UserModel.create({ fullName, userName });
                res.status(201).send(user);
            } catch (error) {
                res.status(400).send({ error: { message: 'User name is duplicated'}});
            }
        });
    } else {
        res.status(400).send({ error: { message: 'Missing data' } });
    }
});

app.get('/api/users', async (req, res) => {
    res.status(200).send(await UserModel.find());
});


server.on('upgrade', async (request, socket, head) => {
    const userName = request.headers.username;
    const accessToken = request.headers.accesstoken;

    let publicKey;

    try {
        publicKey = await fs.promises.readFile(`${CER_PATH}/${userName}.pub`);
    } catch (error) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
    }

    const planMessage = crypto.publicDecrypt(publicKey, Buffer.from(accessToken, 'base64'));
    const payload = JSON.parse(planMessage.toString());

    if (userName === payload.userName && (new Date().getTime() - new Date(payload.timestamp).getTime() < 1000)) {
        wsServer.handleUpgrade(request, socket, head, function done(ws) {
            const client = { userId: userName };
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
