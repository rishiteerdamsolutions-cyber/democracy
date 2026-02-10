"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface PSStats {
  id: string;
  psNumber: string;
  psName: string;
  roomNumber: string;
  wardNumber: string;
  inchargeName: string;
  totalHouses: number;
  housesCompleted: number;
  housesPartial: number;
  housesPending: number;
  totalVoters: number;
  votersMet: number;
  votersNotMet: number;
  completionPercentage: number;
}

interface Overall {
  totalStations: number;
  totalHouses: number;
  housesCompleted: number;
  totalVoters: number;
  votersMet: number;
  votersNotMet: number;
  completionPercentage: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stations, setStations] = useState<PSStats[]>([]);
  const [overall, setOverall] = useState<Overall | null>(null);
  const [wardNumber, setWardNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingPS, setEditingPS] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/ps");
      const data = await res.json();
      setStations(data.stations || []);
      setOverall(data.overall || null);
      setWardNumber(data.wardNumber || "");
    } catch {
      console.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const startEdit = (ps: PSStats) => {
    setEditingPS(ps.id);
    setEditValue(ps.inchargeName);
  };

  const saveIncharge = async (psId: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/ps/${psId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inchargeName: editValue }),
      });
      if (res.ok) {
        setStations((prev) =>
          prev.map((ps) =>
            ps.id === psId ? { ...ps, inchargeName: editValue.trim() } : ps
          )
        );
        setEditingPS(null);
      }
    } catch {
      console.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditingPS(null);
    setEditValue("");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Democracy — Admin
            </h1>
            <p className="text-sm text-gray-500">
              Ward {wardNumber} — Division Overview
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={fetchData}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-6">
        {/* Overall Stats */}
        {overall && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <StatCard
              label="Total PS"
              value={overall.totalStations}
              color="indigo"
            />
            <StatCard
              label="Total Houses"
              value={overall.totalHouses}
              sub={`${overall.housesCompleted} complete`}
              color="blue"
            />
            <StatCard
              label="Total Voters"
              value={overall.totalVoters}
              sub={`${overall.votersMet} met`}
              color="green"
            />
            <StatCard
              label="Completion"
              value={`${overall.completionPercentage}%`}
              color="purple"
            />
          </div>
        )}

        {/* Overall progress bar */}
        {overall && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Division Progress</span>
              <span>
                {overall.votersMet} / {overall.totalVoters} voters met
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div
                className="bg-indigo-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${overall.completionPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* PS Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">
                    PS No.
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">
                    PS Name / Room
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">
                    Incharge
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">
                    Houses
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">
                    Voters
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">
                    Progress
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stations.map((ps) => (
                  <tr key={ps.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center justify-center w-10 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-sm">
                        {ps.psNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 text-xs">
                        {ps.psName}
                      </div>
                      <div className="text-xs text-gray-500">
                        Room {ps.roomNumber}
                      </div>
                    </td>
                    <td className="px-4 py-3 min-w-[180px]">
                      {editingPS === ps.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveIncharge(ps.id);
                              if (e.key === "Escape") cancelEdit();
                            }}
                            autoFocus
                            className="w-full px-2 py-1 border border-indigo-300 rounded text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                            placeholder="Enter incharge name"
                          />
                          <button
                            onClick={() => saveIncharge(ps.id)}
                            disabled={saving}
                            className="text-xs text-white bg-indigo-600 hover:bg-indigo-700 px-2 py-1 rounded font-medium"
                          >
                            {saving ? "..." : "Save"}
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => startEdit(ps)}
                          className="cursor-pointer group flex items-center gap-1"
                        >
                          {ps.inchargeName ? (
                            <span className="text-gray-700">
                              {ps.inchargeName}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">
                              Not assigned
                            </span>
                          )}
                          <svg
                            className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="font-medium text-gray-900">
                        {ps.housesCompleted}/{ps.totalHouses}
                      </div>
                      <div className="text-xs text-gray-500">
                        {ps.housesPending} pending
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="font-medium text-gray-900">
                        {ps.votersMet}/{ps.totalVoters}
                      </div>
                      <div className="text-xs text-gray-500">
                        {ps.votersNotMet} not met
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-2 min-w-[60px]">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              ps.completionPercentage === 100
                                ? "bg-green-500"
                                : ps.completionPercentage > 0
                                ? "bg-amber-500"
                                : "bg-gray-300"
                            }`}
                            style={{ width: `${ps.completionPercentage}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-gray-600 w-9 text-right">
                          {ps.completionPercentage}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    indigo: "text-indigo-600",
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
      <div
        className={`text-2xl font-bold ${colorMap[color] || "text-gray-900"}`}
      >
        {value}
      </div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  );
}
