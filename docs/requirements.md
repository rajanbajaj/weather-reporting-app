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

### Sheet Columns
* Name	
* Country	
* Region
* Timezone
* Rank	
* Latitude	
* Longitude	
* Weather Text	
* Is Day Time	
* Temperature Celsius (C)	
* Temperature Fahrenheit (F)	
* Last Updated At

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

# Implementation Plan
* Get data of top 50 cities locations: http://dataservice.accuweather.com/locations/v1/topcities/:group?apikey={{accuweather_api_key}}
  * Name (.EnglishName)
  * Country (.Country.EnglishName)
  * Region (.Region.EnglishName)
  * TimeZone (.TimeZone.Name)
  * Rank (.Rank)
  * Latitude (.GeoPosition.Latitude)
  * Longitude (.GeoPosition.Longitude)
* Get data of current conditions of top 50 cities: http://dataservice.accuweather.com/currentconditions/v1/topcities/:group?apikey={{accuweather_api_key}}
  * Weather Text (.WeatherText)
  * Is Day Time (.IsDayTime)
  * Temperature Celsius (C) (.Temperature.Metric.Value)
  * Temperature Fahrenheit (F)	(.Temperature.Imperial.Value)
  * Last Updated At (.LocalObservationDateTime)
* Merge the data to make it required format
* Create a CSV File and Store it in local file system
* Create Google Excel sheet:
  * Use Google developer console 
  * Create a Project to get API Keys
  * Create JWT library to sign, decode and verify
  * Create JWT access tokens from API KEYs
  * Use Google APIs to make request
* Creaet Public sharable link
* Add logger to log sheet related details
* Check formatting of the sheet and values
* Send email
* Performance optimization and code refactor