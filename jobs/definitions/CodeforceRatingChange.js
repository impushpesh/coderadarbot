// Codeforce rating change job definition- detects change and update db

import chalk from "chalk";
import { hitCodeforceAPI } from "../../helpers/helper.js";

export function defineCodeforceRatingChange(agenda) {
  agenda.define("codeforce:ratingChange", async (job) => {
    try {
      console.log(chalk.blue("[INFO] Starting Codeforces rating change job..."));
      const hasChanged = await hitCodeforceAPI();
      if (hasChanged) {
        console.log(chalk.green("[INFO] Codeforces rating has changed."));
        // start the process to update all users' data
        // after completion, ping the users
      } else {
        console.log(chalk.yellow("[INFO] No changes in Codeforces ratings."));
      }
    } catch (error) {
      console.error(chalk.red("[ERROR] Failed to check Codeforces rating change:"), error);
    }
  });
}
