export async function GET(): Promise<Response> {
  try {
    // Ambil data langsung dari endpoint publik
    const res = await fetch("http://localhost:3000/api/sdgs12", { cache: "no-store" });
    if (!res.ok) throw new Error(`Gagal mengambil data SDG 12: ${res.status}`);
    const data = await res.json();

    // Skor kategori (semua indikator kategorikal)
    function categoryScore(key: string, value: any): number {
      if (value === null || value === undefined) return 0;
      const v = String(value).toLowerCase().trim();

      switch (key) {
        // Kegiatan reduce/reuse/recycle di masyarakat
        case "3r":
          if (v.includes("ada")) return 100;
          if (v.includes("tidak ada")) return 0;
          return 50;

        // Keberadaan bank sampah
        case "bank_sampah":
          if (v.includes("ada")) return 100;
          if (v.includes("tidak ada")) return 0;
          return 50;

        // Partisipasi pemilahan sampah
        case "partisipasi_pilah":
          if (v.includes("sebagian besar")) return 100;
          if (v.includes("sebagian kecil")) return 50;
          if (v.includes("tidak ada")) return 0;
          return 50;

        // Tempat buang sampah
        case "tempat_buang":
          // Praktik terbaik: TPA/TPS/diangkut → 100
          if (v.includes("tps") || v.includes("tpa") || v.includes("diangkut")) return 100;
          // Dalam lubang/dibakar (masih buruk, tapi bukan pembuangan liar): 30
          if (v.includes("dalam lubang") || v.includes("dibakar")) return 30;
          // Sungai/selokan/sembarangan → 0
          if (v.includes("sungai") || v.includes("selokan") || v.includes("sembarangan")) return 0;
          return 40;

        // Frekuensi pengangkutan sampah
        case "frekuensi_angkut":
          if (v.includes("tidak ada")) return 0;
          // "1 kali", "1-2 kali" → 70
          if (v.includes("1") || v.includes("1-2") || v.includes("1 – 2") || v.includes("1 –2") || v.includes("1–2")) return 70;
          // "2-3 kali" atau ">=3 kali" → 100
          if (v.includes("3") || v.includes(">=3") || v.includes("≥3") || v.includes("3 kali")) return 100;
          return 50;

        default:
          return 0;
      }
    }

    // Hitung rata-rata skor per desa
    const desaAverages: number[] = [];

    for (const row of data) {
      const scores = [
        categoryScore("3r", row["Kegiatan Pengolahan/daur ulang sampah/limbah (reuse, recycle) oleh masyarakat desa/kelurahan"]),
        categoryScore("bank_sampah", row["status keberadaan bank sampah di desa/kelurahan:"]),
        categoryScore("partisipasi_pilah", row["Partisipasi Pemilahan sampah membusuk dan sampah kering:"]),
        categoryScore("tempat_buang", row["Tempat buang sampah sebagian besar keluarga"]),
        categoryScore("frekuensi_angkut", row["Frekuensi pengangkutan sampah dalam 1 minggu"]),
      ];

      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      desaAverages.push(avg);
    }

    const successPercentage =
      desaAverages.length > 0
        ? parseFloat((desaAverages.reduce((a, b) => a + b, 0) / desaAverages.length).toFixed(2))
        : 0;

    return new Response(JSON.stringify({ goalNo: 12, successPercentage }), { status: 200 });
  } catch (err: any) {
    console.error("Error menghitung SDG 12:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

