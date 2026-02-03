import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import useAuthStore from "../store/authStore";
import AccountService from "../appwrite/Account.services"
// async function logout(){
//   await AccountService.logout();
// }

export default function Layout() {
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, checkAuth, isLoading } = useAuthStore();
  

  // Run auth check only once on app load
  useEffect(() => {
    checkAuth(); // This updates user in store if session exists
  }, [checkAuth]);

  // Protect ONLY dashboard routes
  useEffect(() => {
    if (isLoading) return;

    const isDashboard = location.pathname.startsWith("/dashboard/");
    const isWaiting = location.pathname === "/waiting-approval";

    // If on dashboard and no user → redirect to login
    if (isDashboard && !user) {
      navigate("/login", { replace: true });
    }

    // If on waiting-approval but already approved → redirect to dashboard
    if (isWaiting && user?.labels?.length > 0) {
      // Use role to decide dashboard
      const role = user.labels.find(r => 
        ["superadmin", "stateadmin", "districtadmin", "technician", "schooladmin"].includes(r)
      );

      const pathMap = {
        superadmin: "/dashboard/super-admin",
        stateadmin: "/dashboard/state-admin",
        districtadmin: "/dashboard/district-admin",
        technician: "/dashboard/technician",
        schooladmin: "/dashboard/school-admin",
      };

      if (role && pathMap[role]) {
        navigate(pathMap[role], { replace: true });
      }
    }
  }, [user, isLoading, location.pathname, navigate]);

  return (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <div className="flex-1">
      {console.log("Layout: Rendering Outlet")}
      <Outlet />
    </div>
  </div>
);
}