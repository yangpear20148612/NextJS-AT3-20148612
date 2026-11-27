"use client";

import { useEffect } from "react";
import api from "../../lib/api";

export default function TestAPI() {
  useEffect(() => {
    const testAPI = async () => {
      try {
        const response = await api.get("/");

        console.log("API Response:", response.data);
      } catch (error) {
        console.error("API Error:", error.response?.data || error.message);
      }
    };

    testAPI();
  }, []);

  return (
    <div>
      <h1>API Connection Test</h1>
      <p>Check your browser console for the API response.</p>
    </div>
  );
}
