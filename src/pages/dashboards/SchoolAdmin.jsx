// pages/SuperAdminDashboard.jsx
import { useEffect, useState } from "react";
import DatabaseService from "../../appwrite/Database.services";
//import  AccountService from "../../appwrite/Account.services";

export default function SchoolAdminDashboard() {
  const [requests, setRequests] = useState([]);



  return (
    <div>
      <h2>Raise issues</h2>

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
