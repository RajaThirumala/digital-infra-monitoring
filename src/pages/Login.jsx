import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const redirectAfterAuth = useAuthStore((state) => state.redirectAfterAuth);
  const isLoading = useAuthStore((state) => state.isLoading); // For UI feedback

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      redirectAfterAuth(user, navigate); // Centralized redirect
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form 
        onSubmit={handleSubmit} 
        className="bg-white p-8 rounded shadow-md w-full max-w-md flex flex-col gap-6"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

        {/* Email Field */}
        <div className="flex items-center gap-4">
          <label htmlFor="email" className="w-24 font-medium text-gray-700">
            Email:
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Password Field */}
        <div className="flex items-center gap-4">
          <label htmlFor="password" className="w-24 font-medium text-gray-700">
            Password:
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="flex-1 border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Submit Button with Loading */}
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-800 transition disabled:opacity-50"
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>

        {/* Error Message */}
        {error && <p className="text-red-500 text-center">{error}</p>}
      </form>
    </div>
  );
}