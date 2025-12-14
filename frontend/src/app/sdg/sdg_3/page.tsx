// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, LabelList
} from "recharts";

export default function SDG3Page() {
  const [insight, setInsight] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [activeFilters, setActiveFilters] = useState({
    puskesmas: true,
    posyandu: true,
    kader: true
  });

  // Modal
  const [selectedIndicator, setSelectedIndicator] = useState<any>(null);

  const router = useRouter();

  // Lock scroll saat modal muncul
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
    fetch("/api/insight?sdg=3")
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

  // fetch sdgs3 data
  useEffect(() => {
    fetch("/api/sdgs3")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error(err));
  }, []);

  const COLORS = ["#22c55e", "#ef4444", "#3b82f6", "#f59e0b"];

  // === Hitung total untuk card
  const totalPuskesmas = data.reduce(
    (sum, row) => sum + (parseFloat(row["Jumlah Puskesmas dengan sarana Rawat Inap"]) || 0),
    0
  );
  const totalPosyandu = data.reduce(
    (sum, row) => sum + (parseFloat(row["Jumlah Posyandu Aktif"]) || 0),
    0
  );
  const totalKader = data.reduce(
    (sum, row) => sum + (parseFloat(row["Jumlah Kader KB/KIA"]) || 0),
    0
  );

  // Filters
  const toggleFilter = (key) => {
    setActiveFilters(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const selectAllFilters = () => {
    setActiveFilters({
      puskesmas: true,
      posyandu: true,
      kader: true
    });
  };

  const clearAllFilters = () => {
    setActiveFilters({
      puskesmas: false,
      posyandu: false,
      kader: false
    });
  };

  // ================================
  // Ambil indikator jaminan kesehatan otomatis dari JSON
  // ================================
  const indikatorJaminan =
    data.length > 0
      ? Object.keys(data[0]).filter(
        (k) =>
          k.toLowerCase().includes("jaminan") &&
          k !== "nama_desa"
      )
      : [];

  // Helper mendeteksi "memenuhi indikator"
  const isPositive = (value) => {
    if (!value) return false;
    const v = String(value).toLowerCase();

    // jika mengandung "tidak", maka dianggap belum
    if (v.includes("tidak")) return false;

    return true; // selain itu dianggap memenuhi
  };

  // ===================
  // Loading
  // ===================
  if (isLoading) {
    return (
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="text-center space-y-4 animate-pulse">
          <div className="w-16 h-16 bg-green-500 rounded-full mx-auto animate-bounce"></div>
          <p className="text-white text-lg font-semibold">Memuat Data SDG 3...</p>
          <div className="w-32 h-2 bg-white/20 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-green-500 animate-pulse" style={{ animationDuration: '2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">

      {/* HEADER */}
      <div className="glass-4 p-6 rounded-2xl border border-white/10 shadow-lg">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-300 hover:text-white mb-4 transition-colors duration-200"
        >
          <ArrowLeft size={20} />
          <span className="text-sm">Kembali ke Dashboard</span>
        </button>
        <h2 className="text-2xl font-bold text-green-400 animate-pulse">
          🏥 SDG 3: Kesehatan yang Baik dan Kesejahteraan
        </h2>
        <p className="text-sm text-gray-200 mt-2">
          Monitoring Puskesmas, Posyandu, Kader, dan Jaminan Kesehatan
        </p>
      </div>

      {/* CARD SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-2 p-6 rounded-xl text-center shadow border border-white/10">
          <h4 className="text-white font-semibold">Total Puskesmas Rawat Inap</h4>
          <p className="text-4xl font-extrabold text-red-400">{totalPuskesmas.toLocaleString()}</p>
        </div>
        <div className="glass-2 p-6 rounded-xl text-center shadow border border-white/10">
          <h4 className="text-white font-semibold">Total Posyandu Aktif</h4>
          <p className="text-4xl font-extrabold text-blue-400">{totalPosyandu.toLocaleString()}</p>
        </div>
        <div className="glass-2 p-6 rounded-xl text-center shadow border border-white/10">
          <h4 className="text-white font-semibold">Total Kader KB/KIA</h4>
          <p className="text-4xl font-extrabold text-green-400">{totalKader.toLocaleString()}</p>
        </div>
      </div>

      {/* FILTER BAR CHART */}
      <div className="glass-4 p-6 rounded-2xl border border-white/10 shadow-lg">
        <h3 className="text-white font-semibold mb-4">🎚️ Filter Data Bar Chart</h3>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => toggleFilter('puskesmas')}
            className={`px-4 py-2 rounded-lg ${activeFilters.puskesmas ? "bg-red-500 text-white" : "bg-gray-600 text-gray-300"
              }`}
          >
            Puskesmas {activeFilters.puskesmas ? "✓" : ""}
          </button>

          <button
            onClick={() => toggleFilter('posyandu')}
            className={`px-4 py-2 rounded-lg ${activeFilters.posyandu ? "bg-blue-500 text-white" : "bg-gray-600 text-gray-300"
              }`}
          >
            Posyandu {activeFilters.posyandu ? "✓" : ""}
          </button>

          <button
            onClick={() => toggleFilter('kader')}
            className={`px-4 py-2 rounded-lg ${activeFilters.kader ? "bg-green-500 text-white" : "bg-gray-600 text-gray-300"
              }`}
          >
            Kader KB/KIA {activeFilters.kader ? "✓" : ""}
          </button>
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={selectAllFilters}
            className="bg-green-600 px-3 py-2 rounded-lg text-white"
          >
            Pilih Semua
          </button>
          <button
            onClick={clearAllFilters}
            className="bg-red-600 px-3 py-2 rounded-lg text-white"
          >
            Hapus Semua
          </button>
        </div>
      </div>

      {/* BAR CHART */}
      <div className="glass-4 p-6 rounded-2xl border border-white/10 shadow-lg">
        <h3 className="text-white text-lg font-semibold mb-4">📊 Fasilitas Kesehatan per Desa</h3>

        <div className="w-full h-96">
          <ResponsiveContainer>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff30" />
              <XAxis dataKey="nama_desa" stroke="#fff" tick={{ fill: "#fff" }} angle={-45} height={80} />
              <YAxis stroke="#fff" tick={{ fill: "#fff" }} />
              <Tooltip />
              <Legend />

              {activeFilters.puskesmas && (
                <Bar dataKey="Jumlah Puskesmas dengan sarana Rawat Inap" fill="#ef4444">
                  <LabelList dataKey="Jumlah Puskesmas dengan sarana Rawat Inap" fill="#fff" position="top" />
                </Bar>
              )}

              {activeFilters.posyandu && (
                <Bar dataKey="Jumlah Posyandu Aktif" fill="#3b82f6">
                  <LabelList dataKey="Jumlah Posyandu Aktif" fill="#fff" position="top" />
                </Bar>
              )}

              {activeFilters.kader && (
                <Bar dataKey="Jumlah Kader KB/KIA" fill="#22c55e">
                  <LabelList dataKey="Jumlah Kader KB/KIA" fill="#fff" position="top" />
                </Bar>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ===================================================== */}
      {/*           PROGRESS BAR — JAMINAN KESEHATAN            */}
      {/* ===================================================== */}
      <div className="glass-4 p-6 rounded-2xl border border-white/10 shadow-lg">
        <h3 className="text-white text-lg font-semibold mb-4">
          🏷️ Indikator Program Jaminan Kesehatan
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {indikatorJaminan.map((key, idx) => {
            const desaYa = data.filter((row) => isPositive(row[key])).map((d) => d.nama_desa);
            const desaTidak = data.filter((row) => !isPositive(row[key])).map((d) => d.nama_desa);

            const total = data.length || 1;
            const percent = Math.round((desaYa.length / total) * 100);

            return (
              <div key={idx} className="glass-2 p-5 rounded-xl border border-white/10">
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
                      desaTidak
                    })
                  }
                  className="mt-3 w-full text-center bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2 rounded-lg"
                >
                  Lihat Desa
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL */}
      {selectedIndicator && (
        <div
          className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex justify-center p-6 overflow-y-auto animate-fade-in"
          onClick={() => setSelectedIndicator(null)}
        >
          <div
            className="glass-4 p-6 rounded-2xl max-w-xl w-full mt-10 border border-white/10 animate-slide-up h-fit"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-green-400 mb-4">
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

