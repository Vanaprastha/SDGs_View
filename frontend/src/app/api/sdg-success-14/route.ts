export async function GET(): Promise<Response> {
  try {
    // Ambil data dari endpoint publik versi6
    const res = await fetch("http://localhost:3000/api/sdgs14", { cache: "no-store" });
    if (!res.ok) throw new Error(`Gagal mengambil data SDG 14: ${res.status}`);
    const data = await res.json();

    // Fungsi skoring kategorikal
    function categoryScore(key: string, value: any): number {
      if (value === null || value === undefined) return 0;
      const v = String(value).toLowerCase().trim();

      switch (key) {
        // 1️⃣ Desa pesisir (berbatasan langsung dengan laut)
        case "pesisir":
          if (v.includes("ada")) return 100;
          if (v.includes("tidak ada")) return 50; // tetap diberi bobot moderat
          return 0;

        // 2️⃣ Tempat buang sampah ke laut
        case "sampah_laut":
          if (v.includes("tidak")) return 100; // tidak buang ke laut = baik
          if (v.includes("ya") || v.includes("ada")) return 0;
          return 50;

        // 3️⃣ Pemanfaatan laut untuk perikanan tangkap
        case "perikanan":
          if (v.includes("ada")) return 100; // mendukung ekonomi lokal
          if (v.includes("tidak ada")) return 50;
          return 50;

        // 4️⃣ Pemanfaatan laut untuk wisata bahari
        case "wisata":
          if (v.includes("ada")) return 100;
          if (v.includes("tidak ada")) return 50;
          return 50;

        // 5️⃣ Status Kampung Pesisir Tangguh
        case "pesisir_tangguh":
          if (v.includes("utama")) return 100;
          if (v.includes("madya")) return 80;
          if (v.includes("pratama")) return 60;
          if (v.includes("tidak termasuk")) return 0;
          return 50;

        default:
          return 0;
      }
    }

    // Hitung rata-rata per desa
    const desaAverages: number[] = [];

    for (const row of data) {
      const scores = [
        categoryScore("pesisir", row["Ada wilayah desa/kelurahan yang berbatasan langsung dengan laut"]),
        categoryScore("sampah_laut", row["Tempat buang sampah keluarga melalui Sungai/saluran irigasi/danau/laut "]),
        categoryScore("perikanan", row["Pemanfaatan laut untuk Perikanan tangkap (mencakup seluruh biota laut) "]),
        categoryScore("wisata", row["Pemanfaatan laut untuk wisata bahari "]),
        categoryScore("pesisir_tangguh", row["Status desa termasuk Kampung Pesisir Tangguh "]),
      ];

      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      desaAverages.push(avg);
    }

    // Rata-rata keseluruhan desa
    const successPercentage =
      desaAverages.length > 0
        ? parseFloat((desaAverages.reduce((a, b) => a + b, 0) / desaAverages.length).toFixed(2))
        : 0;

    return new Response(JSON.stringify({ goalNo: 14, successPercentage }), { status: 200 });
  } catch (err: any) {
    console.error("Error menghitung SDG 14:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

