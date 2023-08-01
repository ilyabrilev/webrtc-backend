const { ExpressPeerServer } = require('peer');
const peerExpress = require('express');
const https = require('https');

const setupPeer = (expressOptions) => {
    console.log('setup peer');
    const peerApp = peerExpress();
    const peerServer = https.createServer(expressOptions, peerApp);
    const peerOptions = { debug: true }
    const peerPort = process.env.PEER_PORT;
    peerApp.use('/peerjs', ExpressPeerServer(peerServer, peerOptions));
    peerServer.listen(peerPort, () => console.log('peerjs is listening on port ' + peerPort));
}

module.exports = setupPeer;