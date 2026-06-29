import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const sendChat = async (messages, preferredIndex = 0) => {
  const res = await axios.post(`${BASE_URL}/api/chat`, {
    messages,
    preferredIndex,
  });
  return res.data;
};
