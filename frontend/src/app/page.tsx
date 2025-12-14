"use client";

import Link from "next/link";
import SDGCard from "@/components/SDGCard";
import { useState, useEffect } from "react";
import {
  DollarSign,
  Apple,
  Heart,
  BookOpen,
  Users,
  Droplets,
  Zap,
  Briefcase,
  Factory,
  Scale,
  Building,
  Recycle,
  Globe,
  Fish,
  TreePine,
  Gavel,
  Handshake
} from "lucide-react";

interface SdgSuccessData {
  goalNo: number;
  successPercentage: number;
}

// 🧭 Nama lengkap semua SDGs (1–17) dengan ikon
const sdgTitles: { [key: number]: { title: string; icon: any } } = {
  1: { title: "Tanpa Kemiskinan", icon: DollarSign },
  2: { title: "Tanpa Kelaparan", icon: Apple },
  3: { title: "Kesehatan yang Baik", icon: Heart },
  4: { title: "Pendidikan Berkualitas", icon: BookOpen },
  5: { title: "Kesetaraan Gender", icon: Users },
  6: { title: "Air Bersih & Sanitasi", icon: Droplets },
  7: { title: "Energi Bersih", icon: Zap },
  8: { title: "Pekerjaan Layak & Pertumbuhan Ekonomi", icon: Briefcase },
  9: { title: "Industri, Inovasi & Infrastruktur", icon: Factory },
  10: { title: "Berkurangnya Kesenjangan", icon: Scale },
  11: { title: "Kota & Pemukiman Berkelanjutan", icon: Building },
  12: { title: "Konsumsi & Produksi Bertanggung Jawab", icon: Recycle },
  13: { title: "Perubahan Iklim", icon: Globe },
  14: { title: "Ekosistem Lautan", icon: Fish },
  15: { title: "Ekosistem Daratan", icon: TreePine },
  16: { title: "Institusi & Peradilan Kuat", icon: Gavel },
  17: { title: "Kemitraan untuk Tujuan", icon: Handshake },
};

export default function Dashboard() {
  const [sdgData, setSdgData] = useState<SdgSuccessData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSdgSuccess() {
      try {
        const response = await fetch("/api/sdg-success", { cache: "no-store" });
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data: SdgSuccessData[] = await response.json();
        setSdgData(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchSdgSuccess();
  }, []);

  if (loading)
    return (
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="text-center space-y-4 animate-pulse">
          <div className="flex space-x-2 justify-center">
            <div className="w-4 h-4 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-4 h-4 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-4 h-4 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <p className="text-white text-lg font-semibold">Memuat Dashboard SDGs...</p>
        </div>
      </div>
    );

  if (error) return <p>Error loading SDGs: {error}</p>;

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header dengan animasi */}
      <div className="glass-4 p-4 sm:p-6 rounded-2xl shadow-lg border border-white/10 transform transition-all duration-300 hover:scale-[1.01] animate-slide-up">
        <h1 className="text-xl sm:text-2xl font-bold text-blue-400 drop-shadow-md">🌍 Wates SDGs Dashboard</h1>
        <p className="text-xs sm:text-sm text-gray-200 mt-2">
          Pilih tujuan SDG untuk melihat perkembangan dan analisis detail
        </p>
      </div>

      {/* Grid SDG Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
        {sdgData.map((d, index) => {
          const sdgInfo = sdgTitles[d.goalNo] || {
            title: `SDG ${d.goalNo}`,
            icon: Globe
          };

          return (
            <Link
              key={d.goalNo}
              href={{ pathname: `/sdg/sdg_${d.goalNo}` }}
              className="block"
            >
              <SDGCard
                goalNo={d.goalNo}
                title={sdgInfo.title}
                icon={sdgInfo.icon}
                successPercentage={d.successPercentage}
                animationDelay={Math.min(index * 50, 200)}
              />
            </Link>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="glass-2 p-3 sm:p-4 rounded-xl text-center border border-white/10 animate-fade-in-up">
        <p className="text-xs sm:text-sm text-gray-300">
          {sdgData.length} Tujuan Pembangunan Berkelanjutan •
          Total Progress: {Math.round(sdgData.reduce((acc, curr) => acc + curr.successPercentage, 0) / sdgData.length)}%
        </p>
      </div>
    </div>
  );
}