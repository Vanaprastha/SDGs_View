// @ts-nocheck
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Portal from "@/components/Portal";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, LabelList
} from "recharts";

export default function SDG7Page() {
  const [insight, setInsight] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [activeFilters, setActiveFilters] = useState({
    tanpaListrik: true,
    waduk: true
  });

  // Overlay untuk "Lihat Desa"
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayTitle, setOverlayTitle] = useState("");
  const [overlayList, setOverlayList] = useState<string[]>([]);

  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);

  const openOverlay = (title: string, list: string[]) => {
    setOverlayTitle(title);
    setOverlayList(list);
    setShowOverlay(true);
  };

  const closeOverlay = () => setShowOverlay(false);

  // Lock body scroll and scroll main container to top when overlay is shown
  useEffect(() => {
    if (showOverlay) {
      const mainContainer = document.querySelector('main');
      if (mainContainer) {
        mainContainer.scrollTo({ top: 0, behavior: "smooth" });
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
      document.body.style.overflow = "hidden";
      if (overlayRef.current) {
        overlayRef.current.scrollTop = 0;
      }
    } else {
      document.body.style.overflow = "auto";
    }
  }, [showOverlay]);

  // Load insight
  useEffect(() => {
    setIsLoading(true);
    fetch("/api/insight?sdg=7")
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

  // Load data SDG7
  useEffect(() => {
    fetch("/api/sdgs7")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error(err));
  }, []);

  // Hitung total ringkasan
  const totals = data.reduce(
    (acc, row) => {
      acc.tanpaListrik += row["Jumlah Keluarga Tanpa Listrik"] || 0;
      acc.waduk += row["Pemanfaatan Waduk Untuk Listrik"] || 0;
      return acc;
    },
    { tanpaListrik: 0, waduk: 0 }
  );

  // Toggle filter
  const toggleFilter = (filterName: keyof typeof activeFilters) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  const selectAllFilters = () => {
    setActiveFilters({
      tanpaListrik: true,
      waduk: true
    });
  };

  const clearAllFilters = () => {
    setActiveFilters({
      tanpaListrik: false,
      waduk: false
    });
  };

  // Tooltip Bar Animasi
  const CustomTooltipBar = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 text-white p-3 rounded-lg text-sm border border-white/20 shadow-lg animate-pulse">
          <p className="font-semibold">{label}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: p.color }}
              ></span>
              {p.name}: {p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Loading animation
  if (isLoading) {
    return (
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="text-center space-y-4 animate-pulse">
          <div className="w-16 h-16 bg-yellow-500 rounded-full mx-auto animate-bounce"></div>
          <p className="text-white text-lg font-semibold">Memuat Data SDG 7...</p>
          <div className="w-32 h-2 bg-white/20 rounded-full mx-auto overflow-hidden">
            <div
              className="h-full bg-yellow-500 animate-pulse"
              style={{ animationDuration: "2s" }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">

      {/* Overlay Lihat Desa */}
      {showOverlay && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex justify-center p-6 overflow-y-auto animate-fade-in">
          <div className="glass-4 p-6 rounded-2xl w-full max-w-xl border border-white/10 mt-10 animate-slide-up h-fit">
            <h3 className="text-xl font-bold text-yellow-400 mb-4">{overlayTitle}</h3>

            <ul className="text-white space-y-2 max-h-96 overflow-y-auto">
              {overlayList.map((d, i) => (
                <li key={i} className="p-2 bg-white/10 rounded-lg">{d}</li>
              ))}
            </ul>

            <button
              className="w-full mt-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
              onClick={closeOverlay}
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="glass-4 p-6 rounded-2xl shadow-lg border border-white/10 hover:scale-[1.01] transition-all duration-300">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-300 hover:text-white mb-4 transition-colors duration-200"
        >
          <ArrowLeft size={20} />
          <span className="text-sm">Kembali ke Dashboard</span>
        </button>
        <h2 className="text-2xl font-bold drop-shadow text-yellow-400 animate-pulse">
          ⚡ SDG 7: Energi Bersih dan Terjangkau
        </h2>
        <p className="text-sm text-gray-200 mt-2">
          Monitoring akses listrik, energi terbarukan, biogas, sarana energi, dan pemanfaatan waduk.
        </p>
      </div>

      {/* CARD RINGKASAN */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
        <div className="glass-2 p-4 rounded-xl text-center border border-white/10 hover:scale-105 transition-all animate-slide-up">
          <h4 className="font-semibold text-sm text-white">Keluarga Tanpa Listrik</h4>
          <p className="text-xl font-bold text-red-400 animate-count-up">
            {totals.tanpaListrik.toLocaleString()}
          </p>
        </div>
        <div
          className="glass-2 p-4 rounded-xl text-center border border-white/10 hover:scale-105 transition-all animate-slide-up"
          style={{ animationDelay: "100ms" }}
        >
          <h4 className="font-semibold text-sm text-white">Pemanfaatan Waduk</h4>
          <p className="text-xl font-bold text-blue-400 animate-count-up">
            {totals.waduk.toLocaleString()}
          </p>
        </div>
      </div>

      {/* ============================= */}
      {/* FILTER BAR CHART */}
      {/* ============================= */}
      <div className="glass-4 p-6 rounded-2xl shadow-lg border border-white/10 animate-fade-in-up">
        <h3 className="text-lg font-semibold text-white mb-4">🎚️ Filter Data Bar Chart</h3>

        <div className="flex flex-wrap gap-4">

          {/* Toggle Filters */}
          <button
            onClick={() => toggleFilter("tanpaListrik")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold hover:scale-105 transition-all ${activeFilters.tanpaListrik
              ? "bg-red-500 text-white shadow-lg"
              : "bg-gray-700 text-gray-300"
              }`}
          >
            🔌 Keluarga Tanpa Listrik
          </button>

          <button
            onClick={() => toggleFilter("waduk")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold hover:scale-105 transition-all ${activeFilters.waduk
              ? "bg-blue-500 text-white shadow-lg"
              : "bg-gray-700 text-gray-300"
              }`}
          >
            💧 Pemanfaatan Waduk
          </button>

          {/* Quick Actions */}
          <div className="flex gap-3 ml-auto">
            <button
              onClick={selectAllFilters}
              className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:scale-105"
            >
              Pilih Semua
            </button>
            <button
              onClick={clearAllFilters}
              className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:scale-105"
            >
              Hapus Semua
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-300 mt-2">
          Menampilkan:{" "}
          {[
            activeFilters.tanpaListrik && "Tanpa Listrik",
            activeFilters.waduk && "Pemanfaatan Waduk"
          ].filter(Boolean).join(", ") || "Tidak ada data"}
        </p>
      </div>

      {/* ============================= */}
      {/* BAR CHART */}
      {/* ============================= */}
      <div className="glass-4 p-6 rounded-2xl shadow-lg border border-white/10 animate-fade-in-up">
        <h3 className="text-lg font-semibold text-white mb-4">📊 Indikator SDG 7 per Desa</h3>

        <div className="w-full h-96">
          <ResponsiveContainer>
            <BarChart data={data}>
              <CartesianGrid stroke="#ffffff30" strokeDasharray="3 3" />
              <XAxis
                dataKey="nama_desa"
                stroke="#fff"
                tick={{ fill: "#fff" }}
                angle={-45}
                height={80}
                textAnchor="end"
              />
              <YAxis stroke="#fff" tick={{ fill: "#fff" }} />
              <Tooltip content={<CustomTooltipBar />} />
              <Legend />

              {activeFilters.tanpaListrik && (
                <Bar
                  dataKey="Jumlah Keluarga Tanpa Listrik"
                  fill="#ef4444"
                  radius={[6, 6, 0, 0]}
                >
                  <LabelList position="top" fill="#fff" fontSize={12} />
                </Bar>
              )}

              {activeFilters.waduk && (
                <Bar
                  dataKey="Pemanfaatan Waduk Untuk Listrik"
                  fill="#3b82f6"
                  radius={[6, 6, 0, 0]}
                >
                  <LabelList position="top" fill="#fff" fontSize={12} />
                </Bar>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ================================================================= */}
      {/* ===   PROGRESS BAR untuk INDIKATOR KUALITATIF ENERGI (NEW!)    === */}
      {/* ================================================================= */}
      <div className="glass-4 p-6 rounded-2xl shadow-lg border border-white/10 animate-fade-in-up">
        <h3 className="text-lg font-semibold text-white mb-4">
          🔋 Indikator Kualitatif Energi
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {[
            "Keberadaan program pengembangan energi terbarukan",
            "Penggunaan Biogas",
            "Keberadaan program kegiatan pembangunan masyarakat untuk Sarana prasarana energi"
          ].map((key, idx) => {
            const desaYes = data.filter((d) => String(d[key]).toLowerCase() === "ada").length;
            const percent = Math.round((desaYes / data.length) * 100);

            const desaList = data
              .filter((d) => String(d[key]).toLowerCase() === "ada")
              .map((d) => d.nama_desa);

            return (
              <div
                key={idx}
                className="glass-2 p-5 rounded-xl border border-white/10 hover:scale-[1.02] transition-all animate-slide-up"
              >
                <h4 className="text-white text-center font-semibold mb-2">
                  {key}
                </h4>

                <p className="text-gray-300 text-center mb-1">
                  {percent}% ({desaYes}/{data.length} desa)
                </p>

                {/* Progress Bar */}
                <div className="w-full h-4 bg-white/20 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full transition-all ${percent === 0 ? "bg-red-500" :
                      percent < 50 ? "bg-yellow-500" :
                        "bg-green-500"
                      }`}
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>

                <button
                  onClick={() => openOverlay(key, desaList)}
                  className="mt-2 w-full py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm"
                >
                  Lihat Desa
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* INSIGHT */}
      <div className="glass-4 p-6 rounded-2xl border border-white/10 shadow-lg animate-fade-in-up">
        <h3 className="text-lg font-semibold text-blue-400 mb-3">💡 Insight Otomatis</h3>
        <div className="bg-black/30 p-4 rounded-lg border border-blue-500/30">
          <p className="text-sm text-gray-100 whitespace-pre-line animate-pulse-slow">
            {insight}
          </p>
        </div>
      </div>

    </div>
  );
}

