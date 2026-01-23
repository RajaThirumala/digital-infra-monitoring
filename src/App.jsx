import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./Components/Layout";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import SuperAdmin from "./pages/dashboards/SuperAdmin.jsx";
import WaitingApproval from "./pages/WaitingApproval.jsx";

export default function App() {

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        { index: true, element: <Home /> },
        { path: "login", element: <Login /> },
        { path: "register", element: <Register /> },
        { path: "super-admin", element: <SuperAdmin /> },
      ],}
      ,
      {
        path: "/waiting-approval",
        element: <WaitingApproval />
      }
  ]);

  return <RouterProvider router={router} />;
}
