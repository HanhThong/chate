import crypto, { publicDecrypt } from 'crypto';
import fs from 'fs';

const publicKey = fs.readFileSync('key_example/user_1.pub', 'utf-8');
const privateKey = fs.readFileSync('key_example/user_1.pem', 'utf-8');

const data = {
    userId: "123",
    timestamp: new Date(),
}

const dataJson = JSON.stringify(data);

const sign = crypto.privateEncrypt(
    {
        key: privateKey,
        // padding: crypto.constants.RSA_NO_PADDING,
        // oaepHash: 'sha256',
    },
    Buffer.from(dataJson),
)

const decryptData = crypto.publicDecrypt(
    {
        key: publicKey,
        // padding: crypto.constants.RSA_NO_PADDING,
        // oaepHash: 'sha256',
    },
    sign,
)

console.log(decryptData.toString());