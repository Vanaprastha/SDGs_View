// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, LabelList
} from "recharts";

export default function SDG5Page() {
  const [insight, setInsight] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [activeFilters, setActiveFilters] = useState({
    kader: true,
    pmi: true,
    calonPmi: true,
    pembunuhan: true,
    bunuhDiri: true
  });

  const router = useRouter();

  useEffect(() => {
    setIsLoading(true);
    fetch("/api/insight?sdg=5")
      .then(res => res.json())
      .then(d => {
        setInsight(d.insight || "sedang memberikan insight berdasarkan data....");
        setIsLoading(false);
      })
      .catch(err => {
        setInsight("sedang memberikan insight berdasarkan data....");
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    fetch("/api/sdgs5")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error(err));
  }, []);

  // Hitung ringkasan total
  const totals = data.reduce(
    (acc, row) => {
      acc.kader += row["Jumlah Kader KB/KIA"] || 0;
      acc.pmi += row["Jumlah PMI Perempuan 2024"] || 0;
      acc.calonPmi += row["Jumlah calon PMI dengan surat rekomendasi desa/lurah untuk kerja ke luar negeri"] || 0;
      acc.pembunuhan += row["Jumlah Korban Pembunuhan Perempuan"] || 0;
      acc.bunuhDiri += row["Jumlah Korban Bunuh Diri Perempuan"] || 0;
      return acc;
    },
    { kader: 0, pmi: 0, calonPmi: 0, pembunuhan: 0, bunuhDiri: 0 }
  );

  // Filter handlers
  const toggleFilter = (filterName: keyof typeof activeFilters) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  const selectAllFilters = () => {
    setActiveFilters({
      kader: true,
      pmi: true,
      calonPmi: true,
      pembunuhan: true,
      bunuhDiri: true
    });
  };

  const clearAllFilters = () => {
    setActiveFilters({
      kader: false,
      pmi: false,
      calonPmi: false,
      pembunuhan: false,
      bunuhDiri: false
    });
  };

  // Tooltip custom dengan animasi
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 text-white p-3 rounded-lg text-sm border border-white/20 shadow-lg animate-pulse">
          <p className="font-semibold">{label}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: p.color }}
              ></span>
              {p.name}: {p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const indikator = [
    {
      key: "Jumlah Kader KB/KIA",
      color: "#3b82f6",
      short: "Kader KB/KIA",
      filterKey: "kader",
      emoji: "👩‍⚕️"
    },
    {
      key: "Jumlah PMI Perempuan 2024",
      color: "#22c55e",
      short: "PMI Perempuan",
      filterKey: "pmi",
      emoji: "🧕"
    },
    {
      key: "Jumlah calon PMI dengan surat rekomendasi desa/lurah untuk kerja ke luar negeri",
      color: "#eab308",
      short: "Calon PMI",
      filterKey: "calonPmi",
      emoji: "✈️"
    },
    {
      key: "Jumlah Korban Pembunuhan Perempuan",
      color: "#ef4444",
      short: "Pembunuhan",
      filterKey: "pembunuhan",
      emoji: "🔪"
    },
    {
      key: "Jumlah Korban Bunuh Diri Perempuan",
      color: "#f59e0b",
      short: "Bunuh Diri",
      filterKey: "bunuhDiri",
      emoji: "💔"
    }
  ];

  // Loading animation
  if (isLoading) {
    return (
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="text-center space-y-4 animate-pulse">
          <div className="w-16 h-16 bg-pink-500 rounded-full mx-auto animate-bounce"></div>
          <p className="text-white text-lg font-semibold">Memuat Data SDG 5...</p>
          <div className="w-32 h-2 bg-white/20 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-pink-500 animate-pulse" style={{ animationDuration: '2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header dengan animasi */}
      <div className="glass-4 p-6 rounded-2xl shadow-lg border border-white/10 transform transition-all duration-300 hover:scale-[1.01]">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-300 hover:text-white mb-4 transition-colors duration-200"
        >
          <ArrowLeft size={20} />
          <span className="text-sm">Kembali ke Dashboard</span>
        </button>
        <h2 className="text-2xl font-bold drop-shadow text-pink-400 animate-pulse">
          ⚖️ SDG 5: Kesetaraan Gender
        </h2>
        <p className="text-sm text-gray-200 mt-2">
          Monitoring Kader KB/KIA, PMI Perempuan, calon PMI, korban pembunuhan, dan bunuh diri perempuan
        </p>
      </div>

      {/* Cards Ringkasan dengan animasi */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {indikator.map((ind, idx) => (
          <div
            key={idx}
            className="glass-2 p-4 rounded-xl text-center shadow border border-white/10 transform transition-all duration-300 hover:scale-105 animate-slide-up"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <h4 className="font-semibold text-sm text-white mb-2">{ind.short}</h4>
            <p className="text-xl font-bold text-pink-400 animate-count-up">
              {totals[ind.filterKey as keyof typeof totals].toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Filter Slicer untuk Bar Chart Utama */}
      <div className="glass-4 p-6 rounded-2xl shadow-lg border border-white/10 transform transition-all duration-300 animate-fade-in-up">
        <h3 className="text-lg font-semibold mb-4 text-white flex items-center">
          🎚️ Filter Data Bar Chart Utama
        </h3>
        <div className="flex flex-wrap gap-4 items-center">
          {/* Filter Toggles */}
          <div className="flex flex-wrap gap-3">
            {indikator.map((ind, idx) => (
              <button
                key={idx}
                onClick={() => toggleFilter(ind.filterKey as keyof typeof activeFilters)}
                className={`px-4 py-2 rounded-lg font-semibold text-base transition-all duration-300 transform hover:scale-105 ${activeFilters[ind.filterKey as keyof typeof activeFilters]
                    ? `bg-[${ind.color}] text-white border border-[${ind.color}] shadow-lg`
                    : 'bg-gray-700 text-gray-300 border border-gray-600'
                  }`}
                style={{
                  backgroundColor: activeFilters[ind.filterKey as keyof typeof activeFilters] ? ind.color : '',
                  borderColor: activeFilters[ind.filterKey as keyof typeof activeFilters] ? ind.color : ''
                }}
              >
                {ind.emoji} {ind.short} {activeFilters[ind.filterKey as keyof typeof activeFilters] ? '✓' : ''}
              </button>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 ml-auto">
            <button
              onClick={selectAllFilters}
              className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold transition-all duration-300 transform hover:scale-105 hover:bg-green-500 border border-green-400"
            >
              Pilih Semua
            </button>
            <button
              onClick={clearAllFilters}
              className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold transition-all duration-300 transform hover:scale-105 hover:bg-red-500 border border-red-400"
            >
              Hapus Semua
            </button>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="mt-3 text-sm text-gray-300">
          Menampilkan:
          {indikator
            .filter(ind => activeFilters[ind.filterKey as keyof typeof activeFilters])
            .map(ind => ind.short)
            .join(', ') || 'Tidak ada data yang dipilih'}
        </div>
      </div>

      {/* Bar Chart Utama dengan Filter */}
      <div className="glass-4 p-6 rounded-2xl shadow-lg border border-white/10 transform transition-all duration-500 animate-fade-in-up">
        <h3 className="text-lg font-semibold mb-4 text-white flex items-center">
          📊 Indikator SDG 5 per Desa
        </h3>
        <div className="w-full h-96">
          <ResponsiveContainer>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff30" />
              <XAxis
                dataKey="nama_desa"
                stroke="#fff"
                tick={{ fill: "#fff", fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#fff" tick={{ fill: "#fff" }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {indikator.map((ind, idx) =>
                activeFilters[ind.filterKey as keyof typeof activeFilters] && (
                  <Bar
                    key={idx}
                    dataKey={ind.key}
                    fill={ind.color}
                    radius={[6, 6, 0, 0]}
                    className="transition-all duration-500"
                  >
                    <LabelList
                      dataKey={ind.key}
                      position="top"
                      fill="#fff"
                      fontSize={10}
                    />
                  </Bar>
                )
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insight Card dengan animasi */}
      <div className="glass-4 p-6 rounded-2xl shadow-lg border border-white/10 transform transition-all duration-500 animate-fade-in-up">
        <h3 className="text-lg font-semibold mb-3 text-blue-400 flex items-center">
          💡 Insight Otomatis
        </h3>
        <div className="bg-black/30 p-4 rounded-lg border border-blue-500/30">
          <p className="text-sm text-gray-100 whitespace-pre-line leading-relaxed animate-pulse-slow">
            {insight || "Sedang menganalisis data untuk memberikan insight..."}
          </p>
        </div>
      </div>
    </div>
  );
}