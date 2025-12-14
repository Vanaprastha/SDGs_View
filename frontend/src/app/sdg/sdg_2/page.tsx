// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, LabelList
} from "recharts";

export default function SDG2Page() {
  const [dataSDG2, setDataSDG2] = useState<any[]>([]);
  const [insight, setInsight] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // modal
  const [selectedIndicator, setSelectedIndicator] = useState<any>(null);

  const router = useRouter();

  // Lock scroll when modal is open
  useEffect(() => {
    if (selectedIndicator) {
      const mainContainer = document.querySelector('main');
      if (mainContainer) {
        mainContainer.scrollTo({ top: 0, behavior: "smooth" });
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [selectedIndicator]);

  // fetch insight
  useEffect(() => {
    setIsLoading(true);
    fetch("/api/insight?sdg=2")
      .then(res => res.json())
      .then(d => {
        setInsight(d.insight || "sedang memberikan insight berdasarkan data....");
        setIsLoading(false);
      })
      .catch(() => {
        setInsight("sedang memberikan insight berdasarkan data....");
        setIsLoading(false);
      });
  }, []);

  // fetch sdgs2
  useEffect(() => {
    fetch("/api/sdgs2")
      .then(res => res.json())
      .then(d => {
        if (d.length > 0) {
          d.sort((a, b) => {
            const va = parseFloat(a["Jumlah penderita gizi buruk"]) || 0;
            const vb = parseFloat(b["Jumlah penderita gizi buruk"]) || 0;
            return va - vb;
          });
        }
        setDataSDG2(d);
      })
      .catch(err => console.error(err));
  }, []);

  const COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#f59e0b"];

  // count summary
  const totalGiziBuruk = dataSDG2.reduce(
    (sum, row) => sum + (parseFloat(row["Jumlah penderita gizi buruk"]) || 0),
    0
  );

  const totalLuasPertanian = dataSDG2.reduce(
    (sum, row) => sum + (parseFloat(row["Luas areal pertanian yang terdampak bencana alam"]) || 0),
    0
  );

  // list indikator kualitatif (nama lengkap tidak dirubah)
  const indikatorKualitatif = [
    "Kejadian Kearawanan Pangan",
    "Penggalakan penggunaan pupuk organik di lahan pertanian",
    "Akses jalan darat dari sentra produksi pertanian ke jalan utama dapat dilalui kendaraan roda 4 lebih"
  ];

  // =======================
  // Loading Animation (yellow)
  // =======================
  if (isLoading) {
    return (
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="text-center space-y-4 animate-pulse">
          <div className="w-16 h-16 bg-yellow-500 rounded-full mx-auto animate-bounce"></div>
          <p className="text-white text-lg font-semibold">Memuat Data SDG 2...</p>
          <div className="w-32 h-2 bg-white/20 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-yellow-500 animate-pulse" style={{ animationDuration: "2s" }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      {/* Header */}
      <div className="glass-4 p-6 rounded-2xl shadow-lg border border-white/10">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-300 hover:text-white mb-4 transition-colors duration-200"
        >
          <ArrowLeft size={20} />
          <span className="text-sm">Kembali ke Dashboard</span>
        </button>
        <h2 className="text-2xl font-bold text-yellow-400 animate-pulse">
          🌾 SDG 2: Tanpa Kelaparan
        </h2>
        <p className="text-sm text-gray-200 mt-2">
          Monitoring Gizi Buruk, Areal Pertanian, Kerawanan Pangan, Pupuk Organik & Akses Jalan
        </p>
      </div>

      {/* Ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-2 p-6 rounded-xl text-center shadow border border-white/10">
          <h4 className="text-white font-semibold">Total Penderita Gizi Buruk</h4>
          <p className="text-4xl font-extrabold text-red-400">{totalGiziBuruk.toLocaleString()}</p>
          <p className="text-xs text-gray-300 mt-2">Orang</p>
        </div>

        <div className="glass-2 p-6 rounded-xl text-center shadow border border-white/10">
          <h4 className="text-white font-semibold">Total Luas Areal Pertanian Terdampak</h4>
          <p className="text-4xl font-extrabold text-blue-400">{totalLuasPertanian.toLocaleString()}</p>
          <p className="text-xs text-gray-300 mt-2">Hektar</p>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="glass-4 p-6 rounded-2xl shadow-lg border border-white/10">
        <h3 className="text-lg font-semibold mb-4 text-white">
          📊 Jumlah Gizi Buruk & Areal Pertanian per Desa
        </h3>
        <div className="w-full h-96">
          <ResponsiveContainer>
            <BarChart data={dataSDG2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff30" />
              <XAxis
                dataKey="nama_desa"
                stroke="#fff"
                tick={{ fill: "#fff", fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#fff" tick={{ fill: "#fff" }} />
              <Tooltip />
              <Legend />

              <Bar
                dataKey="Jumlah penderita gizi buruk"
                fill="#ef4444"
                radius={[6, 6, 0, 0]}
              >
                <LabelList dataKey="Jumlah penderita gizi buruk" position="top" fill="#fff" />
              </Bar>

              <Bar
                dataKey="Luas areal pertanian yang terdampak bencana alam"
                fill="#3b82f6"
                radius={[6, 6, 0, 0]}
              >
                <LabelList dataKey="Luas areal pertanian" position="top" fill="#fff" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ==================== */}
      {/* PROGRESS BAR KUALITATIF */}
      {/* ==================== */}
      <div className="glass-4 p-6 rounded-2xl border border-white/10 shadow-lg">
        <h3 className="text-white text-lg font-semibold mb-4">
          📊 Indikator Kualitatif (Per Layanan)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {indikatorKualitatif.map((key, idx) => {
            const desaYa = dataSDG2.filter((row) => row[key] === "ya").map((d) => d.nama_desa);
            const desaTidak = dataSDG2.filter((row) => row[key] !== "ya").map((d) => d.nama_desa);

            const total = dataSDG2.length;
            const percent = Math.round((desaYa.length / total) * 100);

            return (
              <div
                key={idx}
                className="glass-2 p-5 rounded-xl border border-white/10 shadow hover:scale-[1.02] transition"
              >
                <h4 className="text-white text-center font-semibold mb-3 break-words leading-snug">
                  {key}
                </h4>

                <p className="text-gray-200 text-sm text-center mb-1">
                  {percent}% ({desaYa.length}/{total} desa)
                </p>

                <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-4 bg-green-500 rounded-full transition-all duration-700"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <button
                  onClick={() =>
                    setSelectedIndicator({
                      indikator: key,
                      desaYa,
                      desaTidak,
                    })
                  }
                  className="mt-3 w-full text-center bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-semibold py-2 rounded-lg transition"
                >
                  Lihat Desa
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ==================== */}
      {/* MODAL */}
      {/* ==================== */}
      {selectedIndicator && (
        <div
          className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex justify-center p-6 overflow-y-auto animate-fade-in"
          onClick={() => setSelectedIndicator(null)}
        >
          <div
            className="glass-4 p-6 rounded-2xl max-w-xl w-full mt-10 border border-white/10 animate-slide-up h-fit"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-yellow-400 mb-4">
              {selectedIndicator.indikator}
            </h2>

            <h3 className="text-green-400 font-semibold mb-2">
              ✓ Desa yang memenuhi indikator ({selectedIndicator.desaYa.length})
            </h3>
            <ul className="text-white space-y-2 max-h-40 overflow-y-auto mb-4">
              {selectedIndicator.desaYa.map((d, i) => (
                <li key={i} className="p-2 bg-white/10 rounded-lg">{d}</li>
              ))}
            </ul>

            <h3 className="text-red-400 font-semibold mb-2">
              ✗ Desa yang belum memenuhi indikator ({selectedIndicator.desaTidak.length})
            </h3>
            <ul className="text-white space-y-2 max-h-40 overflow-y-auto">
              {selectedIndicator.desaTidak.map((d, i) => (
                <li key={i} className="p-2 bg-white/10 rounded-lg">{d}</li>
              ))}
            </ul>

            <button
              onClick={() => setSelectedIndicator(null)}
              className="w-full mt-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* INSIGHT */}
      <div className="glass-4 p-6 rounded-2xl border border-white/10 shadow-lg">
        <h3 className="text-blue-400 text-lg font-semibold mb-2">💡 Insight Otomatis</h3>
        <p className="text-gray-100 text-sm whitespace-pre-line">
          {insight || "Sedang menganalisis data..."}
        </p>
      </div>
    </div>
  );
}

