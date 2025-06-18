import { Agenda } from 'agenda';
import dotenv from 'dotenv';
import chalk from 'chalk';
import { getCodeChefUserInfo, getLeetCodeRatingInfo } from '../services/index.js';
dotenv.config();

const agenda = new Agenda({
    db: {
        address: process.env.MONGO_URI,
        collection: 'agendaJobs'
    }
})

// For leetcode and codechef- Every THU, FRI, SAT, SUN at 8am, 3pm and 11pm, from a pool of random useers, fetch the rating and if the rating change is detected, start a job to update the db of all users and ping those users.


// For codeforce- Dynamic, based on the latest contest- contest on day x- check on x+1, x+2, x+3 days at 8am, 3pm and 11pm

// Contest fetcher- Fetches contest of codeforce and saves it to db. When user asks for contest, it will fetch from db instead of fetching from codeforce API

// A job to clear db of all users who have not used the bot for 30 days

export default agenda;