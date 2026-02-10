// pages/dashboards/Technician.jsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAuthStore from "../../store/authStore";
import dbService from "../../appwrite/Database.services";
import clsx from "clsx";

export default function Technician() {
  const { user } = useAuthStore();
  const technicianId = user?.$id || null;
  console.log("technicianId",technicianId);
  const queryClient = useQueryClient();

  // Fetch issues assigned to this technician
  const {
    data: issues = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["issues", technicianId],
    queryFn: async () => {
      if (!technicianId) return [];
      return dbService.getIssuesByAssignedTo(technicianId);
    },
    enabled: !!technicianId,
  });

  // Mutation to update issue status
  const updateStatusMutation = useMutation({
    mutationFn: ({ issueId, newStatus }) =>
      dbService.updateIssueStatus(issueId, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issues", technicianId] });
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900">
            Technician Dashboard
          </h1>
        </div>

        {/* Loading / Error / Empty States */}
        {isLoading && (
          <div className="text-center py-12 text-xl text-blue-900">
            Loading your assigned issues...
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-6 py-4 rounded-lg text-center">
            Error loading issues: {error.message}
          </div>
        )}

        {!isLoading && !error && issues.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-400 text-yellow-800 px-6 py-8 rounded-xl text-center">
            <h2 className="text-2xl font-bold mb-4">No Issues Assigned Yet</h2>
            <p className="text-lg">Check back later for new assignments.</p>
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
                      issue.status === "OPEN"
                        ? "bg-blue-100 text-blue-800"
                        : issue.status === "IN_PROGRESS"
                        ? "bg-yellow-100 text-yellow-800"
                        : issue.status === "RESOLVED"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
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

                {/* School Info */}
                <p className="text-gray-700 mb-4 line-clamp-3">
                  School: {issue.schoolName || "N/A"}
                </p>

                {/* Uploaded Media Placeholder */}
                {issue.image || issue.document ? (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">Attachments: Yes</p>
                    {/* Add preview if you have file URLs */}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No attachments</p>
                )}

                {/* Update Status Button */}
                {issue.status !== "RESOLVED" && (
                  <button
                    onClick={() => {
                      const nextStatus =
                        issue.status === "OPEN" ? "IN_PROGRESS" : "RESOLVED";
                      updateStatusMutation.mutate({
                        issueId: issue.$id,
                        newStatus: nextStatus,
                      });
                    }}
                    disabled={updateStatusMutation.isLoading}
                    className="mt-4 w-full bg-blue-900 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition shadow-md disabled:opacity-50"
                  >
                    {issue.status === "OPEN"
                      ? "Start Working"
                      : "Mark as Resolved"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}