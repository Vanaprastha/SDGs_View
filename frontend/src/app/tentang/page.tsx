"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";


const features = [
  {
    icon: "🌍",
    title: "Monitoring SDGs 1–17",
    description:
      "Visualisasi capaian indikator tiap tujuan pembangunan berkelanjutan dengan tampilan kartu dan peta berwarna sesuai palet resmi SDGs."
  },
  {
    icon: "🤖",
    title: "Auto-ML Engine",
    description:
      "Sistem Machine Learning yang dapat direplikasi dan diperbarui otomatis setiap kali data baru masuk — menjaga hasil analisis tetap akurat dan relevan."
  },
  {
    icon: "🧩",
    title: "Smart Clustering Otomatis",
    description:
      "Model machine learning diperbarui otomatis setiap kali data baru masuk agar hasil analisis tetap akurat dan relevan dengan 3 Model yang relevan (K-Protoypes,K-Means, dan K-Modes) yang akan disesuaikan otomatis mengikuti kondisi dataset."
  },
  {
    icon: "💡",
    title: "Smart Insight Card",
    description:
      "Ringkasan insight otomatis tentang tren, anomali, dan kondisi desa untuk memudahkan pengambilan keputusan."
  },
  {
    icon: "💬",
    title: "TanyaSDGs (Chatbot LLM)",
    description:
      "Asisten AI untuk menjawab pertanyaan indikator, definisi, dan kebijakan SDGs dengan berbasis data SDGs Kecamatan Wates."
  },
  {
    icon: "🗺️",
    title: "Visualisasi Real-Time",
    description:
      "Dashboard interaktif menampilkan hasil clustering dan insight terbaru langsung dari backend FastAPI."
  },
  {
    icon: "🔐",
    title: "Cloudflare Zero Trust",
    description:
      "Akses backend dilindungi dengan Cloudflare Zero Trust — memastikan hanya request terverifikasi yang bisa masuk melalui proteksi token, firewall layer-7, dan identity-based access."
  }
];


export default function TentangPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 animate-fade-in">
        <div className="text-center space-y-3 sm:space-y-4 animate-pulse">
          <div className="flex space-x-2 justify-center">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
              className="w-3 h-3 bg-blue-400 rounded-full"
            />
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
              className="w-3 h-3 bg-blue-400 rounded-full"
            />
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
              className="w-3 h-3 bg-blue-400 rounded-full"
            />
          </div>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "200px" }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="h-1 bg-blue-400 rounded-full mx-auto"
          />
          <p className="text-white text-lg font-semibold">Memuat Halaman Tentang...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-4 p-4 sm:p-8 rounded-2xl shadow-lg border border-white/10 text-center"
      >
        <h1 className="text-2xl sm:text-4xl font-bold text-blue-400 drop-shadow-md mb-3 sm:mb-4">
          🌍 Wates SDGs Dashboard
        </h1>
        <p className="text-gray-200 text-base sm:text-lg mb-2">
          Platform Cerdas untuk Monitoring dan Analisis Sustainable Development Goals
        </p>
        <p className="text-gray-400 text-xs sm:text-sm">
          Mengintegrasikan Teknologi Modern untuk Mendukung Pembangunan Berkelanjutan
        </p>
      </motion.div>

      {/* Deskripsi */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="glass-4 p-4 sm:p-6 rounded-2xl shadow-lg border border-white/10"
      >
        <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3 sm:mb-4 flex items-center gap-3">
          <span className="text-xl sm:text-2xl">💻</span>
          Tentang Platform
        </h2>
        <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent mb-4 sm:mb-6"></div>
        <div className="space-y-4 sm:space-y-6 text-gray-200 leading-relaxed">
          <p className="text-base sm:text-lg font-medium text-white">
            Pantau.In adalah dashboard pintar yang membantu pemerintah desa dan kecamatan memantau kemajuan pembangunan desa secara real-time, tanpa perlu bingung membaca data yang rumit.
          </p>

          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-lg sm:text-xl font-semibold text-blue-300">
              Apa itu Pantau.In?
            </h3>
            <div className="space-y-2 sm:space-y-3 text-sm sm:text-base">
              <p>
                Seperti "aplikasi laporan perkembangan desa" yang menampilkan data SDGs dalam bentuk grafik, peta, dan angka sederhana
              </p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-3">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>Menggunakan kecerdasan buatan untuk memberikan saran program pembangunan yang tepat</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>Bisa membandingkan kemajuan antar-desa dengan mudah</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </motion.section>


      {/* Keunggulan Fitur */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="glass-4 p-4 sm:p-8 rounded-2xl shadow-lg border border-white/10"
      >
        <h2 className="text-xl sm:text-2xl font-semibold text-white mb-6 sm:mb-8 flex items-center gap-3">
          <span className="text-2xl sm:text-3xl">✨</span>
          Keunggulan Teknologi
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
              whileHover={{
                scale: 1.05,
                y: -5,
                transition: { duration: 0.3 }
              }}
              className="glass-2 p-4 sm:p-6 rounded-2xl border border-white/10 hover:border-blue-400/30 group cursor-pointer transition-all duration-500 shadow-lg"
            >
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
                {feature.icon}
              </div>
              <h3 className="font-bold text-white text-lg sm:text-xl mb-2 sm:mb-3 group-hover:text-blue-300 transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-gray-200 text-sm sm:text-base leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Tech Stack */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="glass-4 p-4 sm:p-6 rounded-2xl shadow-lg border border-white/10 text-center"
      >
        <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">🛠 Tech Stack</h3>
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
          {["Next.js 14", "TypeScript", "Supabase", "PostgreSQL", "Tailwind CSS",
            "Framer Motion", "Python", "TensorFlow", "Scikit-learn", "Machine Learning"].map((tech, index) => (
              <motion.span
                key={tech}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.4 + index * 0.1 }}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500/20 text-blue-300 rounded-full border border-blue-400/30 text-xs sm:text-sm font-medium">
                {tech}
              </motion.span>
            ))}
        </div>
      </motion.section>

      {/* Buku Informasi */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 0.5 }}
        className="glass-4 p-4 sm:p-6 rounded-2xl shadow-lg border border-white/10"
      >
        <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3 sm:mb-4 flex items-center gap-3">
          <span className="text-xl sm:text-2xl">📚</span>
          Buku Informasi
        </h2>
        <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent mb-4 sm:mb-6"></div>
        <p className="mb-3 sm:mb-4 text-sm sm:text-base text-gray-300">
          Dokumen ini berisi informasi penting mengenai program dan capaian SDGs di wilayah Kecamatan Wates.
        </p>
        <div
          style={{
            position: "relative",
            width: "100%",
            height: 0,
            paddingTop: "56.2500%",
            paddingBottom: 0,
            boxShadow: "0 2px 8px 0 rgba(63,69,81,0.16)",
            marginTop: "1.6em",
            marginBottom: "0.9em",
            overflow: "hidden",
            borderRadius: "8px",
            willChange: "transform",
          }}
        >
          <iframe
            loading="lazy"
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              top: 0,
              left: 0,
              border: "none",
              padding: 0,
              margin: 0,
            }}
            src="https://www.canva.com/design/DAGxdqBzurE/Bw5Teu1e15LXiYkR6Vtgjg/view?embed"
            allowFullScreen
            title="Buku Informasi SDGs"
          />
        </div>
      </motion.section>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.5 }}
        className="text-center text-gray-400 text-sm"
      >
        <p>Wates SDGs Dashboard • Inovasi untuk Pembangunan Berkelanjutan 2024</p>
      </motion.div>
    </div>
  );
}
