"use client";

import { useState, useEffect, useCallback } from "react";
import { FiRefreshCw, FiSave } from "react-icons/fi";
import { supabase } from "@/lib/supabase/client";



type FeedbackRow = {
  id: string;
  sdg_goal: number;
  problem_title: string;
  problem_description: string;
  location_lat: number;
  location_lon: number;
  reporter_name: string;
  reporter_contact: string;
  status: "Diajukan" | "Proses" | "Selesai";
  created_at: string;
  nama_desa: string;
};

const STATUS_OPTIONS = ["Diajukan", "Proses", "Selesai"];

async function fetchFeedbackData(): Promise<FeedbackRow[]> {
  const { data, error } = await supabase
    .from("feedback_sdgs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Gagal mengambil data feedback: ${error.message}`);
  return data.map((row) => ({
    ...row,
    status: row.status as "Diajukan" | "Proses" | "Selesai",
  })) as FeedbackRow[];
}

async function updateFeedbackStatus(id: string, status: string) {
  const { data, error, count } = await supabase
    .from("feedback_sdgs")
    .update({ status })
    .eq("id", id)
    .select("*", { count: "exact" });

  console.log("🧩 Update attempt:", { id, status, count, data, error });

  if (error) throw new Error(error.message);
  if (!data || data.length === 0)
    throw new Error("Tidak ada baris yang diperbarui — periksa RLS atau ID.");
}

export default function FeedbackSDGsUpdate() {
  const [data, setData] = useState<FeedbackRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pendingUpdates, setPendingUpdates] = useState<Record<string, string>>(
    {}
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    setPendingUpdates({});
    try {
      const fetched = await fetchFeedbackData();
      setData(fetched);
      setMessage(`✅ Berhasil memuat ${fetched.length} laporan warga.`);
    } catch (e: any) {
      setMessage(`❌ ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = (id: string, newStatus: string) => {
    setPendingUpdates((prev) => ({
      ...prev,
      [id]: newStatus,
    }));
  };

  const handleUpdateAll = async () => {
    if (Object.keys(pendingUpdates).length === 0) {
      setMessage("Tidak ada perubahan status yang tertunda.");
      return;
    }

    setLoading(true);
    setMessage("Sedang memperbarui data...");
    let successCount = 0;
    let errorCount = 0;

    for (const id in pendingUpdates) {
      const newStatus = pendingUpdates[id];
      try {
        await updateFeedbackStatus(id, newStatus);
        successCount++;
      } catch (e: any) {
        console.error("❌ Update gagal:", e.message);
        errorCount++;
      }
    }

    await loadData();

    if (errorCount === 0)
      setMessage(`✅ Berhasil memperbarui ${successCount} laporan.`);
    else
      setMessage(
        `⚠️ ${successCount} laporan berhasil, ${errorCount} gagal diperbarui.`
      );
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Diajukan":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500";
      case "Proses":
        return "bg-blue-500/20 text-blue-400 border-blue-500";
      case "Selesai":
        return "bg-green-500/20 text-green-400 border-green-500";
      default:
        return "bg-neutral-500/20 text-neutral-400 border-neutral-500";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-semibold text-white">
          Laporan Warga SDGs ({data.length} data)
        </h2>
        <div className="flex gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-2"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
            {loading ? "Memuat..." : "Refresh"}
          </button>
          <button
            onClick={handleUpdateAll}
            disabled={loading || Object.keys(pendingUpdates).length === 0}
            className="p-2 rounded bg-green-600 text-white hover:bg-green-700 transition flex items-center gap-2 font-semibold"
          >
            <FiSave />
            Update {Object.keys(pendingUpdates).length} Perubahan
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`p-3 rounded-xl font-medium ${
            message.startsWith("❌")
              ? "bg-red-500/20 text-red-400"
              : message.startsWith("⚠️")
              ? "bg-yellow-500/20 text-yellow-400"
              : "bg-green-500/20 text-green-400"
          }`}
        >
          {message}
        </div>
      )}

      <div className="rounded-xl p-4 overflow-x-auto bg-neutral-900 border border-neutral-700 shadow-lg">
        {loading && (
          <div className="text-center py-8 text-neutral-400">Memuat data...</div>
        )}
        {!loading && data.length === 0 && (
          <div className="text-center py-8 text-neutral-500">
            Tidak ada laporan warga.
          </div>
        )}
        {!loading && data.length > 0 && (
          <table className="min-w-full text-sm table-auto bg-neutral-800 text-white rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-neutral-700 text-white">
                <th className="px-4 py-2 text-left">Judul Masalah</th>
                <th className="px-4 py-2 text-left">Deskripsi</th>
                <th className="px-4 py-2 text-left">Desa</th>
                <th className="px-4 py-2 text-left">SDG</th>
                <th className="px-4 py-2 text-left">Pelapor</th>
                <th className="px-4 py-2 text-left">Kontak</th>
                <th className="px-4 py-2 text-left">Lokasi</th>
                <th className="px-4 py-2 text-left">Tanggal</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => {
                const currentStatus = pendingUpdates[row.id] || row.status;
                return (
                  <tr
                    key={row.id}
                    className="border-b border-neutral-700 hover:bg-neutral-700/60"
                  >
                    <td className="px-4 py-2 font-semibold">
                      {row.problem_title}
                    </td>
                    <td className="px-4 py-2 max-w-xs overflow-hidden text-ellipsis">
                      {row.problem_description}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {row.nama_desa}
                    </td>
                    <td className="px-4 py-2 text-center">{row.sdg_goal}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {row.reporter_name}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {row.reporter_contact}
                    </td>
                    <td className="px-4 py-2 text-xs text-neutral-400">
                      {row.location_lat}, {row.location_lon}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-xs text-neutral-400">
                      {new Date(row.created_at).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-2">
                      <select
                        value={currentStatus}
                        onChange={(e) =>
                          handleStatusChange(row.id, e.target.value)
                        }
                        className={`p-1 rounded-lg text-xs font-semibold border ${getStatusColor(
                          currentStatus
                        )} bg-neutral-900 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

