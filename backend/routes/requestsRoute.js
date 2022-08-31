const express = require('express');
const router = express.Router();
const crypto = require('crypto');
var ObjectId = require('mongodb').ObjectId
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
})

// Importing user schema
const User = require('../models/userModel');
const Files = require('../models/filesModel');
const Requests = require('../models/requestModel')

router.get('/getrequests/:_id', (req, res) => {

    const user_id = req.params._id

    // Find the user requests
    Requests.findOne({ _id: user_id})
        .then(requests => {

            // If usre dosent exist
            if(!requests) return res.status(401).json({ msg: "Request for given user dosent exists" });

            res.status(200).json({ requests: requests.requests})
        })
        .catch(err => res.status(401).json({ msg: err }))
})

router.post('/sendrequest', (req, res) => {

    const { sender_id, receiver_id, filename, filesize } = req.body

    let public_key;
    let sender_key, sender_iv, content_type;

    Files.findOne({_id: sender_id})
        .then(files => {
                    
            files.files.forEach(item => {
                if(item.filename == filename){
                    sender_key = item.key;
                    sender_iv = item.iv;
                    content_type = item.content_type
                }
            })

            if(!sender_key || !sender_iv) return res.status(401).json({ msg: "File not found" })

            receiver_id.forEach(item => {

                User.findById(ObjectId(item))
                    .then(user => {
        
                    // If user dosent exists
                    if(!user) return res.status(401).json({ msg: "Receiver dosent exist" });
        
                    public_key = user.keys.public
                    
                    Requests.findOne({_id: item})
                        .then(requests => {
        
                            if(!requests) res.status(401).json({ msg: "Request for given user dosent exists" });
        
                            let request_exists = false
                            requests.requests.forEach(item => {
                                if(item.filename == filename){
                                    if(item.status != "Rejected") request_exists = true
                                }
                            })

                            if(request_exists) return res.status(401).json({ msg: "Request for given file already exists" });
        
                            key = crypto.publicEncrypt(
                                {
                                    key: public_key,
                                    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                                    oaepHash: 'sha256',
                                },
                                // We convert the data string to a buffer using `Buffer.from`
                                Buffer.from(sender_key)
                            ).toString('hex')
                            
                            iv = crypto.publicEncrypt(
                                {
                                    key: public_key,
                                    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                                    oaepHash: 'sha256',
                                },
                                // We convert the data string to a buffer using `Buffer.from`
                                Buffer.from(sender_iv)
                            ).toString('hex')
        
                            const new_request = {
                                sender_id, filename, filesize, key, iv, content_type,status: "Pending",
                            };
        
                            Requests.findOneAndUpdate({_id: item}, {$push: { "requests": new_request}})
                                .then(requests => res.status(200).json({ msg : "File request sent successfully"}))
                                .catch(err => res.status(401).json({ msg: err}))
                        })
                        .catch(err => res.status(401).json({ msg: err }))
                    })
                    .catch(err => res.status(401).json({ msg: err }))
                })
        })
        .catch(err => res.status(401).json({ msg: err }))
})


router.post('/accept', (req, res) => {

    const { sender_id, receiver_id, filename, filesize, key, iv, content_type } = req.body

    // Check if the filename is alredy in files
    // Copy the file in s3
    // Decrypt keys
    // Upate user files

    Files.findOne({_id: receiver_id})
        .then(files => {

            let file_exists = false
            files.files.forEach(item => {
                if(item.filename == filename) file_exists = true
            })

            if(file_exists) return res.status(401).json({ msg: "File already exists" });

            s3.copyObject({
                Bucket: "secure-data-transfer", 
                CopySource:`secure-data-transfer/${sender_id}/${filename}`,
                Key: `${receiver_id}/${filename}`
            },(err, data) => {
                console.log(err)
                console.log(data)
            })

            User.findById(ObjectId(receiver_id))
            .then(user => {

                if(!user) return res.status(401).json({ msg: "Receiver dosent exist" });  

                private_key = user.keys.private

                // console.log(private_key)
                // console.log(key)
                const decryptedKey = crypto.privateDecrypt(
                    {
                      key: private_key,
                      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                      oaepHash: 'sha256',
                    },
                    Buffer.from(key, 'hex'),
                ).toString("utf8")

                const decryptedIv = crypto.privateDecrypt(
                    {
                      key: private_key,
                      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                      oaepHash: 'sha256',
                    },
                    Buffer.from(iv, 'hex'),
                ).toString("utf8")
                
                const new_file = {
                    filename, filesize, content_type,
                    key: decryptedKey,
                    iv: decryptedIv,
                    shared: true
                }

                Files.findOneAndUpdate({_id: receiver_id}, {$push : { "files": new_file}})
                    .then(files => {

                        Requests.findOneAndUpdate({ _id: receiver_id, "requests.filename": filename}, {$set : { "requests.$.status": "Accepted" }})
                            .then(files => {

                                res.status(200).json({ msg : "File request accepted successfully"})
                            })
                            .catch(err => res.status(401).json({ msg: err}))

                    })
                    .catch(err => res.status(401).json({ msg: err}))
            })
        })
        .catch(err => res.status(401).json({ msg: err}))
})

router.post('/reject', (req, res) => {

    const { receiver_id, filename} = req.body

    Requests.findOneAndUpdate({ _id: receiver_id, "requests.filename": filename}, {$set : { "requests.$.status": "Rejected" }})
        .then(files => {
            res.status(200).json({ msg : "File request rejected successfully"})
        })
        .catch(err => res.status(401).json({ msg: err}))

})

module.exports = router;