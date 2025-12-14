// @ts-nocheck
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Portal from "@/components/Portal";

export default function SDG10Page() {
  const [dataSDG10, setDataSDG10] = useState<any[]>([]);
  const [insight, setInsight] = useState<string>("");

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

  // === Fetch data SDG 10 ===
  useEffect(() => {
    fetch("/api/sdgs10")
      .then(res => res.json())
      .then((d) => {
        if (d.length > 0) {
          d.sort((a, b) => {
            const va = parseFloat(a["jumlah surat keterangan miskin diterbitkan"]) || 0;
            const vb = parseFloat(b["jumlah surat keterangan miskin diterbitkan"]) || 0;
            return va - vb;
          });
        }
        setDataSDG10(d);
      })
      .catch(err => console.error(err));
  }, []);

  // === Fetch Insight ===
  useEffect(() => {
    fetch("/api/insight?sdg=10")
      .then(res => res.json())
      .then((d) => setInsight(d.insight || "sedang memberikan insight berdasarkan data...."))
      .catch(() => setInsight("sedang memberikan insight berdasarkan data...."));
  }, []);

  // === Ambil kunci indikator layanan (otomatis) ===
  const availabilityKeys =
    dataSDG10.length > 0
      ? Object.keys(dataSDG10[0]).filter(
        (k) => k !== "nama_desa" && k !== "jumlah surat keterangan miskin diterbitkan"
      )
      : [];

  // === Hitung total SKTM ===
  const totalSKTM = dataSDG10.reduce(
    (sum, row) => sum + (parseFloat(row["jumlah surat keterangan miskin diterbitkan"]) || 0),
    0
  );

  return (
    <div className="space-y-6 p-6 animate-fade-in">

      {/* Overlay */}
      {showOverlay && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex justify-center p-6 overflow-y-auto animate-fade-in">
          <div className="glass-4 p-6 rounded-2xl max-w-xl w-full border border-white/10 mt-10 animate-slide-up h-fit">
            <h3 className="text-xl font-bold text-purple-300 mb-4">{overlayTitle}</h3>

            <ul className="text-white space-y-2 max-h-96 overflow-y-auto">
              {overlayList.map((d, i) => (
                <li key={i} className="p-2 bg-white/10 rounded-lg">
                  {d}
                </li>
              ))}
            </ul>

            <button
              onClick={closeOverlay}
              className="mt-6 w-full py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="glass-4 p-6 rounded-2xl shadow-lg">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-300 hover:text-white mb-4 transition-colors duration-200"
        >
          <ArrowLeft size={20} />
          <span className="text-sm">Kembali ke Dashboard</span>
        </button>
        <h2 className="text-xl font-bold text-purple-400">SDG 10: Mengurangi Ketimpangan</h2>
        <p className="text-sm text-gray-200">
          Monitoring: SKTM, akses air minum, jamban sehat, layanan ibu hamil, dan layanan dasar lainnya.
        </p>
      </div>

      {/* Total SKTM */}
      <div className="glass-2 p-6 rounded-xl text-center shadow">
        <h4 className="font-semibold text-lg mb-2">Total SKTM</h4>
        <p className="text-3xl font-extrabold text-purple-400">{totalSKTM}</p>
      </div>

      {/* Progress Bar Dinamis untuk semua indikator */}
      <div className="glass-4 p-6 rounded-2xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Indikator Keberadaan Layanan</h3>

        <div className="space-y-8">
          {availabilityKeys.map((key, idx) => {
            let ada = 0;
            let tidak = 0;

            dataSDG10.forEach((row) => {
              if (row[key] === "ada") ada++;
              if (row[key] === "tidak ada") tidak++;
            });

            const percent = Math.round((ada / dataSDG10.length) * 100);

            const adaList = dataSDG10
              .filter((d) => d[key] === "ada")
              .map((d) => d.nama_desa);

            const tidakList = dataSDG10
              .filter((d) => d[key] === "tidak ada")
              .map((d) => d.nama_desa);

            return (
              <div
                key={idx}
                className="glass-2 p-4 rounded-xl border border-white/10 shadow-md animate-slide-up"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex justify-between mb-2">
                  <h4 className="text-white font-semibold">{key}</h4>

                  <button
                    onClick={() =>
                      openOverlay(key, [
                        `Desa Ada (${ada}):`,
                        ...adaList,
                        "",
                        `Desa Tidak Ada (${tidak}):`,
                        ...tidakList,
                      ])
                    }
                    className="px-3 py-1 text-xs bg-purple-600 hover:bg-purple-700 rounded-lg text-white"
                  >
                    Lihat Desa
                  </button>
                </div>

                <p className="text-gray-300 text-sm mb-1">
                  {percent}% ({ada}/{dataSDG10.length} desa ada)
                </p>

                {/* Progress Bar */}
                <div className="w-full h-4 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${percent === 0
                      ? "bg-red-500"
                      : percent < 50
                        ? "bg-yellow-500"
                        : "bg-green-500"
                      }`}
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>

                {/* Legend */}
                <div className="flex justify-between text-xs text-gray-300 mt-2">
                  <span className="text-green-400">Ada: {ada}</span>
                  <span className="text-red-400">Tidak Ada: {tidak}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insight */}
      <div className="glass-4 p-6 rounded-2xl shadow-lg">
        <h3 className="text-lg font-semibold mb-2 text-blue-400">💡 Insight Otomatis</h3>
        <p className="text-sm text-gray-200 whitespace-pre-line">
          {insight}
        </p>
      </div>
    </div>
  );
}

