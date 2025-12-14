// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, LabelList
} from "recharts";

export default function SDG1Page() {
  const [dataSDG1, setDataSDG1] = useState<any[]>([]);
  const [insight, setInsight] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // Modal state
  const [selectedService, setSelectedService] = useState<any>(null);

  const router = useRouter();

  // Lock scroll when modal is open
  useEffect(() => {
    if (selectedService) {
      const mainContainer = document.querySelector('main');
      if (mainContainer) {
        mainContainer.scrollTo({ top: 0, behavior: "smooth" });
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [selectedService]);

  // Fetch SDG1
  useEffect(() => {
    setIsLoading(true);
    fetch("/api/sdgs1")
      .then(res => res.json())
      .then(d => {
        if (d.length > 0) {
          d.sort((a, b) => {
            const va = parseFloat(a["jumlah surat keterangan miskin diterbitkan"]) || 0;
            const vb = parseFloat(b["jumlah surat keterangan miskin diterbitkan"]) || 0;
            return va - vb;
          });
        }
        setDataSDG1(d);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  // Fetch Insight
  useEffect(() => {
    fetch("/api/insight?sdg=1")
      .then(res => res.json())
      .then(d => setInsight(d.insight || "Insight tidak tersedia."))
      .catch(() => setInsight("Insight tidak tersedia (gagal fetch API)."));
  }, []);

  // Ambil kolom layanan
  const availabilityKeys =
    dataSDG1.length > 0
      ? Object.keys(dataSDG1[0]).filter(
        (k) =>
          k !== "nama_desa" &&
          k !== "jumlah surat keterangan miskin diterbitkan"
      )
      : [];

  const totalSKTM = dataSDG1.reduce(
    (sum, row) =>
      sum + (parseFloat(row["jumlah surat keterangan miskin diterbitkan"]) || 0),
    0
  );

  // Tooltip
  const CustomTooltipSKTM = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-black/90 text-white p-3 rounded-lg text-sm border border-white/20 shadow-lg">
          <p className="font-semibold">{label}</p>
          <p>Jumlah SKTM: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  // === 🔥 LOADING ANIMASI MERAH (seperti SDG2) ===
  if (isLoading) {
    return (
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="text-center space-y-4 animate-pulse">

          {/* Lingkaran bouncing */}
          <div className="w-16 h-16 bg-red-500 rounded-full mx-auto animate-bounce"></div>

          {/* Teks loading */}
          <p className="text-white text-lg font-semibold">
            Memuat Data SDG 1...
          </p>

          {/* Progress bar */}
          <div className="w-32 h-2 bg-white/20 rounded-full mx-auto overflow-hidden">
            <div
              className="h-full bg-red-500 animate-pulse"
              style={{ animationDuration: "2s" }}
            ></div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6 animate-fade-in">

      {/* Header */}
      <div className="glass-4 p-4 sm:p-6 rounded-2xl border border-white/10 shadow-lg">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-300 hover:text-white mb-3 sm:mb-4 transition-colors duration-200"
        >
          <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
          <span className="text-xs sm:text-sm">Kembali ke Dashboard</span>
        </button>
        <h2 className="text-xl sm:text-2xl font-bold text-red-400 animate-pulse">
          🎯 SDG 1: Tanpa Kemiskinan
        </h2>
        <p className="text-gray-200 text-xs sm:text-sm mt-1">
          Monitoring SKTM & layanan stunting per desa
        </p>
      </div>

      {/* Ringkasan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="glass-2 p-4 sm:p-6 rounded-xl text-center border border-white/10 col-span-1 lg:col-span-2 shadow">
          <h4 className="text-white text-sm sm:text-base font-semibold">Total SKTM</h4>
          <p className="text-3xl sm:text-4xl text-red-400 font-extrabold">
            {totalSKTM.toLocaleString()}
          </p>
          <p className="text-xs text-gray-300">Surat Keterangan Tidak Mampu</p>
        </div>

        {availabilityKeys.map((key, idx) => {
          let ada = 0;
          let tidak = 0;

          dataSDG1.forEach((row) => {
            if (row[key] === "ada") ada++;
            else if (row[key] === "tidak ada") tidak++;
          });

          return (
            <div key={idx} className="glass-2 p-3 sm:p-4 rounded-xl border border-white/10 shadow text-center">
              <h4 className="text-white text-xs sm:text-sm font-semibold break-words leading-snug">
                {key}
              </h4>
              <div className="flex justify-around mt-2">
                <div>
                  <p className="text-green-400 font-bold">{ada}</p>
                  <p className="text-xs text-gray-300">Ada</p>
                </div>
                <div>
                  <p className="text-red-400 font-bold">{tidak}</p>
                  <p className="text-xs text-gray-300">Tidak</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bar Chart SKTM */}
      <div className="glass-4 p-4 sm:p-6 rounded-2xl border border-white/10 shadow-lg">
        <h3 className="text-white font-semibold text-base sm:text-lg mb-3">
          📊 Jumlah SKTM per Desa
        </h3>

        <div className="w-full chart-container-mobile">
          <ResponsiveContainer>
            <BarChart data={dataSDG1}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff30" />
              <XAxis
                dataKey="nama_desa"
                stroke="#fff"
                tick={{ fill: "#fff" }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#fff" tick={{ fill: "#fff" }} />
              <Tooltip content={<CustomTooltipSKTM />} />
              <Legend />

              <Bar
                dataKey="jumlah surat keterangan miskin diterbitkan"
                fill="#ef4444"
                radius={[6, 6, 0, 0]}
              >
                <LabelList
                  dataKey="jumlah surat keterangan miskin diterbitkan"
                  position="top"
                  fill="#fff"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Progress Bar Coverage */}
      <div className="glass-4 p-4 sm:p-6 rounded-2xl border border-white/10 shadow-lg">
        <h3 className="text-white text-base sm:text-lg font-semibold mb-3 sm:mb-4">
          📊 Keberadaan Layanan Terkait Stunting (Per Layanan)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {availabilityKeys.map((key, idx) => {
            const desaAda = dataSDG1.filter((d) => d[key] === "ada").map((d) => d.nama_desa);
            const desaTidak = dataSDG1.filter((d) => d[key] === "tidak ada").map((d) => d.nama_desa);

            const total = dataSDG1.length;
            const percent = Math.round((desaAda.length / total) * 100);

            return (
              <div
                key={idx}
                className="glass-2 p-4 sm:p-5 rounded-xl border border-white/10 shadow hover:scale-[1.02] transition"
              >
                <h4 className="text-white text-center text-sm sm:text-base font-semibold mb-2 sm:mb-3 break-words leading-snug">
                  {key}
                </h4>

                <p className="text-gray-200 text-sm text-center mb-1">
                  {percent}% ({desaAda.length}/{total} desa)
                </p>

                <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-4 bg-green-500 rounded-full transition-all duration-700"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <p className="text-green-400 text-center mt-2 text-sm font-semibold">
                  ✓ Semua desa memiliki layanan ini
                </p>

                <button
                  onClick={() =>
                    setSelectedService({
                      layanan: key,
                      desaAda,
                      desaTidak,
                    })
                  }
                  className="mt-3 w-full text-center bg-blue-500 hover:bg-blue-600 text-white text-xs sm:text-sm font-semibold py-2 rounded-lg transition btn-mobile-sm"
                >
                  Lihat Desa
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {selectedService && (
        <div
          className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in"
          onClick={() => setSelectedService(null)}
        >
          <div
            className="glass-4 p-4 sm:p-6 rounded-2xl max-w-xl w-full mt-4 sm:mt-10 border border-white/10 animate-slide-up h-fit modal-mobile"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg sm:text-xl font-bold text-red-400 mb-3 sm:mb-4">
              {selectedService.layanan}
            </h2>

            <h3 className="text-sm sm:text-base text-green-400 font-semibold mb-2">
              ✓ Desa yang memiliki layanan ({selectedService.desaAda.length})
            </h3>
            <ul className="text-white text-sm space-y-2 max-h-40 overflow-y-auto mb-4">
              {selectedService.desaAda.map((d, i) => (
                <li key={i} className="p-2 bg-white/10 rounded-lg">{d}</li>
              ))}
            </ul>

            <h3 className="text-sm sm:text-base text-red-400 font-semibold mb-2">
              ✗ Desa yang belum memiliki layanan ({selectedService.desaTidak.length})
            </h3>
            <ul className="text-white text-sm space-y-2 max-h-40 overflow-y-auto">
              {selectedService.desaTidak.map((d, i) => (
                <li key={i} className="p-2 bg-white/10 rounded-lg">{d}</li>
              ))}
            </ul>

            <button
              onClick={() => setSelectedService(null)}
              className="w-full mt-4 sm:mt-6 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg btn-mobile"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Insight */}
      <div className="glass-4 p-4 sm:p-6 rounded-2xl border border-white/10 shadow-lg">
        <h3 className="text-blue-400 text-base sm:text-lg font-semibold mb-2">💡 Insight Otomatis</h3>
        <p className="text-gray-100 text-xs sm:text-sm whitespace-pre-line">
          {insight || "Sedang menganalisis data..."}
        </p>
      </div>
    </div>
  );
}

