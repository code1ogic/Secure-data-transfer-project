const express = require('express')
const app = express()
const mongoose = require('mongoose');
const bodyParser = require('body-parser') 
const cors = require('cors') 
require('dotenv').config()

app.use(bodyParser.json());
app.use(cors({ origin: "*" }))

const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, { useNewUrlParser: true }, { useUnifiedTopology: true });

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log("Connection Successfull");
});

app.use('/api/auth' , require('./routes/userRoute'));

const port = process.env.NODE_ENV || 5000;
app.listen(port, () => console.log(`Server started at port ${port}`));
