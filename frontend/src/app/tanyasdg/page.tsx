"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

type Msg = { role: "user" | "assistant"; text: string };

export default function TanyaSDGsPage() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<Msg[]>([
    {
      role: "assistant",
      text: "🌍 **Halo! Saya SDGsBot**\n\nSaya siap membantu Anda menganalisis data SDGs 1-17. Anda dapat bertanya tentang:\n\n- Progress setiap tujuan SDGs\n- Perbandingan antar wilayah\n- Analisis trend dan patterns\n- Insight berdasarkan data terkini\n\nContoh: *\"Bagaimana progress SDG 4 di Kecamatan Wates?\"*",
    },
  ]);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs, loading]);

  async function send(customQ?: string) {
    const question = customQ || q;
    if (!question.trim()) return;

    setLogs((l) => [...l, { role: "user", text: question }]);
    setQ("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ q: question }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      let text = data?.answer || data?.error || "Maaf, terjadi kesalahan.";

      // Post-process: konversi ke format bullet jika belum ada
      const lines = text.split("\n").map((line: string) => line.trim()).filter(Boolean);

      // Cek apakah ada bullet yang sudah ada
      const hasBullets = lines.some((line: string) => line.startsWith("- ") || line.startsWith("* "));

      if (!hasBullets && lines.length > 1) {
        // Konversi ke bullet format - skip baris pertama jika berupa pengantar
        const firstLine = lines[0];
        const isIntro = firstLine.endsWith(":") || firstLine.toLowerCase().includes("berikut") || firstLine.toLowerCase().includes("ringkasan");

        if (isIntro) {
          // Baris pertama adalah intro, sisanya jadi bullets
          text = firstLine + "\n\n" + lines.slice(1).map((line: string) => `- ${line}`).join("\n");
        } else {
          // Semua jadi bullets
          text = lines.map((line: string) => `- ${line}`).join("\n");
        }
      }

      setLogs((l) => [...l, { role: "assistant", text }]);
    } catch {
      setLogs((l) => [
        ...l,
        { role: "assistant", text: "⚠️ Gagal menghubungi server. Silakan coba lagi." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const templates = [
    { category: "Progress SDG", questions: ["Tampilkan perkembangan SDG 6 Air Bersih"] },
    { category: "Analisis Data", questions: ["Bandingkan progress SDG 4 dan SDG 8"] },
    {
      category: "Rekomendasi",
      questions: [
        "Rekomendasi untuk meningkatkan SDG 1 di daerah tertinggal",
        "Strategi apa yang efektif untuk SDG 5 Kesetaraan Gender?",
      ],
    },
  ];

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 animate-fade-in">
      <div className="glass-4 p-4 sm:p-6 rounded-2xl shadow-lg border border-white/10 text-center transform transition-all duration-300 hover:scale-[1.01]">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-400 drop-shadow-md flex items-center justify-center gap-2 sm:gap-3">
          <span className="text-3xl sm:text-4xl">🤖</span>
          Tanya SDGs
          <span className="text-3xl sm:text-4xl">🌍</span>
        </h1>
        <p className="text-gray-200 text-xs sm:text-base mt-2">
          AI Assistant untuk Analisis Data Sustainable Development Goals
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="lg:col-span-1 space-y-3 sm:space-y-4">
          <div className="glass-2 p-3 sm:p-4 rounded-xl border border-white/10">
            <h3 className="font-semibold text-white text-sm sm:text-base mb-2 sm:mb-3 flex items-center gap-2">
              💡 Pertanyaan Cepat
            </h3>
            <div className="space-y-3">
              {templates.map((cat, i) => (
                <div key={i} className="space-y-2">
                  <h4 className="text-sm font-medium text-blue-300">{cat.category}</h4>
                  {cat.questions.map((qst, j) => (
                    <motion.button
                      key={j}
                      onClick={() => send(qst)}
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full text-left p-2 sm:p-3 text-xs sm:text-sm rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-400/30 transition-all duration-200 text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed btn-mobile-sm"
                    >
                      {qst}
                    </motion.button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-3 sm:space-y-4">
          <div className="glass-4 rounded-2xl p-3 sm:p-6 chat-height-mobile lg:h-[60vh] overflow-y-auto space-y-3 sm:space-y-4 relative">
            <AnimatePresence>
              {logs.map((m, i) => (
                <motion.div
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className={`max-w-[90%] sm:max-w-[80%] chat-message-mobile px-3 sm:px-4 py-2 sm:py-3 rounded-2xl backdrop-blur-sm ${m.role === "user"
                      ? "bg-blue-500/20 border border-blue-400/30 text-white"
                      : "bg-green-500/20 border border-green-400/30 text-white"
                      }`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className={`text-xs font-semibold mb-1 ${m.role === "user" ? "text-blue-300" : "text-green-300"}`}>
                      {m.role === "user" ? "👤 Anda" : "🤖 SDGsBot"}
                    </div>
                    <div className="text-xs sm:text-sm leading-relaxed font-sans text-white">
                      {/* @ts-expect-error */}
                      <ReactMarkdown>{m.text}</ReactMarkdown>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>

            {loading && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                <div className="bg-gray-500/20 border border-gray-400/30 px-4 py-3 rounded-2xl max-w-[80%]">
                  <div className="flex items-center gap-2 text-gray-300">
                    <div className="flex space-x-1">
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} className="w-2 h-2 bg-blue-400 rounded-full" />
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} className="w-2 h-2 bg-blue-400 rounded-full" />
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} className="w-2 h-2 bg-blue-400 rounded-full" />
                    </div>
                    <span className="text-sm">SDGsBot sedang menganalisis...</span>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="glass-2 p-3 sm:p-4 rounded-xl border border-white/10">
            <div className="flex gap-3">
              <motion.input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Tanyakan tentang data SDGs..."
                className="flex-1 border border-white/20 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-white/10 text-white placeholder-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                whileFocus={{ scale: 1.01 }}
              />
              <motion.button
                onClick={() => send()}
                disabled={loading || !q.trim()}
                whileHover={{ scale: loading || !q.trim() ? 1 : 1.05 }}
                whileTap={{ scale: loading || !q.trim() ? 1 : 0.95 }}
                className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-xl font-semibold transition-all duration-200 btn-mobile ${loading || !q.trim()
                  ? "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg"
                  }`}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Memproses...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>🚀</span>
                    <span>Kirim</span>
                  </div>
                )}
              </motion.button>
            </div>
            <div className="mt-2 sm:mt-3 flex flex-wrap gap-2">
              <span className="text-xs text-gray-400 flex items-center gap-1">💡 Tips: Tanya spesifik dengan menyebutkan SDG dan wilayah</span>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center text-gray-400 text-sm">
        <p>SDGsBot • Powered by AI • Data SDGs 1-17</p>
      </div>
    </div>
  );
}

