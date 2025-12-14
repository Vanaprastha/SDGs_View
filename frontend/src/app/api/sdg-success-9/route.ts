export async function GET(): Promise<Response> {
  try {
    // Ambil data langsung dari endpoint JSON kamu
    const res = await fetch("http://localhost:3000/api/sdgs9", { cache: "no-store" });
    if (!res.ok) throw new Error(`Gagal ambil data SDG 9: ${res.status}`);
    const data = await res.json();

    function categoryScore(key: string, value: any): number {
      if (!value) return 0;
      const v = String(value).toLowerCase();

      switch (key) {
        case "jalan_utama":
          if (v.includes("aspal") || v.includes("beton")) return 100;
          if (v.includes("tanah")) return 40;
          return 60;

        case "akses_desa":
          if (v.includes("sepanjang tahun")) return 100;
          if (v.includes("musim")) return 70;
          return 40;

        case "sinyal":
          if (v.includes("5g") || v.includes("4g") || v.includes("lte")) return 100;
          if (v.includes("3g") || v.includes("h+") || v.includes("evdo")) return 70;
          if (v.includes("2g") || v.includes("edge")) return 40;
          return 20;

        case "fasilitas_internet":
          return v.includes("berfungsi") ? 100 : 0;

        case "akses_produksi":
          if (v.includes("sepanjang tahun")) return 100;
          if (v.includes("hujan deras") || v.includes("tertentu")) return 80;
          return 50;

        default:
          return 0;
      }
    }

    // Hitung keberhasilan SDG 9 dari JSON
    const totalScores: number[] = [];

    for (const row of data) {
      const scores: number[] = [
        categoryScore("jalan_utama", row["Jenis Permukaan Jalan Utama"]),
        categoryScore(
          "akses_desa",
          row["Akses Jalan darat antar desa/kelurahan dapat dilalui kendaraan bermotor roda 4 atau lebih"]
        ),
        categoryScore(
          "sinyal",
          row["Sinyal internet telepon seluler/handphone di sebagian besar wilayah di desa/kelurahan :"]
        ),
        categoryScore("fasilitas_internet", row["Fasilitas internet di kantor kepala desa/lurah"]),
        categoryScore(
          "akses_produksi",
          row["Akses jalan darat dari sentra produksi pertanian ke jalan utama dapat dilalui kendaraan roda 4 lebih"]
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
      JSON.stringify({ goalNo: 9, successPercentage }),
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error menghitung SDG 9:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

