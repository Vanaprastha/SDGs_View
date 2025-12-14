"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const MapSDG = dynamic(() => import("../components/MapSDG"), { ssr: false });

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

export default function ClusteringPage() {
  const [goal, setGoal] = useState<number>(1);

  return (
    <div className="p-3 sm:p-6 space-y-3 sm:space-y-4">
      <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Clustering SDGs</h2>

      <select
        value={goal}
        onChange={(e) => setGoal(Number(e.target.value))}
        className="mb-3 sm:mb-4 p-2 text-sm sm:text-base rounded bg-neutral-800 text-white border border-neutral-600 focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
      >
        {sdgOptions.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      {/* Map container */}
      <div className="map-mobile">
        <MapSDG goal={goal} />
      </div>
    </div>
  );
}
