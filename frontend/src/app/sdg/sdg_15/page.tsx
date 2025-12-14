// @ts-nocheck
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Portal from "@/components/Portal";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  LabelList,
} from "recharts";

export default function SDG15Page() {
  const [insight, setInsight] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  // Overlay
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

  // Fetch Insight
  useEffect(() => {
    setIsLoading(true);
    fetch("/api/insight?sdg=15")
      .then((res) => res.json())
      .then((d) => {
        setInsight(d.insight || "sedang memberikan insight berdasarkan data…");
        setIsLoading(false);
      })
      .catch(() => {
        setInsight("sedang memberikan insight berdasarkan data…");
        setIsLoading(false);
      });
  }, []);

  // Fetch Data
  useEffect(() => {
    fetch("/api/sdgs15")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(console.error);
  }, []);

  // ===================
  // SUMMARY CARDS
  // ===================
  const summary = {
    tepiHutan: data.filter((d) =>
      String(d["Lokasi wilayah desa/kelurahan terhadap kawasan hutan/hutan"])
        .toLowerCase()
        .includes("tepi")
    ).length,

    luarHutan: data.filter((d) =>
      String(d["Lokasi wilayah desa/kelurahan terhadap kawasan hutan/hutan"])
        .toLowerCase()
        .includes("luar")
    ).length,

    adaPenanaman: data.filter((d) =>
      String(
        d[
        "Penanaman/pemeliharaan pepohonan di lahan kritis, penanaman mangrove, dan sejenisnya oleh masyarakat desa/kelurahan"
        ]
      )
        .toLowerCase()
        .includes("ada")
    ).length,
  };

  // ===========================================
  //  AUTO COLORING PROGRESS BAR
  // ===========================================
  const getColor = (value: string) => {
    const v = value.toLowerCase();
    if (
      v.includes("tidak ada") ||
      v.includes("tidak") ||
      v.includes("tidak termasuk") ||
      v.includes("tidak ada kegiatan")
    )
      return "#ef4444"; // merah
    if (v.includes("ada")) return "#22c55e"; // hijau
    return "#3b82f6"; // biru
  };

  // ===========================================
  //  HORIZONTAL BAR CHART UNTUK LOKASI HUTAN
  // ===========================================
  const lokasiKey = "Lokasi wilayah desa/kelurahan terhadap kawasan hutan/hutan";

  const lokasiCounts: Record<string, number> = {};
  data.forEach((row) => {
    const v = String(row[lokasiKey]).trim();
    lokasiCounts[v] = (lokasiCounts[v] || 0) + 1;
  });

  const lokasiChartData = Object.entries(lokasiCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const lokasiOverlayList = data.map(
    (d) => `${d.nama_desa} — ${String(d[lokasiKey])} `
  );

  // ==================================================
  //  GENERIC DYNAMIC PROGRESS BAR (untuk indikator lain)
  // ==================================================
  const DynamicProgressBar = ({ keyName, title, index }) => {
    const counts: Record<string, number> = {};

    data.forEach((row) => {
      const val = String(row[keyName] || "").trim();
      counts[val] = (counts[val] || 0) + 1;
    });

    const total = data.length;
    const entries = Object.entries(counts);

    const desaList = data.map((d) => `${d.nama_desa} — ${String(d[keyName])} `);

    return (
      <div
        className="glass-2 p-4 rounded-xl border border-white/10 animate-slide-up"
        style={{ animationDelay: `${index * 120} ms` }}
      >
        <div className="flex justify-between mb-2">
          <h4 className="text-white text-md font-semibold">{title}</h4>

          <button
            onClick={() => openOverlay(title, desaList)}
            className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded-lg"
          >
            Lihat Desa
          </button>
        </div>

        <div className="w-full h-6 bg-white/20 rounded-full overflow-hidden flex">
          {entries.map(([cat, val], i) => (
            <div
              key={`bar - ${index} -${i} `}
              style={{
                width: `${(val / total) * 100}% `,
                backgroundColor: getColor(cat),
              }}
            ></div>
          ))}
        </div>

        <div className="mt-3 space-y-1">
          {entries.map(([cat, val], i) => (
            <div key={`legend - ${index} -${i} `} className="flex items-center gap-2 text-gray-200 text-sm">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getColor(cat) }}
              ></span>
              {cat} — {val} desa
            </div>
          ))}
        </div>
      </div>
    );
  };

  // LOADING SCREEN
  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="w-16 h-16 bg-green-500 rounded-full animate-bounce mx-auto"></div>
        <p className="text-white mt-4">Memuat Data SDG 15...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* ====================== OVERLAY ====================== */}
      {showOverlay && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex justify-center p-6 overflow-y-auto animate-fade-in">
          <div className="glass-4 p-6 rounded-2xl max-w-xl w-full mt-10 border border-white/10 animate-slide-up h-fit">
            <h3 className="text-xl font-bold text-green-400 mb-4">{overlayTitle}</h3>

            <ul className="text-white space-y-2 max-h-96 overflow-y-auto">
              {overlayList.map((item, i) => (
                <li key={i} className="p-2 bg-white/10 rounded-lg">
                  {item}
                </li>
              ))}
            </ul>

            <button
              onClick={closeOverlay}
              className="w-full mt-6 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* ====================== HEADER ====================== */}
      <div className="glass-4 p-6 rounded-2xl border border-white/10">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-300 hover:text-white mb-4 transition-colors duration-200"
        >
          <ArrowLeft size={20} />
          <span className="text-sm">Kembali ke Dashboard</span>
        </button>
        <h2 className="text-2xl font-bold text-green-400">🌳 SDG 15: Ekosistem Daratan</h2>
        <p className="text-gray-300 text-sm">
          Monitoring lokasi desa terhadap kawasan hutan, kebakaran, penanaman pohon, dan perhutanan sosial.
        </p>
      </div>

      {/* ====================== SUMMARY CARDS ====================== */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Tepi Hutan", val: summary.tepiHutan, color: "text-green-400" },
          { label: "Di Luar Hutan", val: summary.luarHutan, color: "text-blue-400" },
          { label: "Ada Penanaman", val: summary.adaPenanaman, color: "text-green-400" },
        ].map((c, i) => (
          <div
            key={i}
            className="glass-2 p-4 rounded-xl text-center border border-white/10 animate-slide-up"
          >
            <h4 className="text-sm text-white">{c.label}</h4>
            <p className={`text - 2xl font - bold ${c.color} `}>{c.val}</p>
            <p className="text-xs text-gray-300">Desa</p>
          </div>
        ))}
      </div>

      {/* ====================== HORIZONTAL BAR CHART ====================== */}
      <div className="glass-4 p-6 rounded-2xl border border-white/10">
        <div className="flex justify-between">
          <h3 className="text-lg font-semibold text-white mb-4">
            📊 Lokasi Desa terhadap Kawasan Hutan
          </h3>

          <button
            onClick={() => openOverlay("Lokasi Desa terhadap Kawasan Hutan", lokasiOverlayList)}
            className="px-3 py-1 h-8 text-xs bg-green-600 hover:bg-green-700 text-white rounded-lg"
          >
            Lihat Desa
          </button>
        </div>

        <div className="w-full h-80">
          <ResponsiveContainer>
            <BarChart data={lokasiChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis type="number" stroke="#fff" />
              <YAxis
                dataKey="name"
                type="category"
                width={200}
                tick={{ fill: "#fff" }}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(0,0,0,0.7)",
                  borderRadius: "8px",
                  border: "1px solid #555",
                }}
              />
              <Bar dataKey="value" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ====================== PROGRESS BARS ====================== */}
      <div className="glass-4 p-6 rounded-2xl border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">
          🌱 Indikator Kehutanan & Lingkungan
        </h3>

        <div className="space-y-10">
          {[
            { key: "Kejadian Kebakaran hutan dan lahan", title: "Kebakaran Hutan" },
            {
              key: "Penanaman/pemeliharaan pepohonan di lahan kritis, penanaman mangrove, dan sejenisnya oleh masyarakat desa/kelurahan",
              title: "Penanaman Pohon",
            },
            { key: "Keberadaan Program perhutanan sosial", title: "Program Perhutanan Sosial" },
            { key: "Kepemilikan hutan milik desa", title: "Kepemilikan Hutan Desa" },
          ].map((item, idx) => (
            <DynamicProgressBar
              key={item.key}
              keyName={item.key}
              title={item.title}
              index={idx}
            />
          ))}
        </div>
      </div>

      {/* ====================== INSIGHT ====================== */}
      <div className="glass-4 p-6 rounded-2xl border border-white/10">
        <h3 className="text-green-400 font-semibold text-lg mb-3">💡 Insight Otomatis</h3>
        <p className="text-sm text-white whitespace-pre-line">{insight}</p>
      </div>
    </div>
  );
}

