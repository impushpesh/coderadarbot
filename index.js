import { Telegraf } from "telegraf";
import chalk from "chalk";
import { format } from "date-fns";

import {
  getCodeforceUserInfo,
  getCodeChefUserInfo,
  getUpcomingCodeforcesContests,
  getCodeforceRatingHistory,
  getLeetCodeRatingInfo,
  getLeetCodePublicProfile
} from "./services/index.js";

import dotenv from "dotenv";
dotenv.config();

import connectDB from "./lib/connection.js";
await connectDB();

import User from "./models/user.model.js";

const bot = new Telegraf(process.env.BOT_TOKEN);

// Start command
bot.start(async (ctx) => {
  console.log(
    chalk.cyan(
      `[COMMAND] /start triggered by id:  ${ctx.from.id} and username: ${
        ctx.from.username || "N/A"
      }`
    )
  );
  console.dir(ctx.from, { depth: null });

  const existingUser = await User.findOne({ telegramId: ctx.from.id });

  if (!existingUser) {
    const newUser = new User({
      telegramId: ctx.from.id,
      isBot: ctx.from.is_bot,
      firstName: ctx.from.first_name,
      lastName: ctx.from.last_name,
      username: ctx.from.username,
      languageCode: ctx.from.language_code,
    });

    await newUser.save();
    console.log(
      chalk.green(
        `[DB] New user saved: ${newUser.username || newUser.telegramId}`
      )
    );
  } else {
    console.log(
      chalk.yellow(
        `[DB] User already exists: ${
          existingUser.username || existingUser.telegramId
        }`
      )
    );
    console.log(
      chalk.gray(
        `[DB] Data saving denied for ${
          existingUser.username || existingUser.telegramId
        }`
      )
    );
  }

  ctx.reply(`Welcome ${ctx.from.first_name}!`);
});

// Help command
bot.help((ctx) => {
  console.log(
    chalk.cyan(
      `[COMMAND] /help triggered by id:  ${ctx.from.id} and username: ${
        ctx.from.username || "N/A"
      }`
    )
  );
  ctx.reply(
    "The list of available commands:\n" +
      "/codeforce - Get Codeforces user info\n" +
      "/codeforceRating - Get Codeforces user rating\n" +
      "/codechef - Get CodeChef user info\n" +
      "/codechefRating - Get CodeChef user rating\n" +
      "/leetcode - Get LeetCode user Info\n" +
      "/leetcodeRating - Get LeetCode user rating\n" +
      "/contest - Get Upcoming  contest list\n" + // From Codechef + Codeforces + Leetcode
      "/status- Get your status(Rating) in all platforms\n" + // Codeforces + Codechef + Leetcode
      "/delete - Delete your profile\n" + // Delete user info from DB
      "/info - Get your profile info saved on db\n" + // Get user info from DB
      "/setup - Set up your profile\n" // Ask for user id of platforms- Codeforces, Codechef, Leetcode
  );
});

// /codeforce - Get Codeforces user info
bot.command("codeforce", async (ctx) => {
  try {
    console.log(
      chalk.cyan(
        `[COMMAND] /codeforce triggered by id:  ${ctx.from.id} and username: ${
          ctx.from.username || "N/A"
        }`
      )
    );

    const user = await User.findOne({ telegramId: ctx.from.id });

    if (!user || !user.codeforcesId) {
      console.log(
        chalk.yellow("[WARN] Codeforces user not found or ID not set.")
      );
      return ctx.reply(
        "Please set up your Codeforces username using /setup command."
      );
    }

    const userInfo = await getCodeforceUserInfo(user.codeforcesId);

    if (!userInfo) {
      console.log(
        chalk.red("[ERROR] Failed to fetch user info from Codeforces.")
      );
      return ctx.reply(
        "Failed to fetch Codeforces user info. Please check your username from /info command."
      );
    }

    const {
      handle,
      firstName,
      lastName,
      country,
      rating,
      maxRating,
      rank,
      maxRank,
      titlePhoto,
    } = userInfo;

    const name = `${firstName || ""} ${lastName || ""}`.trim();

    const message = `Handle: ${handle}
Name: ${name || "N/A"}
Country: ${country || "N/A"}
Rating: ${rating || "N/A"}
Max Rating: ${maxRating || "N/A"}
Rank: ${rank || "N/A"}
Max Rank: ${maxRank || "N/A"}`;

    await ctx.replyWithPhoto({ url: titlePhoto }, { caption: message });

    console.log(
      chalk.green(
        `[SUCCESS] Codeforces info sent for id:  ${ctx.from.id} and username: ${
          ctx.from.username || "N/A"
        }`
      )
    );
  } catch (error) {
    console.error(chalk.red("[FATAL] Error in /codeforce command:"), error);
    ctx.reply(
      "Oops! Something went wrong while fetching your Codeforces info."
    );
  }
});

// TODO: Send a graph also to the user, showing their ratings. Packages- chartjs, canva , chartjs-node-canvas
// /codeforce-rating - Get Codeforces user rating
bot.command("codeforceRating", async (ctx) => {
  try {
    console.log(
      chalk.cyan(
        `[COMMAND] /codeforceRating triggered by id:  ${
          ctx.from.id
        } and username: ${ctx.from.username || "N/A"}`
      )
    );

    const user = await User.findOne({ telegramId: ctx.from.id });
    if (!user || !user.codeforcesId) {
      console.log(
        chalk.yellow("[WARN] User not found or Codeforces ID not set.")
      );
      return ctx.reply(
        "Please set up your Codeforces username using /setup command."
      );
    }

    const ratingHistory = await getCodeforceRatingHistory(user.codeforcesId);

    if (!ratingHistory || ratingHistory.length < 2) {
      console.log(chalk.yellow("[INFO] Not enough rating history data."));
      return ctx.reply("Not enough contest data to show rating changes.");
    }

    const latest = ratingHistory[ratingHistory.length - 1];
    const previous = ratingHistory[ratingHistory.length - 2];

    const currentRating = latest.newRating;
    const previousRating = previous.newRating;
    const ratingChange = currentRating - previousRating;
    const sign = ratingChange >= 0 ? "+" : "-";

    const message = `Current Rating: ${currentRating}
Previous Rating: ${previousRating}
Rating Change: ${sign}${Math.abs(ratingChange)}`;

    await ctx.reply(message);
    console.log(
      chalk.green(
        `[SUCCESS] Rating change sent for id:  ${ctx.from.id} and username: ${
          ctx.from.username || "N/A"
        }`
      )
    );
  } catch (error) {
    console.error(
      chalk.red("[FATAL] Error in /codeforceRating command:"),
      error
    );
    ctx.reply("Oops! Something went wrong while fetching your CodeForce info.");
  }
});

// /codechef - Get CodeChef user info
bot.command("codechef", async (ctx) => {
  try {
    console.log(
      chalk.cyan(
        `[COMMAND] /codechef triggered by id:  ${ctx.from.id} and username: ${
          ctx.from.username || "N/A"
        }`
      )
    );

    const user = await User.findOne({ telegramId: ctx.from.id });

    if (!user || !user.codechefId) {
      console.log(
        chalk.yellow("[WARN] User not found or CodeChef ID not set.")
      );
      return ctx.reply(
        "Please set up your CodeChef username using /setup command."
      );
    }

    const userInfo = await getCodeChefUserInfo(user.codechefId);

    if (!userInfo) {
      console.log(chalk.red("[ERROR] Failed to fetch CodeChef user info."));
      return ctx.reply(
        "Failed to fetch codechef user info. Please check your username. from /info command."
      );
    }

    const {
      profile,
      name,
      currentRating,
      highestRating,
      globalRank,
      countryRank,
      countryName,
      stars,
    } = userInfo;

    const message = `
Name: ${name || "N/A"}
Country: ${countryName || "N/A"}
Rating: ${currentRating || "N/A"}
Max Rating: ${highestRating || "N/A"}
Global Rank: ${globalRank || "N/A"}
Country Rank: ${countryRank || "N/A"}
Stars: ${stars || "N/A"}`;

    await ctx.replyWithPhoto({ url: profile }, { caption: message });
    console.log(
      chalk.green(
        `[SUCCESS] CodeChef user info sent for id:  ${
          ctx.from.id
        } and username: ${ctx.from.username || "N/A"}`
      )
    );
  } catch (error) {
    console.error(chalk.red("[FATAL] Error in /codechef command:"), error);
    ctx.reply("Oops! Something went wrong while fetching your CodeChef info.");
  }
});

// TODO: Send a graph also to the user, showing their ratings.
// /codechefRating - Get CodeChef user rating
bot.command("codechefRating", async (ctx) => {
  try {
    console.log(
      chalk.cyan(
        `[COMMAND] /codechefRating triggered by id:  ${
          ctx.from.id
        } and username: ${ctx.from.username || "N/A"}`
      )
    );

    const user = await User.findOne({ telegramId: ctx.from.id });
    if (!user || !user.codechefId) {
      console.log(
        chalk.yellow("[WARN] User not found or CodeChef ID not set.")
      );
      return ctx.reply(
        "Please set up your CodeChef username using /setup command."
      );
    }

    const userInfo = await getCodeChefUserInfo(user.codechefId);

    if (!userInfo || !userInfo.ratingData || userInfo.ratingData.length < 2) {
      console.log(chalk.yellow("[INFO] Not enough rating history data."));
      return ctx.reply("Not enough contest data to show rating changes.");
    }

    const ratingHistory = userInfo.ratingData;
    const latest = ratingHistory[ratingHistory.length - 1];
    const previous = ratingHistory[ratingHistory.length - 2];

    const currentRating = parseInt(latest.rating, 10);
    const previousRating = parseInt(previous.rating, 10);
    const ratingChange = currentRating - previousRating;
    const sign = ratingChange >= 0 ? "+" : "-";

    const message = `Current Rating: ${currentRating}
Previous Rating: ${previousRating}
Rating Change: ${sign}${Math.abs(ratingChange)}`;

    await ctx.reply(message);
    console.log(
      chalk.green(
        `[SUCCESS] CodeChef rating change sent for id:  ${
          ctx.from.id
        } and username: ${ctx.from.username || "N/A"}`
      )
    );
  } catch (error) {
    console.error(
      chalk.red("[FATAL] Error in /codechefRating command:"),
      error
    );
    ctx.reply("Oops! Something went wrong while fetching your CodeChef info.");
  }
});

// /leetcode - Get LeetCode user Info
bot.command("leetcode", async (ctx) => {
  try {
    console.log(
      chalk.cyan(
        `[COMMAND] /leetcode triggered by id:  ${ctx.from.id} and username: ${
          ctx.from.username || "N/A"
        }`
      )
    );

    const user = await User.findOne({ telegramId: ctx.from.id });

    if (!user || !user.leetcodeId) {
      console.log(
        chalk.yellow("[WARN] User not found or LeetCode ID not set.")
      );
      return ctx.reply(
        "Please set up your LeetCode username using /setup command."
      );
    }

    const userInfo = await getLeetCodePublicProfile(user.leetcodeId);

    if (!userInfo) {
      console.log(chalk.red("[ERROR] Failed to fetch LeetCode user info."));
      return ctx.reply(
        "Failed to fetch LeetCode user info. Please check your username from the /info command."
      );
    }

    const {
      badge,
      avatar,
      ranking,
      country,
      linkedin,
      github,
      twitter,
    } = userInfo;

    const message = `
LeetCode ID: ${user.leetcodeId}
Ranking: ${ranking || "N/A"}
Country: ${country || "N/A"}
Badge: ${badge || "N/A"}

Social Links:
${twitter ? ` Twitter: ${twitter}` : ""}
${github ? ` GitHub: ${github}` : ""}
${linkedin ? ` LinkedIn: ${linkedin}` : ""}
    `.trim();

    await ctx.replyWithPhoto({ url: avatar }, { caption: message });
    console.log(
      chalk.green(
        `[SUCCESS] LeetCode user info sent for id:  ${
          ctx.from.id
        } and username: ${ctx.from.username || "N/A"}`
      )
    );
  } catch (error) {
    console.error(chalk.red("[FATAL] Error in /leetcode command:"), error);
    ctx.reply("Oops! Something went wrong while fetching your LeetCode info.");
  }
});

// /leetcodeRating - Get LeetCode user rating
bot.command("leetcodeRating", async (ctx) => {
  try {
    console.log(
      chalk.cyan(
        `[COMMAND] /leetcodeRating triggered by id: ${
          ctx.from.id
        } and username: ${ctx.from.username || "N/A"}`
      )
    );

    const user = await User.findOne({ telegramId: ctx.from.id });
    if (!user || !user.leetcodeId) {
      console.log(chalk.yellow("[WARN] LeetCode ID not found."));
      return ctx.reply("Please set up your LeetCode username using /setup command.");
    }

    const userInfo = await getLeetCodeRatingInfo(user.leetcodeId);

    if (!userInfo) {
      return ctx.reply("Could not fetch your LeetCode contest data.");
    }

    const { attendedContestsCount, rating } = userInfo;

    const message = `LeetCode Contest Stats:
Attended Contests: ${attendedContestsCount}
Current Rating: ${rating}`;

    await ctx.reply(message);

    console.log(
      chalk.green(
        `[SUCCESS] LeetCode rating sent for id: ${
          ctx.from.id
        } and username: ${ctx.from.username || "N/A"}`
      )
    );
  } catch (error) {
    console.error(chalk.red("[FATAL] Error in /leetcodeRating command:"), error);
    ctx.reply("Oops! Something went wrong while fetching your LeetCode info.");
  }
});

// /contest - Get Upcoming contest list
bot.command("contest", async (ctx) => {
  try {
    console.log(
      chalk.cyan(
        `[COMMAND] /contest triggered by id: ${ctx.from.id} and username: ${
          ctx.from.username || "N/A"
        }`
      )
    );

    const contests = await getUpcomingCodeforcesContests();

    if (!contests || contests.length === 0) {
      return ctx.reply("No upcoming contests found.");
    }

    let message = ` *Upcoming Codeforces Contests*\n\n`;

    contests.forEach((contest, index) => {
      const startDate = new Date(contest.startTimeSeconds * 1000);
      const durationMins = contest.durationSeconds / 60;
      message += `*${index + 1}. ${contest.name}*\n🕒 Duration: ${
        durationMins >= 60
          ? `${durationMins / 60} hrs`
          : `${durationMins} mins`
      }\n Starts: ${format(startDate, "PPPppp")}\n\n`;
    });

    await ctx.reply(message.trim());

    console.log(
      chalk.green(
        `[SUCCESS] Sent upcoming contests for id: ${ctx.from.id} (${ctx.from.username || "N/A"})`
      )
    );
  } catch (error) {
    console.error(chalk.red("[FATAL] Error in /contest command:"), error);
    ctx.reply("Oops! Couldn't fetch contest list from Codeforces.");
  }
});

// /status - Get your status(Rating) in all platforms
bot.command("status", async (ctx) => {
  try {
    console.log(
      chalk.cyan(
        `[COMMAND] /status triggered by id:  ${ctx.from.id} and username: ${
          ctx.from.username || "N/A"
        }`
      )
    );

    const user = await User.findOne({ telegramId: ctx.from.id });

    if (!user) {
      console.log(chalk.yellow("[WARN] User not found in database."));
      return ctx.reply("No profile found. Please register your handles first.");
    }

    const { codeforcesId, codechefId, leetcodeId } = user;

    if (!codeforcesId && !codechefId && !leetcodeId) {
      return ctx.reply("You have not set up any platform handles yet.");
    }

    let message = "Your current ratings:\n";

    if (codeforcesId) {
      const cfRating = await getCodeforceRatingHistory(codeforcesId);
      if (cfRating && cfRating.length > 0) {
        const latest = cfRating[cfRating.length - 1];
        message += `Codeforces: ${latest.newRating}\n`;
      } else {
        message += "Codeforces: Not available\n";
      }
    }

    if (codechefId) {
      const ccRating = await getCodeChefUserInfo(codechefId);
      if (ccRating && ccRating.ratingData && ccRating.ratingData.length > 0) {
        const latest = ccRating.ratingData[ccRating.ratingData.length - 1];
        message += `CodeChef: ${latest.rating}\n`;
      } else {
        message += "CodeChef: Not available\n";
      }
    }

    if (leetcodeId) {
      const lcRating = await getLeetCodeRatingInfo(leetcodeId);
      if (lcRating) {
        message += `LeetCode: ${lcRating.rating}\n`;
      } else {
        message += "LeetCode: Not available\n";
      }
    }

    await ctx.reply(message.trim());
    console.log(
      chalk.green(`[SUCCESS] Status sent for Telegram ID: ${ctx.from.id}`)
    );
  } catch (error) {
    console.error(chalk.red("[FATAL] Error in /status command:"), error);
    ctx.reply("Oops! Something went wrong while fetching your status.");
  }
});

// /delete - Delete your profile from database
bot.command("delete", async (ctx) => {
  try {
    console.log(
      chalk.cyan(
        `[COMMAND] /delete triggered by id: ${ctx.from.id} and username: ${
          ctx.from.username || "N/A"
        }`
      )
    );

    const user = await User.findOne({ telegramId: ctx.from.id });
    if (!user) {
      console.log(chalk.yellow("[WARN] User not found in database."));
      return ctx.reply("No profile found to delete.");
    }

    await User.deleteOne({ telegramId: ctx.from.id });

    await ctx.reply("Your profile has been deleted successfully.");
    console.log(
      chalk.green(`[SUCCESS] Profile deleted for Telegram ID: ${ctx.from.id}`)
    );
  } catch (error) {
    console.error(chalk.red("[FATAL] Error in /delete command:"), error);
    ctx.reply("Oops! Something went wrong while deleting your profile.");
  }
});

// /info - Get your profile info saved on db
bot.command("info", async (ctx) => {
  try {
    console.log(
      chalk.cyan(
        `[COMMAND] /info triggered by id: ${ctx.from.id} and username: ${
          ctx.from.username || "N/A"
        }`
      )
    );

    const user = await User.findOne({ telegramId: ctx.from.id });

    if (!user) {
      console.log(chalk.yellow("[WARN] User not found in database."));
      return ctx.reply("No profile found. Please register your handles first.");
    }

    const {
      leetcodeId = "Not set",
      codeforcesId = "Not set",
      codechefId = "Not set",
      firstName = "",
      lastName = "",
      username = "N/A",
    } = user;

    const fullName = `${firstName} ${lastName}`.trim() || "N/A";

    const message = `
Your profile info:

Name: ${fullName}
Telegram Username: @${username}
LeetCode: ${leetcodeId || "Not set"}
Codeforces: ${codeforcesId || "Not set"}
CodeChef: ${codechefId || "Not set"}
    `.trim();

    await ctx.reply(message);
    console.log(
      chalk.green(`[SUCCESS] /info response sent for Telegram ID: ${ctx.from.id}`)
    );
  } catch (error) {
    console.error(chalk.red("[FATAL] Error in /info command:"), error);
    ctx.reply("Oops! Something went wrong while fetching your profile info.");
  }
});

// Setup command
const userStates = new Map(); // Telegram user ID -> { stage, data } Structure- Map<telegramUserId, { stage: string, data?: object }>

bot.command("setup", (ctx) => {
  console.log(
    chalk.cyan(
      `[COMMAND] /setup triggered by id:  ${ctx.from.id} and username: ${
        ctx.from.username || "N/A"
      }`
    )
  );

  const userId = ctx.from.id;
  userStates.set(userId, { stage: "awaiting_codeforces" });

  console.log(
    chalk.yellow(`[INFO] Awaiting Codeforces username from user ${userId}`)
  );
  ctx.reply("Please enter your Codeforces username:");
});

bot.on("text", async (ctx) => {
  const userId = ctx.from.id;
  const state = userStates.get(userId);

  if (!state) return;

  const input = ctx.message.text.trim();

  if (state.stage === "awaiting_codeforces") {
    console.log(
      chalk.cyan(`[INPUT] Codeforces username from ${userId}: ${input}`)
    );
    const valid = await getCodeforceUserInfo(input);
    if (!valid) {
      console.log(
        chalk.red(
          `[ERROR] Invalid Codeforces username from ${userId}: ${input}`
        )
      );
      return ctx.reply("Invalid Codeforces username. Try again.");
    }

    state.data = { codeforcesId: input };
    state.stage = "awaiting_codechef";
    console.log(chalk.green(`[OK] Codeforces username accepted for ${userId}`));
    ctx.reply("Got it! Now enter your CodeChef username:");
  } else if (state.stage === "awaiting_codechef") {
    console.log(
      chalk.cyan(`[INPUT] CodeChef username from ${userId}: ${input}`)
    );
    state.data.codechefId = input;
    state.stage = "awaiting_leetcode";
    console.log(chalk.green(`[OK] CodeChef username accepted for ${userId}`));
    ctx.reply("Great! Now enter your LeetCode username:");
  } else if (state.stage === "awaiting_leetcode") {
    console.log(
      chalk.cyan(`[INPUT] LeetCode username from ${userId}: ${input}`)
    );
    state.data.leetcodeId = input;

    await User.updateOne({ telegramId: userId }, { $set: state.data });
    console.log(
      chalk.green(`[SUCCESS] User data saved for ${userId}:`),
      state.data
    );

    ctx.reply("Setup complete! Your platform handles have been saved.");
    userStates.delete(userId);
  }
});

// Bot launch
bot.launch();
console.log(chalk.green("[INFO] Bot is running..."));

bot.catch((err) => {
  console.error(chalk.red("[FATAL] Error occurred:"), err);
});
