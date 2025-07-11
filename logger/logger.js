import winston from "winston";
import "winston-daily-rotate-file";
const { combine, timestamp, printf, colorize, align, json, errors  } = winston.format;

// Defining custom log levels
const loglevels = {
  fatal: 0, // for system severiety/crash/failure , like bot crash, db not conecting
  error: 1, // errors
  warn: 2, // for potential errors
  abuse: 3, // abuse to api/bot
  info: 4, // for debugging purpose
  debug: 5, // for debugging purpose
};

// Defining custom log colors
const logcolors = {
  fatal: "redBG",
  error: "red",
  warn: "yellow",
  abuse: "magentaBG",
  info: "green",
  debug: "blue",
};

// Adding custom log colors to winston
winston.addColors(logcolors);

// Filter
const filterByLevel = (level) => {
  return winston.format((info) => (info.level === level ? info : false))();
};

// Logger
const logger = winston.createLogger({
  levels: loglevels,
  level: process.env.LOG_LEVEL || "debug",
  transports: [
    // Console
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: "YYYY-MM-DD hh:mm:ss.SSS A" }),
        align(),
        printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
      ),
    }),

    // Rotated combined log- kept for 14 days
    new winston.transports.DailyRotateFile({
      filename: "logs/combined-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxFiles: "14d",
      format: combine(errors({ stack: true }), timestamp(), json()),
    }),

    // Rotated error log - kept for 14 days
    new winston.transports.DailyRotateFile({
      filename: "logs/error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxFiles: "14d",
      format: combine(errors({ stack: true }),filterByLevel("error"), timestamp(), json()),
    }),

    // Rotated fatal log - kept for 30 days
    new winston.transports.DailyRotateFile({
      filename: "logs/fatal-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxFiles: "30d",
      format: combine(errors({ stack: true }),filterByLevel("fatal"), timestamp(), json()),
    }),

    // Rotated abuse log - kept for 30 days
    new winston.transports.DailyRotateFile({
      filename: "logs/abuse-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxFiles: "30d",
      format: combine(filterByLevel("abuse"), timestamp(), json()),
    }),
  ],
});

logger.fatal("help")

export default logger;
