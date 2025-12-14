// @ts-nocheck
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Portal from "@/components/Portal";

export default function SDG17Page() {
  const [insight, setInsight] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    fetch("/api/insight?sdg=17")
      .then((res) => res.json())
      .then((d) => {
        setInsight(d.insight || "Sedang memberikan insight berdasarkan data…");
        setIsLoading(false);
      })
      .catch(() => {
        setInsight("Sedang memberikan insight berdasarkan data…");
        setIsLoading(false);
      });
  }, []);

  // Fetch Data
  useEffect(() => {
    fetch("/api/sdgs17")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(console.error);
  }, []);

  // ===========================
  // SUMMARY CARD FIXED (EXACT MATCH)
  // ===========================
  const summary = {
    kerjasamaAntar: data.filter(
      (d) =>
        String(d["Keberadaan kerjasama antar desa"]).trim().toLowerCase() ===
        "ada"
    ).length,

    kerjasamaPihak: data.filter(
      (d) =>
        String(
          d["Keberadaan kerjasama desa dengan pihak ketiga"]
        ).trim().toLowerCase() === "ada"
    ).length,

    proklim: data.filter(
      (d) =>
        String(
          d["Status desa termasuk Program Kampung Iklim (Proklim)"]
        ).trim().toLowerCase() === "termasuk"
    ).length,

    perhutanan: data.filter(
      (d) =>
        String(
          d["Keberadaan Program perhutanan sosial"]
        ).trim().toLowerCase() === "ada"
    ).length,

    siaran: data.filter(
      (d) =>
        String(
          d["status penerimaan program siaran televisi/radio swasta"]
        )
          .trim()
          .toLowerCase() === "bisa diterima"
    ).length,
  };

  // ===========================
  // WARNA OTOMATIS
  // ===========================
  const getColor = (v: string) => {
    const x = v.toLowerCase();
    if (x.includes("tidak")) return "#ef4444"; // merah
    if (x.includes("ada") || x.includes("termasuk") || x.includes("bisa"))
      return "#22c55e"; // hijau
    return "#3b82f6"; // biru default
  };

  // ===========================
  // PROGRESS BAR DINAMIS
  // ===========================
  const DynamicProgressBar = ({ keyName, title, index }) => {
    const counts: Record<string, number> = {};

    data.forEach((row) => {
      const val = String(row[keyName] || "").trim();
      counts[val] = (counts[val] || 0) + 1;
    });

    const total = data.length;
    const entries = Object.entries(counts);

    const desaList = data.map((d) => `${d.nama_desa} — ${String(d[keyName])}`);

    return (
      <div
        className="glass-2 p-4 rounded-xl border border-white/10 shadow animate-slide-up"
        style={{ animationDelay: `${index * 120}ms` }}
      >
        <div className="flex justify-between mb-2">
          <h4 className="text-md font-semibold text-white">{title}</h4>

          <button
            onClick={() => openOverlay(title, desaList)}
            className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
          >
            Lihat Desa
          </button>
        </div>

        {/* PROGRESS BAR */}
        <div className="w-full h-6 bg-white/20 rounded-full flex overflow-hidden">
          {entries.map(([cat, val], i) => (
            <div
              key={i}
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

  // ===========================
  // LOADING SCREEN
  // ===========================
  if (isLoading) {
    return (
      <div className="p-6 text-center space-y-4 animate-fade-in">
        <div className="w-16 h-16 bg-blue-500 rounded-full animate-bounce mx-auto"></div>
        <p className="text-white text-lg">Memuat Data SDG 17...</p>
      </div>
    );
  }

  // ===========================
  // RENDER PAGE
  // ===========================
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Overlay */}
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

      {/* Header */}
      <div className="glass-4 p-6 rounded-2xl border border-white/10">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-300 hover:text-white mb-4 transition-colors duration-200"
        >
          <ArrowLeft size={20} />
          <span className="text-sm">Kembali ke Dashboard</span>
        </button>
        <h2 className="text-2xl font-bold text-blue-400">🌍 SDG 17: Kemitraan untuk Tujuan</h2>
        <p className="text-gray-300 text-sm">
          Visualisasi kemitraan desa, pihak ketiga, program lingkungan, perhutanan, dan akses siaran.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { title: "Kerjasama Antar Desa", val: summary.kerjasamaAntar },
          { title: "Kerjasama Pihak Ketiga", val: summary.kerjasamaPihak },
          { title: "Program Proklim", val: summary.proklim },
          { title: "Perhutanan Sosial", val: summary.perhutanan },
          { title: "Siaran Swasta", val: summary.siaran },
        ].map((c, i) => (
          <div
            key={i}
            className="glass-2 p-4 rounded-xl text-center border border-white/10 animate-slide-up"
          >
            <h4 className="text-sm text-white">{c.title}</h4>
            <p className="text-2xl font-bold text-green-400">{c.val}</p>
            <p className="text-xs text-gray-300">Desa</p>
          </div>
        ))}
      </div>

      {/* DYNAMIC PROGRESS CHARTS */}
      <div className="glass-4 p-6 rounded-2xl border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">📊 Indikator SDG 17</h3>

        <div className="space-y-10">
          {[
            {
              key: "Keberadaan kerjasama antar desa",
              title: "Kerjasama Antar Desa",
            },
            {
              key: "Keberadaan kerjasama desa dengan pihak ketiga",
              title: "Kerjasama dengan Pihak Ketiga",
            },
            {
              key: "Status desa termasuk Program Kampung Iklim (Proklim)",
              title: "Program Kampung Iklim",
            },
            {
              key: "Keberadaan Program perhutanan sosial",
              title: "Perhutanan Sosial",
            },
            {
              key: "status penerimaan program siaran televisi/radio swasta",
              title: "Akses Siaran Swasta",
            },
          ].map((item, index) => (
            <DynamicProgressBar
              key={item.key}
              keyName={item.key}
              title={item.title}
              index={index}
            />
          ))}
        </div>
      </div>

      {/* Insight */}
      <div className="glass-4 p-6 rounded-2xl border border-white/10">
        <h3 className="text-blue-400 font-semibold text-lg mb-3">💡 Insight Otomatis</h3>
        <p className="text-sm text-white whitespace-pre-line">{insight}</p>
      </div>
    </div>
  );
}

