// pages/dashboards/SchoolAdmin.jsx
import { useState  } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAuthStore from "../../store/authStore";
import dbService from "../../appwrite/Database.services";
import clsx from "clsx";  // ← Add this import
import { ID } from "appwrite";

export default function SchoolAdmin() {
  const { user } = useAuthStore();
  const schoolAdminId = user?.$id || null;
  const queryClient = useQueryClient();
  // Fetch issues for this school admin's school
  
  const { 
    data: issues = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ["issues", schoolAdminId],
    queryFn: async () => {
      console.log("inside useQuery");
      const schoolId = await dbService.getSchoolIdByAdmin(schoolAdminId);
      if (!schoolId) return [];
      return dbService.getIssuesBySchool(schoolId);
    },
    enabled: !!schoolAdminId,
  });
  console.log("issues",issues);

  // Mutation to create new issue
  const createIssueMutation = useMutation({
    mutationFn: (newIssue) => dbService.createIssue(newIssue),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issues", schoolAdminId] });
    },
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [newIssue, setNewIssue] = useState({
    issueType: "",
    deviceType: "",
    description: "",
    status: "OPEN",
  });
  
  const handleAddIssue = async () => {
    console.log("Inside add issue");
    // Get schoolId first (from admin)
    let schoolId, schoolName, technician, assignedTo, technicianId, districtId, zoneId;

    if (issues.length > 0) {
      schoolId = issues[0]?.schoolId;
      schoolName = issues[0]?.schoolName; 
      assignedTo = issues[0]?.assignedTo;
      technicianId = issues[0]?.technicianId;
      districtId = issues[0]?.districtId;
      zoneId = issues[0]?.zoneId;
    } else {
      schoolId = await dbService.getSchoolIdByAdmin(schoolAdminId);
      const school = await dbService.getSchoolDetailsById(schoolId);
      console.log("insideHandleissue",school);
      schoolName = school.name || ""; 
      districtId = school.districts || "";
      zoneId = school.zones || "";
      technician = await dbService.getTechnicianByZone(zoneId) || "";
      assignedTo = technician.userName;
      technicianId = technician.userId; 
      console.log("assignedTo",assignedTo)
    }
    
    
    createIssueMutation.mutate({
      ...newIssue,
      schoolId: schoolId,
      schoolName: schoolName,
      assignedTo: assignedTo,
      technicianId: technicianId,
      districtId: districtId,
      zoneId: zoneId
    });

    setShowAddModal(false);
    setNewIssue({ issueType: "", deviceType: "", description: "", status: "OPEN" });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900">
            School Admin Dashboard
          </h1>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-900 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition shadow-md"
          >
            + Report New Issue
          </button>
        </div>

        {/* Loading / Error / Empty States */}
        {isLoading && (
          <div className="text-center py-12 text-xl text-blue-900">
            Loading your reported issues...
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-6 py-4 rounded-lg text-center">
            Error loading issues: {error.message}
          </div>
        )}

        {!isLoading && !error && issues.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-400 text-yellow-800 px-6 py-8 rounded-xl text-center">
            <h2 className="text-2xl font-bold mb-4">No Issues Reported Yet</h2>
            <p className="text-lg">Click "Report New Issue" to add your first problem.</p>
          </div>
        )}

        {/* Issues Grid / List */}
        {issues.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {issues.map((issue) => (
              <div
                key={issue.$id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all"
              >
                {/* Status Badge */}
                <div className="flex justify-between items-center mb-4">
                  <span
                    className={clsx(
                      "inline-flex px-4 py-1 rounded-full text-sm font-medium",
                      issue.status === "OPEN" ? "bg-blue-100 text-blue-800" :
                      issue.status === "IN_PROGRESS" ? "bg-yellow-100 text-yellow-800" :
                      issue.status === "RESOLVED" ? "bg-green-100 text-green-800" :
                      "bg-gray-100 text-gray-800"
                    )}
                  >
                    {issue.status || "OPEN"}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(issue.$createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Issue Type & Device */}
                <div className="mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {issue.issueType || "Unknown Issue"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Device: {issue.deviceType || "N/A"}
                  </p>
                </div>

                {/* Description */}
                <p className="text-gray-700 mb-4 line-clamp-3">
                  {issue.description || "No description provided"}
                </p>

                {/* Uploaded Media Placeholder */}
                <p className="text-gray-700 mb-4 line-clamp-3">
                  AssignedTo: {issue.assignedTo}
                </p>
                {issue.image || issue.document ? (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">Attachments: Yes</p>
                    {/* Add preview if you have file URLs */}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No attachments</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Issue Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full mx-4">
            <h2 className="text-2xl font-bold text-blue-900 mb-6">
              Report New Issue
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Issue Type
                </label>
                <select
                  value={newIssue.issueType}
                  onChange={(e) => setNewIssue({ ...newIssue, issueType: e.target.value })}
                  className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Type</option>
                  <option value="DEVICE_FAULT">DEVICE_FAULT</option>
                  <option value="NOT_POWERING_ON">NOT_POWERING_ON</option>
                  <option value="ABNORMAL_BEHAVIOUR">ABNORMAL_BEHAVIOUR</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Device Type
                </label>
                <select
                  value={newIssue.deviceType}
                  onChange={(e) => setNewIssue({ ...newIssue, deviceType: e.target.value })}
                  className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Type</option>
                  <option value="COMPUTER">COMPUTER</option>
                  <option value="PROJECTOR">PROJECTOR</option>
                  <option value="DIGITAL_TV">DIGITAL_TV</option>
                  <option value="TAB">TAB</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newIssue.description}
                  onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
                  rows="4"
                  placeholder="Describe the issue in detail..."
                  className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddIssue}
                  disabled={!newIssue.issueType || !newIssue.deviceType}
                  className="px-6 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition disabled:opacity-50"
                >
                  Submit Issue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}