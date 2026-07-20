import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosClient } from "./axiosClient.js";

// Define a base query function that uses axios to make HTTP requests

const axiosBaseQuery =
  () =>
  async ({ url, method = "GET", data, params }) => {
    try {
      const result = await axiosClient({ url, method, data, params });
      return { data: result.data };
    } catch (axiosError) {
      return {
        error: {
          status: axiosError.response?.status,
          data: axiosError.response?.data ?? { message: axiosError.message }
        }
      };
    }
  };

export const api = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Auth", "Server", "Channel", "Message", "Friend", "Conversation"],
  endpoints: () => ({})
});
