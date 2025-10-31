// backend/src/utils/logger.js
const winston = require('winston');
const { format } = winston;

// Format personnalisé pour les logs
const logFormat = format.printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}] : ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` | ${JSON.stringify(metadata)}`;
  }
  return msg;
});

const logger = winston.createLogger({
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.colorize(),
    logFormat
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ 
      filename: 'logs/references.log',
      level: 'debug'
    }),
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    })
  ]
});

// Fonction utilitaire pour le suivi des références
const logReferenceTracking = (originalRef, normalizedRef, source, success = true) => {
  const logData = {
    original: originalRef,
    normalized: normalizedRef,
    source,
    success,
    timestamp: new Date().toISOString()
  };

  if (success) {
    logger.info(`Référence convertie: ${originalRef} -> ${normalizedRef}`, logData);
  } else {
    logger.error(`Échec de conversion de référence: ${originalRef}`, logData);
  }
};

module.exports = {
  logger,
  logReferenceTracking
};