// @ts-nocheck
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Portal from "@/components/Portal";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, LabelList, PieChart, Pie, Cell
} from "recharts";

// ===============================
// PIE LABEL STYLE seperti SDG6
// ===============================
const PIE_LABEL_FONT = 17;

const RenderPieLabel = ({ name, percent, x, y }) => (
  <text
    x={x}
    y={y}
    fill="#fff"
    textAnchor="middle"
    dominantBaseline="central"
    fontSize={PIE_LABEL_FONT}
  >
    {`${name} (${(percent * 100).toFixed(0)}%)`}
  </text>
);

export default function SDG8Page() {
  const [insight, setInsight] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  const [activeFilters, setActiveFilters] = useState({
    bumdes: true,
    industri: true,
    waduk: true
  });

  // ===============================
  // Overlay lihat desa
  // ===============================
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

  // ===============================
  // LOAD INSIGHT
  // ===============================
  useEffect(() => {
    setIsLoading(true);
    fetch("/api/insight?sdg=8")
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

  // ===============================
  // LOAD DATA SDG 8
  // ===============================
  useEffect(() => {
    fetch("/api/sdgs8")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error(err));
  }, []);

  // ===============================
  // TOTAL SUMMARY
  // ===============================
  const totals = data.reduce(
    (acc, row) => {
      acc.bumdes += row["Jumlah unit Badan usaha Milik Desa"] || 0;
      acc.industri += row["Jumlah industri mikro makanan"] || 0;
      acc.waduk += row["Jumlah Pemanfaatan Waduk Untuk Pariwisata"] || 0;
      return acc;
    },
    { bumdes: 0, industri: 0, waduk: 0 }
  );

  const toggleFilter = (filterName) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  // ============================
  // Tooltip Bar
  // ============================
  const CustomTooltipBar = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;

    return (
      <div className="bg-black/90 text-white p-3 rounded-lg text-sm shadow-lg border border-white/20 animate-pulse">
        <p className="font-semibold">{label}</p>
        {payload.map((p, i) => (
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
  };

  // ============================
  // Tooltip Pie (SDG6 Style)
  // ============================
  const CustomTooltipPie = ({ active, payload }) => {
    if (!active || !payload?.length) return null;

    const category = payload[0].name;
    const key = payload[0].payload.key;

    const desaList = data
      .filter((row) => String(row[key]) === category)
      .map((row) => row.nama_desa);

    return (
      <div className="bg-black/90 text-white p-3 rounded-lg text-sm shadow-lg border border-white/10 animate-fade-in">
        <p className="font-semibold">{category}</p>
        <ul className="list-disc list-inside mt-1 max-h-32 overflow-y-auto">
          {desaList.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
      </div>
    );
  };

  // ============================
  // LOADING SCREEN
  // ============================
  if (isLoading) {
    return (
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="text-center space-y-4 animate-pulse">
          <div className="w-16 h-16 bg-orange-500 rounded-full mx-auto animate-bounce"></div>
          <p className="text-white text-lg font-semibold">Memuat Data SDG 8...</p>
        </div>
      </div>
    );
  }

  // =====================================================================
  // PAGE OUTPUT
  // =====================================================================
  return (
    <div className="p-6 space-y-6 animate-fade-in">

      {/* Overlay */}
      {showOverlay && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex justify-center p-6 overflow-y-auto animate-fade-in">
          <div className="glass-4 p-6 rounded-2xl w-full max-w-xl border border-white/10 mt-10 animate-slide-up h-fit">
            <h3 className="text-xl font-bold text-orange-400 mb-4">{overlayTitle}</h3>

            <ul className="text-white space-y-2 max-h-96 overflow-y-auto">
              {overlayList.map((d, i) => (
                <li key={i} className="p-2 bg-white/10 rounded-lg">{d}</li>
              ))}
            </ul>

            <button
              onClick={closeOverlay}
              className="w-full mt-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="glass-4 p-6 rounded-2xl border border-white/10">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-300 hover:text-white mb-4 transition-colors duration-200"
        >
          <ArrowLeft size={20} />
          <span className="text-sm">Kembali ke Dashboard</span>
        </button>
        <h2 className="text-2xl font-bold text-orange-400 animate-pulse">
          💼 SDG 8: Pekerjaan Layak & Pertumbuhan Ekonomi
        </h2>
        <p className="text-gray-300 text-sm mt-1">
          Monitoring BUMDes, industri mikro, waduk wisata & indikator ekonomi lainnya.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "BUMDes", val: totals.bumdes, color: "text-blue-400" },
          { label: "Industri Mikro", val: totals.industri, color: "text-green-400" },
          { label: "Waduk Pariwisata", val: totals.waduk, color: "text-yellow-400" },
        ].map((it, i) => (
          <div
            key={i}
            className="glass-2 p-4 text-center rounded-xl border border-white/10 hover:scale-105 transition-all animate-slide-up"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <h4 className="text-sm text-white">{it.label}</h4>
            <p className={`text-xl font-bold ${it.color}`}>{it.val}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass-4 p-6 rounded-2xl border border-white/10 animate-fade-in-up">
        <h3 className="text-lg text-white mb-3">🎚️ Filter Bar Chart</h3>

        <div className="flex gap-3 flex-wrap">

          <button
            onClick={() => toggleFilter("bumdes")}
            className={`px-4 py-2 rounded-lg ${activeFilters.bumdes ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-300"
              }`}
          >
            🏢 BUMDes
          </button>

          <button
            onClick={() => toggleFilter("industri")}
            className={`px-4 py-2 rounded-lg ${activeFilters.industri ? "bg-green-500 text-white" : "bg-gray-700 text-gray-300"
              }`}
          >
            🍽️ Industri Mikro
          </button>

          <button
            onClick={() => toggleFilter("waduk")}
            className={`px-4 py-2 rounded-lg ${activeFilters.waduk ? "bg-yellow-500 text-white" : "bg-gray-700 text-gray-300"
              }`}
          >
            🏞️ Waduk Wisata
          </button>

        </div>
      </div>

      {/* Bar Chart */}
      <div className="glass-4 p-6 rounded-2xl border border-white/10 animate-fade-in-up">
        <h3 className="text-lg text-white mb-4">📊 Bar Chart Ekonomi</h3>

        <div className="w-full h-96">
          <ResponsiveContainer>
            <BarChart data={data}>
              <CartesianGrid stroke="#ffffff30" strokeDasharray="3 3" />
              <XAxis dataKey="nama_desa" stroke="#fff" tick={{ fill: "#fff" }} angle={-45} height={80} />
              <YAxis stroke="#fff" tick={{ fill: "#fff" }} />
              <Tooltip content={<CustomTooltipBar />} />
              <Legend />

              {activeFilters.bumdes && (
                <Bar dataKey="Jumlah unit Badan usaha Milik Desa" fill="#3b82f6">
                  <LabelList dataKey="Jumlah unit Badan usaha Milik Desa" fill="#fff" />
                </Bar>
              )}

              {activeFilters.industri && (
                <Bar dataKey="Jumlah industri mikro makanan" fill="#22c55e">
                  <LabelList dataKey="Jumlah industri mikro makanan" fill="#fff" />
                </Bar>
              )}

              {activeFilters.waduk && (
                <Bar dataKey="Jumlah Pemanfaatan Waduk Untuk Pariwisata" fill="#eab308">
                  <LabelList dataKey="Jumlah Pemanfaatan Waduk Untuk Pariwisata" fill="#fff" />
                </Bar>
              )}

            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ================================================== */}
      {/*  PIE CHART + PROGRESS BAR (KUALITATIF)            */}
      {/* ================================================== */}
      <div className="glass-4 p-6 rounded-2xl border border-white/10 animate-fade-in-up">
        <h3 className="text-lg text-white mb-4">🥧 Indikator Kualitatif Ekonomi</h3>

        <div className="grid grid-cols-2 gap-6">

          {/* ================= PIE CHART ================= */}
          {(() => {
            const key = "Sumber Penghasilan Utama Warga";
            const counts = {};

            data.forEach((row) => {
              const val = row[key];
              if (val) counts[val] = (counts[val] || 0) + 1;
            });

            const pieData = Object.entries(counts).map(([name, value]) => ({
              name,
              value,
              key,
            }));

            return (
              <div className="glass-2 p-4 rounded-xl border border-white/10 hover:scale-[1.02] transition-all">
                <h4 className="text-md text-center text-white mb-4">{key}</h4>

                <div className="w-full h-72">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={80}
                        labelLine={true}
                        label={RenderPieLabel}
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={["#3b82f6", "#22c55e", "#ef4444", "#f59e0b"][i % 4]} />
                        ))}
                      </Pie>

                      <Legend verticalAlign="bottom" align="center" />
                      <Tooltip content={<CustomTooltipPie />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })()}

          {/* ================= PROGRESS BAR (KUR) ================= */}
          {(() => {
            const key = "Fasilitas Kredit usaha rakyat";

            const desaAda = data.filter(
              (d) => String(d[key]).toLowerCase() === "ada"
            );

            const value = desaAda.length;
            const percent = Math.round((value / data.length) * 100);

            return (
              <div className="glass-2 p-4 rounded-xl border border-white/10 hover:scale-[1.02] transition-all">
                <h4 className="text-md font-semibold text-white text-center mb-4">
                  {key}
                </h4>

                <p className="text-gray-300 text-center mb-1">
                  {percent}% ({value}/{data.length} desa)
                </p>

                <div className="w-full h-4 bg-white/20 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full transition-all ${percent === 0 ? "bg-red-500"
                      : percent < 50 ? "bg-yellow-500"
                        : "bg-green-500"
                      }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <button
                  onClick={() => openOverlay(key, desaAda.map((d) => d.nama_desa))}
                  className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm"
                >
                  Lihat Desa
                </button>
              </div>
            );
          })()}

        </div>
      </div>

      {/* Insight */}
      <div className="glass-4 p-6 rounded-2xl border border-white/10 animate-fade-in-up">
        <h3 className="text-lg text-blue-400 mb-3">💡 Insight Otomatis</h3>
        <p className="text-gray-100 text-sm whitespace-pre-line">{insight}</p>
      </div>

    </div>
  );
}

