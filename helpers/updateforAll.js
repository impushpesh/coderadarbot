export default updateforAll = async (user) => {
  try {
    // Fetch Codeforces rating history
    const ratingHistory = await getCodeforceRatingHistory(user.codeforcesId);
    
    // Update user's rating history in the database
    await UserData.updateOne(
      { telegramID: user._id },
      { $set: { codeforcesRatingHistory: ratingHistory } }
    );

    console.log(`Updated rating history for user ${user.telegramId}`);
  } catch (error) {
    console.error(`Failed to update rating history for user ${user.telegramId}:`, error);
  }
}