const { error } = require("console");
const fs = require('fs');
const { convertToIST } = require("../utils/date");
const { logger } = require("../utils/logger");


const top_50_cities_location_api_url = `http://dataservice.accuweather.com/locations/v1/topcities/50?apikey=${process.env.ACCUWEATHER_API_KEY}`;
const top_50_cities_current_conditions_api_url = `http://dataservice.accuweather.com/currentconditions/v1/topcities/50?apikey=${process.env.ACCUWEATHER_API_KEY}`;
const MOCK_APIS = process.env.ENABLE_MOCKING_FOR_WEATHER_APIS === "true";

/** 
 * mocks the data the data from ./location-response.json file 
 * to prevent exhaustive use of actual APIs in DEV environment
 **/
const mockFetchLocationsDataAPI = async () => {
  return {
    json: () => {
            var obj = JSON.parse(fs.readFileSync('./location-response.json', 'utf8'));
            return obj;
          },
    status: "200"
  }
};

/** 
 * mocks the data the data from ./current-condition-response.json file 
 * to prevent exhaustive use of actual APIs in DEV environment
 **/
const mockFetchCurrentConditionForTopLocationsAPI = async () => {
  return {
    json: () => {
            var obj = JSON.parse(fs.readFileSync('./current-condition-response.json', 'utf8'));
            return obj;
          },
    status: "200"
  }
};

/** 
 * fetch top 50 cities locations data
 * strucutre of the response data is defined in ./location-response.json
 **/
const fetchLocationsData = async (mockData = false) => {
  if (mockData) {
    return mockFetchLocationsDataAPI();
  }

  const data = await fetch(top_50_cities_location_api_url);
  return data;
};

/** 
 * fetch top 50 cities locations current condition data
 * strucutre of the response is defined in ./current-condition-response.json
 **/
const fetchCurrentConditionForTopLocations = async (mockData = false) => {
  if (mockData) {
    return mockFetchCurrentConditionForTopLocationsAPI();
  }
  
  const data = await fetch(top_50_cities_current_conditions_api_url);
  return data;
};

/** 
 * find the object that matches the key, value pair in objectArray
 **/
const findObjectByKey = (objectArray, key, value) => {
  return objectArray.find((object) => object.hasOwnProperty(key) && object[key] === value);
};

const addDataToCSVFile = (result, filePath = 'output.csv', delimiter = ',') => {
  // add result to csv file
  const headers = Object.keys(result[0]);
  const csvRows = [
    headers.join(delimiter),
    ...result.map((obj) => headers.map((header) => `"${obj[header]}"`).join(delimiter))
  ];

  fs.writeFileSync(filePath, csvRows.join('\n'));
}

const getMergedLocationAndConditionData = async () => {
  let top50LocationData = [];
  let top50CondtionData = [];
  let result = [];

  result = await Promise.all([
    fetchLocationsData(MOCK_APIS)
      .then((resp) => {
        if(resp.status == "200") {
          return resp.json()
        }

        throw error(`Request Failed with status code ${resp.status}.`)
      })
      .then((data) => top50LocationData = data)
      .catch((error) => logger.error(error)),
    fetchCurrentConditionForTopLocations(MOCK_APIS)
      .then((resp) => {
        if(resp.status == "200") {
          return resp.json()
        }

        throw error(`Request Failed with status code ${resp.status}.`)
      })
      .then((data) => top50CondtionData = data)
      .catch((error) => logger.error(error))
  ]).then(() => {
    for (i=0; i<top50LocationData.length; i++) {
      locationData = top50LocationData[i];
      let tmp = {
        "Name": locationData.EnglishName,
        "Country": locationData.Country.EnglishName,
        "Region": locationData.Region.EnglishName,
        "TimeZone": locationData.TimeZone.Name,
        "Rank": locationData.Rank,
        "Latitude": locationData.GeoPosition.Latitude,
        "Longitude": locationData.GeoPosition.Longitude
      }

      let currentConditionForLocation = findObjectByKey(top50CondtionData, "Key", locationData.Key)
      tmp["Weather Text"] = currentConditionForLocation.WeatherText;
      tmp["Is Day Time"] = currentConditionForLocation.IsDayTime ? "TRUE" : "FALSE";
      tmp["Temperature Celsius (C)"] = currentConditionForLocation.Temperature.Metric.Value;
      tmp["Temperature Fahrenheit (F)"] = currentConditionForLocation.Temperature.Imperial.Value;
      tmp["Last Updated At"] = currentConditionForLocation.LocalObservationDateTime ? convertToIST(currentConditionForLocation.LocalObservationDateTime) : currentConditionForLocation.LocalObservationDateTime;

      result.push(tmp);
    }

    return result;
  });

  return result;
}

module.exports = {
  addDataToCSVFile,
  fetchCurrentConditionForTopLocations,
  fetchLocationsData,
  getMergedLocationAndConditionData,
  mockFetchCurrentConditionForTopLocationsAPI,
  mockFetchLocationsDataAPI,
};