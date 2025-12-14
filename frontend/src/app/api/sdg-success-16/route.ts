export async function GET(): Promise<Response> {
  try {
    // Ambil data publik SDG 16 dari versi6
    const res = await fetch("http://localhost:3000/api/sdgs16", { cache: "no-store" });
    if (!res.ok) throw new Error(`Gagal mengambil data SDG 16: ${res.status}`);
    const data = await res.json();

    // Fungsi skoring kategorikal
    function categoryScore(key: string, value: any): number {
      if (value === null || value === undefined) return 0;
      const v = String(value).toLowerCase().trim();

      switch (key) {
        // 1️⃣ Inisiatif keamanan warga
        case "inisiatif_warga":
          if (v.includes("ada")) return 100;
          if (v.includes("tidak ada")) return 0;
          return 50;

        // 2️⃣ Regu keamanan oleh warga
        case "regu_keamanan":
          if (v.includes("ada")) return 100;
          if (v.includes("tidak ada")) return 0;
          return 50;

        // 3️⃣ Pembangunan/pemeliharaan pos keamanan
        case "pos_keamanan":
          if (v.includes("ada")) return 100;
          if (v.includes("tidak ada")) return 0;
          return 50;

        default:
          return 0;
      }
    }

    // --- 🔢 Skor numerik (dinormalisasi) ---
    const numericKeys = {
      lembaga_adat: "Jumlah jenis lembaga adat",
      perkelahian: "Jumlah kejadian perkelahian Kelompok masyarakat dengan aparat keamanan",
    };

    // Cari nilai maksimum dan minimum untuk normalisasi
    const maxLembaga = Math.max(...data.map((d: any) => d[numericKeys.lembaga_adat] || 0));
    const maxPerkelahian = Math.max(...data.map((d: any) => d[numericKeys.perkelahian] || 0));

    // --- 🔄 Hitung skor per desa ---
    const desaAverages: number[] = [];

    for (const row of data) {
      const categoricalScores = [
        categoryScore("inisiatif_warga", row["kegiatan pengaktifan sistem keamanan lingkungan berasal dari inisiatif warga"]),
        categoryScore("regu_keamanan", row["Pembentukan/pengaturan regu keamanan oleh warga untuk menjaga keamanan lingkungan di desa/kelurahan"]),
        categoryScore("pos_keamanan", row["Kegiatan Pembangunan/pemeliharaan pos keamanan lingkungan oleh warga"]),
      ];

      const lembagaScore = maxLembaga > 0 ? (row[numericKeys.lembaga_adat] / maxLembaga) * 100 : 0;
      // Untuk perkelahian — semakin sedikit semakin baik
      const perkelahianScore =
        maxPerkelahian > 0 ? (1 - (row[numericKeys.perkelahian] / maxPerkelahian)) * 100 : 100;

      const allScores = [...categoricalScores, lembagaScore, perkelahianScore];
      const avg = allScores.reduce((a, b) => a + b, 0) / allScores.length;
      desaAverages.push(avg);
    }

    // --- Hitung rata-rata keseluruhan ---
    const successPercentage =
      desaAverages.length > 0
        ? parseFloat((desaAverages.reduce((a, b) => a + b, 0) / desaAverages.length).toFixed(2))
        : 0;

    return new Response(JSON.stringify({ goalNo: 16, successPercentage }), { status: 200 });
  } catch (err: any) {
    console.error("Error menghitung SDG 16:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

