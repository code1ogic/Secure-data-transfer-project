const express = require('express');
const router = express.Router();
const crypto = require('crypto')

// Importing file schema
const File = require('../models/filesModel');

router.post('/upload', (req, res) => {

    // Getting data from req
    const { _id, file, filename, filesize } = req.body;

    key = crypto.randomBytes(64).toString('hex')
    shared = false

    File.findOne({filename})
        .then(file => {

            // If filename already exists
            if(file) return res.status(401).json({ msg: "File with same name already exists" });

            const newFile = {
                file, filename, filesize, key, shared
            };
            
            File.findOneAndUpdate({ _id }, {$push: { newFile }})
                .then(file => res.json({ msg : file}))
                .catch(err => res.json({ msg: err}))

        })
        .catch(err => res.status(401).json({ msg: err }));

});

module.exports = router;