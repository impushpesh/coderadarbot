import axios from "axios";

export const getLeetCodeRatingInfo = async (username) => {
  const query = `
    query userContestRankingInfo($username: String!) {
      userContestRanking(username: $username) {
        attendedContestsCount
        rating
      }
      userContestRankingHistory(username: $username) {
        attended
        trendDirection
        problemsSolved
        totalProblems
        finishTimeInSeconds
        rating
        ranking
        contest {
          title
          startTime
        }
      }
    }
  `;

  const variables = { username };

  try {
    const response = await axios.post(
      "https://leetcode.com/graphql",
      { query, variables },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const rankingInfo = response.data?.data?.userContestRanking;
    const historyRaw = response.data?.data?.userContestRankingHistory;

    if (!rankingInfo || !historyRaw || !Array.isArray(historyRaw)) {
      throw new Error("LeetCode data is missing or invalid.");
    }

    const attendedContests = historyRaw
      .filter((entry) => entry.attended)
      .map((entry) => ({
        title: entry.contest.title,
        startTime: entry.contest.startTime,
        rating: entry.rating,
        ranking: entry.ranking,
        attended: entry.attended,
      }));

    return {
      attendedContestsCount: rankingInfo.attendedContestsCount,
      rating: rankingInfo.rating,
      history: attendedContests,
    };
  } catch (err) {
    console.error("Error fetching LeetCode data:", err.message);
    return null;
  }
};


// To get public profile information
export const getLeetCodePublicProfile = async (username) => {
  const query = `
    query userPublicProfile($username: String!) {
      matchedUser(username: $username) {
        contestBadge {
          name
        }
        githubUrl
        twitterUrl
        linkedinUrl
        profile {
          ranking
          userAvatar
          countryName
        }
      }
    }
  `;

  const variables = { username };

  try {
    const response = await axios.post(
      "https://leetcode.com/graphql",
      { query, variables },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const user = response.data?.data?.matchedUser;

    if (!user) {
      throw new Error("No matched user found.");
    }

    return {
      username: username,
      badge: user.contestBadge?.name || "No badge",
      avatar: user.profile?.userAvatar || null,
      ranking: user.profile?.ranking ?? "N/A",
      country: user.profile?.countryName || "Unknown",
      linkedin: user.linkedinUrl || "Not provided",
      github: user.githubUrl || "Not provided",
      twitter: user.twitterUrl || "Not provided",
    };
  } catch (err) {
    console.error("Error fetching LeetCode profile:", err.message);
    return null;
  }
};



