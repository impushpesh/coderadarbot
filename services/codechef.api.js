import axios from "axios";

export const getCodeChefUserInfo = async (handle) => {
  const API_URL = `https://codechef-api.vercel.app/handle/${handle}`;
  const response = await axios.get(API_URL);

  if (!response.data.success || response.data.status !== 200) {
    throw new Error("API Error");
  }

  return response.data;
};
