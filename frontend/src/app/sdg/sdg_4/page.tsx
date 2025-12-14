// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function SDG4Page() {
  const [insight, setInsight] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [selectedIndicator, setSelectedIndicator] = useState<any>(null);

  const router = useRouter();

  // Lock scroll saat modal terbuka
  useEffect(() => {
    if (selectedIndicator) {
      const mainContainer = document.querySelector('main');
      if (mainContainer) {
        mainContainer.scrollTo({ top: 0, behavior: "smooth" });
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [selectedIndicator]);

  // Fetch Insight SDG 4
  useEffect(() => {
    setIsLoading(true);
    fetch("/api/insight?sdg=4")
      .then((res) => res.json())
      .then((d) => {
        setInsight(d.insight || "Sedang memberikan insight berdasarkan data....");
        setIsLoading(false);
      })
      .catch(() => {
        setInsight("Sedang memberikan insight berdasarkan data...");
        setIsLoading(false);
      });
  }, []);

  // Fetch Data SDG 4
  useEffect(() => {
    fetch("/api/sdgs4")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error(err));
  }, []);

  // Fungsi pendeteksi positif/negatif
  const isPositive = (value: string) => {
    if (!value) return false;
    const v = value.toLowerCase();

    // cek negatif dulu
    const negatif = [
      "tidak ada",
      "tidak tersedia",
      "tidak dapat",
      "tidak",
      "sulit",
      "sangat sulit",
    ];

    if (negatif.some((n) => v.includes(n))) return false;

    // baru cek positif
    const positif = ["ada", "tersedia", "mudah", "dekat"];
    return positif.some((p) => v.includes(p));
  };

  // List indikator pendidikan
  const indikatorPendidikan = [
    "Akses ke SD Terdekat",
    "Jarak ke PAUD Terdekat",
    "Ketersediaan Program Keaksaraan",
    "Ketersediaan Program Paket A/B/C",
  ];

  // Hitung total lembaga komputer
  const totalLembagaKomputer = data.reduce(
    (sum, row) => sum + (parseFloat(row["Jumlah Lembaga Keterampilan Komputer"]) || 0),
    0
  );

  // ============================
  // LOADING SCREEN
  // ============================
  if (isLoading) {
    return (
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="text-center space-y-4 animate-pulse">
          <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto animate-bounce"></div>
          <p className="text-white text-lg font-semibold">Memuat Data SDG 4...</p>
          <div className="w-32 h-2 bg-white/20 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-blue-500 animate-pulse" style={{ animationDuration: "2s" }}></div>
          </div>
        </div>
      </div>
    );
  }

  // ============================
  // MAIN RENDER
  // ============================
  return (
    <div className="p-6 space-y-6 animate-fade-in">

      {/* Header */}
      <div className="glass-4 p-6 rounded-2xl shadow-lg border border-white/10">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-300 hover:text-white mb-4 transition-colors duration-200"
        >
          <ArrowLeft size={20} />
          <span className="text-sm">Kembali ke Dashboard</span>
        </button>
        <h2 className="text-2xl font-bold text-blue-400 animate-pulse">
          📚 SDG 4: Pendidikan Berkualitas
        </h2>
        <p className="text-sm text-gray-200 mt-2">
          Monitoring akses pendidikan dasar, PAUD, keaksaraan, program paket A/B/C & lembaga komputer
        </p>
      </div>

      {/* KETERAMPILAN KOMPUTER */}
      <div className="glass-4 p-6 rounded-2xl shadow-lg border border-white/10 animate-fade-in-up">
        <h3 className="text-lg font-semibold text-white mb-3">💻 Lembaga Keterampilan Komputer</h3>

        <div className="text-center py-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500/20 rounded-full mb-4 animate-pulse">
            💻
          </div>

          <h4 className="text-xl text-white font-bold mb-2">
            {totalLembagaKomputer === 0 ? "Belum Tersedia" : `${totalLembagaKomputer} Lembaga`}
          </h4>

          <p className="text-gray-300 max-w-xl mx-auto">
            {totalLembagaKomputer === 0
              ? "Belum terdapat lembaga keterampilan komputer di desa. Pelatihan komputer dapat menjadi prioritas utama."
              : "Terdapat lembaga komputer yang sudah tersedia di beberapa desa."}
          </p>
        </div>
      </div>

      {/* PROGRESS BAR INDIKATOR KUALITATIF */}
      <div className="glass-4 p-6 rounded-2xl border border-white/10 shadow-lg animate-fade-in-up">
        <h3 className="text-lg font-semibold text-white mb-4">📊 Indikator Kualitatif Pendidikan</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {indikatorPendidikan.map((key, idx) => {
            const desaYes = data.filter((row) => isPositive(row[key])).map((d) => d.nama_desa);
            const desaNo = data.filter((row) => !isPositive(row[key])).map((d) => d.nama_desa);

            const total = data.length;
            const percent = Math.round((desaYes.length / total) * 100);

            return (
              <div key={idx} className="glass-2 p-5 rounded-xl border border-white/10 shadow hover:scale-[1.02] transition">
                <h4 className="text-white font-semibold text-center mb-3 break-words">{key}</h4>

                {/* Persentase */}
                <p className="text-gray-200 text-sm text-center mb-1">
                  {percent}% ({desaYes.length}/{total} desa)
                </p>

                {/* Progress Bar */}
                <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden">
                  <div className="h-4 bg-blue-500 rounded-full transition-all duration-700" style={{ width: `${percent}%` }} />
                </div>

                {/* Tombol Lihat Desa */}
                <button
                  onClick={() =>
                    setSelectedIndicator({
                      indikator: key,
                      desaYes,
                      desaNo,
                    })
                  }
                  className="mt-3 w-full text-center bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold py-2 rounded-lg transition"
                >
                  Lihat Desa
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL DESA */}
      {selectedIndicator && (
        <div
          className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex justify-center p-6 overflow-y-auto animate-fade-in"
          onClick={() => setSelectedIndicator(null)}
        >
          <div
            className="glass-4 p-6 rounded-2xl max-w-xl w-full mt-10 border border-white/10 animate-slide-up h-fit"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-red-400 mb-4">
              {selectedIndicator.indikator}
            </h2>

            <h3 className="text-green-400 font-semibold mb-2">
              ✓ Desa yang memenuhi ({selectedIndicator.desaYes.length})
            </h3>
            <ul className="text-white space-y-2 max-h-40 overflow-y-auto mb-4">
              {selectedIndicator.desaYes.map((d, i) => (
                <li key={i} className="p-2 bg-white/10 rounded-lg">{d}</li>
              ))}
            </ul>

            <h3 className="text-red-400 font-semibold mb-2">
              ✗ Desa yang tidak memenuhi ({selectedIndicator.desaNo.length})
            </h3>
            <ul className="text-white space-y-2 max-h-40 overflow-y-auto">
              {selectedIndicator.desaNo.map((d, i) => (
                <li key={i} className="p-2 bg-white/10 rounded-lg">{d}</li>
              ))}
            </ul>

            <button
              onClick={() => setSelectedIndicator(null)}
              className="w-full mt-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* INSIGHT */}
      <div className="glass-4 p-6 rounded-2xl border border-white/10 shadow-lg">
        <h3 className="text-blue-400 text-lg font-semibold mb-2">💡 Insight Otomatis</h3>
        <p className="text-gray-100 text-sm whitespace-pre-line">{insight}</p>
      </div>
    </div>
  );
}

