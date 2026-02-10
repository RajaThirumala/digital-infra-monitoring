// pages/dashboards/DistrictAdmin.jsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useAuthStore from "../../store/authStore";
import dbService from "../../appwrite/Database.services";
import clsx from "clsx";

export default function DistrictAdmin() {
  const { user } = useAuthStore();
  const districtAdminId = user?.$id || null;

  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState(null);

  // Fetch zones for the district admin's district
  const { data: zones = [], isLoading: zonesLoading, error: zonesError } = useQuery({
    queryKey: ["zones", districtAdminId],
    queryFn: async () => {
      if (!districtAdminId) return [];
      const districtId = await dbService.getDistrictIdByAdmin(districtAdminId);
      if (!districtId) return [];
      return dbService.getZonesByDistrict(districtId);
    },
    enabled: !!districtAdminId,
  });

  // Fetch schools for selected zone
  const { data: schools = [], isLoading: schoolsLoading, error: schoolsError } = useQuery({
    queryKey: ["schools", selectedZone?.$id],
    queryFn: () => dbService.getSchoolsByZone(selectedZone.$id),
    enabled: !!selectedZone,
  });

  // Fetch issues for selected school
  const { data: schoolIssues = [], isLoading: schoolIssuesLoading, error: schoolIssuesError } = useQuery({
    queryKey: ["schoolIssues", selectedSchool?.$id],
    queryFn: () => dbService.getIssuesBySchool(selectedSchool.$id),
    enabled: !!selectedSchool,
  });

  const IssueCard = ({ issue }) => (
    <div className="bg-white rounded-xl shadow border border-gray-200 p-6 hover:shadow-lg transition-all">
      <div className="flex justify-between items-center mb-4">
        <span
          className={clsx(
            "inline-flex px-3 py-1 rounded-full text-xs font-medium",
            issue.status === "OPEN" ? "bg-blue-100 text-blue-700" :
            issue.status === "IN_PROGRESS" ? "bg-yellow-100 text-yellow-700" :
            issue.status === "RESOLVED" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
          )}
        >
          {issue.status || "OPEN"}
        </span>
        <span className="text-xs text-gray-500">
          {new Date(issue.$createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </span>
      </div>

      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {issue.issueType || "Unknown Issue"}
      </h3>

      <p className="text-sm text-gray-600 mb-3">
        Device: <span className="font-medium">{issue.deviceType || "N/A"}</span>
      </p>

      <p className="text-gray-700 text-sm line-clamp-3 mb-4">
        {issue.description?.trim() && issue.description !== "." && issue.description !== "..."
          ? issue.description
          : "No description provided"}
      </p>

      <p className="text-sm text-gray-600">
        Assigned To: <span className="font-medium">{issue.assignedTo || "Not assigned"}</span>
      </p>

      {issue.image || issue.document ? (
        <p className="text-xs text-gray-500 mt-3">Attachments: Yes</p>
      ) : (
        <p className="text-xs text-gray-500 italic mt-3">No attachments</p>
      )}
    </div>
  );

  // School issues view
  if (selectedSchool) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <button
            onClick={() => setSelectedSchool(null)}
            className="mb-6 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            ← Back to Schools
          </button>

          <h1 className="text-2xl font-bold text-gray-900 mb-8">
            Issues in {selectedSchool.name || selectedSchool.code || "School"}
          </h1>

          {schoolIssuesLoading && <p className="text-center py-16 text-gray-600">Loading issues...</p>}
          {schoolIssuesError && <p className="text-red-600 text-center py-8">Error: {schoolIssuesError.message}</p>}

          {!schoolIssuesLoading && !schoolIssuesError && schoolIssues.length === 0 && (
            <p className="text-center py-16 text-gray-600 text-lg">No issues reported yet.</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schoolIssues.map(issue => (
              <IssueCard key={issue.$id} issue={issue} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Schools list in zone
  if (selectedZone) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <button
            onClick={() => setSelectedZone(null)}
            className="mb-6 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            ← Back to Zones
          </button>

          <h1 className="text-2xl font-bold text-gray-900 mb-8">
            {selectedZone.name} – Schools
          </h1>

          {schoolsLoading && <p className="text-center py-16 text-gray-600">Loading schools...</p>}
          {schoolsError && <p className="text-red-600 text-center py-8">Error: {schoolsError.message}</p>}

          {!schoolsLoading && !schoolsError && schools.length === 0 && (
            <p className="text-center py-16 text-gray-600 text-lg">No schools found in this zone.</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schools.map(school => (
              <div
                key={school.$id}
                onClick={() => setSelectedSchool(school)}
                className="bg-white rounded-xl shadow border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all cursor-pointer"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {school.name || "Unnamed School"}
                </h3>
                <p className="text-sm text-gray-600">
                  {school.code || "No code"}
                </p>
                <p className="mt-4 text-blue-600 text-sm font-medium">
                  View issues →
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Main dashboard: Zones cards
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-10">District Admin Dashboard</h1>

        {zonesLoading && (
          <p className="text-center py-20 text-gray-600 text-xl">Loading zones...</p>
        )}

        {zonesError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-8 rounded-xl text-center">
            Error loading zones: {zonesError.message}
          </div>
        )}

        {!zonesLoading && !zonesError && zones.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-10 rounded-xl text-center">
            <h2 className="text-2xl font-bold mb-4">No Zones Available</h2>
            <p>Contact support if this is unexpected.</p>
          </div>
        )}

        {zones.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {zones.map((zone) => (
              <div
                key={zone.$id}
                className={`
                  group relative bg-white rounded-xl shadow border border-gray-200
                  transition-all duration-300 ease-out
                  hover:shadow-xl hover:scale-[1.02] hover:border-gray-300
                  cursor-pointer
                `}
              >
                <div className="relative p-6 pb-20">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-gray-900 transition-colors">
                    {zone.name || "Unnamed Zone"}
                  </h2>

                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-sm text-gray-600 bg-gray-50 px-2.5 py-1 rounded">
                      {zone.code || "No code"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(zone.$createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                    </span>
                  </div>

                  {/* Always visible light labels – become buttons on hover */}
                  <div className="absolute bottom-0 left-0 right-0 pb-6 px-6 flex gap-4 justify-center">
                    {/* Technicians */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        alert("Technician view is under preparation – coming soon!");
                        // Later replace with real logic
                      }}
                      className={`
                        flex-1 text-center text-sm font-medium py-3 px-5 rounded-lg
                        bg-gray-50 text-gray-700 border border-gray-200
                        hover:bg-gray-100 hover:text-gray-900 hover:border-gray-300
                        hover:shadow-sm hover:-translate-y-0.5
                        transition-all duration-300 ease-out cursor-pointer
                      `}
                    >
                      Technicians
                    </div>

                    {/* Schools */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedZone(zone);
                        console.log("Navigating to schools for zone:", zone.$id);
                      }}
                      className={`
                        flex-1 text-center text-sm font-medium py-3 px-5 rounded-lg
                        bg-blue-50 text-blue-700 border border-blue-100
                        hover:bg-blue-100 hover:text-blue-800 hover:border-blue-200
                        hover:shadow-sm hover:-translate-y-0.5
                        transition-all duration-300 ease-out cursor-pointer
                      `}
                    >
                      Schools
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}