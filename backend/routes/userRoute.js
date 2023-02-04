const express = require('express');
const router = express.Router();
const { generateKeyPair } = require('crypto');
 
// Importing schemas
const User = require('../models/userModel');
const Files = require('../models/filesModel');
const Requests = require('../models/requestModel')

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
                    modulusLength: 2048,
                    publicKeyEncoding: {
                        type: 'pkcs1',
                        format: 'pem'
                    },
                    privateKeyEncoding: {
                        type: 'pkcs1',
                        format: 'pem',
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
                                },
                                requests : []
                            });
            
                        // Adding the user to db
                        newUser.save()
                            .then(user => {
                                
                                const user_files = new Files({
                                    _id: user._id,
                                    files: []
                                })

                                user_files.save()
                                .then(files => {
                                    console.log("Created files")
                                    
                                    const user_requests = new Requests({
                                        _id: user._id,
                                        requests: []
                                    })
    
                                    user_requests.save()
                                        .then(requests => {
                                            console.log("Created requests")
                                            
                                            res.status(200).json({
                                                msg: "Registration successful"
                                            });
                                        })
                                        .catch(err => res.status(401).json({ msg: err }));
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
router.get('/getusers/:_id', (req, res) => {

    const current_user = req.params._id

    // Finding all the users
    User.find({})
        .then(users => {

            // Creating a new array of users 
            all_users = []
            users.forEach(item => {
                if(item._id != current_user) {
                    all_users.push({
                        _id: item._id,
                        name: item.name
                    })
                }
            })
            res.status(200).json({ users: all_users})
        })
        .catch(err => res.status(401).json({ msg: err }))

})

// Get API to get a user
router.get('/getuser/:_id', (req, res) => {

    const current_user = req.params._id

    // Finding the user
    User.findOne({'_id':current_user})
        .then(user => {

            if(!user) return res.status(401).json({ msg: "User dosent exists" });

            res.status(200).json({ name: user.name, email: user.email})
        })
        .catch(err => res.status(401).json({ msg: err }))
})

module.exports = router;