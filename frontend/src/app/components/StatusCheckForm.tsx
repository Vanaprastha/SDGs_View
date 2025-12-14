"use client";

import { useState } from "react";

interface StatusResult {
  id: string | number;
  problem_title: string;
  status: string;
}

export default function StatusCheckForm() {
  const [problemId, setProblemId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StatusResult | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProblemId(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    if (!problemId.trim()) {
      setError("ID masalah tidak boleh kosong.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/feedback?id=${problemId}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Gagal mengambil status masalah");
      setResult(data as StatusResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat cek status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-neutral-900 text-white p-6 rounded-2xl shadow-md border border-neutral-700 space-y-6">
      <h2 className="text-2xl font-bold flex items-center justify-center gap-2 text-green-400">
        <span role="img" aria-label="Search">🔍</span> Cek Status Masalah
      </h2>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-3"
      >
        <input
          type="text"
          value={problemId}
          onChange={handleChange}
          placeholder="Masukkan ID Masalah"
          required
          className="flex-1 p-3 rounded-lg bg-neutral-800 border border-neutral-600 text-sm sm:text-base focus:ring-2 focus:ring-green-500 focus:outline-none placeholder-neutral-400"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-all duration-200"
        >
          {loading ? "Mencari..." : "Cek Status"}
        </button>
      </form>

      {error && (
        <div className="p-3 bg-red-900/60 border border-red-500/40 rounded-lg text-center text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="p-4 bg-neutral-800 border border-neutral-600 rounded-xl space-y-3 shadow-inner animate-fadeIn">
          <p className="text-sm text-neutral-400">
            <strong>ID Masalah:</strong> <span className="text-white">{result.id}</span>
          </p>
          <p className="text-lg font-semibold leading-snug">{result.problem_title}</p>
          <div className="flex items-center gap-2">
            <strong>Status:</strong>
            <span
              className={`px-2 py-1 rounded-md text-sm font-semibold ${
                result.status.toLowerCase() === "selesai"
                  ? "bg-green-600/20 text-green-400"
                  : result.status.toLowerCase() === "diproses"
                  ? "bg-yellow-600/20 text-yellow-400"
                  : "bg-blue-600/20 text-blue-400"
              }`}
            >
              {result.status}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

