// @ts-nocheck
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Portal from "@/components/Portal";

export default function SDG9Page() {
  const [insight, setInsight] = useState<string>("");
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

  useEffect(() => {
    setIsLoading(true);
    fetch("/api/insight?sdg=9")
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
    fetch("/api/sdgs9")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error(err));
  }, []);

  const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"];

  const summary = {
    jalanAspal: data.filter((d) => d["Jenis Permukaan Jalan Utama"] === "Aspal/beton").length,
    sinyal4G: data.filter((d) =>
      String(
        d["Sinyal internet telepon seluler/handphone di sebagian besar wilayah di desa/kelurahan :"]
      ).includes("5G/4G/LTE")
    ).length,
    internetKantor: data.filter((d) => d["Fasilitas internet di kantor kepala desa/lurah"] === "Berfungsi").length,
    aksesSepanjang: data.filter((d) =>
      String(
        d["Akses jalan darat dari sentra produksi pertanian ke jalan utama dapat dilalui kendaraan roda 4 lebih"]
      ).includes("Sepanjang tahun")
    ).length,
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center space-y-4 animate-fade-in">
        <div className="w-16 h-16 bg-purple-500 rounded-full mx-auto animate-bounce" />
        <p className="text-white text-lg">Memuat Data SDG 9...</p>
      </div>
    );
  }

  // =============================
  // STACKED BAR COMPONENT (FIXED)
  // =============================
  const StackedBar = ({ keyName, title, idx }) => {
    const counts: Record<string, number> = {};

    data.forEach((row) => {
      const val = String(row[keyName]).trim();
      if (val) counts[val] = (counts[val] || 0) + 1;
    });

    const total = data.length;
    const entries = Object.entries(counts);

    return (
      <div
        key={keyName}
        className="glass-2 p-4 rounded-xl border border-white/10 shadow-lg animate-slide-up"
        style={{ animationDelay: `${idx * 100}ms` }}
      >
        <div className="flex justify-between mb-2">
          <h4 className="text-md font-semibold text-white">{title}</h4>
          <button
            className="px-3 py-1 text-xs bg-purple-600 hover:bg-purple-700 rounded-lg text-white"
            onClick={() => {
              const listAll = data.map((d, i) => `${i + 1}. ${d.nama_desa} — ${String(d[keyName])}`);
              openOverlay(title, listAll);
            }}
          >
            Lihat Desa
          </button>
        </div>

        {/* BAR */}
        <div className="w-full h-6 flex overflow-hidden rounded-full bg-white/20">
          {entries.map(([name, value], i) => (
            <div
              key={`bar-${name}-${i}`}
              style={{
                width: `${(value / total) * 100}%`,
                backgroundColor: COLORS[i % COLORS.length],
              }}
              className="h-full"
            />
          ))}
        </div>

        {/* Legend */}
        <div className="mt-3 space-y-1">
          {entries.map(([name, value], i) => (
            <div key={`legend-${name}-${i}`} className="flex items-center gap-2 text-gray-200 text-sm">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              ></span>
              {name} — {value} desa
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">

      {/* OVERLAY LIHAT DESA */}
      {showOverlay && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex justify-center p-6 overflow-y-auto animate-fade-in">
          <div className="glass-4 p-6 rounded-2xl w-full max-w-xl border border-white/10 mt-10 animate-slide-up h-fit">
            <h3 className="text-xl font-bold text-purple-300 mb-4">{overlayTitle}</h3>

            <ul className="text-white space-y-2 max-h-96 overflow-y-auto">
              {overlayList.map((d, i) => (
                <li key={`overlay-${i}-${d}`} className="p-2 bg-white/10 rounded-lg">
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
      <div className="glass-4 p-6 rounded-2xl border border-white/10 hover:scale-[1.01] transition-all shadow-lg">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-300 hover:text-white mb-4 transition-colors duration-200"
        >
          <ArrowLeft size={20} />
          <span className="text-sm">Kembali ke Dashboard</span>
        </button>
        <h2 className="text-2xl font-bold text-purple-400 animate-pulse">
          🏗️ SDG 9: Industri, Inovasi, dan Infrastruktur
        </h2>
        <p className="text-sm text-gray-200 mt-2">
          Monitoring kualitas infrastruktur desa meliputi jalan, sinyal internet, dan akses pertanian.
        </p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Jalan Aspal/Beton", val: summary.jalanAspal, color: "text-green-400" },
          { label: "Sinyal 4G/5G", val: summary.sinyal4G, color: "text-blue-400" },
          { label: "Internet Kantor Desa", val: summary.internetKantor, color: "text-purple-400" },
          { label: "Akses Pertanian Sepanjang Tahun", val: summary.aksesSepanjang, color: "text-yellow-400" },
        ].map((item, i) => (
          <div
            key={`card-${i}`}
            className="glass-2 p-4 rounded-xl text-center border border-white/10 shadow hover:scale-105 transition-all animate-slide-up"
            style={{ animationDelay: `${i * 120}ms` }}
          >
            <h4 className="text-sm text-white">{item.label}</h4>
            <p className={`text-2xl font-bold ${item.color}`}>{item.val}</p>
            <p className="text-xs text-gray-400">Desa</p>
          </div>
        ))}
      </div>

      {/* STACKED BAR SET */}
      <div className="glass-4 p-6 rounded-2xl border border-white/10 shadow-lg animate-fade-in-up">
        <h3 className="text-lg font-semibold mb-4 text-white">📊 Indikator Infrastruktur & Akses Desa</h3>

        <div className="space-y-10">
          {[
            { key: "Jenis Permukaan Jalan Utama", title: "Jenis Permukaan Jalan Utama" },
            { key: "Akses Jalan darat antar desa/kelurahan dapat dilalui kendaraan bermotor roda 4 atau lebih", title: "Akses Jalan Antar Desa" },
            { key: "Sinyal internet telepon seluler/handphone di sebagian besar wilayah di desa/kelurahan :", title: "Sinyal Internet Seluler" },
            { key: "Fasilitas internet di kantor kepala desa/lurah", title: "Fasilitas Internet Kantor Desa" },
            { key: "Akses jalan darat dari sentra produksi pertanian ke jalan utama dapat dilalui kendaraan roda 4 lebih", title: "Akses Jalan Sentra Pertanian" },
          ].map((item, idx) => (
            <StackedBar
              key={`section-${item.key}`}
              keyName={item.key}
              title={item.title}
              idx={idx}
            />
          ))}
        </div>
      </div>

      {/* INSIGHT */}
      <div className="glass-4 p-6 rounded-2xl border border-white/10 shadow-lg animate-fade-in-up">
        <h3 className="text-lg font-semibold text-blue-400 mb-3">💡 Insight Otomatis</h3>
        <p className="text-gray-100 text-sm whitespace-pre-line">{insight}</p>
      </div>
    </div>
  );
}

