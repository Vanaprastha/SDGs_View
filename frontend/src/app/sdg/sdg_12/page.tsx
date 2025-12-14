// @ts-nocheck
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Portal from "@/components/Portal";

export default function SDG12Page() {
  const [insight, setInsight] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  // Overlay "Lihat Desa"
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayTitle, setOverlayTitle] = useState("");
  const [overlayList, setOverlayList] = useState<string[]>([]);

  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);

  const openOverlay = (title, list) => {
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

  // ===== Fetch Insight =====
  useEffect(() => {
    setIsLoading(true);
    fetch("/api/insight?sdg=12")
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

  // ===== Fetch Data =====
  useEffect(() => {
    fetch("/api/sdgs12")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error(err));
  }, []);

  // ===== Summary Cards =====
  const summary = {
    daurUlang: data.filter((d) =>
      String(d["Kegiatan Pengolahan/daur ulang sampah/limbah (reuse, recycle) oleh masyarakat desa/kelurahan"])
        .toLowerCase()
        .includes("ada")
    ).length,
    bankSampah: data.filter((d) =>
      String(d["status keberadaan bank sampah di desa/kelurahan:"]).toLowerCase().includes("ada")
    ).length,
    pemilahan: data.filter((d) =>
      String(d["Partisipasi Pemilahan sampah membusuk dan sampah kering:"]).toLowerCase() !== "tidak ada"
    ).length,
    pengangkutan: data.filter((d) =>
      String(d["Frekuensi pengangkutan sampah dalam 1 minggu"]).toLowerCase() !== "tidak ada pengangkutan sampah"
    ).length,
  };

  // ===== Dynamic Progress Bar Component =====
  const DynamicProgressBar = ({ keyName, title, index }) => {
    const counts: Record<string, number> = {};

    data.forEach((row) => {
      const val = String(row[keyName] || "").trim();
      if (val) counts[val] = (counts[val] || 0) + 1;
    });

    const total = data.length;
    const entries = Object.entries(counts); // contoh: [["Sebagian kecil keluarga", 7], ["Tidak ada", 1]]

    // Warna otomatis
    const getColor = (category: string) => {
      const lower = category.toLowerCase();

      if (lower.includes("tidak")) return "#ef4444"; // merah
      if (lower.includes("ada")) return "#22c55e"; // hijau
      if (lower.includes("lubang") || lower.includes("dibakar")) return "#f59e0b"; // oranye
      if (lower.includes("sebagian")) return "#3b82f6"; // biru

      return "#8b5cf6"; // default ungu
    };

    // Overlay list
    const listAll = data.map(
      (d) => `${d.nama_desa} — ${String(d[keyName])}`
    );

    return (
      <div
        className="glass-2 p-4 rounded-xl shadow border border-white/10 animate-slide-up"
        style={{ animationDelay: `${index * 120}ms` }}
      >
        <div className="flex justify-between mb-3">
          <h4 className="text-white font-semibold">{title}</h4>
          <button
            onClick={() => openOverlay(title, listAll)}
            className="px-3 py-1 text-xs bg-yellow-500 hover:bg-yellow-600 rounded-lg text-white"
          >
            Lihat Desa
          </button>
        </div>

        {/* PROGRESS BAR */}
        <div className="w-full h-5 rounded-full overflow-hidden bg-white/20 flex">
          {entries.map(([cat, val], i) => (
            <div
              key={`${cat}-${i}`}
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
              key={`legend-${cat}-${i}`}
              className="flex items-center gap-2 text-gray-200 text-sm"
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getColor(cat) }}
              />
              {cat} — {val} desa
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Loading Screen
  if (isLoading) {
    return (
      <div className="p-6 text-center space-y-4">
        <div className="w-16 h-16 bg-yellow-500 rounded-full animate-bounce mx-auto"></div>
        <p className="text-white text-lg">Memuat Data SDG 12...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">

      {/* OVERLAY */}
      {showOverlay && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex justify-center p-6 overflow-y-auto animate-fade-in">
          <div className="glass-4 p-6 rounded-2xl w-full max-w-xl mt-10 border border-white/10 animate-slide-up h-fit">
            <h3 className="text-xl font-bold text-yellow-400 mb-4">{overlayTitle}</h3>

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

      {/* HEADER */}
      <div className="glass-4 p-6 rounded-2xl border border-white/10">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-300 hover:text-white mb-4 transition-colors duration-200"
        >
          <ArrowLeft size={20} />
          <span className="text-sm">Kembali ke Dashboard</span>
        </button>
        <h2 className="text-2xl font-bold text-yellow-400">♻️ SDG 12: Konsumsi & Produksi Bertanggung Jawab</h2>
        <p className="text-gray-200 text-sm">
          Monitoring daur ulang, bank sampah, pemilahan, tempat buang sampah, dan pengangkutan sampah.
        </p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Daur Ulang", val: summary.daurUlang },
          { label: "Bank Sampah", val: summary.bankSampah },
          { label: "Pemilahan", val: summary.pemilahan },
          { label: "Pengangkutan", val: summary.pengangkutan },
        ].map((card, i) => (
          <div
            key={i}
            className="glass-2 p-4 rounded-xl text-center border border-white/10 shadow animate-slide-up"
          >
            <h4 className="text-white text-sm">{card.label}</h4>
            <p className="text-2xl font-bold text-yellow-300">{card.val}</p>
            <p className="text-xs text-gray-400">Desa</p>
          </div>
        ))}
      </div>

      {/* PROGRESS BARS */}
      <div className="glass-4 p-6 rounded-2xl border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">📊 Indikator Pengelolaan Sampah</h3>

        <div className="space-y-8">
          {[
            "Kegiatan Pengolahan/daur ulang sampah/limbah (reuse, recycle) oleh masyarakat desa/kelurahan",
            "status keberadaan bank sampah di desa/kelurahan:",
            "Partisipasi Pemilahan sampah membusuk dan sampah kering:",
            "Tempat buang sampah sebagian besar keluarga",
            "Frekuensi pengangkutan sampah dalam 1 minggu",
          ].map((key, idx) => {
            const shortTitles = {
              "Kegiatan Pengolahan/daur ulang sampah/limbah (reuse, recycle) oleh masyarakat desa/kelurahan":
                "Daur Ulang Sampah",
              "status keberadaan bank sampah di desa/kelurahan:": "Bank Sampah",
              "Partisipasi Pemilahan sampah membusuk dan sampah kering:": "Pemilahan Sampah",
              "Tempat buang sampah sebagian besar keluarga": "Tempat Buang Sampah",
              "Frekuensi pengangkutan sampah dalam 1 minggu": "Frekuensi Pengangkutan",
            };
            return (
              <DynamicProgressBar
                key={key}
                keyName={key}
                title={shortTitles[key] || key}
                index={idx}
              />
            );
          })}
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

