const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Creating Schema for user
const UserSchema = new Schema({
    name : {
        type: String,
        required: true
    },
    email : {
        type: String,
        required: true
    },
    password : {
        type: String,
        required: true
    },
    keys : {
        public : {
            type: String,
            required: true
        },
        private : {
            type: String,
            required: true
        }
    }
})

module.exports = mongoose.model('user', UserSchema);