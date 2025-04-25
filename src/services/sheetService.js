const fs = require('fs');
const SERVICE_ACCOUNT_FILE = process.env.SERVICE_ACCOUNT_FILE;
const SERVICE_ACCOUNT = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_FILE).toString());
const SERVICE_ENDPOINT = "https://sheets.googleapis.com";
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive'
const { sign } = require("../utils/jwt")

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

  // get access token using jwt  
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

    // console.log('Access Token:', data.access_token);
    return data.access_token;
  } catch (error) {
    console.error('Failed to get access token:', error.message);
  }
}

const makeSheetPublic = async (spreadsheetId, accessToken, role = 'reader') => {
  try {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${spreadsheetId}/permissions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        role: role,                   // 'reader' (view only) or 'writer' (edit)
        type: 'anyone',               // Makes it public
        allowFileDiscovery: false     // So it won't show up in search
      })
    });

    const result = await response.json();

    if (response.status != 200) {
      throw new Error(JSON.stringify(result));
    }

    console.log(`Sheet is now public with role: ${role}`);
  } catch (error) {
    console.error('Failed to update sheet permissions:', error.message);
  }
};

const createSheet = async (accessToken, payload) => {
  try {
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const result = await response.json();
    if (response.status != 200) {
      throw new Error(JSON.stringify(result));
    }

    console.log(result);
    return result;
  } catch (error) {
    console.error('Failed to create sheet:', error.message)
  }
}

module.exports = {
  createSheet,
  getAccessToken,
  makeSheetPublic
}