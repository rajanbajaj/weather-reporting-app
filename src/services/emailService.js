const fs = require("fs");
const crypto = require("crypto");
const SERVICE_ACCOUNT_FILE_PATH = process.env.SERVICE_ACCOUNT_FILE_PATH
const SERVICE_ACCOUNT = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_FILE_PATH).toString())
const SCOPES = "https://www.googleapis.com/auth/gmail.send"
const { base64url, sign } = require("../utils/jwt");
const { logger } = require("../utils/logger");

const createIatTimestamp = () => {
  return Math.floor(Date.now() / 1000);
}

const getAccessToken = async () => {
  let iat = createIatTimestamp()
  exp = iat + 3600 // expiration time is 1hour
  payload = {
    iss: SERVICE_ACCOUNT.client_email,
    sub: SERVICE_ACCOUNT.client_email,
    scope: SCOPES,
    aud: SERVICE_ACCOUNT.token_uri,
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

    const response = await fetch(SERVICE_ACCOUNT.token_uri, {
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

const createEmailRawContent = (to, subject, htmlBody) => {
  const str = [
    `To: ${to}`,
    `Subject: ${subject}`,
    `Content-Type: text/html; charset=UTF-8`,
    '',
    htmlBody
  ].join('\n');

  return base64url(str);
}

const sendEmailWithSpreadSheetUrl = async (spreadsheetUrl) => {
  let accessToken = await getAccessToken()
  let api_url = "https://gmail.googleapis.com/upload/gmail/v1/users/me/messages/send"
  let to = "rajanbajajkota@gmail.com";
  let subject = "Test Subject";
  let htmlBody = spreadsheetUrl;
  let payload = {
    raw: createEmailRawContent(to, subject, htmlBody)
  };

  const formBody = new URLSearchParams(payload);
  const response = await fetch(api_url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'message/rfc822'
    },
    body: formBody
  });

  const result = await response.json();

  if (response.status != 200) {
    throw new Error(JSON.stringify(result));
  }

  logger.info(`Email Sent: ${result}`);
  return response;
}

module.exports = {
  sendEmailWithSpreadSheetUrl
}
