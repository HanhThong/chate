import crypto from 'crypto';
import fs from 'fs';

const publicKey = fs.readFileSync('key_example/user_1.pub', 'utf-8');
const privateKey = fs.readFileSync('key_example/user_1.pem', 'utf-8');

const data = {
    userId: "997f1695e6e127d3bf4a861354aea694",
    timestamp: new Date(),
}

const accessToken = crypto.privateEncrypt(privateKey, Buffer.from(JSON.stringify(data)));

console.log(accessToken.toString('base64'));
