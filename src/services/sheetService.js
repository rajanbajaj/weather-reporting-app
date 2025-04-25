const { logger } = require('../utils/logger');

const makeMeEditorOfSheet = async (spreadsheetId, accessToken) => {
  try {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${spreadsheetId}/permissions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        role: 'writer',
        type: 'user',
        emailAddress: process.env.SHEET_OWNER_EMAIL_ADDRESS
      })
    });

    const result = await response.json();

    if (response.status != 200) {
      throw new Error(JSON.stringify(result));
    }

    logger.info(`SHEET: Sheet is now public with role: ${role}`);
  } catch (error) {
    logger.error('SHEET: Failed to update sheet permissions:' + error.message);
  }
}; 

/**
 * This function transfers ownership of the sheet created by service account to gmail account is same workspace
 * TODO: Currently personal account and service account is not in same google domain workspace.
 * So using other method to get edit access makeMeEditorOfSheet.
*/
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
  makeMeEditorOfSheet,
  makeMeOwnerOfSheet
}