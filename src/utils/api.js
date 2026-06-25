import axios from "axios";

const API = axios.create({
  baseURL: "https://uniconnect-backend-production.up.railway.app/api",
});

// Attach JWT token to every request automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;