export async function GET(): Promise<Response> {
  try {
    // 🌐 Ambil langsung dari endpoint publik
    const res = await fetch("http://localhost:3000/api/sdgs11", { cache: "no-store" });
    if (!res.ok)
      throw new Error(`Gagal mengambil data SDG 11: ${res.status}`);
    const data = await res.json();

    // 🎯 Fungsi penilaian kategori
    function categoryScore(key: string, value: any): number {
      if (!value) return 0;
      const v = String(value).toLowerCase();

      switch (key) {
        case "permukiman_kumuh":
          return v.includes("tidak ada") ? 100 : 0;

        case "peringatan_dini":
          return v.includes("ada") ? 100 : 0;

        case "rambu_evakuasi":
          return v.includes("ada") ? 100 : 0;

        case "tangguh_bencana":
          return v.includes("termasuk") ? 100 : 0;

        case "pengelolaan_lingkungan":
          return v.includes("ada") ? 100 : 0;

        default:
          return 0;
      }
    }

    // 🔢 Hitung rata-rata skor per desa
    const totalScores: number[] = [];

    for (const row of data) {
      const scores = [
        categoryScore(
          "permukiman_kumuh",
          row["Keberadaan permukiman kumuh (sanitasi lingkungan buruk, bangunan padat dan sebagian besar tidak layak huni)"]
        ),
        categoryScore(
          "peringatan_dini",
          row["Fasilitas sistem peringatan dini bencana alam"]
        ),
        categoryScore(
          "rambu_evakuasi",
          row["Fasilitas Rambu–rambu dan jalur evakuasi bencana"]
        ),
        categoryScore("tangguh_bencana", row["Status Desa Tangguh Bencana"]),
        categoryScore(
          "pengelolaan_lingkungan",
          row["Keberadaan program pengelolaan lingkungan perumahan desa/kelurahan"]
        ),
      ];

      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      totalScores.push(avg);
    }

    const successPercentage =
      totalScores.length > 0
        ? parseFloat(
          (totalScores.reduce((a, b) => a + b, 0) / totalScores.length).toFixed(2)
        )
        : 0;

    return new Response(
      JSON.stringify({ goalNo: 11, successPercentage }),
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error menghitung SDG 11:", err.message);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
}

