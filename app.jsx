import { useEffect } from "react";
import axios from "axios";

export default function App() {
  useEffect(() => {
    axios
      .get("/api/some-endpoint")
      .then((res) => console.log("API response:", res.data))
      .catch((e) => console.error("API error:", e));
  }, []);
  return <h1>Welcome to Admin Login</h1>;
}
