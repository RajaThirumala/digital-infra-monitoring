// pages/SuperAdminDashboard.jsx
import { useEffect, useState } from "react";
import DatabaseService from "../../appwrite/Database.services";


export default function districtAdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [schoolAdminrequests, setschoolAdminRequests] = useState([]);
  useEffect(() => {
    loadRequests();
    loadschoolAdminRequests();
  }, []);

  async function loadRequests() {
    const data = await DatabaseService.getTechnicianRequests();
    setRequests(data);
  }

  async function loadschoolAdminRequests() {
    const data = await DatabaseService.getschoolAdminRequests();
    setschoolAdminRequests(data);
  }

  return (
    <div>
      <h2>TechnicianRequests</h2>
      {requests.map((req) => (
        <div key={req.$id} style={{ border: "1px solid #ccc", margin: 10 }}>
          <p>User ID: {req.userId}</p>
          <p>State: {req.state}</p>
          <p>{req.selfIntro}</p>
        </div>
      ))}
       <h2>SchoolAdminRequests</h2>
      {schoolAdminrequests.map((req) => (
        <div key={req.$id} style={{ border: "1px solid #ccc", margin: 10 }}>
          <p>User ID: {req.userId}</p>
          <p>State: {req.state}</p>
          <p>{req.selfIntro}</p>
        </div>
      ))}
    </div>
  );
}
