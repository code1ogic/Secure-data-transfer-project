const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Creating Schema for files
const FilesSchema = new Schema({
    _id : {
        type: String,
        required: true
    },
    files : [
        {
            filename : {
                type: String,
                required: true
            },
            filesize : {
                type: String,
                required: true
            },
            content_type : {
                type: String,
                required: true
            },
            key : {
                type: String,
                required: true
            },
            iv : {
                type: String,
                required: true
            },
            shared : {
                type: Boolean,
                required: true
            } 
        }
    ]
})

module.exports = mongoose.model('files', FilesSchema)