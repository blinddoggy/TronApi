const express = require('express');
const bodyParser=require('body-parser');

require("dotenv").config();

const tron = require('./src/controllers/tron');

const port = process.env.PORT;
const app = express();
  
app.listen(port, function() {
    console.log("Server is listening at port:" + port);
});

// Parses the text as url encoded data
app.use(bodyParser.urlencoded({extended: true}));
 
// Parses the text as json
app.use(bodyParser.json());

app.use('/tron', tron);