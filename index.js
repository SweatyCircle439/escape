const express = require('express');
const app = express();

const server = require('http').createServer(app);
const io = require('socket.io')(server);



io.on('connection', (client) => {
    client.on("input");
});

const bodyParser = require('body-parser');

const sessids = require('sessids')();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(sessids.sessions);

app.use(express.static("public"));

server.listen(3000);