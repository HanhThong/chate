import crypto from 'crypto';
import fs from 'fs';

const publicKey = fs.readFileSync('key_example/user_1.pub', 'utf-8');
const privateKey = fs.readFileSync('key_example/user_1.pem', 'utf-8');

const message = 'This is message';
const messageBuffer = Buffer.from(message);

const data = "my secret data"

const cipher = crypto.publicEncrypt(
    {
		key: publicKey,
	},
    messageBuffer,
);

console.log(cipher);

const planText = crypto.privateDecrypt(
    {
        key: privateKey,
        // padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        // oaepHash: "sha256",
    },
    cipher,
);

console.log(planText.toString());