import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function Navbar() { // Removed isAuthPage prop
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isDashboardPage = location.pathname.startsWith("/dashboard"); // For showing Logout only on dashboards
  const isLoginPage = location.pathname === "/login";
  const isRegisterPage = location.pathname === "/register";
  const isAuthPage = isLoginPage || isRegisterPage; // Internal check for auth pages

  return (
    <nav className="bg-blue-900 text-white px-6 py-4 flex justify-between items-center">
      <Link to="/" className="font-semibold text-lg hover:text-blue-300">
        Home
      </Link>

      <div className="flex items-center gap-4">
        {user ? (
          isDashboardPage && (
            <button onClick={handleLogout} className="hover:text-blue-300">
              Logout
            </button>
          )
        ) : isAuthPage ? (
          // For auth pages: Show only the opposite link
          <>
            {isLoginPage && (
              <Link to="/register" className="hover:text-blue-300">
                Register
              </Link>
            )}
            {isRegisterPage && (
              <Link to="/login" className="hover:text-blue-300">
                Login
              </Link>
            )}
          </>
        ) : (
          // For home and other non-auth pages: Show both if not logged in
          <>
            <Link to="/login" className="hover:text-blue-300">
              Login
            </Link>
            <Link to="/register" className="hover:text-blue-300">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}