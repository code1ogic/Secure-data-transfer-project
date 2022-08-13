const express = require('express');
const router = express.Router();
const { generateKeyPair } = require('crypto');
 
const User = require('../models/userModel');

router.post('/register', (req, res) => {

    const { name, email, password } = req.body;

    User.findOne({ email })
        .then(err, user => {
            
            if(err) return res.status(401).json({ err: err });
            
            if(user) return res.status(401).json({ msg: "User already exists" });

            generateKeyPair('rsa', {
                    modulusLength: 530,    
                    publicExponent: 0x10101,
                    publicKeyEncoding: {
                        type: 'pkcs1',
                        format: 'der'
                    },
                    privateKeyEncoding: {
                        type: 'pkcs8',
                        format: 'der',
                        cipher: 'aes-192-cbc',
                        passphrase: email
                    }
                }, 
                (crypto_err, publicKey, privateKey) => {
                    if(!err)
                    {
                        const newUser = new User({
                                name,
                                email,
                                password,
                                keys: {
                                    public: publicKey.toString('hex'),
                                    private: privateKey.toString('hex')
                                }
                            });
            
                        newUser.save()
                            .then(user => {
                                res.status(200).json({
                                    msg: "Registration successful"
                                });
                            });
                    }
                    else
                    {
                        console.log("Errr is: ", err);
                        res.status(401).json({
                            msg: "Registration failed",
                            err: crypto_err
                        });
                    }  
                });
            
        });

});

router.post('/login', (req, res) => {

    const { email, password } = req.body;

    User.findOne({ email })
        .then(err, user => {

            if(err) return res.status(401).json({ err: err });
            
            if(!user) return res.status(401).json({ msg: "User dosent exist" });

            if(password == user.password) return res.status(200).json({ _id: user._id });
            else res.status(401).json({msg : "Wrong password"})
            
        });
});

module.exports = router;