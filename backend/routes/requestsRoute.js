const express = require('express');
const router = express.Router();
 
// Importing user schema
const Requests = require('../models/requestModel');

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

    Requests.findOne({receiver_id})
        .then(requests => {

            if(!requests) res.status(401).json({ msg: "Request for given user dosent exists" });

            const new_request = {
                sender_id, filename, filesize, status: "Pending"
            };

            Requests.findOneAndUpdate({receiver_id}, {$push: { "requests": new_request}})
                .then(requests => res.status(200).json({ msg : "File request sent successfully"}))
                .catch(err => res.status(401).json({ msg: err}))
        })
})

module.exports = router;