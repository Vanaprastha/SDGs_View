"use client";

import { useState, useEffect, useCallback } from "react";
import { FiRefreshCw, FiPlayCircle, FiInfo } from "react-icons/fi";
import { createClient } from "@supabase/supabase-js";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
);

type RowData = Record<string, any> & { nama_desa: string };
type ColumnData = { key: string; label: string; isEditable: boolean };

const sdgColors: Record<number, string> = {
  1: "text-red-400",
  2: "text-orange-400",
  3: "text-green-400",
  4: "text-sky-400",
  5: "text-pink-400",
  6: "text-cyan-400",
  7: "text-yellow-300",
  8: "text-amber-400",
  9: "text-rose-400",
  10: "text-purple-400",
  11: "text-lime-400",
  12: "text-emerald-400",
  13: "text-teal-400",
  14: "text-blue-400",
  15: "text-green-300",
  16: "text-indigo-400",
  17: "text-sky-300",
};

const sdgDescriptions: Record<number, string> = {
  1: "💰 SDG 1 – Tanpa Kemiskinan:\n• r710 = Jumlah surat keterangan miskin (SKTM)\n• r1502_7 = Jaminan layanan kesehatan ibu hamil (1=ada, 2=tidak)\n• r1502_8 = Jaminan layanan kesehatan baduta (1=ada, 2=tidak)\n• r1502_4 = Layanan PMT ibu hamil KEK (1=ada, 2=tidak)\n• r1502_9 = Layanan akta kelahiran (1=ada, 2=tidak)",

  2: "🌾 SDG 2 – Tanpa Kelaparan:\n• r709 = Jumlah penderita gizi buruk\n• r603 = Luas areal pertanian terdampak bencana\n• r711jk2 = Kejadian kerawanan pangan (1=ada, 2=tidak)\n• r515c = Penggalakan pupuk organik (1=Ada, warga terlibat, 2=Ada, warga tidak terlibat, 3=Tidak ada)\n• r403c2 = Akses jalan sentra produksi (1=Sepanjang tahun, 2=Sepanjang tahun kecuali saat tertentu, 3=Musim kemarau, 4=Tidak dapat dilalui)",

  3: "⚕️ SDG 3 – Kesehatan & Kesejahteraan:\n• r704ck2 = Jumlah Puskesmas rawat inap\n• r705a = Jumlah Posyandu aktif\n• r705e = Jumlah Kader KB/KIA\n• r1502_7 = Jaminan layanan kesehatan ibu hamil (1=ada, 2=tidak)\n• r1502_8 = Jaminan layanan kesehatan baduta (1=ada, 2=tidak)",

  4: "📚 SDG 4 – Pendidikan Berkualitas:\n• r703bk2 = Jumlah lembaga keterampilan komputer\n• r701dk5 = Aksesibilitas SD terdekat (0=tidak ada lembaga)\n• r701ak4 = Jarak PAUD terdekat (0=tidak ada lembaga, 1=sangat sulit)\n• r702a = Program keaksaraan (1=ada, 2=tidak)\n• r702b = Program Paket A/B/C (1=ada, 2=tidak)",

  5: "♀️ SDG 5 – Kesetaraan Gender:\n• r705e = Jumlah Kader KB/KIA\n• r402b2 = Jumlah PMI Perempuan 2024\n• r402d2b = Jumlah calon PMI (dgn rekomendasi)\n• r1307bk3 = Jumlah korban pembunuhan perempuan\n• r1307ak3 = Jumlah korban bunuh diri perempuan",

  6: "🚰 SDG 6 – Air Bersih & Sanitasi Layak:\n• r809e = Jumlah lembaga pengelolaan air\n• r1502_5 = Akses air minum aman (1=ada, 2=tidak)\n• r506a = Fasilitas BAB (1=Jamban sendiri, 2=Jamban bersama, 3=Jamban umum, 4=Bukan jamban)\n• r511c1 = Pencemaran limbah sungai (1=ada, 2=tidak)\n• r507 = Pembuangan limbah cair (1=Lubang resapan, 2=Drainase, 3=Sungai/laut, 4=Lubang/tanah terbuka, 5=Lainnya)",

  7: "⚡ SDG 7 – Energi Bersih & Terjangkau:\n• r501b = Jumlah keluarga tanpa listrik\n• r510b8k4 = Pemanfaatan waduk untuk listrik\n• r1504a = Program energi terbarukan (1=ada, 2=tidak)\n• r503a6 = Penggunaan biogas (1=ada, 2=tidak)\n• r1503a = Program sarana prasarana energi (1=ada, 2=tidak)",

  8: "💼 SDG 8 – Pekerjaan Layak & Pertumbuhan Ekonomi:\n• r1403a = Jumlah unit BUMDes\n• r1201a8 = Jumlah industri mikro makanan\n• r510b5k4 = Pemanfaatan waduk untuk pariwisata\n• r403a = Sumber penghasilan utama (1=Pertanian, 2=Tambang, ... 21=Lainnya)\n• r1207a = Fasilitas Kredit Usaha Rakyat (1=ada, 2=tidak)",

  9: "🏗️ SDG 9 – Industri, Inovasi, & Infrastruktur:\n• r1001b1 = Jenis permukaan jalan utama (1=Aspal/beton, 2=Diperkeras, 3=Tanah, 4=Lainnya)\n• r1001b2 = Akses jalan desa roda 4 (1=Sepanjang tahun, 2=Sepanjang tahun kecuali saat tertentu, 3=Musim kemarau, 4=Tidak dapat dilalui)\n• r1005d = Sinyal internet (1=5G/4G, 2=3G, 3=2.5G, 4=Tidak ada)\n• r1006b = Fasilitas internet kantor desa (1=Berfungsi, 2=Jarang, 3=Tidak berfungsi, 4=Tidak ada)\n• r403c2 = Akses jalan sentra produksi (1=Sepanjang tahun, 2=Sepanjang tahun kecuali saat tertentu, 3=Musim kemarau, 4=Tidak dapat dilalui)",

  10: "⚖️ SDG 10 – Mengurangi Ketimpangan:\n• r710 = Jumlah surat keterangan miskin (SKTM)\n• r1502_4 = Keberadaan paket layanan terkait stunting: PMT ibu hamil KEK/ risiko tinggi dari keluarga miskin (1 = ada, 2 = tidak ada)\n• r1502_5 = Akses air minum aman (1 = ada, 2 = tidak ada)\n• r1502_6 = Keberadaan paket layanan terkait stunting untuk akses jamban sehat (1 = ada, 2 = tidak ada)\n• r1502_7 = Jaminan layanan kesehatan ibu hamil (1 = ada, 2 = tidak ada)",

  11: "🏘️ SDG 11 – Kota & Permukiman Berkelanjutan:\n• r513a = Keberadaan permukiman kumuh (1=ada, 2=tidak)\n• r604a = Fasilitas sistem peringatan dini bencana (1=ada, 2=tidak)\n• r604d = Fasilitas rambu & jalur evakuasi (1=ada, 2=tidak)\n• r605a = Status Desa Tangguh Bencana (1=termasuk, 2=tidak)\n• r1504b = Program pengelolaan lingkungan perumahan (1=ada, 2=tidak)",

  12: "♻️ SDG 12 – Konsumsi & Produksi Bertanggung Jawab:\n• r515b = Kegiatan daur ulang sampah (1=Ada, warga terlibat, 2=Ada, warga tidak terlibat, 3=Tidak ada)\n• r504e = Keberadaan bank sampah (1=ada, 2=tidak)\n• r505 = Partisipasi pemilahan sampah (1=Semua, 2=Sebagian besar, 3=Sebagian kecil, 4=Tidak ada)\n• r504b = Tempat buang sampah utama (1=Tempat sampah diangkut, 2=Lubang/dibakar, 3=Sungai/laut, 4=Drainase)\n• r504a1b = Frekuensi pengangkutan sampah/minggu (0=tidak ada, 1=4x+, 2=3x, 3=2x, 4=1x-)",

  13: "🌍 SDG 13 – Penanganan Perubahan Iklim:\n• r605b = Status Program Kampung Iklim (Proklim) (1=termasuk, 2=tidak)\n• r601bk2 = Kejadian bencana banjir (1=ada, 2=tidak)\n• r601jk2 = Kejadian bencana kekeringan (1=ada, 2=tidak)\n• r604a = Fasilitas sistem peringatan dini bencana (1=ada, 2=tidak)\n• r6061 = Partisipasi simulasi bencana (1=Sebagian besar warga, 2=Sebagian kecil, 3=Tidak ada)",

  14: "🐟 SDG 14 – Ekosistem Lautan:\n• r308a = Wilayah berbatasan laut (1=ada, 2=tidak)\n• r504a3 = Buang sampah ke laut/sungai (1=ya, 2=tidak)\n• r308b1a = Pemanfaatan laut untuk perikanan (0=tidak, 1=ada)\n• r308b1d = Pemanfaatan laut untuk wisata bahari (0=tidak, 1=ada)\n• r605c = Status Kampung Pesisir Tangguh (1=termasuk, 2=tidak)",

  15: "🌳 SDG 15 – Ekosistem Daratan:\n• r309a = Lokasi desa terhadap hutan (1=Di dalam, 2=Di tepi, 3=Di luar)\n• r601ik2 = Kejadian kebakaran hutan & lahan (1=ada, 2=tidak)\n• r515a = Penanaman pohon lahan kritis (1=Ada, warga terlibat, 2=Ada, warga tidak terlibat, 3=Tidak ada)\n• r309e = Program perhutanan sosial (0=tidak, 1=ada)\n• r1403f = Kepemilikan hutan milik desa (1=ada, 2=tidak)",

  16: "🕊️ SDG 16 – Perdamaian & Kelembagaan:\n• r1304e = Siskamling inisiatif warga (1=ada, 2=tidak)\n• r1304b = Pembentukan regu keamanan (1=ada, 2=tidak)\n• r1304a = Pembangunan pos keamanan (1=ada, 2=tidak)\n• r809c = Jumlah jenis lembaga adat\n• r1301b3k2 = Jumlah perkelahian warga vs aparat",

  17: "🤝 SDG 17 – Kemitraan untuk Tujuan:\n• r1405a = Kerjasama antar desa (1=ada, 2=tidak)\n• r1405b = Kerjasama desa dengan pihak ketiga (1=ada, 2=tidak)\n• r605b = Status Program Kampung Iklim (Proklim) (1=termasuk, 2=tidak)\n• r309e = Program perhutanan sosial (0=tidak, 1=ada)\n• r1008ck2 = Penerimaan siaran TV/radio swasta (1=bisa, 2=tidak)"
};




const sdgOptions = Object.entries(sdgDescriptions).map(([value, text]) => ({
  value: Number(value),
  label: `SDG ${value} : ${text.split("–")[1].split(":")[0].trim()}`,
}));

async function fetchData(goal: number) {
  const tableName = `sdgs_${goal}`;
  const { data, error } = await supabase.from(tableName).select("*");
  if (error) throw new Error(`Gagal mengambil data: ${error.message}`);
  const filteredData = data.map(({ cluster, arti_cluster, ...rest }) => rest);
  return filteredData as RowData[];
}

export default function ClusteringUpdate() {
  const [goal, setGoal] = useState<number>(1);
  const [data, setData] = useState<RowData[]>([]);
  const [columns, setColumns] = useState<ColumnData[]>([]);
  const [loading, setLoading] = useState(false);
  const [clustering, setClustering] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [clusterLogs, setClusterLogs] = useState<
    { nama_desa: string; cluster: number; arti_cluster: string }[]
  >([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const fetched = await fetchData(goal);
      setData(fetched);
      if (fetched.length > 0) {
        const keys = Object.keys(fetched[0]);
        const cols: ColumnData[] = keys.map((key) => ({
          key,
          label: key,
          isEditable: key !== "nama_desa",
        }));
        setColumns(cols);
      } else {
        setColumns([]);
      }
    } catch (e: any) {
      setMessage(`❌ ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, [goal]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCellChange = (rowIndex: number, key: string, value: string) => {
    const newData = [...data];
    newData[rowIndex][key] = value;
    setData(newData);
  };

  const runClustering = async () => {
    setClustering(true);
    setClusterLogs([]);
    setMessage(null);
    try {
      const res = await fetch(`${BACKEND_URL}/run-clustering`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sdg_number: goal,
          data: data.map((r) =>
            Object.fromEntries(
              Object.entries(r).map(([k, v]) => [k, k === "nama_desa" ? v : Number(v)])
            )
          ),
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      setMessage(
        result.count
          ? `✅ Clustering berhasil (${result.count} baris diperbarui)`
          : "✅ Clustering berhasil dan data berhasil diperbarui di Supabase"
      );
      if (result.results)
        setClusterLogs(
          result.results.map((r: any) => ({
            nama_desa: r.nama_desa,
            cluster: r.cluster,
            arti_cluster: r.arti_cluster,
          }))
        );
      loadData();
    } catch (e: any) {
      setMessage(`❌ ${e.message}`);
    } finally {
      setClustering(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 🔹 Dropdown + Tombol */}
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <select
              value={goal}
              onChange={(e) => setGoal(Number(e.target.value))}
              className="p-2 rounded bg-neutral-800 text-white border border-neutral-700"
              disabled={loading || clustering}
            >
              {sdgOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <button
              onClick={loadData}
              disabled={loading || clustering}
              className="p-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-2"
            >
              <FiRefreshCw className={loading ? "animate-spin" : ""} />
              {loading ? "Memuat..." : "Refresh Data"}
            </button>
          </div>

          <button
            onClick={runClustering}
            disabled={clustering || data.length === 0}
            className="p-3 rounded-xl bg-green-600 text-white hover:bg-green-700 transition flex items-center gap-2 font-semibold"
          >
            <FiPlayCircle className={clustering ? "animate-pulse" : ""} />
            {clustering ? "Menjalankan Clustering..." : "Jalankan Clustering"}
          </button>

          {message && (
            <div
              className={`text-sm font-medium ${
                message.startsWith("❌") ? "text-red-500" : "text-green-400"
              }`}
            >
              {message}
            </div>
          )}
        </div>

        {/* Info SDG tetap */}
        <div className="flex-1 min-w-[300px] bg-white/5 backdrop-blur-sm border border-neutral-700 rounded-xl p-4 text-sm text-neutral-300 shadow-lg">
          <div className={`flex items-center gap-2 font-semibold mb-2 ${sdgColors[goal]}`}>
            <FiInfo className="text-xl" />
            <span>{sdgDescriptions[goal]?.split(":")[0]}</span>
          </div>
          <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-200 font-normal">
            {sdgDescriptions[goal]?.split(":")[1]?.trim() ||
              "Belum ada deskripsi untuk SDG ini."}
          </p>
        </div>
      </div>

      {/* Tabel dan log clustering */}
      <div className="rounded-xl p-4 overflow-x-auto bg-neutral-900 border border-neutral-700 shadow-lg">
        <h3 className="text-xl font-semibold mb-3 text-white">
          Data Indikator ({data.length} Baris)
        </h3>
        {loading && <div className="text-center py-8 text-neutral-400">Memuat data...</div>}
        {!loading && data.length === 0 && (
          <div className="text-center py-8 text-neutral-500">
            Tidak ada data untuk SDG {goal}.
          </div>
        )}
        {!loading && data.length > 0 && (
          <table className="min-w-full text-sm table-auto bg-neutral-800 text-white rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-neutral-700 text-white">
                {columns.map((col) => (
                  <th key={col.key} className="px-4 py-2 text-left whitespace-nowrap">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="border-b border-neutral-700 hover:bg-neutral-700/60">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-2">
                      {col.isEditable ? (
                        <input
                          type="text"
                          value={row[col.key] ?? ""}
                          onChange={(e) => handleCellChange(i, col.key, e.target.value)}
                          className="w-full p-1 bg-neutral-900 border border-neutral-600 rounded text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      ) : (
                        <span className="font-medium">{row[col.key]}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {clusterLogs.length > 0 && (
          <div className="mt-6 border-t border-neutral-600 pt-4 bg-neutral-900 rounded-lg shadow-inner p-4">
            <h3 className="text-lg font-semibold mb-2 text-white">📋 Log Hasil Clustering</h3>
            <p className="text-sm text-neutral-400 mb-3">
              Menampilkan hasil <strong>{clusterLogs.length}</strong> baris terbaru yang diperbarui:
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm table-auto bg-neutral-800 text-white rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-neutral-700">
                    <th className="px-4 py-2 text-left">Nama Desa</th>
                    <th className="px-4 py-2 text-left">Cluster</th>
                    <th className="px-4 py-2 text-left">Arti Cluster</th>
                  </tr>
                </thead>
                <tbody>
                  {clusterLogs.map((log, i) => (
                    <tr key={i} className="border-b border-neutral-700 hover:bg-neutral-700/60">
                      <td className="px-4 py-2">{log.nama_desa}</td>
                      <td className="px-4 py-2 font-semibold text-blue-400">{log.cluster}</td>
                      <td className="px-4 py-2 text-green-400">{log.arti_cluster}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

