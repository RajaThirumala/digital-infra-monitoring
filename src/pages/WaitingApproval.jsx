import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function WaitingApproval() {
  const navigate = useNavigate();
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const user = useAuthStore((state) => state.user);

  const checkApproval = async () => {
    const fetchedUser = await checkAuth(); // Uses store, sets user

    if (fetchedUser && fetchedUser.labels && fetchedUser.labels.length > 0) {
      // Redirect based on label
      if (fetchedUser.labels.includes("superadmin")) navigate("/super-admin");
      else if (fetchedUser.labels.includes("stateadmin")) navigate("/state-admin");
      else if (fetchedUser.labels.includes("districtadmin")) navigate("/district-admin");
      else if (fetchedUser.labels.includes("technician")) navigate("/technician");
      else if (fetchedUser.labels.includes("schooladmin")) navigate("/school-admin");
      else navigate("/"); // Fallback
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4">Waiting for Approval</h2>
        <p className="mb-6">
          Your registration request has been submitted and is pending approval. 
          Please wait while an administrator reviews your request. This page will automatically redirect you to your dashboard once approved.
        </p>
        <button
          onClick={checkApproval}
          className="bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-800 transition"
        >
          Check Status Now
        </button>
      </div>
    </div>
  );
}