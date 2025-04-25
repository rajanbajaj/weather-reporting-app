/**
 * Convert the ISO 8601 Datetime string to the request format
 * requested format: 20/05/2022 at 2:30 pm IST
 **/
function convertToIST(datetimeString) {
  const date = new Date(datetimeString);

  // Convert to IST by adding 5 hours 30 minutes to UTC time
  const istOffset = 5.5 * 60 * 60000; // (ms)
  const utcOffset = date.getTimezoneOffset() * 60000; // (ms)
  const istDate = new Date(date.getTime()+ utcOffset + istOffset);

  // Get the components of the date
  const day = String(istDate.getDate()).padStart(2, '0');
  const month = String(istDate.getMonth() + 1).padStart(2, '0');
  const year = istDate.getFullYear();
  let hours = istDate.getHours();
  const minutes = String(istDate.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // Hour '0' should be '12'

  const formattedDate = `${day}/${month}/${year} at ${hours}:${minutes} ${ampm} IST`;
  return formattedDate;
}

const createIatTimestamp = () => {
  return Math.floor(Date.now() / 1000);
}

module.exports = {
  convertToIST,
  createIatTimestamp
}