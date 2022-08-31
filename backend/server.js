const express = require('express')
const app = express()
const mongoose = require('mongoose');
const bodyParser = require('body-parser') 
const cors = require('cors'); 
const upload = require('express-fileupload')
require('dotenv').config()

// Body parser middleware to parse json
app.use(bodyParser.json());
app.use(cors({ origin: "*" }))
app.use(upload())

// Connection details of db
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, { useNewUrlParser: true }, { useUnifiedTopology: true });

// Connecting to db
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
	console.log("Connection Successfull");
});

// Declaring API routes
app.use('/api/auth', require('./routes/userRoute'));
app.use('/api/files', require('./routes/filesRoute'));
app.use('/api/requests', require('./routes/requestsRoute'))

app.get('/api/demo', (req,res) => {
	res.write("demo ")
	res.write("demo1 ")
	res.write("demo2 ")
	res.end("demo3")
}) 

// Starting server
const port = process.env.NODE_ENV || 5000;
app.listen(port, () => console.log(`Server started at port ${port}`));
