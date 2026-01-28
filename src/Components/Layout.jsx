import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import useAuthStore from "../store/authStore";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const redirectAfterAuth = useAuthStore((state) => state.redirectAfterAuth);  // NEW: Pull redirect function from store

  useEffect(() => {
    const initAuth = async () => {  // NEW: Make async to await checkAuth
      const currentUser = await checkAuth();  // Await to get the user (or null)
      if (currentUser) {
        redirectAfterAuth(currentUser, navigate);  // NEW: Redirect if session exists
      }
      // Optional: else if (location.pathname === '/') navigate('/login'); // Force login if no user on home
    };
    initAuth();
  }, []);  // Still runs once on mount

  useEffect(() => {
    // Basic auth guard: Redirect to login if not logged in on protected routes
    const protectedPaths = ["/dashboard/super-admin", "/dashboard/state-admin", "/district-admin", "/technician", "/school-admin"];
    if (!user && protectedPaths.includes(location.pathname)) {
      navigate("/login");
    }
  }, [user, location.pathname, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar /> {/* Removed isAuthPage prop */}
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}