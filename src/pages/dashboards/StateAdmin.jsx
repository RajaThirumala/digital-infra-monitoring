// pages/dashboards/StateAdmin.jsx
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import useAuthStore from "../../store/authStore";
import dbService from "../../appwrite/Database.services";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

export default function StateAdmin() {
  const { user } = useAuthStore();

  // Fetch ALL issues
  const { data: issuesData, isLoading, error } = useQuery({
    queryKey: ["allStateIssues"],
    queryFn: () => dbService.getAllIssues(),
  });

  const allIssues = issuesData || [];

  // ====================== DISTRICT BREAKDOWN (LOOP-PROOF) ======================
  const [districtData, setDistrictData] = useState([]);
  const [districtLoading, setDistrictLoading] = useState(false);
  const issuesRef = useRef(null);   // ← prevents infinite loop

  useEffect(() => {
    // Skip if data hasn't actually changed
    if (issuesData === issuesRef.current) return;
    issuesRef.current = issuesData;

    const computeDistricts = async () => {
      if (allIssues.length === 0) {
        setDistrictData([]);
        setDistrictLoading(false);
        return;
      }

      setDistrictLoading(true);

      // Get unique zone IDs
      const zoneIds = [
        ...new Set(allIssues.map((i) => i.zoneId).filter(Boolean)),
      ];

      const zoneToDistrictName = {};

      for (const zoneId of zoneIds) {
        try {
          const distId = await dbService.getDistrictByZone(zoneId);
          const dist = await dbService.getDistrictById(distId);
          zoneToDistrictName[zoneId] = dist;
        } catch (err) {
          console.error("Failed to get district for zone", zoneId, err);
          zoneToDistrictName[zoneId] = "Unknown District";
        }
      }

      // Build district map
      const map = allIssues.reduce((acc, i) => {
        const zoneId = i.zoneId;
        const distName = zoneToDistrictName[zoneId] || "Unknown District";
        acc[distName] = (acc[distName] || 0) + 1;
        return acc;
      }, {});

      const data = Object.entries(map)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

      setDistrictData(data);
      setDistrictLoading(false);
    };

    computeDistricts();
  }, [issuesData]);

  // ====================== OTHER ANALYTICS ======================
  const currentDate = new Date();
  const thisMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

  const totalIssues = allIssues.length;
  const openCount = allIssues.filter((i) => i.status === "OPEN").length;
  const inProgressCount = allIssues.filter((i) => i.status === "IN_PROGRESS").length;
  const resolvedCount = allIssues.filter((i) => i.status === "RESOLVED").length;

  const raisedThisMonth = allIssues.filter((i) => new Date(i.$createdAt) >= thisMonthStart).length;
  const resolvedThisMonth = allIssues.filter(
    (i) =>
      i.status === "RESOLVED" &&
      new Date(i.$updatedAt || i.$createdAt) >= thisMonthStart
  ).length;

  const resolvedIssues = allIssues.filter((i) => i.status === "RESOLVED" && i.$updatedAt && i.$createdAt);
  const totalDays = resolvedIssues.reduce((sum, i) => {
    const created = new Date(i.$createdAt);
    const resolved = new Date(i.$updatedAt);
    return sum + (resolved - created) / (1000 * 60 * 60 * 24);
  }, 0);
  const avgResolutionDays = resolvedIssues.length > 0 ? (totalDays / resolvedIssues.length).toFixed(1) : "0";

  // Monthly trend
  const monthlyMap = {};
  allIssues.forEach((issue) => {
    const date = new Date(issue.$createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (!monthlyMap[key]) {
      monthlyMap[key] = {
        month: date.toLocaleString("en-IN", { month: "short", year: "numeric" }),
        raised: 0,
        resolved: 0,
        sortKey: date.getFullYear() * 12 + date.getMonth(),
      };
    }
    monthlyMap[key].raised++;
    if (issue.status === "RESOLVED") monthlyMap[key].resolved++;
  });
  const monthlyData = Object.values(monthlyMap).sort((a, b) => a.sortKey - b.sortKey);

  // Status Pie
  const statusData = [
    { name: "Open", value: openCount, color: "#3b82f6" },
    { name: "In Progress", value: inProgressCount, color: "#f59e0b" },
    { name: "Resolved", value: resolvedCount, color: "#10b981" },
  ];

  // Device Type Pie
  const deviceMap = allIssues.reduce((acc, i) => {
    const type = i.deviceType || "Unknown";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  const deviceData = Object.entries(deviceMap).map(([name, value]) => ({ name, value }));

  // Top 5 Schools
  const schoolMap = allIssues.reduce((acc, i) => {
    const school = i.schoolName || (i.school && i.school.name) || "Unknown School";
    acc[school] = (acc[school] || 0) + 1;
    return acc;
  }, {});
  const topSchools = Object.entries(schoolMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-2xl text-gray-600">Loading state analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="text-red-600 text-center py-20">Error: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-10">State Admin Dashboard</h1>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-gray-500 text-sm">Total Issues</p>
            <p className="text-5xl font-semibold text-gray-900 mt-3">{totalIssues}</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-gray-500 text-sm">Open Issues</p>
            <p className="text-5xl font-semibold text-blue-600 mt-3">{openCount}</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-gray-500 text-sm">Resolved This Month</p>
            <p className="text-5xl font-semibold text-green-600 mt-3">{resolvedThisMonth}</p>
            <p className="text-xs text-gray-500 mt-2">Raised: {raisedThisMonth}</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-gray-500 text-sm">Avg Resolution Time</p>
            <p className="text-5xl font-semibold text-purple-600 mt-3">{avgResolutionDays}</p>
            <p className="text-xs text-gray-500 mt-2">days</p>
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white rounded-2xl shadow p-8 mb-10">
          <h2 className="text-2xl font-semibold mb-6">Issues Raised vs Resolved (Monthly)</h2>
          <ResponsiveContainer width="100%" height={380}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="raised" stroke="#3b82f6" strokeWidth={3} name="Raised" />
              <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={3} name="Resolved" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <div className="bg-white rounded-2xl shadow p-8">
            <h2 className="text-2xl font-semibold mb-6">Issue Status Distribution</h2>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} dataKey="value">
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl shadow p-8">
            <h2 className="text-2xl font-semibold mb-6">Issues by Device Type</h2>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={deviceData} cx="50%" cy="50%" outerRadius={120} dataKey="value" nameKey="name">
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DISTRICT BAR CHART */}
        <div className="bg-white rounded-2xl shadow p-8 mb-10">
          <h2 className="text-2xl font-semibold mb-6">Issues by District</h2>
          {districtLoading && <p className="text-center py-12 text-gray-500">Loading district breakdown...</p>}
          {!districtLoading && districtData.length === 0 && allIssues.length > 0 && (
            <p className="text-center py-12 text-gray-500">No district data available yet</p>
          )}
          {!districtLoading && districtData.length > 0 && (
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={districtData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={6} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Schools */}
        <div className="bg-white rounded-2xl shadow p-8">
          <h2 className="text-2xl font-semibold mb-6">Top 5 Schools with Most Issues</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-6 font-medium text-gray-600">School</th>
                  <th className="text-right py-4 px-6 font-medium text-gray-600">Issues</th>
                  <th className="text-right py-4 px-6 font-medium text-gray-600">% of Total</th>
                </tr>
              </thead>
              <tbody>
                {topSchools.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-12 text-gray-500">No issues reported yet</td>
                  </tr>
                ) : (
                  topSchools.map((school, idx) => (
                    <tr key={idx} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-4 px-6 font-medium">{school.name}</td>
                      <td className="py-4 px-6 text-right font-semibold">{school.count}</td>
                      <td className="py-4 px-6 text-right text-gray-500">
                        {((school.count / totalIssues) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}