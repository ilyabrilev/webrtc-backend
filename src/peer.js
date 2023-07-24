const { ExpressPeerServer } = require('peer');
const peerExpress = require('express');
const https = require('https');

const setupPeer = (expressOptions) => {
    const peerApp = peerExpress();
    const peerServer = https.createServer(expressOptions, peerApp);
    const peerOptions = { debug: true }
    const peerPort = process.env.PEER_PORT;
    peerApp.use('/peerjs', ExpressPeerServer(peerServer, peerOptions));
    peerServer.listen(peerPort);
}

module.exports = setupPeer;