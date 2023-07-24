const fs = require('fs');

const keyFilename = process.env.KEY_PATH;
const certFilename = process.env.CERT_PATH;

if (!fs.existsSync(keyFilename) || !fs.existsSync(certFilename)) {
    throw new Error('Cert files not found');
}

const key = fs.readFileSync(keyFilename);
const cert = fs.readFileSync(certFilename);
const expressOptions = {
  key,
  cert,
};

module.exports = expressOptions;