import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function RequireAuth({ children }) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    async function verify() {
      const verifiedUser = await checkAuth();
      if (!verifiedUser) {
        navigate("/login");
      }
    }
    verify(); // Always check on mount
  }, [navigate, checkAuth]);

  return user ? children : null; // Or add a loading spinner: <div>Loading...</div>
}