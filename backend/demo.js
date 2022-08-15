const crypto = require('crypto');
const fs = require("fs");
  
// // Using a function generateKeyFiles
// function generateKeyFiles() {
  
//     const keyPair = crypto.generateKeyPairSync('rsa', {
//         modulusLength: 520,
//         publicKeyEncoding: {
//             type: 'spki',
//             format: 'pem'
//         },
//         privateKeyEncoding: {
//         type: 'pkcs8',
//         format: 'pem',
//         cipher: 'aes-256-cbc',
//         passphrase: ''
//         }
//     });
       
//     // Creating public key file 
//     console.log(keyPair.publicKey)
//     console.log(keyPair.privateKey)
//     const encrypted = crypto.publicEncrypt(keyPair.publicKey, Buffer.from("plaintext"));
//     console.log(encrypted)
//     // fs.writeFileSync("public_key", keyPair.publicKey);
//     const decrypted = crypto.publicDecrypt(keyPair.privateKey, encrypted)
//     console.log(decrypted)
// }
  
// // Generate keys
// generateKeyFiles();
  
// // // Creating a function to encrypt string
// // function encryptString (plaintext, publicKeyFile) {
// //     const publicKey = fs.readFileSync(publicKeyFile, "utf8");
  
// //     // publicEncrypt() method with its parameters
// //     const encrypted = crypto.publicEncrypt(
// //              publicKey, Buffer.from(plaintext));
// //     return encrypted;
// // }
  
// // // Defining a text to be encrypted
// // const plainText = "Hello!";
  
// // // Defining encrypted text
// // const encrypted = encryptString(plainText, "./public_key");
  
// // // Prints plain text
// // console.log("Plaintext:", plainText);
  
// // // Prints buffer
// // console.log("Buffer: ", encrypted);

var { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    // The standard secure default length for RSA keys is 2048 bits
    modulusLength: 2048,
    publicKeyEncoding: {
        type: 'pkcs1',
        format: 'pem'
    },
    privateKeyEncoding: {
        type: 'pkcs1',
        format: 'pem',
    }
})


publicKey = publicKey.toString('hex')

const encryptedData = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    // We convert the data string to a buffer using `Buffer.from`
    Buffer.from("dataToEncrypt")
)

privateKey = privateKey.toString('hex')
console.log(privateKey)
const decryptedData = crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    Buffer.from(encryptedData),
  )
console.log(decryptedData.toString('utf8'))