import winston from "winston";
import "winston-daily-rotate-file";
const { combine, timestamp, printf, colorize, align, json, errors  } = winston.format;
import { filterByLevel } from "./filter.js";

export const transport = [
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
    format: combine(
      errors({ stack: true }),
      filterByLevel("error"),
      timestamp(),
      json()
    ),
  }),

  // Rotated fatal log - kept for 30 days
  new winston.transports.DailyRotateFile({
    filename: "logs/fatal-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    maxFiles: "30d",
    format: combine(
      errors({ stack: true }),
      filterByLevel("fatal"),
      timestamp(),
      json()
    ),
  }),

  // Rotated abuse log - kept for 30 days
  new winston.transports.DailyRotateFile({
    filename: "logs/abuse-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    maxFiles: "30d",
    format: combine(filterByLevel("abuse"), timestamp(), json()),
  }),
];
