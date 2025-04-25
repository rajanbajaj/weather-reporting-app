const { sign } = require("../utils/jwt");
const { logger } = require("../utils/logger");
const { createIatTimestamp } = require("../utils/date")

const getAccessToken = async (serviceAccount, scopes) => {
  const iat = createIatTimestamp()
  exp = iat + 3600 // expiration time is 1hour
  payload = {
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    scope: scopes,
    aud: serviceAccount.token_uri,
    iat: iat,
    exp: exp
  }
  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };

  const jwt = sign(payload, header);
  
  // generate access token using jwt token
  try {
    const formBody = new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    });

    const response = await fetch(serviceAccount.token_uri, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formBody
    });

    const data = await response.json();

    if (response.status != "200") {
      throw new Error(JSON.stringify(data));
    }

    return data.access_token;
  } catch (error) {
    logger.error('Failed to get access token:' + error.message);
  }
}

module.exports = {
  getAccessToken
}