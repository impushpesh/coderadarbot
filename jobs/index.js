import { Agenda } from "agenda";
import dotenv from "dotenv";

//importing job definitions
import { defineCodeforceRatingChange } from "./definitions/codeforceRatingChange.js";
import { defineLeetcodeRatingChange } from "./definitions/leetcodeRatingChange.js";
import defineSendPing from "./definitions/ping.js";

dotenv.config();

const agenda = new Agenda({
  db: {
    address: process.env.MONGO_URI,
    collection: "agendaJobs",
  },
});

// Register each job “definition”
defineCodeforceRatingChange(agenda);
defineLeetcodeRatingChange(agenda);
defineSendPing(agenda);

// Configuring agenda
agenda.on("ready", async () => {
  console.log("[INFO] Agenda ready; scheduling jobs…");

  // every 5 seconds just for testing:
  await agenda.every("5 seconds", "send_ping");

  await agenda.every(
    {
      cron: "0 8,15,23 * * 4-0", // every Thu–Sun at 8,15,23
    },
    "leetcode:ratingChange"
  );
  // await agenda.every(
  //   {
  //       cron: "0" // ! Will have to make it dynamic to change based on latest contest
  //   },
  //   "codeforce:ratingChange"
  // );

  agenda.start();
});

// For codeforce- Dynamic, based on the latest contest- contest on day x- check on x+1, x+2, x+3 days at 8am, 3pm and 11pm

// Contest fetcher- Fetches contest of codeforce and saves it to db. When user asks for contest, it will fetch from db instead of fetching from codeforce API

// A job to clear db of all users who have not used the bot for 30 days

export default agenda;
