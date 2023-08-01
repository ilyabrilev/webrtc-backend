const express = require('express');
const https = require('https');
const http = require('http');

const setupSocketServer = require( './sockets.js');
const setupPeer = require( './peer.js');
const router = require('./router.js');
const expressOptions = require('./options.js');


const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(router);


let expressServer;
if (process.env.HTTPS_DEV) {
    // start
    expressServer = https.createServer(expressOptions, app);
    expressServer.listen(process.env.APP_PORT, () => {
        console.log(`listening on ${process.env.APP_URL}${process.env.APP_PORT ? ':'+process.env.APP_PORT : ''}`);
    });
} else {
    expressServer = http.createServer(expressOptions, app);
    expressServer.listen(process.env.APP_PORT, () => {
        console.log(`listening on ${process.env.APP_URL}${process.env.APP_PORT ? ':'+process.env.APP_PORT : ''}`);
    });    
}


setupPeer(expressOptions);
setupSocketServer(expressServer);
