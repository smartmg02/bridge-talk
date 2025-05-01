import axios from "axios";

export const proxyToOpenAI = async (body) => {
  const apiUrl = "https://api.openai.com/v1/chat/completions";

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  };

  return await axios.post(apiUrl, body, { headers });
};
