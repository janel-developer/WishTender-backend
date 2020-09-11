const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;

const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

format.combine(format.colorize(), format.json());

const logger = createLogger({
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 6,
    silly: 7,
  },
  format: combine(format.colorize(), timestamp(), myFormat),
  transports: [new transports.Console({ level: 'info' })],
});

module.exports = logger;
