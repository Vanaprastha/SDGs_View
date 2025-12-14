"use client";

import { useEffect, useState } from "react";
import { LucideIcon } from "lucide-react";

// 🎨 Warna SDG
const SDG_COLORS: Record<number, string> = {
  1: "#E5243B", 2: "#DDA63A", 3: "#4C9F38", 4: "#C5192D", 5: "#FF3A21",
  6: "#26BDE2", 7: "#FCC30B", 8: "#A21942", 9: "#FD6925", 10: "#DD1367",
  11: "#FD9D24", 12: "#BF8B2E", 13: "#3F7E44", 14: "#0A97D9", 15: "#56C02B",
  16: "#00689D", 17: "#19486A",
};

interface SDGCardProps {
  goalNo: number;
  title: string;
  icon: LucideIcon;
  successPercentage: number;
  animationDelay?: number;
}

export default function SDGCard({
  goalNo,
  title,
  icon: Icon,
  successPercentage,
  animationDelay = 0
}: SDGCardProps) {

  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  // Animasi persentase - simplified
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercentage(successPercentage);
    }, 300 + Math.min(animationDelay, 300)); // Cap animation delay untuk mobile

    return () => clearTimeout(timer);
  }, [successPercentage, animationDelay]);

  // Warna progress bar
  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "from-green-500 to-emerald-400";
    if (percentage >= 60) return "from-blue-500 to-cyan-400";
    if (percentage >= 40) return "from-yellow-500 to-amber-400";
    if (percentage >= 20) return "from-orange-500 to-yellow-400";
    return "from-red-500 to-orange-400";
  };

  const progressColor = getProgressColor(successPercentage);

  // 🎨 Background & border khusus SDG
  const base = SDG_COLORS[goalNo] ?? "#10b981";
  const cardBg = `linear-gradient(135deg, ${base}33, ${base}55)`; // soft gradient
  const borderColor = `${base}88`;

  return (
    <div
      className="relative glass-2 p-3 sm:p-4 rounded-xl shadow-lg border transition-transform duration-200 hover:scale-[1.02] cursor-pointer group"
      style={{
        background: cardBg,
        borderColor: borderColor
      }}
    >
      {/* Header Icon */}
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <Icon size={28} className="sm:w-8 sm:h-8 transform transition-transform duration-300 group-hover:scale-110 text-white/90" />

        <div className="glass-1 px-2 py-1 rounded-lg border border-white/20">
          <span className="text-xs sm:text-sm font-bold text-white drop-shadow">#{goalNo}</span>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 line-clamp-2 group-hover:text-white transition-colors duration-300">
        {title}
      </h3>

      {/* Progress Section */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-white/80">Progress</span>
          <span className="font-bold text-white transition-all duration-300 transform group-hover:scale-110">
            {Math.round(animatedPercentage)}%
          </span>
        </div>

        <div className="w-full bg-black/20 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full bg-gradient-to-r ${progressColor} transition-all duration-700 ease-out`}
            style={{
              width: `${animatedPercentage}%`,
            }}
          />
        </div>

        {/* Status Text */}
        <div className="flex justify-between text-xs">
          <span className="text-white/70">Mulai</span>
          <span
            className={`font-semibold transition-all duration-300 transform group-hover:scale-105 ${successPercentage >= 80
              ? "text-green-300"
              : successPercentage >= 60
                ? "text-blue-300"
                : successPercentage >= 40
                  ? "text-yellow-300"
                  : successPercentage >= 20
                    ? "text-orange-300"
                    : "text-red-300"
              }`}
          >
            {successPercentage >= 80
              ? "Sempurna"
              : successPercentage >= 60
                ? "Bagus"
                : successPercentage >= 40
                  ? "Cukup"
                  : successPercentage >= 20
                    ? "Perlu Perbaikan"
                    : "Kritis"}
          </span>
        </div>
      </div>

      {/* Hover Border */}
      <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-white/40 transition-all duration-300 pointer-events-none" />
    </div>
  );
}
