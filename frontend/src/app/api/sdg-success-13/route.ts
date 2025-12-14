export async function GET(): Promise<Response> {
  try {
    // Ambil data dari endpoint publik
    const res = await fetch("http://localhost:3000/api/sdgs13", { cache: "no-store" });
    if (!res.ok) throw new Error(`Gagal mengambil data SDG 13: ${res.status}`);
    const data = await res.json();

    // Fungsi skoring kategorikal
    function categoryScore(key: string, value: any): number {
      if (value === null || value === undefined) return 0;
      const v = String(value).toLowerCase().trim();

      switch (key) {
        // Status Program Kampung Iklim (ProKlim)
        case "proklim":
          if (v.includes("utama")) return 100;
          if (v.includes("madya")) return 80;
          if (v.includes("pratama")) return 60;
          if (v.includes("tidak termasuk")) return 0;
          return 50;

        // Kejadian bencana banjir
        case "banjir":
          if (v.includes("tidak ada")) return 100;
          if (v.includes("pernah")) return 50;
          if (v.includes("sering")) return 0;
          return 50;

        // Kejadian kekeringan
        case "kekeringan":
          if (v.includes("tidak ada")) return 100;
          if (v.includes("pernah")) return 50;
          if (v.includes("sering")) return 0;
          return 50;

        // Fasilitas sistem peringatan dini bencana
        case "peringatan_dini":
          if (v.includes("ada")) return 100;
          if (v.includes("tidak ada")) return 0;
          return 50;

        // Partisipasi simulasi bencana
        case "simulasi_bencana":
          if (v.includes("seluruh warga")) return 100;
          if (v.includes("sebagian warga")) return 70;
          if (v.includes("tidak ada warga")) return 0;
          return 40;

        default:
          return 0;
      }
    }

    // Hitung rata-rata per desa
    const desaAverages: number[] = [];

    for (const row of data) {
      const scores = [
        categoryScore("proklim", row["Status desa termasuk Program Kampung Iklim (Proklim)"]),
        categoryScore("banjir", row["status Kejadian bencana alam banjir"]),
        categoryScore("kekeringan", row["status Kejadian bencana alam kekeringan"]),
        categoryScore("peringatan_dini", row["Fasilitas sistem peringatan dini bencana alam"]),
        categoryScore("simulasi_bencana", row["Partisipasi_Simulasi_Bencana"]),
      ];

      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      desaAverages.push(avg);
    }

    // Hitung rata-rata seluruh desa
    const successPercentage =
      desaAverages.length > 0
        ? parseFloat((desaAverages.reduce((a, b) => a + b, 0) / desaAverages.length).toFixed(2))
        : 0;

    return new Response(JSON.stringify({ goalNo: 13, successPercentage }), { status: 200 });
  } catch (err: any) {
    console.error("Error menghitung SDG 13:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

