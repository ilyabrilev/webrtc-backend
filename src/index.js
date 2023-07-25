const express = require('express');
const https = require('https');

const setupSocketServer = require( './sockets.js');
const setupPeer = require( './peer.js');
const router = require('./router.js');
const expressOptions = require('./options.js');


const app = express();
const expressServer = https.createServer(expressOptions, app);

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(router);

// start
expressServer.listen(process.env.APP_PORT, () => {
    console.log(`listening on ${process.env.APP_URL}${process.env.APP_PORT ? ':'+process.env.APP_PORT : ''}`);
});

setupPeer(expressOptions);
setupSocketServer(expressServer);
