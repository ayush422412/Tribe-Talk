import axios from "axios";

// Create an axios instance with a base URL and credentials configuration
export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5000/api",
  withCredentials: true
});
