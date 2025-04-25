const { createIatTimestamp } = require("../utils/date")
const { sign } = require("../utils/jwt");
const { logger } = require("../utils/logger");

/**
 * Generates an OAuth2 access token using a Google service account and JWT.
 **/
const getAccessToken = async (serviceAccount, scopes) => {
  const iat = createIatTimestamp()
  let exp = iat + 300 // expiration time is 5min

  // get exp value from .env file
  if (process.env.JWT_EXPIRY) {
    const parsedExpiry = Number(process.env.JWT_EXPIRY);
    if (!isNaN(parsedExpiry)) {
      exp = iat + parsedExpiry;
    } else {
      logger.warn('Invalid JWT_EXPIRY value in environment. Using default expiry.');
    }
  }
  
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
  logger.debug("JWT token generated successfully: " + jwt);
  
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

    logger.debug("Access token generated successfully: " + data.access_token);
    return data.access_token;
  } catch (error) {
    logger.error('Failed to get access token:' + error.message);
  }
}

module.exports = {
  getAccessToken
}