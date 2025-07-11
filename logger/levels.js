// Contains log levels and log colors for the logger

// Defining custom log levels
export const loglevels = {
  fatal: 0, // for system severiety/crash/failure , like bot crash, db not conecting
  error: 1, // errors
  warn: 2, // for potential errors
  abuse: 3, // abuse to api/bot
  info: 4, // for debugging purpose
  debug: 5, // for debugging purpose
};

// Defining custom log colors
export const logcolors = {
  fatal: "redBG",
  error: "red",
  warn: "yellow",
  abuse: "magentaBG",
  info: "green",
  debug: "blue",
};