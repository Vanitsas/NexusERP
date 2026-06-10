import { useState } from "react";
import api from "../api/client";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/login", {
        username,
        password,
      });

      console.log("LOGIN RESPONSE:", res.data);

      // 🔥 ROBUST TOKEN PARSING (backend fark edebilir diye)
      const token =
        res.data.access_token ||
        res.data.token ||
        res.data.accessToken;

      const role =
        res.data.role ||
        res.data.user?.role ||
        "user";

      // ❌ TOKEN YOKSA PATLAT
      if (!token) {
        throw new Error("Token not found in response");
      }

      // 💾 STORAGE
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      // 🔁 APP STATE UPDATE
      onLogin(token, role);

    } catch (err) {
      console.log("LOGIN ERROR:", err);
      setError("Login failed. Check credentials or backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white">

      <div className="bg-gray-800 p-6 rounded-xl w-80 shadow-lg border border-gray-700">

        <h1 className="text-xl mb-4 font-bold text-center">
          ERP LOGIN
        </h1>

        {/* USERNAME */}
        <input
          className="w-full p-2 mb-2 text-black rounded"
          placeholder="username"
          onChange={(e) => setUsername(e.target.value)}
        />

        {/* PASSWORD */}
        <input
          className="w-full p-2 mb-2 text-black rounded"
          type="password"
          placeholder="password"
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* ERROR */}
        {error && (
          <p className="text-red-400 text-sm mb-2">
            {error}
          </p>
        )}

        {/* BUTTON */}
        <button
          onClick={login}
          disabled={loading}
          className="w-full bg-blue-500 p-2 rounded hover:bg-blue-600 transition disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

      </div>
    </div>
  );
}
