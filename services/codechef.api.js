import axios from "axios";

export const getCodeChefUserInfo = async (handle) => {
  const API_URL = `https://codechef-api.vercel.app/handle/${handle}`;

  const response = await axios.get(API_URL);
  if (response.data.status !== "OK") {
    throw new Error(response.data.comment || "API Error");
  }

  return response.data.result[0];
};
