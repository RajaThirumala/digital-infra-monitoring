// pages/dashboards/DistrictAdmin.jsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useAuthStore from "../../store/authStore";
import dbService from "../../appwrite/Database.services";

export default function DistrictAdmin() {
  console.log("DistrictAdmin: Component is mounted and running!");

  const { user } = useAuthStore();

  // Try common places for districtId (prefs is most likely)
  const districtId = user?.district || null;

  console.log("DistrictAdmin: Full user object:", user);
  console.log("DistrictAdmin: Extracted districtId:", districtId);

  const [selectedSchool, setSelectedSchool] = useState(null);

  const {
    data: schools = [],
    isLoading: schoolsLoading,
    error: schoolsError,
  } = useQuery({
    queryKey: ["schools", districtId],
    queryFn: () => dbService.getSchoolsByDistrict(districtId),
    enabled: !!districtId,
  });

  console.log("DistrictAdmin: Schools query result:", {
    loading: schoolsLoading,
    error: schoolsError?.message || null,
    schools: schools,
    schoolsCount: schools.length,
  });

  const {
    data: issues = [],
    isLoading: issuesLoading,
    error: issuesError,
  } = useQuery({
    queryKey: ["issues", selectedSchool?.$id],
    queryFn: () => dbService.getIssuesBySchool(selectedSchool.$id),
    enabled: !!selectedSchool?.$id,
  });

  console.log("DistrictAdmin: Issues query result:", {
    loading: issuesLoading,
    error: issuesError?.message || null,
    issuesCount: issues.length,
  });

  // Always render something
  if (!districtId) {
    console.log("DistrictAdmin: No districtId – showing fallback UI");
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="max-w-md text-center bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            No District Assigned
          </h2>
          <p className="text-gray-700 mb-6">
            Your account doesn't have a district linked yet. Please ask the superadmin to assign one.
          </p>
          <button
            onClick={() => window.location.href = "/"}
            className="bg-blue-900 text-white px-6 py-3 rounded hover:bg-blue-800"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (schoolsLoading) {
    console.log("DistrictAdmin: Schools are loading");
    return (
      <div className="min-h-screen bg-gray-50 p-8 text-center">
        <p className="text-xl text-blue-900">Loading schools in your district...</p>
      </div>
    );
  }

  if (schoolsError) {
    console.log("DistrictAdmin: Schools query error:", schoolsError);
    return (
      <div className="min-h-screen bg-gray-50 p-8 text-center">
        <p className="text-xl text-red-600">Error loading schools: {schoolsError.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-blue-900 text-white px-6 py-3 rounded hover:bg-blue-800"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  console.log("DistrictAdmin: Rendering main UI with schools:", schools.length);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-blue-900 mb-6">
        District Admin Dashboard
      </h1>

      <p className="mb-4 text-lg text-gray-700">
        Welcome! Managing district: <strong>{districtId}</strong>
      </p>

      {!selectedSchool ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schools.length === 0 ? (
            <p className="col-span-full text-center text-xl text-gray-600 py-12">
              No schools found in this district yet.
            </p>
          ) : (
            schools.map((school) => (
              <div
                key={school.$id}
                onClick={() => setSelectedSchool(school)}
                className="cursor-pointer rounded-lg bg-white p-4 shadow hover:shadow-lg transition"
              >
                <img 
                  src={school.image || 'https://via.placeholder.com/400x225?text=School'}
                  alt={school.name}
                  className="w-full h-40 object-cover rounded mb-2"
                />
                <h3 className="font-bold text-lg">{school.name}</h3>
                <p className="text-sm text-gray-600">{school.location || 'No location'}</p>
              </div>
            ))
          )}
        </div>
      ) : (
        <div>
          <button
            onClick={() => setSelectedSchool(null)}
            className="mb-6 text-blue-900 hover:underline font-medium"
          >
            ← Back to school list
          </button>

          <h2 className="text-2xl font-bold mb-4">{selectedSchool.name}</h2>

          {issuesLoading && <p className="text-gray-600">Loading issues...</p>}

          {issuesError && <p className="text-red-600">Error loading issues</p>}

          {!issuesLoading && !issuesError && issues.length === 0 && (
            <p className="text-gray-600">No issues reported from this school yet.</p>
          )}

          {issues.length > 0 && (
            <div className="space-y-4">
              {issues.map((issue) => (
                <div key={issue.$id} className="border p-4 rounded bg-white shadow-sm">
                  <p><strong>Type:</strong> {issue.type || 'Unknown'}</p>
                  <p><strong>Description:</strong> {issue.description}</p>
                  <p><strong>Status:</strong> {issue.status || 'Pending'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}