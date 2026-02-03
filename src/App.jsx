import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import Layout from "./Components/Layout";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import SuperAdmin from "./pages/dashboards/SuperAdmin.jsx";
import StateAdmin from "./pages/dashboards/StateAdmin.jsx";
import DistrictAdmin from "./pages/dashboards/DistrictAdmin.jsx";
import Technician from "./pages/dashboards/Technician.jsx";
import SchoolAdmin from "./pages/dashboards/SchoolAdmin.jsx";
import WaitingApproval from "./pages/WaitingApproval.jsx";
import ErrorPage from "./pages/ErrorPage.jsx";
import RequireAuth from "./Components/RequireAuth.jsx";

export default function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      errorElement: <ErrorPage />,
      children: [
        { index: true, element: <Home /> },
        { path: "login", element: <Login /> },
        { path: "register", element: <Register /> },
        // App.jsx (snippet – replace the dashboard children)
{
  path: "dashboard",
  element: <RequireAuth><Outlet /></RequireAuth>, // ← RequireAuth wraps Outlet
  children: [
    { path: "super-admin", element: <SuperAdmin /> },
    { path: "state-admin", element: <StateAdmin /> },
    { path: "district-admin", element: <DistrictAdmin /> },
    { path: "technician", element: <Technician /> },
    { path: "school-admin", element: <SchoolAdmin /> },
  ],
},
      ],
    },
    {
      path: "/waiting-approval",
      element: <WaitingApproval />,
      errorElement: <ErrorPage />,
    },
  ]);

  return <RouterProvider router={router} />;
}
