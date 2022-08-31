const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const AWS = require('aws-sdk');
var algorithm = 'aes256';
fs = require('fs');
const stream = require('stream');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
})

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
            
            all_files = []
            files.files.forEach(item => {
                all_files.push({
                    filename: item.filename,
                    filesize: item.filesize,
                    shared: item.shared
                })
            })
            res.status(200).json({files : all_files})

        })
        .catch(err => res.status(401).json({ msg: err }));
})

// Post API to add a new file
router.post('/upload', async (req, res) => {

    // Getting data from req
    const { _id, filename, filesize } = req.body;

    // Creating a key for the file
    key = crypto.randomBytes(32)
    iv = crypto.randomBytes(16)
    shared = false
    content_type = req.files.file.mimetype

    Files.findOne({_id})
        .then(files => {

            // Creating a new file
            const newFile = {
                filename, filesize, 
                key : key.toString('hex'), 
                iv : iv.toString('hex'), 
                shared, content_type
            };

            // Checking if filename is already there in db
            let isFilename = false
            files.files.forEach(item => {
                if(filename == item.filename) isFilename = true
            })

            if (isFilename) return res.status(401).json({ msg : "File already exists"});

            var cipher = crypto.createCipheriv(algorithm, key, iv)
            var encrypted = Buffer.concat([cipher.update(req.files.file.data), cipher.final()]);

            s3.putObject({
                Body: encrypted, 
                Bucket: "secure-data-transfer", 
                Key: `${_id}/${filename}`
            }, (err, data) => {
                console.log(err)
                console.log(data)
                // Adding the file in the db
                Files.findOneAndUpdate({ _id }, {$push: { "files": newFile }})
                .then(file => res.status(200).json({ msg : "File uploaded successfully"}))
                .catch(err => res.status(401).json({ msg: err}))
            })
        })
        .catch(err => res.status(401).json({ msg: err }));

});

router.post('/download', (req, res) => {

    const { _id, filename } = req.body

    Files.findOne({_id})
        .then(files => {
            // console.log(files.files)
            let found = false

            files.files.forEach(item => {
                if(item.filename == filename){
                    
                    found = true
                    
                    s3.getObject({
                        Bucket: "secure-data-transfer", 
                        Key: `${_id}/${filename}`
                    }, (err ,data) => {
                        // console.log(err)
                        demo = data.Body
                        key = Buffer.from(item.key, 'hex');
                        iv = Buffer.from(item.iv, 'hex');
                        
                        var decipher = crypto.createDecipheriv(algorithm, key, iv);
                        var decrypted = Buffer.concat([decipher.update(demo), decipher.final()]);

                        // res.status(200).json({file: decrypted, content_type: item.content_type, filename: item.fileName})

                        var readStream = new stream.PassThrough();
                        readStream.end(decrypted);

                        res.set('Content-disposition', 'attachment; filename=' + item.fileName);
                        res.set('Content-Type', item.content_type);

                        readStream.pipe(res);
                    })
                }
            })
            if(!found) res.status(401).json({ msg: err })

        })
        .catch(err => res.status(401).json({ msg: err}))
})

module.exports = router;