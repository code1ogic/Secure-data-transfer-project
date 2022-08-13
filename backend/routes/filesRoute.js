const express = require('express');
const router = express.Router();
const crypto = require('crypto')

// Importing file schema
const Files = require('../models/filesModel');

// Get API to get aal the files data
router.get('/getfiles/:_id', (req, res) => {

    // Pulling the _id from the get uri
    const _id = req.params._id

    // Get the data of the requested _id
    Files.findOne({_id})
        .then(files => {

            // If files are not present
            if(!files) return res.status(401).json({ msg: "Files not found for given _id"});

            res.status(200).json({files : files.files})

        })
        .catch(err => res.status(401).json({ msg: err }));
})

// Post API to add a new file
router.post('/upload', (req, res) => {

    // Getting data from req
    const { _id, file, filename, filesize } = req.body;

    // Creating a key for the file
    key = crypto.randomBytes(64).toString('hex')
    shared = false

    Files.findOne({_id})
        .then(files => {

            // Creating a new file
            const newFile = {
                filename, filesize, key, shared
            };

            // Checking if filename is already there in db
            isFilename = false
            files.files.forEach(item => {
                if(filename == item.filename) isFilename = true
            })

            if (isFilename) return res.status(401).json({ msg : "File name already exists"});
            
            // Adding the file in the db
            Files.findOneAndUpdate({ _id }, {$push: { "files": newFile }})
                .then(file => res.status(200).json({ msg : "File uploaded successfully"}))
                .catch(err => res.status(401).json({ msg: err}))

        })
        .catch(err => res.status(401).json({ msg: err }));

});

module.exports = router;