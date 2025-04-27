const fs = require('fs');
const path = require('path');

// Create logs directory if not exists
const logDir = './logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logFile = path.join(logDir, 'app.log');

const logToFile = (level, message) => {
  const logMessage = `[${level.toUpperCase()}] ${new Date().toISOString()} - ${message}\n`;
  if (level.toUpperCase() === "ERROR") {
    throw new Error(logMessage);
  } else {
    console.log(logMessage);
  }
  fs.appendFileSync(logFile, logMessage);
};

const logger = {
  // TODO: If app environemnt is production skip loggging for debug function
  debug: (msg) => logToFile('debug', msg),
  info: (msg) => logToFile('info', msg),
  warn: (msg) => logToFile('warn', msg),
  error: (msg) => logToFile('error', msg),
};

module.exports = {
  logger
};