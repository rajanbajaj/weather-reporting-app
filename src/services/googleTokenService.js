const fs = require("fs");
const { createIatTimestamp } = require("../utils/date")
const { sign } = require("../utils/jwt");
const { logger } = require("../utils/logger");

// Get service account details and validate the file
const getServiceAccount = () => {
  // Path to Google service account JSON key file
  const SERVICE_ACCOUNT_FILE_PATH = process.env.SERVICE_ACCOUNT_FILE_PATH;
  if (!SERVICE_ACCOUNT_FILE_PATH) {
    logger.error('SERVICE_ACCOUNT_FILE_PATH is not defined in environment variables.');
  }
  
  // Check if file exists
  if (!fs.existsSync(SERVICE_ACCOUNT_FILE_PATH)) {
    logger.error(`Service account file does not exist at path: ${SERVICE_ACCOUNT_FILE_PATH}`);
  }
  
  const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_FILE_PATH).toString());
  if (
    !(
      serviceAccount.hasOwnProperty("client_email")
      && serviceAccount.hasOwnProperty("auth_uri")
      && serviceAccount.hasOwnProperty("token_uri")
      && serviceAccount.hasOwnProperty("private_key")
    )
  ) {
    logger.error("Service account file content is invalid: please check the following \
                      data [client_email, auth_uri, token_uri, private_key]");
  }

  return serviceAccount;
}

/**
 * Generates an OAuth2 access token using a Google service account and JWT.
 **/
const getAccessToken = async (scopes) => {
  const serviceAccount = getServiceAccount()
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

  const jwt = sign(serviceAccount.private_key, payload, header);
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
  getAccessToken,
  getServiceAccount
}