
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function RequireAuth() {
  const [isChecking, setIsChecking] = useState(true);
  const { user, checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    const verify = async () => {
      await checkAuth();
      setIsChecking(false);
    };
    verify();
  }, [checkAuth]);

  if (isChecking || isLoading) {
    console.log("RequireAuth: Checking/loading state");
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-xl text-blue-900">Verifying access...</div>
      </div>
    );
  }

  if (!user) {
    console.log("RequireAuth: No user, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  console.log("RequireAuth: Rendering Outlet/children");
  return <Outlet />;
}