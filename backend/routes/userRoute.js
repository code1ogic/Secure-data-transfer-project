const express = require('express');
const router = express.Router();
const { generateKeyPair } = require('crypto');
 
// Importing user schema
const User = require('../models/userModel');

// Importing files schema
const Files = require('../models/filesModel');

// Post API to register a user
router.post('/register', (req, res) => {

    // Getting data from req
    const { name, email, password } = req.body;

    // To check if email is already registered
    User.findOne({ email })
        .then(user => {
            
            // If user already exists
            if(user) return res.status(401).json({ msg: "User already exists" });

            // Generating key pair
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
                (err, publicKey, privateKey) => {

                    // If key generation is successfull
                    if(!err)
                    {
                        // Creating a new json object to push in to db
                        const newUser = new User({
                                name,
                                email,
                                password,
                                keys: {
                                    // Converting the Buffer to hex string
                                    public: publicKey.toString('hex'),  
                                    private: privateKey.toString('hex')
                                }
                            });
            
                        // Adding the user to db
                        newUser.save()
                            .then(user => {
                                
                                const user_files = new Files({
                                    _id: user._id
                                })

                                user_files.save()
                                    .then(files => {
                                        res.status(200).json({
                                            msg: "Registration successful"
                                        });
                                    })
                                    .catch(err => res.status(401).json({ msg: err }));
                            })
                            .catch(err => res.status(401).json({ msg: err }));
                    }
                    else
                    {
                        console.log("Errr is: ", err);
                        res.status(401).json({
                            msg: "Registration failed",
                            err: err
                        });
                    }  
                });
            
        })
        .catch(err => res.status(401).json({ msg: err }));

});

// Post API to validate a user
router.post('/login', (req, res) => {

    // Getting data from req
    const { email, password } = req.body;

    // Finding the user with given email
    User.findOne({ email })
        .then(user => {

            // If user dosent exists
            if(!user) return res.status(401).json({ msg: "User dosent exist" });

            // Comparing the password
            if(password == user.password) return res.status(200).json({ _id: user._id });
            else res.status(401).json({msg : "Wrong password"})
            
        })
        .catch(err => res.status(401).json({ msg: err }));
});

// Get API to get all users
router.get('/getallusers/:_id', (req, res) => {

    const current_user = req.params._id

    // Finding all the users
    User.find({})
        .then(users => {

            // Creating a new array of users 
            all_users = []
            users.forEach(item => {
                if(item._id != current_user) {
                    all_users.push({
                        name: item.name,
                        email: item.email
                    })
                }
            })
            res.status(200).json({ users: all_users})
        })
        .catch(err => res.status(401).json({ msg: err }))

})

module.exports = router;