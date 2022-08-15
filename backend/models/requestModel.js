const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Creating Schema for user
const RequestsSchema = new Schema({
    _id : {
        type: String,
        required: true
    },
    requests : [
        {
            sender_id : {
                type: String,
                required: true
            },
            filename : {
                type: String,
                required: true
            },
            filesize : {
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
            content_type : {
                type: String,
                required: true
            },
            status : {
                type: String,
                required: true
            }
        }
    ]
})

module.exports = mongoose.model('requests', RequestsSchema);