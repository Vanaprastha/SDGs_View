// @ts-nocheck
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Portal from "@/components/Portal";

export default function SDG14Page() {
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

  // INSIGHT
  useEffect(() => {
    setIsLoading(true);
    fetch("/api/insight?sdg=14")
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

  // DATA
  useEffect(() => {
    fetch("/api/sdgs14")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(console.error);
  }, []);

  // =========================
  //   SUMMARY CARDS DINAMIS
  // =========================
  const summary = {
    pesisir: data.filter((d) =>
      String(d["Ada wilayah desa/kelurahan yang berbatasan langsung dengan laut"])
        .toLowerCase()
        .includes("ada")
    ).length,

    perikanan: data.filter((d) =>
      String(d["Pemanfaatan laut untuk Perikanan tangkap (mencakup seluruh biota laut) "])
        .toLowerCase()
        .includes("ada")
    ).length,

    wisata: data.filter((d) =>
      String(d["Pemanfaatan laut untuk wisata bahari "]).toLowerCase().includes("ada")
    ).length,

    tangguh: data.filter((d) =>
      String(d["Status desa termasuk Kampung Pesisir Tangguh "])
        .toLowerCase()
        .includes("termasuk")
    ).length,
  };

  // ==================================================
  //   COMPONENT — DYNAMIC PROGRESS BAR (AUTO TITLE)
  // ==================================================
  const DynamicProgressBar = ({ keyName, index }) => {
    const counts: Record<string, number> = {};

    data.forEach((row) => {
      const val = String(row[keyName] || "").trim();
      counts[val] = (counts[val] || 0) + 1;
    });

    const total = data.length;
    const entries = Object.entries(counts);

    // AUTO COLOR
    const getColor = (cat: string) => {
      const v = cat.toLowerCase();
      if (v.includes("tidak ada") || v.includes("tidak") || v.includes("tidak termasuk"))
        return "#ef4444";
      if (v.includes("ada") || v.includes("termasuk")) return "#22c55e";
      return "#3b82f6";
    };

    // List desa untuk overlay
    const desaList = data.map((d) => `${d.nama_desa} — ${String(d[keyName])}`);

    return (
      <div
        className="glass-2 p-4 rounded-xl border border-white/10 animate-slide-up"
        style={{ animationDelay: `${index * 120}ms` }}
      >
        <div className="flex justify-between mb-2">
          <h4 className="text-white text-md font-semibold whitespace-normal break-words max-w-[75%]">
            {keyName}
          </h4>

          <button
            onClick={() => openOverlay(keyName, desaList)}
            className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Lihat Desa
          </button>
        </div>

        {/* PROGRESS BAR */}
        <div className="w-full h-6 bg-white/20 rounded-full overflow-hidden flex">
          {entries.map(([cat, val], i) => (
            <div
              key={`bar-${i}`}
              style={{
                width: `${(val / total) * 100}%`,
                backgroundColor: getColor(cat),
              }}
            ></div>
          ))}
        </div>

        {/* LEGEND */}
        <div className="mt-3 space-y-1">
          {entries.map(([cat, val], i) => (
            <div key={`legend-${i}`} className="flex items-center gap-2 text-gray-200 text-sm">
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

  // LOADING
  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="w-16 h-16 bg-blue-500 rounded-full animate-bounce mx-auto"></div>
        <p className="text-white mt-4">Memuat Data SDG 14...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* OVERLAY */}
      {showOverlay && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex justify-center p-6 overflow-y-auto animate-fade-in">
          <div className="max-w-xl w-full mt-10 glass-4 p-6 rounded-2xl border border-white/10 animate-slide-up h-fit">
            <h3 className="text-xl font-bold text-blue-400 mb-4">{overlayTitle}</h3>

            <ul className="text-white space-y-2 max-h-96 overflow-y-auto">
              {overlayList.map((item, i) => (
                <li key={i} className="bg-white/10 p-2 rounded-lg">
                  {item}
                </li>
              ))}
            </ul>

            <button
              onClick={closeOverlay}
              className="w-full py-2 bg-red-500 hover:bg-red-600 text-white mt-6 rounded-lg"
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
        <h2 className="text-2xl font-bold text-blue-400">🌊 SDG 14: Ekosistem Lautan</h2>
        <p className="text-gray-300 text-sm">
          Monitoring desa pesisir, pemanfaatan laut, wisata bahari, dan ketangguhan pesisir.
        </p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Desa Pesisir", val: summary.pesisir, color: "text-blue-400" },
          { label: "Perikanan Tangkap", val: summary.perikanan, color: "text-green-400" },
          { label: "Wisata Bahari", val: summary.wisata, color: "text-purple-400" },
          { label: "Pesisir Tangguh", val: summary.tangguh, color: "text-green-400" },
        ].map((c, i) => (
          <div
            key={i}
            className="glass-2 p-4 rounded-xl text-center border border-white/10 animate-slide-up"
          >
            <h4 className="text-sm text-white">{c.label}</h4>
            <p className={`text-2xl font-bold ${c.color}`}>{c.val}</p>
            <p className="text-xs text-gray-300">Desa</p>
          </div>
        ))}
      </div>

      {/* PROGRESS BARS (DINAMIS) */}
      <div className="glass-4 p-6 rounded-2xl border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">📊 Indikator Laut & Pesisir</h3>

        <div className="space-y-10">
          {[
            "Ada wilayah desa/kelurahan yang berbatasan langsung dengan laut",
            "Tempat buang sampah keluarga melalui Sungai/saluran irigasi/danau/laut ",
            "Pemanfaatan laut untuk Perikanan tangkap (mencakup seluruh biota laut) ",
            "Pemanfaatan laut untuk wisata bahari ",
            "Status desa termasuk Kampung Pesisir Tangguh ",
          ].map((keyName, idx) => (
            <DynamicProgressBar key={keyName} keyName={keyName} index={idx} />
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

