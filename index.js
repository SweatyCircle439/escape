const express = require('express');
const app = express();

const bodyParser = require('body-parser');

const sessids = require('sessids')();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(sessids.sessions);

app.use(express.static("public"));

app.listen(3000, () => {
    console.log("test development server going live!");
});