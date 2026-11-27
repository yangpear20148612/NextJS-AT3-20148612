import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",

    "Workspacers-Identifier": process.env.NEXT_PUBLIC_WORKSPACE_ID,

    "X-Intergration-Name": process.env.NEXT_PUBLIC_INTERGRATION_NAME,
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = sessionStorage.getItem("workspace_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
