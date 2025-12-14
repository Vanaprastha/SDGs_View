export async function GET(): Promise<Response> {
  try {
    // Ambil data publik dari versi6
    const res = await fetch("http://localhost:3000/api/sdgs15", { cache: "no-store" });
    if (!res.ok) throw new Error(`Gagal mengambil data SDG 15: ${res.status}`);
    const data = await res.json();

    // Fungsi skoring kategorikal
    function categoryScore(key: string, value: any): number {
      if (value === null || value === undefined) return 0;
      const v = String(value).toLowerCase().trim();

      switch (key) {
        // 1️⃣ Lokasi terhadap kawasan hutan
        case "lokasi_hutan":
          if (v.includes("dalam kawasan")) return 100; // di kawasan = peluang konservasi tinggi
          if (v.includes("di tepi") || v.includes("sekitar")) return 80;
          if (v.includes("di luar")) return 60;
          return 50;

        // 2️⃣ Kejadian kebakaran hutan/lahan
        case "kebakaran":
          if (v.includes("tidak ada")) return 100;
          if (v.includes("pernah")) return 50;
          if (v.includes("sering")) return 0;
          return 50;

        // 3️⃣ Penanaman/mangrove/pohon di lahan kritis
        case "penanaman":
          if (v.includes("ada")) return 100;
          if (v.includes("tidak ada")) return 0;
          if (v.includes("tidak ada kegiatan")) return 0;
          return 50;

        // 4️⃣ Program perhutanan sosial
        case "perhutanan":
          if (v.includes("ada")) return 100;
          if (v.includes("tidak ada")) return 0;
          return 50;

        // 5️⃣ Kepemilikan hutan milik desa
        case "hutan_desa":
          if (v.includes("ada")) return 100;
          if (v.includes("tidak ada")) return 0;
          return 50;

        default:
          return 0;
      }
    }

    // Hitung rata-rata tiap desa
    const desaAverages: number[] = [];

    for (const row of data) {
      const scores = [
        categoryScore("lokasi_hutan", row["Lokasi wilayah desa/kelurahan terhadap kawasan hutan/hutan"]),
        categoryScore("kebakaran", row["Kejadian Kebakaran hutan dan lahan"]),
        categoryScore("penanaman", row["Penanaman/pemeliharaan pepohonan di lahan kritis, penanaman mangrove, dan sejenisnya oleh masyarakat desa/kelurahan"]),
        categoryScore("perhutanan", row["Keberadaan Program perhutanan sosial"]),
        categoryScore("hutan_desa", row["Kepemilikan hutan milik desa"]),
      ];

      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      desaAverages.push(avg);
    }

    // Rata-rata seluruh desa
    const successPercentage =
      desaAverages.length > 0
        ? parseFloat((desaAverages.reduce((a, b) => a + b, 0) / desaAverages.length).toFixed(2))
        : 0;

    return new Response(JSON.stringify({ goalNo: 15, successPercentage }), { status: 200 });
  } catch (err: any) {
    console.error("Error menghitung SDG 15:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

