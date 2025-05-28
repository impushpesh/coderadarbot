import axios from "axios";

export const getLeetCodeRatingInfo = async (username) => {
  const query = `
    query userContestRankingInfo($username: String!) {
      userContestRanking(username: $username) {
        attendedContestsCount
        rating
      }
    }
  `;

  const variables = { username };

  try {
    const response = await axios.post(
      "https://leetcode.com/graphql",
      {
        query,
        variables,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = response.data?.data?.userContestRanking;
    if (!data || !data.attendedContestsCount || !data.rating) {
      throw new Error("Invalid or missing user contest data");
    }

    return {
      attendedContestsCount: data.attendedContestsCount,
      rating: Math.round(data.rating),
    };
  } catch (err) {
    console.error("Error fetching LeetCode data:", err.message);
    return null;
  }
};

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
