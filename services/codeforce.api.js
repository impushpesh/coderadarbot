import axios from "axios";

/**
 * Fetch Codeforces user info (like rating, rank, etc.)
 */
export const getCodeforceUserInfo = async (handle) => {
  const API_URL = `https://codeforces.com/api/user.info?handles=${handle}`;

  const response = await axios.get(API_URL);
  if (response.data.status !== "OK") {
    throw new Error(response.data.comment || "API Error");
  }

  return response.data.result[0];
};

/**
 * Fetch Codeforces rating history for a user
 */
export const getCodeforceRatingHistory = async (handle) => {
  const API_URL = `https://codeforces.com/api/user.rating?handle=${handle}`;

  const response = await axios.get(API_URL);
  if (response.data.status !== "OK") {
    throw new Error(response.data.comment || "API Error");
  }

  return response.data.result; // This is an array of rating changes
};

/**
 * Fetch the list of upcoming/past Codeforces contests
 * Filters only upcoming contests if needed
 */
export const getCodeforceContestList = async () => {
  const API_URL = "https://codeforces.com/api/contest.list?gym=false";

  const response = await axios.get(API_URL);
  if (response.data.status !== "OK") {
    throw new Error(response.data.comment || "API Error");
  }

  return response.data.result; // This includes all contests (past and upcoming)
};
