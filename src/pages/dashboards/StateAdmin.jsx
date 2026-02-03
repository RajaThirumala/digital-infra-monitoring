// pages/SuperAdminDashboard.jsx
import { useEffect, useState } from "react";
import DatabaseService from "../../appwrite/Database.services";
//import  AccountService from "../../appwrite/Account.services";

export default function StateAdminDashboard() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    const data = await DatabaseService.getdistrictAdminRequests();
    setRequests(data);
  }

//   async function approveRequest(request) {
//     try {
//       // Assign label
//       await AccountService.assignDistrictAdminLabel(request.userId);

//       //Update request status
//       await DatabaseService.updateRequestStatus(request.$id, "approved");

//       //Refresh UI
//       loadRequests();
//     } catch (err) {
//       console.error("Approval failed", err);
//     }
//   }

  return (
    <div>
      <h2>District Admin Requests</h2>

      {requests.map((req) => (
        <div key={req.$id} style={{ border: "1px solid #ccc", margin: 10 }}>
          <p>User ID: {req.userId}</p>
          <p>State: {req.state}</p>
          <p>{req.selfIntro}</p>
        </div>
      ))}
    </div>
  );
}