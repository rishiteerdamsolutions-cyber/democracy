"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";

interface Voter {
  id: string;
  voterNumber: number;
  met: boolean;
}

interface House {
  id: string;
  houseNumber: string;
  totalVoters: number;
  voters: Voter[];
}

interface PSData {
  id: string;
  psNumber: string;
  psName: string;
  inchargeName: string;
  houses: House[];
  stats: {
    totalHouses: number;
    housesVisited: number;
    housesCompleted: number;
    totalVoters: number;
    votersMet: number;
    completionPercentage: number;
  };
}

function getHouseStatus(voters: Voter[]): "not_met" | "partial" | "complete" {
  const met = voters.filter((v) => v.met).length;
  if (met === 0) return "not_met";
  if (met === voters.length) return "complete";
  return "partial";
}

const statusConfig = {
  not_met: {
    label: "Not Met",
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-red-200",
  },
  partial: {
    label: "Partial",
    bg: "bg-amber-100",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  complete: {
    label: "Complete",
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-200",
  },
};

export default function AgentPSPage() {
  const router = useRouter();
  const params = useParams();
  const psId = params.psId as string;

  const [psData, setPsData] = useState<PSData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dirtyHouses, setDirtyHouses] = useState<Set<string>>(new Set());
  const [savingHouses, setSavingHouses] = useState<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/ps/${psId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setPsData(data);
    } catch {
      console.error("Failed to load PS data");
    } finally {
      setLoading(false);
    }
  }, [psId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleVoter = (houseIndex: number, voterIndex: number) => {
    if (!psData) return;
    setPsData((prev) => {
      if (!prev) return prev;
      const houses = [...prev.houses];
      const house = { ...houses[houseIndex] };
      const voters = [...house.voters];
      voters[voterIndex] = { ...voters[voterIndex], met: !voters[voterIndex].met };
      house.voters = voters;
      houses[houseIndex] = house;

      // Recompute stats
      let totalVotersMet = 0;
      let housesVisited = 0;
      let housesCompleted = 0;
      for (const h of houses) {
        const metCount = h.voters.filter((v) => v.met).length;
        totalVotersMet += metCount;
        if (metCount > 0) housesVisited++;
        if (metCount === h.voters.length && metCount > 0) housesCompleted++;
      }

      return {
        ...prev,
        houses,
        stats: {
          ...prev.stats,
          votersMet: totalVotersMet,
          housesVisited,
          housesCompleted,
          completionPercentage:
            prev.stats.totalVoters > 0
              ? Math.round((totalVotersMet / prev.stats.totalVoters) * 100)
              : 0,
        },
      };
    });
    setDirtyHouses((prev) => {
      const next = new Set(prev);
      next.add(psData.houses[houseIndex].id);
      return next;
    });
  };

  const saveHouse = async (houseId: string) => {
    if (!psData) return;
    const house = psData.houses.find((h) => h.id === houseId);
    if (!house) return;

    setSavingHouses((prev) => new Set(prev).add(houseId));

    try {
      const res = await fetch(`/api/houses/${houseId}/voters`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voters: house.voters.map((v) => ({ id: v.id, met: v.met })),
        }),
      });

      if (res.ok) {
        setDirtyHouses((prev) => {
          const next = new Set(prev);
          next.delete(houseId);
          return next;
        });
      }
    } catch {
      console.error("Save failed");
    } finally {
      setSavingHouses((prev) => {
        const next = new Set(prev);
        next.delete(houseId);
        return next;
      });
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  if (loading || !psData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500 text-lg">Loading...</div>
      </div>
    );
  }

  const { stats } = psData;

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-1">
            <button
              onClick={() => router.push("/agent")}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Logout
            </button>
          </div>
          <h2 className="text-lg font-bold text-gray-900">
            PS {psData.psNumber} — {psData.psName}
          </h2>
          <p className="text-xs text-gray-500">Incharge: {psData.inchargeName}</p>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="max-w-3xl mx-auto px-4 mt-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-indigo-600">{stats.totalHouses}</div>
              <div className="text-xs text-gray-500">Total Houses</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600">{stats.housesVisited}</div>
              <div className="text-xs text-gray-500">Houses Visited</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {stats.votersMet}/{stats.totalVoters}
              </div>
              <div className="text-xs text-gray-500">Voters Met</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-indigo-600">{stats.completionPercentage}%</div>
              <div className="text-xs text-gray-500">Completion</div>
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 mt-3">
            <div
              className="bg-indigo-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${stats.completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* House Cards */}
      <main className="max-w-3xl mx-auto px-4 mt-4 space-y-3">
        {psData.houses.map((house, houseIdx) => {
          const status = getHouseStatus(house.voters);
          const cfg = statusConfig[status];
          const metCount = house.voters.filter((v) => v.met).length;
          const isDirty = dirtyHouses.has(house.id);
          const isSaving = savingHouses.has(house.id);

          return (
            <div
              key={house.id}
              className={`bg-white rounded-xl shadow-sm border ${
                status === "complete"
                  ? "border-green-200"
                  : status === "partial"
                  ? "border-amber-200"
                  : "border-gray-200"
              } p-4`}
            >
              {/* House Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-gray-900">H.No: {house.houseNumber}</h3>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}
                  >
                    {cfg.label}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {metCount}/{house.totalVoters} voters
                </span>
              </div>

              {/* Voter Checkboxes — Horizontal */}
              <div className="flex flex-wrap gap-2 mb-3">
                {house.voters.map((voter, voterIdx) => (
                  <label
                    key={voter.id}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border cursor-pointer select-none transition ${
                      voter.met
                        ? "bg-green-50 border-green-300 text-green-800"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={voter.met}
                      onChange={() => toggleVoter(houseIdx, voterIdx)}
                      className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm font-medium">{voter.voterNumber}</span>
                  </label>
                ))}
              </div>

              {/* Save Button */}
              <button
                onClick={() => saveHouse(house.id)}
                disabled={!isDirty || isSaving}
                className={`w-full py-2 px-4 rounded-lg text-sm font-semibold transition ${
                  isDirty
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {isSaving ? "Saving..." : isDirty ? "Save" : "Saved"}
              </button>
            </div>
          );
        })}
      </main>
    </div>
  );
}
