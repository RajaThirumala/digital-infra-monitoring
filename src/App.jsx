import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./Components/Layout";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import SuperAdmin from "./pages/dashboards/SuperAdmin.jsx";
import StateAdmin from "./pages/dashboards/StateAdmin.jsx";
import DistrictAdmin from "./pages/dashboards/DistrictAdmin.jsx";
import Technician from "./pages/dashboards/Technician.jsx";
import SchoolAdmin from "./pages/dashboards/SchoolAdmin.jsx";
import WaitingApproval from "./pages/WaitingApproval.jsx"; // Fixed typo if needed
import ErrorPage from "./pages/ErrorPage.jsx";
import RequireAuth from "./Components/RequireAuth.jsx"; // New import

export default function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      errorElement: <ErrorPage />, // Global error handling
      children: [
        { index: true, element: <Home /> },
        { path: "login", element: <Login /> },
        { path: "register", element: <Register /> },
        {
          path: "dashboard",
          children: [
            { path: "super-admin", element: <RequireAuth><SuperAdmin /></RequireAuth> },
            { path: "state-admin", element: <RequireAuth><StateAdmin /></RequireAuth> },
            { path: "district-admin", element: <RequireAuth><DistrictAdmin /></RequireAuth> },
            { path: "technician", element: <RequireAuth><Technician /></RequireAuth> },
            { path: "school-admin", element: <RequireAuth><SchoolAdmin /></RequireAuth> },
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