// @ts-nocheck
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Portal from "@/components/Portal";

export default function SDG11Page() {
  const [insight, setInsight] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  // Overlay untuk lihat desa
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

  useEffect(() => {
    setIsLoading(true);
    fetch("/api/insight?sdg=11")
      .then((res) => res.json())
      .then((d) => {
        setInsight(d.insight || "sedang memberikan insight berdasarkan data....");
        setIsLoading(false);
      })
      .catch(() => {
        setInsight("sedang memberikan insight berdasarkan data....");
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    fetch("/api/sdgs11")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error(err));
  }, []);

  // ===== SUMMARY =====
  const summary = {
    permukimanKumuh: data.filter(
      (d) =>
        d[
        "Keberadaan permukiman kumuh (sanitasi lingkungan buruk, bangunan padat dan sebagian besar tidak layak huni)"
        ] === "ada"
    ).length,
    sistemPeringatan: data.filter((d) => d["Fasilitas sistem peringatan dini bencana alam"] === "ada").length,
    rambuEvakuasi: data.filter((d) => d["Fasilitas Rambu–rambu dan jalur evakuasi bencana"] === "ada").length,
    desaTangguh: data.filter((d) => d["Status Desa Tangguh Bencana"] === "termasuk").length,
    programLingkungan: data.filter(
      (d) => d["Keberadaan program pengelolaan lingkungan perumahan desa/kelurahan"] === "ada"
    ).length,
  };

  // ===== Progress Bar Component Dinamis =====
  const DynamicProgressBar = ({ title, keyName, index }) => {
    const counts: Record<string, number> = {};

    data.forEach((row) => {
      const val = String(row[keyName]).trim().toLowerCase();
      if (val) counts[val] = (counts[val] || 0) + 1;
    });

    const entries = Object.entries(counts); // [["ada", 6], ["tidak ada", 3]]

    const total = data.length;

    // warna otomatis sesuai kategori
    const getColor = (label: string) => {
      const lower = label.toLowerCase();
      if (lower.includes("tidak ada") || lower.includes("tidak termasuk")) return "#ef4444"; // merah
      if (lower.includes("ada") || lower.includes("termasuk")) return "#22c55e"; // hijau
      return "#3b82f6"; // default biru
    };

    // daftar desa untuk overlay
    const listAll = data.map((d) => `${d.nama_desa} — ${String(d[keyName])}`);

    return (
      <div
        className="glass-2 p-4 rounded-xl shadow border border-white/10 animate-slide-up"
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-white font-semibold">{title}</h4>
          <button
            className="px-3 py-1 text-xs bg-amber-500 hover:bg-amber-600 text-white rounded-lg"
            onClick={() => openOverlay(title, listAll)}
          >
            Lihat Desa
          </button>
        </div>

        {/* PROGRESS BAR */}
        <div className="w-full h-5 rounded-full bg-white/20 overflow-hidden flex">
          {entries.map(([label, value], i) => (
            <div
              key={`${label}-${i}`}
              className="h-full"
              style={{
                width: `${(value / total) * 100}%`,
                backgroundColor: getColor(label),
              }}
            ></div>
          ))}
        </div>

        {/* LEGEND */}
        <div className="mt-3 space-y-1">
          {entries.map(([label, value], i) => (
            <div key={`${label}-legend-${i}`} className="flex items-center gap-2 text-gray-200 text-sm">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: getColor(label) }} />
              {label} — {value} desa
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center space-y-4">
        <div className="w-16 h-16 bg-amber-500 rounded-full animate-bounce mx-auto"></div>
        <p className="text-white text-lg">Memuat Data SDG 11...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* OVERLAY */}
      {showOverlay && (
        <div className="absolute inset-0 bg-black/80 z-50 backdrop-blur-md flex justify-center p-6 overflow-y-auto animate-fade-in">
          <div className="glass-4 p-6 rounded-2xl w-full max-w-xl border border-white/10 mt-10 animate-slide-up h-fit">
            <h3 className="text-xl font-bold text-amber-400 mb-4">{overlayTitle}</h3>

            <ul className="text-white space-y-2 max-h-96 overflow-y-auto">
              {overlayList.map((d, i) => (
                <li key={i} className="p-2 bg-white/10 rounded-lg">
                  {d}
                </li>
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

      {/* HEADER */}
      <div className="glass-4 p-6 rounded-2xl shadow-lg">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-300 hover:text-white mb-4 transition-colors duration-200"
        >
          <ArrowLeft size={20} />
          <span className="text-sm">Kembali ke Dashboard</span>
        </button>
        <h2 className="text-2xl font-bold text-amber-400">🏙️ SDG 11: Kota & Permukiman Berkelanjutan</h2>
        <p className="text-sm text-gray-200 mt-2">
          Monitoring permukiman kumuh, fasilitas bencana, desa tangguh, dan program lingkungan.
        </p>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-2 p-4 rounded-xl text-center">
          <h4 className="text-sm text-white">Permukiman Kumuh</h4>
          <p className="text-xl font-bold text-red-400">{summary.permukimanKumuh}</p>
        </div>

        <div className="glass-2 p-4 rounded-xl text-center">
          <h4 className="text-sm text-white">Sistem Peringatan</h4>
          <p className="text-xl font-bold text-green-400">{summary.sistemPeringatan}</p>
        </div>

        <div className="glass-2 p-4 rounded-xl text-center">
          <h4 className="text-sm text-white">Rambu Evakuasi</h4>
          <p className="text-xl font-bold text-green-400">{summary.rambuEvakuasi}</p>
        </div>

        <div className="glass-2 p-4 rounded-xl text-center">
          <h4 className="text-sm text-white">Desa Tangguh</h4>
          <p className="text-xl font-bold text-green-400">{summary.desaTangguh}</p>
        </div>

        <div className="glass-2 p-4 rounded-xl text-center">
          <h4 className="text-sm text-white">Program Lingkungan</h4>
          <p className="text-xl font-bold text-green-400">{summary.programLingkungan}</p>
        </div>
      </div>

      {/* PROGRESS BAR CHART SET */}
      <div className="glass-4 p-6 rounded-2xl shadow-lg border border-white/10">
        <h3 className="text-lg font-semibold mb-4 text-white">📊 Indikator Kota & Permukiman</h3>

        <div className="space-y-8">
          {[
            "Keberadaan permukiman kumuh (sanitasi lingkungan buruk, bangunan padat dan sebagian besar tidak layak huni)",
            "Fasilitas sistem peringatan dini bencana alam",
            "Fasilitas Rambu–rambu dan jalur evakuasi bencana",
            "Status Desa Tangguh Bencana",
            "Keberadaan program pengelolaan lingkungan perumahan desa/kelurahan",
          ].map((key, idx) => (
            <DynamicProgressBar key={key} title={key} keyName={key} index={idx} />
          ))}
        </div>
      </div>

      {/* INSIGHT */}
      <div className="glass-4 p-6 rounded-2xl shadow-lg">
        <h3 className="text-lg font-semibold text-blue-400 mb-3">💡 Insight Otomatis</h3>
        <p className="text-gray-100 whitespace-pre-line">{insight}</p>
      </div>
    </div>
  );
}

