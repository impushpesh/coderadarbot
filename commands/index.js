import { setupCommand } from "./setup.js";
import { userCommands } from "./users.js";
import { contestCommands } from "./contest.js";
import { codeforceCommands } from "./codeforce.js";
import { codechefCommands } from "./codechef.js";
import { leetcodeCommands } from "./leetcode.js";


export const registerCommands = (bot) => {
    userCommands(bot);
    contestCommands(bot);
    codeforceCommands(bot);
    codechefCommands(bot);
    leetcodeCommands(bot);
    setupCommand(bot);

}