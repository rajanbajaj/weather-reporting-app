const { 
  createSheet, 
  getAccessToken,
  makeSheetPublic,
  makeMeEditorOfSheet 
} = require("./services/sheetService");
const { getMergedLocationAndConditionData } = require("./services/weatherService");
const {
  sendEmailWithSpreadSheetUrl
} = require("./services/emailService");

/**
 * gets the weather data
 * format the data in expected payload for sheets API
 * create a new sheet with the payload
 * make sheet publicaly accessible
 */
getMergedLocationAndConditionData().then((data) => {
  const headers = Object.keys(data[0]);
  const rows = [
    ...data.map(row => headers.map(key => row[key]))
  ];

  // format headers data based on payload requirements
  // https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets
  const headersData = {
    values: headers.map(cell => (
      {
        userEnteredValue: {
          stringValue: String(cell)
        },
        userEnteredFormat: {
          backgroundColor: {
            red: 0,
            green: 0,
            blue: 1,
            alpha: 1
          },
          textFormat: {
            foregroundColor: {
              red: 1,
              green: 1,
              blue: 1,
              alpha: 1
            },
            bold: true
          }
        }
      }
    ))
  }

  // format row data based on payload requirements
  // https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets
  const rowData = rows.map(row => (
      {
        values: row.map(cell => (
          {
            userEnteredValue: typeof cell === 'number'
              ? { numberValue: cell }
              : { stringValue: String(cell) }
          }
        ))
      }
  ));

  // create the payload for sheet creation
  const payload = {
    properties: {
      title: 'Weather reporting data | Tech assignment'
    },
    sheets: [
      {
        properties: {
          title: 'Sheet1',
          gridProperties: {
            rowCount: rows.length + 1,
            columnCount: headers.length
          },
        },
        data: [
          {
            rowData: [
              headersData,
              ...rowData
            ]
          }
        ]
      }
    ]
  };

  getAccessToken().then((accessToken) => {
    createSheet(accessToken, payload).then((sheet) => {
      // if the sheet creation was successful, make it public read-only report
      if (sheet && sheet.spreadsheetId) {

        // if SHEET_OWNER_EMAIL_ADDRESS is set in .env file then make owner
        if (process.env.SHEET_OWNER_EMAIL_ADDRESS) {
          makeMeEditorOfSheet(sheet.spreadsheetId, accessToken)
            .then((response) => {
              console.log('Sheet made public successfully:', response);
            })
            .catch((error) => {
              console.error('Error making sheet public:', error.message);
            });
        }

        makeSheetPublic(sheet.spreadsheetId, accessToken, 'reader')
          .then((response) => {
            console.log('Sheet made public successfully:', response);
          })
          .catch((error) => {
            console.error('Error making sheet public:', error.message);
          });

        // send email
        sendEmailWithSpreadSheetUrl(sheet.spreadsheetUrl).then((response) => console.log(response));
      } else {
        console.error('Failed to create sheet.');
      }
    }).catch((error) => {
      console.error('Error creating sheet:', error.message);
    });
  }).catch((error) => {
    console.error('Error getting access token:', error.message);
  });
})