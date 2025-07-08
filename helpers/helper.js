// Update function to update all the users data from mongo DB
export const updateforAll = async (user) => {
  try {
    // Fetch Codeforces rating history
    const ratingHistory = await getCodeforceRatingHistory(user.codeforcesId);
    
    console.log("This is update function")
  } catch (error) {
    console.error(`Failed to update rating history for user ${user.telegramId}:`, error);
  }
}

// Hit Codeforce api- hit codeforce api to detect change- returns true or false 
export const hitCodeforceAPI = async () => {
  try {
    console.log("Api hit")

  } catch (error) {
    console.error("Failed to hit api, will re-run task after few minutes")
  }
}

// Hit Leetcode api to detect change return true or false
export const hitLeetcodeAPI = async () => {
  try {
    console.log("Api hit")

  } catch (error) {
    console.error("Failed to hit api, will re-run task after few minutes")
  }
}