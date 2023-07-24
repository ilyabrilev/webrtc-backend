const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
const { v4: uuidv4 } = require("uuid");
const { Server: SocketServer } = require("socket.io");
const { addUser, removeUser, getRoom } = require('./utils/rooms')

const keyFilename = process.env.KEY_PATH;
const certFilename = process.env.CERT_PATH;

if (!fs.existsSync(keyFilename) || !fs.existsSync(certFilename)) {
    throw new Error('Cert files not found');
}

const key = fs.readFileSync(keyFilename);
const cert = fs.readFileSync(certFilename);
// let passphrase = '123123123'
const expressOptions = {
  key,
  cert,
//   passphrase
};
const app = express();
const expressServer = https.createServer(expressOptions, app);
const io = new SocketServer(expressServer, {
    cors: {
        origin: '*'
    }
});


//peer
const ExpressPeerServer = require('peer').ExpressPeerServer;
const peerExpress = require('express');
const peerApp = peerExpress();
const peerServer = require('https').createServer(expressOptions, peerApp);
const peerOptions = { debug: true }
const peerPort = process.env.PEER_PORT;
peerApp.use('/peerjs', ExpressPeerServer(peerServer, peerOptions));
peerServer.listen(peerPort);


//settings
app.set("view engine", "ejs");
app.use(express.static("public"));

// #region routes
app.get('/', (req, res) => {
    res.redirect(`/${uuidv4()}`);
});

app.get('', (req, res) => {
    res.redirect(`/${uuidv4()}`);
});

app.get('/rooms', (req, res) => {
    res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
    res.render("room", { roomId: req.params.room });
});
// #endregion

// start
expressServer.listen(3000, () => {
    console.log(`listening on ${process.env.APP_URL}${process.env.APP_PORT ? ':'+process.env.APP_PORT : ''}`);
});

// #region sockets
io.on('connection', (socket) => {
    socket.on("room:join", (roomId, userId, userName) => {
        console.log('a user ' + userName + ' connected to room ' + roomId + ' id ' + userId);
        socket.join(roomId);
        let room = addUser(roomId, userId, userName)
        socket.broadcast.to(roomId).emit("room:user-connected", userId, room);
        socket.emit("room:connected-me", userId, room);

        socket.on('message:create', (message) => {
            console.log('message to ' + roomId + ': ' + message);            
            io.to(roomId).emit("message:new", message, userName);
        });

        socket.on('disconnect', () => {
            removeUser(roomId, userId)
            room = getRoom(roomId)
            //ToDo: emit a message to hide a video representation for user
            socket.broadcast.to(roomId).emit("room:user-disconnected", userId, room);
        });
    });
});
// #endregion
