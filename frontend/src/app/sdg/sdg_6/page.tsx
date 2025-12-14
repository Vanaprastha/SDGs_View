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

// ==========================
// ANIMASI PIE LABEL
// ==========================
const PIE_LABEL_FONT = 11; // << atur ukuran label pie

export default function SDG6Page() {
  const [insight, setInsight] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  // Overlay “Lihat Desa”
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
      // Get the main scrollable container
      const mainContainer = document.querySelector('main');
      if (mainContainer) {
        mainContainer.scrollTo({ top: 0, behavior: "smooth" });
      }
      // Also scroll window as fallback
      window.scrollTo({ top: 0, behavior: "smooth" });
      document.body.style.overflow = "hidden";
      // Scroll popup container to top
      if (overlayRef.current) {
        overlayRef.current.scrollTop = 0;
      }
    } else {
      document.body.style.overflow = "auto";
    }
  }, [showOverlay]);

  // =========================
  // LOAD INSIGHT
  // =========================
  useEffect(() => {
    setIsLoading(true);
    fetch("/api/insight?sdg=6")
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

  // =========================
  // LOAD DATA SDG 6
  // =========================
  useEffect(() => {
    fetch("/api/sdgs6")
      .then((res) => res.json())
      .then((d) => {
        // urutkan lembaga air
        d.sort(
          (a: any, b: any) =>
            (b["Jumlah Lembaga pengelolaan air"] || 0) -
            (a["Jumlah Lembaga pengelolaan air"] || 0)
        );
        setData(d);
      })
      .catch((err) => console.error(err));
  }, []);

  const COLORS = ["#22c55e", "#ef4444", "#3b82f6", "#f59e0b", "#a855f7", "#06b6d4"];

  // =========================
  // RINGKASAN
  // =========================
  const totals = {
    airAman: data.filter((d) => String(d["Akses Air Minum Aman"]).toLowerCase() === "ada").length,
    airTidak: data.filter((d) => String(d["Akses Air Minum Aman"]).toLowerCase() === "tidak ada").length,
    jambanSendiri: data.filter(
      (d) =>
        String(d["Penggunaan fasilitas buang air besar sebagian besar keluarga di desa/kelurahan:"]) ===
        "Jamban sendiri"
    ).length,
    pencemaranAda: data.filter((d) => String(d["Pencemaran Limbah Sungai"]).toLowerCase() === "ada").length,
    pencemaranTidak: data.filter(
      (d) =>
        String(d["Pencemaran Limbah Sungai"]).toLowerCase() === "tidak ada" ||
        d["Pencemaran Limbah Sungai"] === 0
    ).length,
  };

  const totalLembagaAir = data.reduce(
    (sum, row) => sum + (parseFloat(row["Jumlah Lembaga pengelolaan air"]) || 0),
    0
  );

  // =========================
  // TOOLTIP PIE
  // =========================
  const CustomTooltipPie = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

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

  // =========================
  // PIE LABEL (kecil)
  // =========================
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

  // =========================
  // LOADING ANIMASI
  // =========================
  if (isLoading) {
    return (
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="text-center space-y-4 animate-pulse">
          <div className="w-16 h-16 bg-cyan-500 rounded-full mx-auto animate-bounce"></div>
          <p className="text-white text-lg font-semibold">Memuat Data SDG 6...</p>
          <div className="w-32 h-2 bg-white/20 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-cyan-500 animate-pulse" style={{ animationDuration: "2s" }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">

      {/* ========================= */}
      {/* OVERLAY */}
      {/* ========================= */}
      {showOverlay && (
        <div
          ref={overlayRef}
          className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex justify-center p-6 overflow-y-auto animate-fade-in"
        >
          <div className="glass-4 p-6 rounded-2xl w-full max-w-xl border border-white/10 mt-10 animate-slide-up h-fit">
            <h3 className="text-xl font-bold text-cyan-400 mb-4">{overlayTitle}</h3>

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

      {/* ========================= */}
      {/* HEADER */}
      {/* ========================= */}
      <div className="glass-4 p-6 rounded-2xl border border-white/10 shadow-lg transform transition-all hover:scale-[1.01] animate-fade-in-up">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-300 hover:text-white mb-4 transition-colors duration-200"
        >
          <ArrowLeft size={20} />
          <span className="text-sm">Kembali ke Dashboard</span>
        </button>
        <h2 className="text-2xl font-bold text-cyan-400 animate-pulse">
          💧 SDG 6: Air Bersih & Sanitasi Layak
        </h2>
      </div>

      {/* ========================= */}
      {/* RINGKASAN CARD (ANIMATED) */}
      {/* ========================= */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Air Minum Aman", value: totals.airAman, color: "text-green-400" },
          { label: "Air Tidak Aman", value: totals.airTidak, color: "text-red-400" },
          { label: "Jamban Sendiri", value: totals.jambanSendiri, color: "text-blue-400" },
          { label: "Pencemaran Ada", value: totals.pencemaranAda, color: "text-red-400" },
          { label: "Pencemaran Tidak Ada", value: totals.pencemaranTidak, color: "text-green-400" }
        ].map((item, i) => (
          <div
            key={i}
            className="glass-2 p-4 rounded-xl text-center border border-white/10 shadow transform transition-all hover:scale-105 animate-slide-up"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <h4 className="font-semibold text-sm text-white">{item.label}</h4>
            <p className={`text-xl font-bold animate-count-up ${item.color}`}>
              {item.value}
            </p>
            <p className="text-xs text-gray-300">Desa</p>
          </div>
        ))}
      </div>

      {/* ========================= */}
      {/* CARD: TOTAL LEMBAGA AIR */}
      {/* ========================= */}
      <div className="glass-4 p-6 rounded-2xl shadow-lg border border-white/10 text-center animate-fade-in-up">
        <h3 className="text-lg font-semibold text-white">🏢 Total Lembaga Pengelolaan Air</h3>
        <p className="text-4xl font-extrabold text-cyan-400 animate-count-up">
          {totalLembagaAir}
        </p>
        <p className="text-sm text-gray-300">{data.length} desa</p>
      </div>

      {/* ========================= */}
      {/* BAR CHART */}
      {/* ========================= */}
      <div className="glass-4 p-6 rounded-2xl shadow-lg border border-white/10 animate-fade-in-up">
        <h3 className="text-lg font-semibold text-white mb-4">📊 Lembaga Pengelolaan Air</h3>

        <div className="w-full h-96">
          <ResponsiveContainer>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff30" />
              <XAxis
                dataKey="nama_desa"
                stroke="#fff"
                tick={{ fill: "#fff" }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#fff" tick={{ fill: "#fff" }} />
              <Tooltip />
              <Bar dataKey="Jumlah Lembaga pengelolaan air" fill="#06b6d4" radius={[6, 6, 0, 0]}>
                <LabelList position="top" fill="#fff" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ========================= */}
      {/* PROGRESS BAR + PIE CHART */}
      {/* ========================= */}
      <div className="glass-4 p-6 rounded-2xl border border-white/10 animate-fade-in-up">
        <h3 className="text-lg font-semibold text-white mb-4">
          🥧 Indikator Kualitatif Sanitasi & Air
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PROGRESS BAR */}
          {[
            "Akses Air Minum Aman",
            "Pencemaran Limbah Sungai"
          ].map((key, i) => {
            const desaYes = data.filter((d) => {
              const val = String(d[key]).toLowerCase();
              if (key === "Pencemaran Limbah Sungai") return val.includes("tidak ada") || val === "0";
              return val.includes("ada");
            }).length;

            const percent = Math.round((desaYes / data.length) * 100);

            const desaList = data
              .filter((d) => {
                const val = String(d[key]).toLowerCase();
                if (key === "Pencemaran Limbah Sungai") return val.includes("tidak ada") || val === "0";
                return val.includes("ada");
              })
              .map((d) => d.nama_desa);

            return (
              <div
                key={i}
                className="glass-2 p-5 rounded-xl border border-white/10 transform hover:scale-[1.02] transition-all animate-slide-up"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <h4 className="text-white text-center font-semibold mb-2">{key}</h4>
                <p className="text-gray-300 text-center mb-1">
                  {percent}% ({desaYes}/{data.length} desa)
                </p>

                <div className="w-full h-4 bg-white/20 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full ${percent === 0 ? "bg-red-500" :
                      percent < 50 ? "bg-yellow-500" :
                        "bg-green-500"
                      } transition-all`}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <button
                  onClick={() => openOverlay(key, desaList)}
                  className="mt-2 w-full py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm"
                >
                  Lihat Desa
                </button>
              </div>
            );
          })}

          {/* PIE CHART */}
          {[
            "Penggunaan fasilitas buang air besar sebagian besar keluarga di desa/kelurahan:",
            "Tempat/saluran pembuangan limbah cair dari air mandi/cuci sebagian besar keluarga:"
          ].map((key, i) => {
            const counts: Record<string, number> = {};

            data.forEach((row) => {
              const val = String(row[key]);
              counts[val] = (counts[val] || 0) + 1;
            });

            const pieData = Object.entries(counts).map(([name, value]) => ({ name, value, key }));

            return (
              <div
                key={i}
                className="glass-2 p-4 rounded-xl border border-white/10 shadow transform hover:scale-[1.02] transition-all animate-slide-up"
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <h4 className="text-md font-semibold text-white text-center mb-4">{key}</h4>

                <div className="w-full h-72 flex justify-center">
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
                        {pieData.map((entry, j) => (
                          <Cell key={j} fill={COLORS[j % COLORS.length]} />
                        ))}
                      </Pie>

                      <Legend verticalAlign="bottom" layout="horizontal" align="center" />
                      <Tooltip content={<CustomTooltipPie />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================= */}
      {/* INSIGHT */}
      {/* ========================= */}
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

