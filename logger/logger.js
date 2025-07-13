// Main logger file
import winston from "winston";
import dotenv from "dotenv";

import {loglevels, logcolors} from "./levels.js"
import { transport } from "./transport.js";

// For transporting logs to telemetary
import { Logtail } from '@logtail/node';
import { LogtailTransport } from '@logtail/winston';

dotenv.config();

const logtail = new Logtail(process.env.SOURCE_TOKEN, {

  endpoint: `https://${process.env.INGESTING_HOST}`,

});

// Adding custom log colors to winston
winston.addColors(logcolors);

// Logger
const logger = winston.createLogger({
  levels: loglevels,
  level: process.env.LOG_LEVEL || "debug",
  transports: [...transport,    new LogtailTransport(logtail)]
});

export default logger;
