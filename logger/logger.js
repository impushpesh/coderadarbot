// Main logger file
import winston from "winston";

import {loglevels, logcolors} from "./levels.js"
import { transport } from "./transport.js";

// Adding custom log colors to winston
winston.addColors(logcolors);

// Logger
const logger = winston.createLogger({
  levels: loglevels,
  level: process.env.LOG_LEVEL || "debug",
  transports: transport
});

export default logger;
