"use client";

import { useState, useEffect } from "react";

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

interface FeedbackFormProps {
  onSuccess?: () => void;
}

export default function FeedbackForm({ onSuccess }: FeedbackFormProps) {
  const [villages, setVillages] = useState<{ nama_desa: string; latitude: string; longitude: string }[]>([]);
  const [formData, setFormData] = useState({
    sdg_goal: "1",
    problem_title: "",
    problem_description: "",
    reporter_name: "",
    reporter_contact: "",
    nama_desa: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [problemId, setProblemId] = useState<string | number | null>(null);

  useEffect(() => {
    const fetchVillages = async () => {
      try {
        const response = await fetch("/api/villages");
        const data = await response.json();
        if (response.ok) {
          setVillages(data);
          if (data.length > 0) {
            setFormData((prev) => ({ ...prev, nama_desa: data[0].nama_desa }));
          }
        } else {
          setError(data.error || "Gagal memuat data desa");
        }
      } catch (err) {
        setError("Terjadi kesalahan saat mengambil data desa");
      }
    };
    fetchVillages();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal mengirim feedback");
      }

      setSuccess(true);
      setProblemId(data.data?.id || null);
      setFormData({
        sdg_goal: "1",
        problem_title: "",
        problem_description: "",
        reporter_name: "",
        reporter_contact: "",
        nama_desa: "",
      });

      if (onSuccess) {
        onSuccess();
      }

      // Reset success message setelah 3 detik
      setTimeout(() => {
        setSuccess(false);
        setProblemId(null);
      }, 10000); // Tampilkan lebih lama agar pengguna sempat mencatat ID
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-neutral-900 p-6 rounded-lg border border-neutral-700">
      <h2 className="text-xl font-bold mb-4">Ajukan Masalah SDGs</h2>

      {error && (
        <div className="p-3 bg-red-900 text-red-200 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-900 text-green-200 rounded">
          <p>Masalah berhasil diajukan! Terima kasih atas kontribusi Anda.</p>
          {problemId && (
            <p className="mt-2 font-bold">
              ID Masalah Anda: <span className="text-yellow-300">{problemId}</span>. Catat ID ini untuk cek status.
            </p>
          )}
        </div>
      )}

      {/* SDG Goal Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Pilih SDG Goal <span className="text-red-400">*</span>
        </label>
        <select
          name="sdg_goal"
          value={formData.sdg_goal}
          onChange={handleChange}
          required
          className="w-full p-2 rounded bg-neutral-800 text-white border border-neutral-600 focus:border-blue-500 focus:outline-none"
        >
          {sdgOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Nama Desa Selection (dipindah ke bawah SDG Goal) */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Pilih Desa <span className="text-red-400">*</span>
        </label>
        <select
          name="nama_desa"
          value={formData.nama_desa}
          onChange={handleChange}
          required
          className="w-full p-2 rounded bg-neutral-800 text-white border border-neutral-600 focus:border-blue-500 focus:outline-none"
        >
          <option value="" disabled>Pilih salah satu desa</option>
          {villages.map((village) => (
            <option key={village.nama_desa} value={village.nama_desa}>
              {village.nama_desa}
            </option>
          ))}
        </select>
      </div>

      {/* Problem Title */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Judul Masalah <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          name="problem_title"
          value={formData.problem_title}
          onChange={handleChange}
          placeholder="Contoh: Kekurangan Air Bersih di Desa X"
          required
          className="w-full p-2 rounded bg-neutral-800 text-white border border-neutral-600 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Problem Description */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Deskripsi Masalah <span className="text-red-400">*</span>
        </label>
        <textarea
          name="problem_description"
          value={formData.problem_description}
          onChange={handleChange}
          placeholder="Jelaskan masalah secara detail..."
          required
          rows={4}
          className="w-full p-2 rounded bg-neutral-800 text-white border border-neutral-600 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Reporter Name */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Nama Pelapor <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          name="reporter_name"
          value={formData.reporter_name}
          onChange={handleChange}
          placeholder="Nama Anda"
          required
          className="w-full p-2 rounded bg-neutral-800 text-white border border-neutral-600 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Reporter Contact */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Kontak Pelapor (Email/No. Telepon)
        </label>
        <input
          type="text"
          name="reporter_contact"
          value={formData.reporter_contact}
          onChange={handleChange}
          placeholder="Email atau nomor telepon"
          className="w-full p-2 rounded bg-neutral-800 text-white border border-neutral-600 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded font-medium transition"
      >
        {loading ? "Mengirim..." : "Ajukan Masalah"}
      </button>
    </form>
  );
}

