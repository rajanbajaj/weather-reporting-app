const { logger } = require('../utils/logger');

/**
 * Attempts to transfer ownership of a Google Sheet from the service account to a Gmail user
 * within the same Google Workspace domain.
 * 
 * TODO: Currently the personal Gmail account and the service account are not in the same Google Workspace.
 * Hence, using an alternate method (`makeSheetPublic`) to get edit access instead.
 **/
const makeMeOwnerOfSheet = async (spreadsheetId, accessToken) => {
  try {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${spreadsheetId}/permissions?transferOwnership=true`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        role: 'owner',
        type: 'user',
        pendingOwner: true,
        emailAddress: process.env.SHEET_OWNER_EMAIL_ADDRESS
      })
    });

    const result = await response.json();

    if (response.status != 200) {
      throw new Error(JSON.stringify(result));
    }

    logger.info(`SHEET: Sheet owner is changed to: ${process.env.SHEET_OWNER_EMAIL_ADDRESS}`);
  } catch (error) {
    logger.error('SHEET: Failed to update sheet permissions:' + error.message);
  }
}; 

/**
 * Updates the permissions of a Google Spreadsheet to make it public or modify sharing settings
 * based on the provided permissions object.
 * Example permissions: { role: 'reader', type: 'anyone' } to make the sheet publicly readable.
 **/
const makeSheetPublic = async (spreadsheetId, accessToken, permissions) => {
  try {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${spreadsheetId}/permissions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(permissions)
    });

    const result = await response.json();

    if (response.status != 200) {
      throw new Error(JSON.stringify(result));
    }

    logger.info(`SHEET: Sheet is now public.`);
  } catch (error) {
    logger.error('SHEET: Failed to update sheet permissions:' + error.message);
  }
};

/**
 * Creates a new Google Spreadsheet using the provided payload and access token.
 **/
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

    return result;
  } catch (error) {
    console.error('Failed to create sheet:', error.message)
  }
}

module.exports = {
  createSheet,
  makeSheetPublic,
  makeMeOwnerOfSheet
}