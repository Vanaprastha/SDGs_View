// @ts-nocheck
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Portal from "@/components/Portal";

export default function SDG13Page() {
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
    fetch("/api/insight?sdg=13")
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

  // Fetch Data SDGs13
  useEffect(() => {
    fetch("/api/sdgs13")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error(err));
  }, []);

  // ===== SUMMARY CARDS DINAMIS =====
  const summary = {
    proklim: data.filter(
      (d) =>
        String(d["Status desa termasuk Program Kampung Iklim (Proklim)"]).toLowerCase() !==
        "tidak termasuk"
    ).length,
    banjir: data.filter(
      (d) =>
        String(d["status Kejadian bencana alam banjir"]).toLowerCase() !== "tidak ada kejadian"
    ).length,
    kekeringan: data.filter(
      (d) =>
        String(d["status Kejadian bencana alam kekeringan"]).toLowerCase() !==
        "tidak ada kejadian"
    ).length,
    peringatan: data.filter(
      (d) => String(d["Fasilitas sistem peringatan dini bencana alam"]).toLowerCase() === "ada"
    ).length,
    simulasi: data.filter(
      (d) => String(d["Partisipasi_Simulasi_Bencana"]).toLowerCase() !== "tidak ada warga"
    ).length,
  };

  // ================================
  // DYNAMIC PROGRESS BAR COMPONENT
  // ================================
  const DynamicProgressBar = ({ keyName, title, index }) => {
    const counts: Record<string, number> = {};

    data.forEach((row) => {
      const val = String(row[keyName] || "").trim();
      counts[val] = (counts[val] || 0) + 1;
    });

    const entries = Object.entries(counts);
    const total = data.length;

    // Warna kategori otomatis
    const getColor = (category: string) => {
      const lower = category.toLowerCase();
      if (lower.includes("tidak ada") || lower.includes("tidak termasuk")) return "#ef4444";
      if (lower.includes("ada") || lower.includes("termasuk")) return "#22c55e";
      if (lower.includes("warga")) return "#f59e0b";
      return "#3b82f6";
    };

    // List desa untuk overlay
    const listAll = data.map((d) => `${d.nama_desa} — ${String(d[keyName])}`);

    return (
      <div
        className="glass-2 p-4 rounded-xl shadow border border-white/10 animate-slide-up"
        style={{ animationDelay: `${index * 120}ms` }}
      >
        <div className="flex justify-between mb-2">
          <h4 className="text-md font-semibold text-white whitespace-normal break-words max-w-[75%]">
            {title}
          </h4>

          <button
            className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 rounded-lg text-white"
            onClick={() => openOverlay(title, listAll)}
          >
            Lihat Desa
          </button>
        </div>

        {/* PROGRESS BAR */}
        <div className="w-full h-6 rounded-full bg-white/20 flex overflow-hidden">
          {entries.map(([cat, val], i) => (
            <div
              key={`p-${index}-${i}`}
              style={{
                width: `${(val / total) * 100}%`,
                backgroundColor: getColor(cat),
              }}
            />
          ))}
        </div>

        {/* LEGEND */}
        <div className="mt-3 space-y-1">
          {entries.map(([cat, val], i) => (
            <div
              key={`l-${index}-${i}`}
              className="flex items-center gap-2 text-gray-200 text-sm"
            >
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
      <div className="p-6 text-center space-y-4">
        <div className="w-16 h-16 bg-green-500 rounded-full animate-bounce mx-auto"></div>
        <p className="text-white text-lg">Memuat Data SDG 13...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* ================================= */}
      {/* OVERLAY LIHAT DESA */}
      {/* ================================= */}
      {showOverlay && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex justify-center p-6 overflow-y-auto animate-fade-in">
          <div className="glass-4 p-6 rounded-2xl max-w-xl w-full mt-10 border border-white/10 animate-slide-up h-fit">
            <h3 className="text-xl font-bold text-green-400 mb-4">{overlayTitle}</h3>

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
        <h2 className="text-2xl font-bold text-green-400">🌍 SDG 13: Penanganan Perubahan Iklim</h2>
        <p className="text-sm text-gray-300">
          Monitoring Proklim, bencana, fasilitas peringatan dini, dan simulasi.
        </p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Desa Proklim", val: summary.proklim, color: "text-green-400" },
          { label: "Banjir", val: summary.banjir, color: "text-red-400" },
          { label: "Kekeringan", val: summary.kekeringan, color: "text-red-400" },
          { label: "Peringatan Dini", val: summary.peringatan, color: "text-green-400" },
          { label: "Simulasi", val: summary.simulasi, color: "text-green-400" },
        ].map((card, i) => (
          <div
            key={i}
            className="glass-2 p-4 rounded-xl text-center border border-white/10 shadow animate-slide-up"
          >
            <h4 className="text-white text-sm">{card.label}</h4>
            <p className={`text-2xl font-bold ${card.color}`}>{card.val}</p>
            <p className="text-xs text-gray-400">Desa</p>
          </div>
        ))}
      </div>

      {/* PROGRESS BARS (DINAMIS) */}
      <div className="glass-4 p-6 rounded-2xl border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">📊 Indikator Perubahan Iklim</h3>

        <div className="space-y-10">
          {[
            "Status desa termasuk Program Kampung Iklim (Proklim)",
            "status Kejadian bencana alam banjir",
            "status Kejadian bencana alam kekeringan",
            "Fasilitas sistem peringatan dini bencana alam",
            "Partisipasi_Simulasi_Bencana",
          ].map((keyName, idx) => (
            <DynamicProgressBar
              key={keyName}
              keyName={keyName}
              title={keyName} // selalu sama dengan dataset
              index={idx}
            />
          ))}
        </div>
      </div>

      {/* INSIGHT */}
      <div className="glass-4 p-6 rounded-2xl border border-white/10">
        <h3 className="text-lg font-semibold text-blue-400 mb-3">💡 Insight Otomatis</h3>
        <p className="text-white text-sm whitespace-pre-line">{insight}</p>
      </div>
    </div>
  );
}

