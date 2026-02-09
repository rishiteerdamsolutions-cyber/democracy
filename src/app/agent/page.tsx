"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface PS {
  id: string;
  psNumber: string;
  psName: string;
  inchargeName: string;
  totalHouses: number;
  housesCompleted: number;
  totalVoters: number;
  votersMet: number;
  completionPercentage: number;
}

export default function AgentSelectPS() {
  const router = useRouter();
  const [stations, setStations] = useState<PS[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ps")
      .then((r) => r.json())
      .then((data) => {
        setStations(data.stations || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Democracy</h1>
            <p className="text-sm text-gray-500">Select a Polling Station</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Logout
          </button>
        </div>
      </header>

      {/* PS Grid */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stations.map((ps) => (
            <button
              key={ps.id}
              onClick={() => router.push(`/agent/ps/${ps.id}`)}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-left hover:shadow-md hover:border-indigo-300 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-lg group-hover:bg-indigo-600 group-hover:text-white transition">
                  {ps.psNumber}
                </span>
                <span className="text-xs font-medium text-gray-400">
                  {ps.completionPercentage}%
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">
                {ps.psName}
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                Incharge: {ps.inchargeName}
              </p>
              {/* Progress bar */}
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-indigo-500 h-2 rounded-full transition-all"
                  style={{ width: `${ps.completionPercentage}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-400">
                <span>{ps.totalHouses} houses</span>
                <span>{ps.totalVoters} voters</span>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
