const { createSheet, getAccessToken ,makeSheetPublic } = require("./services/sheetService");
const { addDataToCSVFile, getMergedLocationAndConditionData } = require("./services/weatherService");

getMergedLocationAndConditionData().then((data) => addDataToCSVFile(data))
getAccessToken().then((accessToken) => {
  createSheet(accessToken).then((sheet) => {
    // if the sheet creation was successful, make it public
    if (sheet && sheet.spreadsheetId) {
      makeSheetPublic(sheet.spreadsheetId, accessToken, 'writer')
        .then((response) => {
          console.log('Sheet made public successfully:', response);
        })
        .catch((error) => {
          console.error('Error making sheet public:', error.message);
        });
    } else {
      console.error('Failed to create sheet.');
    }
  }).catch((error) => {
    console.error('Error creating sheet:', error.message);
  });
}).catch((error) => {
  console.error('Error getting access token:', error.message);
});