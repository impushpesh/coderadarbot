// User commands
import { setupCommand } from "./users/setup.js";
import { userCommands } from "./users/users.js";
import { contestCommands } from "./users/contest.js";
import { codeforceCommands } from "./users/codeforce.js";
import { codechefCommands } from "./users/codechef.js";
import { leetcodeCommands } from "./users/leetcode.js";

// Admin commands
import { systemCommands } from "./admin/systemCommands.js";
import { logCommands } from "./admin/logCommands.js";
import {dbCommands} from "./admin/dbCommands.js";
import { jobCommands } from "./admin/jobCommands.js";
import { userManagementCommands } from "./admin/userManagementCommands.js";
import { helpCommand } from "./admin/helpCommand.js";

export const registerCommands = (bot) => {
    // User commands
    userCommands(bot);
    contestCommands(bot);
    codeforceCommands(bot);
    codechefCommands(bot);
    leetcodeCommands(bot);
    setupCommand(bot);

    // Admin commands
    systemCommands(bot);
    logCommands(bot);
    dbCommands(bot);
    jobCommands(bot);
    userManagementCommands(bot);
    helpCommand(bot);
}