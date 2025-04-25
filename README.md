# weather-reporting-app
A node.js weather reporting app to schedule the reports

# Prerequisits:
* node version v23.11.0
* Create a google console developer account
* Create a service account on google cloud workspace: https://cloud.google.com/iam/docs/service-accounts-create
* Enable the following APIs for this service account:
  * Google Sheets
  * Google Drive
  * Gmail
* Generate a "Key" in JSON format for this service: https://cloud.google.com/iam/docs/keys-create-delete
* Save the key.json file for the previous step in <project_root>/credentials directory or any other directory in your machine.
* Link this service account project to Google wrokspace organization.
* (Blocker) Add users to the project and organization to allow service account to send emails on behalf of this user.
  * Google do not allow service account to send emails directly without associating any users to it.
  * Users can be associated to a service account in admin account only.
* Copy config/.env.example file to config/.env
  * ACCUWEATHER_API_KEY: API key generated for weather app
  * SERVICE_ACCOUNT_FILE_PATH: File path of the generate key.json file in previous steps
  * ENABLE_MOCKING_FOR_WEATHER_APIS: "true" or "false". If set to "true" it will mock weather APIs without using actual APIS.
  * ENABLE_SEND_EMAIL_FUNCTIONALITY: "true" or "false". If set to "true" it will send customized email to the selected user.
  * ENABLE_SHEET_FUNCTIONALITY: "true" or "false". If set to "true" it will use google sheets to store data. Otherwise it will save data to local "output.csv" file.
  * SHEET_OWNER_EMAIL_ADDRESS: comma separated gmail accounts of users that is in the organisation of the same serivce account is linked
```bash
SHEET_OWNER_EMAIL_ADDRESS=

ACCUWEATHER_API_KEY=YOUR_API_KEY_HERE
SERVICE_ACCOUNT_FILE_PATH=./credentials/key.json
ENABLE_MOCKING_FOR_WEATHER_APIS=true
ENABLE_SEND_EMAIL_FUNCTIONALITY=false
ENABLE_SHEET_FUNCTIONALITY=true

# Comma separated Email adresses to send notifications
SHEET_OWNER_EMAIL_ADDRESS=example@xyz.com,abc@vfa.com
```

# Running the application:

## Run manually:
* In project root run the following command:
```bash
npm start
```

## Setup Schedular:
* To setup schedular update the cron commands in the following files to appropriate configurations.
* By default it is set to every week on Monday at 12:00AM.
* Please make sure the changes in one file made should be matched with other file for proper use.
```bash
- ./scripts/schedular.sh (this adds cron job using crontab)
- ./scripts/remove_schedular.sh (this removes the added cron job using crontab)
```

### Activate Schedular
```bash
$ cd ./scripts
$ ./schedular.sh
```

### Deactivae Schedular
```bash
$ cd ./scripts 
$ ./remove_schedular.sh
```

# Sending notification email to the contributers (read mode configured for now)
Set the `SHEET_OWNER_EMAIL_ADDRESS` .env variable to add comma separated email addresses.
This will notify all the users listed in this varaible via email with link of the created spreadsheet.

Future Improvements: Use Gmail APIs through organization account to send customized emails.

# Logs
## Application logs:
All application logs wheather running manually or by schedular will be saved to ./logs/app.log file.
Example Logs:
```bash
[INFO] 2025-04-25T13:43:18.596Z - SHEET: Access Token:<TOKEN>
[INFO] 2025-04-25T13:43:20.584Z - SHEET: Sheet is now public with role: reader
[INFO] 2025-04-25T13:43:20.585Z - Sheet made public successfully: <SHEET_ID>
[ERROR] 2025-04-25T13:43:21.114Z - EMAIL: error in sending email with spread sheet URL: <ERROR>
[ERROR] 2025-04-25T13:43:21.195Z - SHEET: Failed to update sheet permissions:role is not defined
[INFO] 2025-04-25T13:43:21.196Z - Sheet made public successfully: id: <SHEET_ID> url: <SHARABLE_SHEET_URL>

# example error
[ERROR] 2025-04-25T17:08:46.667Z - SHEET: Failed to update sheet permissions:{"error":{"code":403,"message":"Rate limit exceeded. User message: \"Sorry, you have exceeded your sharing quota.\"","errors":[{"message":"Rate limit exceeded. User message: \"Sorry, you have exceeded your sharing quota.\"","domain":"usageLimits","reason":"sharingRateLimitExceeded"}]}}
```

## Cron logs:
If schedular is set using `./scripts/schedular.sh`, the logs will also be saved in ./logs/cron.log file.

# References:
* https://developers.google.com/workspace/guides/create-credentials#api-key
* https://console.cloud.google.com/apis/credentials?project=festive-oxide-457817-d7
* https://developers.google.com/workspace/sheets/api/reference/rest
* https://gist.github.com/ryu1kn/c76aed0af8728f659730d9c26c9ee0ed
* https://developers.google.com/identity/protocols/oauth2/service-account
* https://developers.google.com/workspace/sheets/api/reference/rest
* https://developers.google.com/workspace/drive/api/reference/rest/v3
* https://jwt.io/introduction
* https://developer.atlassian.com/cloud/jira/software/user-impersonation-for-connect-apps/
* https://www.youtube.com/watch?v=ohIAiuHMKMI&list=PLinedj3B30sDby4Al-i13hQJGQoRQDfPo