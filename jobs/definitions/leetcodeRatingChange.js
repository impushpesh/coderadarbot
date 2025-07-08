// Leetcode rating change job definition- detects change and update db
import chalk from "chalk";
import { hitLeetcodeAPI } from "../../helpers/helper.js";

export function defineLeetcodeRatingChange(agenda) {
  agenda.define("leetcode:ratingChange", async (job) => {
    try {
      console.log(chalk.blue("[INFO] Starting LeetCode rating change job..."));
      const hasChanged = await hitLeetcodeAPI();
      if (hasChanged) {
        console.log(chalk.green("[INFO] LeetCode rating has changed."));
        // start the process to update all users' data
        // after completion, ping the users
      } else {
        console.log(chalk.yellow("[INFO] No changes in LeetCode ratings."));
      }
    } catch (error) {
      console.error(chalk.red("[ERROR] Failed to check LeetCode rating change:"), error);
    }
  });
}
