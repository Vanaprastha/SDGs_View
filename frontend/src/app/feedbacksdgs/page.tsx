"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import FeedbackForm from "../components/FeedbackForm";
import StatusCheckForm from "../components/StatusCheckForm";

const FeedbackMap = dynamic(() => import("../components/FeedbackMap"), { ssr: false });

const sdgOptions = [
  { value: 1, label: "SDG 1 : Tanpa Kemiskinan" },
  { value: 2, label: "SDG 2 : Tanpa Kelaparan" },
  { value: 3, label: "SDG 3 : Kehidupan Sehat dan Sejahtera" },
  { value: 4, label: "SDG 4 : Pendidikan Berkualitas" },
  { value: 5, label: "SDG 5 : Kesetaraan Gender" },
  { value: 6, label: "SDG 6 : Air Bersih dan Sanitasi Layak" },
  { value: 7, label: "SDG 7 : Energi Bersih dan Terjangkau" },
  { value: 8, label: "SDG 8 : Pekerjaan Layak dan Pertumbuhan Ekonomi" },
  { value: 9, label: "SDG 9 : Industri, Inovasi, dan Infrastruktur" },
  { value: 10, label: "SDG 10 : Berkurangnya Kesenjangan" },
  { value: 11, label: "SDG 11 : Kota dan Permukiman yang Berkelanjutan" },
  { value: 12, label: "SDG 12 : Konsumsi dan Produksi yang Bertanggung Jawab" },
  { value: 13, label: "SDG 13 : Penanganan Perubahan Iklim" },
  { value: 14, label: "SDG 14 : Ekosistem Lautan" },
  { value: 15, label: "SDG 15 : Ekosistem Daratan" },
  { value: 16, label: "SDG 16 : Perdamaian, Keadilan, dan Kelembagaan yang Tangguh" },
  { value: 17, label: "SDG 17 : Kemitraan untuk Mencapai Tujuan" },
];

export default function FeedbackSDGsPage() {
  const [selectedGoal, setSelectedGoal] = useState<number | undefined>(undefined);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleFormSuccess = () => {
    // Refresh peta setelah data berhasil dikirim
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="p-3 sm:p-6 space-y-6 sm:space-y-10">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-green-400">
          Pengajuan Masalah SDGs 🌍
        </h1>
        <p className="text-neutral-400 text-sm sm:text-base max-w-2xl mx-auto">
          Warga dapat mengajukan masalah spesifik yang terkait dengan Tujuan Pembangunan Berkelanjutan (SDGs).
        </p>
      </div>

      {/* Grid Utama */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Form Section */}
        <div className="lg:col-span-1 space-y-4 sm:space-y-6">
          <FeedbackForm onSuccess={handleFormSuccess} />
        </div>

        {/* Map Section */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="bg-neutral-900 rounded-2xl border border-neutral-700 p-4 sm:p-6 space-y-4 sm:space-y-5">
            <h2 className="text-lg sm:text-xl font-semibold text-green-300">
              Visualisasi Laporan Masalah
            </h2>

            {/* Filter SDG */}
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2">
                Filter berdasarkan SDG Goal (Opsional)
              </label>
              <select
                value={selectedGoal || ""}
                onChange={(e) =>
                  setSelectedGoal(e.target.value ? Number(e.target.value) : undefined)
                }
                className="w-full p-2 text-sm sm:text-base rounded-lg bg-neutral-800 text-white border border-neutral-600 focus:ring-2 focus:ring-green-500"
              >
                <option value="">🌐 Tampilkan Semua SDG</option>
                {sdgOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Map Display */}
            <div className="rounded-xl overflow-hidden border border-neutral-700 shadow-md map-mobile">
              <FeedbackMap key={refreshTrigger} goal={selectedGoal} />
            </div>

            <div className="text-xs sm:text-sm text-neutral-400 bg-neutral-800/50 p-3 rounded-lg border border-neutral-700">
              <p>
                <strong>Catatan:</strong> Peta menampilkan clustering laporan masalah berdasarkan lokasi dan SDG Goal.
                Ukuran marker menunjukkan jumlah pelapor pada lokasi tersebut.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* StatusCheckForm (dipindah ke luar grid agar selebar Panduan) */}
      <div className="w-full">
        <StatusCheckForm />
      </div>

      {/* Panduan Pengajuan Masalah */}
      <div className="bg-neutral-900 rounded-2xl border border-neutral-700 p-4 sm:p-8 space-y-4 sm:space-y-6">
        <h2 className="text-lg sm:text-xl font-semibold text-green-300">
          Panduan Pengajuan Masalah
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 text-neutral-300 text-xs sm:text-sm">
          <div>
            <h3 className="font-semibold mb-2">Langkah-langkah:</h3>
            <ol className="list-decimal list-inside space-y-1 leading-relaxed">
              <li>Pilih SDG Goal yang relevan dengan masalah Anda</li>
              <li>Masukkan judul masalah secara singkat</li>
              <li>Jelaskan masalah secara detail dan spesifik</li>
              <li>Masukkan nama dan kontak Anda</li>
              <li>Tambahkan koordinat lokasi masalah (opsional)</li>
              <li>Klik tombol <strong>"Ajukan Masalah"</strong></li>
            </ol>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Tips:</h3>
            <ul className="list-disc list-inside space-y-1 leading-relaxed">
              <li>Berikan deskripsi yang jelas dan terukur</li>
              <li>Sertakan data atau bukti jika tersedia</li>
              <li>Gunakan tema/kategori untuk mengorganisir masalah</li>
              <li>Lokasi membantu visualisasi di peta</li>
              <li>Kontak Anda memudahkan tindak lanjut</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

