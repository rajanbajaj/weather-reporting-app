const fs = require("fs");
const { base64url } = require("../utils/jwt");  // Custom utility to encode content in base64url
const { logger } = require("../utils/logger");  // Custom logger for logging information and errors
const { getAccessToken } = require("../services/googleTokenService")  // Service to fetch OAuth2 access token

const SERVICE_ACCOUNT_FILE_PATH = process.env.SERVICE_ACCOUNT_FILE_PATH; // Path to Google service account JSON key file

/**
 * Helper function to create raw email content formatted for the Gmail API.
 * Encodes the email as a base64url string.
 **/
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

/**
 * Sends an email via the Gmail API using a service account.
 * The email body contains a Google Spreadsheet URL.
 **/
const sendEmailWithSpreadSheetUrl = async (spreadsheetUrl) => {
  try {
      const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_FILE_PATH).toString());
      const scopes = "https://www.googleapis.com/auth/gmail.send"
      const accessToken = await getAccessToken(serviceAccount, scopes)
      const api_url = "https://gmail.googleapis.com/upload/gmail/v1/users/me/messages/send"
      const to = "rajanbajajkota@gmail.com";
      const subject = "Test Subject";
      const htmlBody = spreadsheetUrl;
      const payload = {
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
  } catch (error) {
    logger.error("EMAIL: error in sending email with spread sheet URL: "+ error.message)
  }
}

module.exports = {
  sendEmailWithSpreadSheetUrl
}
