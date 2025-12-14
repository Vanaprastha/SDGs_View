export async function GET(): Promise<Response> {
  try {
    // Ambil data dari endpoint publik
    const res = await fetch("http://localhost:3000/api/sdgs17", { cache: "no-store" });
    if (!res.ok) throw new Error(`Gagal mengambil data SDG 17: ${res.status}`);
    const data = await res.json();

    // Fungsi skoring kategorikal
    function categoryScore(key: string, value: any): number {
      if (value === null || value === undefined) return 0;
      const v = String(value).toLowerCase().trim();

      switch (key) {
        // 1️⃣ Kerjasama antar desa
        case "kerjasama_desa":
          if (v.includes("ada")) return 100;
          if (v.includes("tidak ada")) return 0;
          return 50;

        // 2️⃣ Kerjasama dengan pihak ketiga
        case "kerjasama_pihak3":
          if (v.includes("ada")) return 100;
          if (v.includes("tidak ada")) return 0;
          return 50;

        // 3️⃣ Status Kampung Iklim
        case "proklim":
          if (v.includes("utama")) return 100;
          if (v.includes("madya")) return 80;
          if (v.includes("pratama")) return 60;
          if (v.includes("tidak termasuk")) return 0;
          return 40;

        // 4️⃣ Program perhutanan sosial
        case "perhutanan":
          if (v.includes("ada")) return 100;
          if (v.includes("tidak ada")) return 0;
          return 50;

        // 5️⃣ Akses media swasta (TV/Radio)
        case "media":
          if (v.includes("bisa diterima")) return 100;
          if (v.includes("tidak bisa")) return 0;
          return 50;

        default:
          return 0;
      }
    }

    // Hitung rata-rata tiap desa
    const desaAverages: number[] = [];

    for (const row of data) {
      const scores = [
        categoryScore("kerjasama_desa", row["Keberadaan kerjasama antar desa"]),
        categoryScore("kerjasama_pihak3", row["Keberadaan kerjasama desa dengan pihak ketiga"]),
        categoryScore("proklim", row["Status desa termasuk Program Kampung Iklim (Proklim)"]),
        categoryScore("perhutanan", row["Keberadaan Program perhutanan sosial"]),
        categoryScore("media", row["status penerimaan program siaran televisi/radio swasta"]),
      ];

      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      desaAverages.push(avg);
    }

    // Rata-rata semua desa
    const successPercentage =
      desaAverages.length > 0
        ? parseFloat((desaAverages.reduce((a, b) => a + b, 0) / desaAverages.length).toFixed(2))
        : 0;

    return new Response(JSON.stringify({ goalNo: 17, successPercentage }), { status: 200 });
  } catch (err: any) {
    console.error("Error menghitung SDG 17:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

