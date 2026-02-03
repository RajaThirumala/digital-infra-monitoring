// pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import clsx from "clsx";

import useAuthStore from "../store/authStore";
import AccountService from "../appwrite/Account.services"
// ────────────────────────────────────────────────
// Validation Schema
// ────────────────────────────────────────────────
const schema = yup.object({
  email: yup.string().email("Invalid email address").required("Email is required"),
  password: yup.string().required("Password is required"),
  // .min(6, "Password must be at least 6 characters") // optional
});

// ────────────────────────────────────────────────
export default function Login() {
  const navigate = useNavigate();

  const { login, redirectAfterAuth, isLoading } = useAuthStore();
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const password = watch("password") || "";

  const onSubmit = async (data) => {
    setServerError("");
    try {
      await AccountService.logout();
      const user = await login(data.email, data.password);
      redirectAfterAuth(user, navigate);
    } catch (err) {
      setServerError(err.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl"
      >
        <h2 className="mb-8 text-center text-3xl font-bold text-blue-900">
          Welcome Back
        </h2>

        {serverError && (
          <div className="mb-6 rounded border border-red-400 bg-red-50 px-4 py-3 text-red-700">
            {serverError}
          </div>
        )}

        {/* Email */}
        <div className="mb-5">
          <input
            {...register("email")}
            type="email"
            placeholder="Email Address"
            disabled={isLoading}
            className={clsx(
              "w-full rounded border p-3 focus:outline-none focus:ring-2",
              errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
            )}
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>

        {/* Password with eye toggle */}
        <div className="mb-6">
          <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              disabled={isLoading}
              className={clsx(
                "w-full rounded border p-3 pr-12 focus:outline-none focus:ring-2",
                password ?  "border-gray-300 focus:ring-blue-500" : "border-red-500 focus:ring-red-500" 
              )}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className={clsx(
            "w-full rounded py-3 font-semibold text-white transition",
            isLoading ? "cursor-not-allowed bg-blue-700 opacity-70" : "bg-blue-900 hover:bg-blue-800"
          )}
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>

        {/* Switch to Register */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-blue-700 hover:underline">
            Register here
          </Link>
        </p>
      </form>
    </div>
  );
}