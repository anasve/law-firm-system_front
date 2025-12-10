import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.DEV ? "/api/guest" : "http://127.0.0.1:8000/api/guest",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  withCredentials: true
});

