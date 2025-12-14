"use client";

import { useState } from "react";
import { FiDatabase, FiMessageSquare } from "react-icons/fi";
import { createClient } from "@supabase/supabase-js";

import ClusteringUpdate from "./ClusteringUpdate";
import FeedbackSDGsUpdate from "./FeedbackSDGsUpdate";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
);

export default function UpdateDataPage() {
  const [password, setPassword] = useState("");
  const [isAuth, setIsAuth] = useState(false);
  const [mode, setMode] = useState<"clustering" | "feedback" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const tryOpen = async () => {
    setMessage(null);
    if (!password) return;
    const res = await fetch("/api/check-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) setIsAuth(true);
    else setMessage("❌ Sandi salah.");
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-8 text-white max-w-6xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-semibold text-center">
        ⚙️ Update Data SDGs (Admin)
      </h1>

      {!isAuth ? (
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="rounded-2xl border border-white/10 p-4 sm:p-6 grid gap-3 sm:gap-4 w-full max-w-md text-center bg-white/5 backdrop-blur-sm shadow-lg">
            <div className="text-sm sm:text-base">Masukkan sandi untuk membuka halaman Update Data</div>
            <input
              type="password"
              className="border rounded-xl px-3 py-2 text-sm sm:text-base text-center bg-white/70 dark:bg-black/30 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Masukkan sandi admin"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              onClick={tryOpen}
              disabled={!password}
              className="rounded-xl px-4 sm:px-5 py-2 text-sm sm:text-base bg-green-600 hover:bg-green-700 text-white font-semibold btn-mobile"
            >
              Buka Halaman Update Data
            </button>
            {message && <div className="text-red-500 text-sm">{message}</div>}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Pilihan Mode Update */}
          {!mode ? (
            <div className="flex flex-col md:flex-row gap-6 sm:gap-8 justify-center items-center min-h-[50vh]">
              {/* Card Clustering */}
              <button
                onClick={() => setMode("clustering")}
                className="flex flex-col justify-between items-center w-full sm:w-72 h-64 sm:h-80 p-4 sm:p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-neutral-700 hover:bg-white/10 transition shadow-lg text-center"
              >
                <div className="flex-grow flex flex-col justify-center items-center">
                  <FiDatabase className="text-5xl sm:text-6xl text-blue-400 mb-3" />
                  <span className="text-lg sm:text-xl font-semibold">
                    Update Data Clustering
                  </span>
                </div>
                <p className="text-sm text-neutral-400 mt-2">
                  Mengelola data indikator dan menjalankan clustering.
                </p>
              </button>

              {/* Card Feedback */}
              <button
                onClick={() => setMode("feedback")}
                className="flex flex-col justify-between items-center w-full sm:w-72 h-64 sm:h-80 p-4 sm:p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-neutral-700 hover:bg-white/10 transition shadow-lg text-center"
              >
                <div className="flex-grow flex flex-col justify-center items-center">
                  <FiMessageSquare className="text-5xl sm:text-6xl text-green-400 mb-3" />
                  <span className="text-lg sm:text-xl font-semibold">
                    Update Data Feedback SDGs
                  </span>
                </div>
                <p className="text-sm text-neutral-400 mt-2">
                  Mengelola status feedback dari pengguna.
                </p>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={() => setMode(null)}
                className="p-2 rounded bg-neutral-700 text-white hover:bg-neutral-600 transition text-sm"
              >
                ← Kembali ke Pilihan Mode
              </button>
              {mode === "clustering" && <ClusteringUpdate />}
              {mode === "feedback" && <FeedbackSDGsUpdate />}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

