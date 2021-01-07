import crypto from 'crypto';
import fs from 'fs';
  
// Using a function generateKeyFiles 
function generateKeyFiles() { 
  
    const keyPair = crypto.generateKeyPairSync('rsa', { 
        modulusLength: 520, 
        publicKeyEncoding: { 
            type: 'spki', 
            format: 'pem'
        }, 
        privateKeyEncoding: { 
        type: 'pkcs8', 
        format: 'pem', 
        cipher: 'aes-256-cbc', 
        passphrase: ''
        } 
    }); 
       
    // Creating public key file  
    fs.writeFileSync("public_key", keyPair.publicKey); 
} 
  
// Generate keys 
generateKeyFiles(); 