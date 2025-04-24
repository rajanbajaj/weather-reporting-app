const { error } = require("console");
const os = require("os");
const fs = require('fs');
const top_50_cities_location_api_url = `http://dataservice.accuweather.com/locations/v1/topcities/50?apikey=${process.env.ACCUWEATHER_API_KEY}` 
const top_50_cities_current_conditions_api_url = `http://dataservice.accuweather.com/currentconditions/v1/topcities/50?apikey=${process.env.ACCUWEATHER_API_KEY}` 
const MOCK_APIS = process.env.MOCK_APIS;

const mockFetchLocationsDataAPI = async () => {
  return {
    json: () => {
            var obj = JSON.parse(fs.readFileSync('./location-response.json', 'utf8'));
            return obj;
          },
    status: "200"
  }
}

const mockFetchCurrentConditionForTopLocationsAPI = async () => {
  return {
    json: () => {
            var obj = JSON.parse(fs.readFileSync('./current-condition-response.json', 'utf8'));
            return obj;
          },
    status: "200"
  }
}

const fetchLocationsData = async (mockData = false) => {
  if (mockData) {
    return mockFetchLocationsDataAPI();
  }

  const data = await fetch(top_50_cities_location_api_url);
  return data;
}

const fetchCurrentConditionForTopLocations = async (mockData = false) => {
  if (mockData) {
    return mockFetchCurrentConditionForTopLocationsAPI();
  }
  
  const data = await fetch(top_50_cities_current_conditions_api_url);
  return data;
}

const findObjectByKey = (objectArray, key, value) => {
  return objectArray.find((object) => object.hasOwnProperty(key) && object[key] === value);
}


// Execution
console.log("API Mocking: " + MOCK_APIS)
let top50LocationData = [];
let top50CondtionData = [];
let result = [];
fetchLocationsData(MOCK_APIS==="yes")
  .then((resp) => {
    if(resp.status == "200") {
      return resp.json()
    }

    throw error(`Request Failed with status code ${resp.status}.`)
  })
  .then((data) => top50LocationData = data)
  .catch((error) => console.log(error));

fetchCurrentConditionForTopLocations(MOCK_APIS==="yes")
  .then((resp) => {
    if(resp.status == "200") {
      return resp.json()
    }

    throw error(`Request Failed with status code ${resp.status}.`)
  })
  .then((data) => top50CondtionData = data)
  .catch((error) => console.log(error))


Promise.all([
  fetchLocationsData()
    .then((resp) => resp.json())
    .then((data) => top50LocationData = data),
  fetchCurrentConditionForTopLocations()
    .then((resp) => resp.json())
    .then((data) => top50CondtionData = data)
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
    tmp["Is Day Time"] = currentConditionForLocation.IsDayTime;
    tmp["Temperature Celsius (C)"] = currentConditionForLocation.Temperature.Metric.Value;
    tmp["Temperature Fahrenheit (F)"] = currentConditionForLocation.Temperature.Imperial.Value;
    tmp["Last Updated At"] = currentConditionForLocation.LocalObservationDateTime

    result.push(tmp);
  }

  // add result to csv file
  const headers = Object.keys(result[0]);
  const csvRows = [
    headers.join(","),
    ...result.map((obj) => headers.map((header) => `"${obj[header]}"`).join(","))
  ];

  fs.writeFileSync('output.csv', csvRows.join('\n'));
});