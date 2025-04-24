# Functional Requirements
* Integration with third party APIs
  * AccuWeather API platform
    * Get the Top 50 cities' data from their Location & Current Conditions APIs.
    * Combine the two datasets to extract the relevant data fields of the Top 50 cities. The dummy dataset below is for reference. 
  * Google APIs
    * Create a Google Excel sheet with the final report data.
    * Upload the Google Excel sheet to your Google Drive and add the generated public link to your email.
* Share the Excel sheet over email with us (zahin@iion.io, ullas@iion.io). 
* The reporting service should be able to perform goals 2 to 5 programmatically. Add the code to register it as a weekly cron job.

## Specifications
### Dummy top city dataset
```json
{
  "name": "Dhaka",
  "latitude": 23.7098,
  "temperatureCelsius": 33,
  "country": "Bangladesh",
  "region": "Asia",
  "timezone": "Asia/Dhaka",
  "longitude": 90.40711,
  "weatherText": "Partly sunny",
  "isDayTime": true,
  "temperatureFahrenheit": 91
}
```
### Tech Stack: 
NodeJS v22+ (no framework/library is used).

# Non-Functional Requirements
* Reliable backend reporting service
  * Expected functionality 
  * Tolerate user / third-party API mistakes
  * Good performance
  * Security
    * Authorization