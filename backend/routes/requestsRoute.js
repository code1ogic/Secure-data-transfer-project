const express = require('express');
const router = express.Router();
const crypto = require('crypto');
var ObjectId = require('mongodb').ObjectId
 
// Importing user schema
const User = require('../models/userModel');
const Files = require('../models/filesModel');
const Requests = require('../models/requestModel')

router.get('/getrequests/:_id', (req, res) => {

    const user_id = req.params._id

    // Find the user requests
    Requests.findOne({user_id})
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
    let sender_key, sender_iv;

    User.findById(ObjectId(receiver_id))
        .then(user => {

            // If user dosent exists
            if(!user) return res.status(401).json({ msg: "Receiver dosent exist" });

            public_key = user.keys.public

            Files.findOne({sender_id})
                .then(files => {
                    
                    files.files.forEach(item => {
                        if(item.filename == filename){
                            sender_key = item.key;
                            sender_iv = item.iv;
                        }
                    })

                    if(!sender_key || !sender_iv) return res.status(401).json({ msg: "File not found" })

                    Requests.findOne({receiver_id})
                        .then(requests => {

                            if(!requests) res.status(401).json({ msg: "Request for given user dosent exists" });

                            key = crypto.publicEncrypt(
                                {
                                  key: public_key,
                                  padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                                  oaepHash: 'sha256',
                                },
                                // We convert the data string to a buffer using `Buffer.from`
                                Buffer.from(sender_key)
                            )
                            iv = crypto.publicEncrypt(
                                {
                                  key: public_key,
                                  padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                                  oaepHash: 'sha256',
                                },
                                // We convert the data string to a buffer using `Buffer.from`
                                Buffer.from(sender_iv)
                            )

                            const new_request = {
                                sender_id, filename, filesize, key, iv, status: "Pending",
                            };

                            Requests.findOneAndUpdate({receiver_id}, {$push: { "requests": new_request}})
                                .then(requests => res.status(200).json({ msg : "File request sent successfully"}))
                                .catch(err => res.status(401).json({ msg: err}))
                        })
                        .catch(err => res.status(401).json({ msg: err }))
                })
                .catch(err => res.status(401).json({ msg: err }))

        })
        .catch(err => res.status(401).json({ msg: err }))
})

module.exports = router;