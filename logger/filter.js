// Contains the filter to filter out the log types
import winston from "winston";

// Filter
export const filterByLevel = (level) => {
  return winston.format((info) => (info.level === level ? info : false))();
};