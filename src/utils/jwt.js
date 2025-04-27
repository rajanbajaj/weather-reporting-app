const crypto = require('crypto');

const base64url = (input) => {
  const str = typeof input === 'string' ? input : JSON.stringify(input);
  return Buffer.from(str).toString('base64url');
};

const sign = (privateKey, payload, header, algorithm = 'RSA-SHA256') => {
  const encodedHeader = base64url(header);
  const encodedPayload = base64url(payload);
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  // sign with algorithm using the private key
  const signer = crypto.createSign(algorithm);
  signer.update(signatureInput);
  signer.end();
  const signature = signer.sign(privateKey, 'base64url');
  return `${signatureInput}.${signature}`;
}

module.exports = {
  base64url,
  sign
}