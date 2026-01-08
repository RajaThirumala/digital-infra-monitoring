import { useState } from "react";
import { useNavigate } from "react-router-dom";
import accountService from "../appwrite/Account.services";
import useAuthStore from "../store/authStore";

export default function Login() {
  const navigate = useNavigate();
  const checkAuth = useAuthStore((state) => state.checkAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Delete existing session to prevent “session already exists”
      await accountService.logout().catch(() => {});

      // Login
      await accountService.login(email, password);

      // Update Zustand store
      await checkAuth();

      // Redirect to dashboard
      navigate("/super-admin");
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

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-800 transition"
        >
          Login
        </button>

        {/* Error Message */}
        {error && <p className="text-red-500 text-center">{error}</p>}
      </form>
    </div>
  );
}
