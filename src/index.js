const { sendEmailWithSpreadSheetUrl } = require("./services/emailService");
const { 
  createSheet, 
  getAccessToken,
  makeSheetPublic,
  makeMeEditorOfSheet 
} = require("./services/sheetService");
const { getMergedLocationAndConditionData } = require("./services/weatherService");
const { logger } = require("./utils/logger");

/**
 * gets the weather data
 * format the data in expected payload for sheets API
 * create a new sheet with the payload
 * make sheet publicaly accessible
 */
getMergedLocationAndConditionData().then((data) => {
  const headers = Object.keys(data[0]);
  const indexOfIsDayTimeColumn = headers.indexOf("Is Day Time"); // to make this column values centered
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
        values: row.map((cell, index) => {

          // make this column values centerd aligned
          if (index === indexOfIsDayTimeColumn) {
            return {
              userEnteredValue: { 
                stringValue: String(cell) 
              },
              userEnteredFormat: {
                horizontalAlignment: "CENTER"
              }
            }
          }

          return {
            userEnteredValue: typeof cell === 'number'
              ? { numberValue: cell }
              : { stringValue: String(cell) }
          }
        })
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
              const message = `Sheet made public successfully: id: ${sheet.spreadsheetId} url: ${sheet.spreadsheetUrl}`;
              logger.info(message);
            })
            .catch((error) => {
              const message = `Error making editor: ${error.message}`;
              logger.error(message);
            });
        }

        makeSheetPublic(sheet.spreadsheetId, accessToken, 'reader')
          .then((response) => {
            const message = `Sheet made public successfully: ${sheet.spreadsheetId}`;
            logger.info(message);
          })
          .catch((error) => {
            const message = `Error making sheet public: ${error.message}`;
            logger.error(message);
          });

        // send email
        // sendEmailWithSpreadSheetUrl(sheet.spreadsheetUrl).then((response) => logger.info(`${response}`));
      } else {
        logger.error('Failed to create sheet.');
      }
    }).catch((error) => {
      logger.error('Error creating sheet:' + error.message);
    });
  }).catch((error) => {
    logger.error('Error getting access token:' + error.message);
  });
})