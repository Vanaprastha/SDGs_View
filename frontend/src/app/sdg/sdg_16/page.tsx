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

export default function SDG16Page() {
  const [insight, setInsight] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  // Overlay lihat desa
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
    fetch("/api/insight?sdg=16")
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
    fetch("/api/sdgs16")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(console.error);
  }, []);

  // ========================
  // SUMMARY (numerik langsung)
  // ========================
  const totals = {
    inisiatif: data.filter((d) =>
      String(d["kegiatan pengaktifan sistem keamanan lingkungan berasal dari inisiatif warga"])
        .toLowerCase()
        .includes("ada")
    ).length,

    regu: data.filter((d) =>
      String(
        d[
        "Pembentukan/pengaturan regu keamanan oleh warga untuk menjaga keamanan lingkungan di desa/kelurahan"
        ]
      )
        .toLowerCase()
        .includes("ada")
    ).length,

    pos: data.filter((d) =>
      String(
        d["Kegiatan Pembangunan/pemeliharaan pos keamanan lingkungan oleh warga"]
      )
        .toLowerCase()
        .includes("ada")
    ).length,

    lembaga: data.reduce(
      (acc, d) => acc + (Number(d["Jumlah jenis lembaga adat"]) || 0),
      0
    ),

    konflik: data.reduce(
      (acc, d) =>
        acc +
        (Number(
          d["Jumlah kejadian perkelahian Kelompok masyarakat dengan aparat keamanan"]
        ) || 0),
      0
    ),
  };

  // ===========================
  // AUTO COLOR LOGIC
  // ===========================
  const getColor = (value: string) => {
    const v = value.toLowerCase();
    if (v.includes("tidak")) return "#ef4444"; // merah
    if (v.includes("ada")) return "#22c55e"; // hijau
    return "#3b82f6"; // biru
  };

  // ===================================
  // DYNAMIC PROGRESS BAR COMPONENT
  // ===================================
  const DynamicProgressBar = ({ keyName, title, index }) => {
    const counts: Record<string, number> = {};

    data.forEach((row) => {
      const val = String(row[keyName] || "").trim();
      counts[val] = (counts[val] || 0) + 1;
    });

    const entries = Object.entries(counts);
    const total = data.length;

    // Untuk overlay list
    const desaList = data.map((d) => `${d.nama_desa} — ${String(d[keyName])} `);

    return (
      <div
        className="glass-2 p-4 rounded-xl shadow border border-white/10 animate-slide-up"
        style={{ animationDelay: `${index * 120} ms` }}
      >
        <div className="flex justify-between mb-2">
          <h4 className="text-md font-semibold text-white">{title}</h4>

          <button
            onClick={() => openOverlay(title, desaList)}
            className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Lihat Desa
          </button>
        </div>

        <div className="w-full h-6 bg-white/20 rounded-full overflow-hidden flex">
          {entries.map(([cat, val], i) => (
            <div
              key={i}
              style={{
                width: `${(val / total) * 100}% `,
                backgroundColor: getColor(cat),
              }}
            ></div>
          ))}
        </div>

        <div className="mt-3 space-y-1">
          {entries.map(([cat, val], i) => (
            <div key={i} className="flex items-center gap-2 text-gray-200 text-sm">
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

  // ==================
  // LOADING SCREEN
  // ==================
  if (isLoading) {
    return (
      <div className="p-6 text-center space-y-4 animate-fade-in">
        <div className="w-16 h-16 bg-blue-500 rounded-full animate-bounce mx-auto"></div>
        <p className="text-white text-lg">Memuat Data SDG 16...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* OVERLAY */}
      {showOverlay && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex justify-center p-6 overflow-y-auto animate-fade-in">
          <div className="glass-4 p-6 rounded-2xl max-w-xl w-full mt-10 border border-white/10 animate-slide-up h-fit">
            <h3 className="text-xl font-bold text-blue-400 mb-4">{overlayTitle}</h3>

            <ul className="text-white space-y-2 max-h-96 overflow-y-auto">
              {overlayList.map((d, i) => (
                <li key={i} className="p-2 bg-white/10 rounded-lg">
                  {d}
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

      {/* HEADER */}
      <div className="glass-4 p-6 rounded-2xl border border-white/10">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-300 hover:text-white mb-4 transition-colors duration-200"
        >
          <ArrowLeft size={20} />
          <span className="text-sm">Kembali ke Dashboard</span>
        </button>
        <h2 className="text-2xl font-bold text-blue-400">
          ⚖️ SDG 16: Perdamaian, Keadilan & Kelembagaan
        </h2>
        <p className="text-gray-300 text-sm">
          Pemantauan keamanan warga, regu keamanan, pos ronda, lembaga adat, dan konflik.
        </p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Inisiatif Keamanan", val: totals.inisiatif, color: "text-green-400" },
          { label: "Regu Keamanan", val: totals.regu, color: "text-green-400" },
          { label: "Pos Keamanan", val: totals.pos, color: "text-green-400" },
          { label: "Jenis Lembaga Adat", val: totals.lembaga, color: "text-purple-400" },
          { label: "Kejadian Konflik", val: totals.konflik, color: "text-red-400" },
        ].map((c, i) => (
          <div key={i} className="glass-2 p-4 rounded-xl text-center border border-white/10 animate-slide-up">
            <h4 className="text-sm text-white">{c.label}</h4>
            <p className={`text - 2xl font - bold ${c.color} `}>{c.val}</p>
          </div>
        ))}
      </div>

      {/* BAR CHART / LEMBAGA ADAT */}
      <div className="glass-4 p-6 rounded-2xl border border-white/10">
        <h3 className="text-lg text-white font-semibold mb-3">📊 Jenis Lembaga Adat per Desa</h3>

        <div className="w-full h-80">
          <ResponsiveContainer>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="nama_desa" stroke="#fff" tick={{ fill: "#fff" }} />
              <YAxis stroke="#fff" tick={{ fill: "#fff" }} />
              <Tooltip />
              <Bar dataKey="Jumlah jenis lembaga adat" fill="#8b5cf6">
                <LabelList dataKey="Jumlah jenis lembaga adat" position="top" fill="#fff" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* PROGRESS BARS */}
      <div className="glass-4 p-6 rounded-2xl border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">
          🛡️ Indikator Keamanan Masyarakat
        </h3>

        <div className="space-y-10">
          {[
            {
              key: "kegiatan pengaktifan sistem keamanan lingkungan berasal dari inisiatif warga",
              title: "Inisiatif Keamanan Warga",
            },
            {
              key: "Pembentukan/pengaturan regu keamanan oleh warga untuk menjaga keamanan lingkungan di desa/kelurahan",
              title: "Regu Keamanan Warga",
            },
            {
              key: "Kegiatan Pembangunan/pemeliharaan pos keamanan lingkungan oleh warga",
              title: "Pos Keamanan Warga",
            },
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

      {/* INSIGHT */}
      <div className="glass-4 p-6 rounded-2xl border border-white/10">
        <h3 className="text-blue-400 font-semibold text-lg mb-3">💡 Insight Otomatis</h3>
        <p className="text-sm text-white whitespace-pre-line">{insight}</p>
      </div>
    </div>
  );
}

