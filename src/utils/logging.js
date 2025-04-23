const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    // Slightly adjust printf to handle potential objects in the message
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
      // If meta contains an error stack or other relevant info, include it
      if (meta.error && meta.error.stack) {
        log += `\n${meta.error.stack}`;
      } else if (Object.keys(meta).length > 0 && !(meta.error instanceof Error && !meta.error.stack)) { // Avoid logging empty/non-stack errors twice
         // Log other metadata if present and not just a basic error message already in `message`
         try {
            const metaString = JSON.stringify(meta, null, 2);
            if (metaString !== '{}') {
               log += `\n${metaString}`;
            }
         } catch (e) { /* Ignore stringify errors */ }
      }
      return log;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'app.log' })
  ]
});

function logEvent(event, message) {
  logger.info(`${event}: ${message}`);
}

function logError(event, error) {
  // Log the full error object for better stack trace information
  // Pass the error object in the metadata part of the log entry
  logger.error(`${event}`, { error: error instanceof Error ? error : new Error(String(error)) });
}

module.exports = {
  logEvent,
  logError
};
