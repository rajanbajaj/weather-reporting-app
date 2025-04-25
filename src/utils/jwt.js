const crypto = require('crypto');
const fs = require('fs');

const SERVICE_ACCOUNT_FILE_PATH = process.env.SERVICE_ACCOUNT_FILE_PATH;
const SERVICE_ACCOUNT = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_FILE_PATH).toString());

const base64url = (input) => {
  const str = typeof input === 'string' ? input : JSON.stringify(input);
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

const sign = (payload, header, algorithm = 'RSA-SHA256') => {
  const encodedHeader = base64url(header);
  const encodedPayload = base64url(payload);
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  // sign with algorithm using the private key
  const signer = crypto.createSign(algorithm);
  signer.update(signatureInput);
  signer.end();
  const signature = signer.sign(SERVICE_ACCOUNT.private_key, 'base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${signatureInput}.${signature}`;
}

module.exports = {
  base64url,
  sign
}