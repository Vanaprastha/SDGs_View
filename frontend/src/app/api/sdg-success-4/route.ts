import { supabase } from "@/lib/supabase/server";


interface SDGData {
  nama_desa: string;
  [key: string]: any;
}

// 🔢 Fungsi skor numerik (semakin besar makin baik)
function numericScore(value: number, max: number = 5): number {
  if (typeof value !== "number" || isNaN(value)) return 0;
  return Math.min(1, value / max) * 100;
}

// 🔤 Fungsi skor kategori (aman dari null dan non-string)
function categoryScore(key: string, value: any): number {
  if (value === null || value === undefined) return 0;
  const v = String(value).toLowerCase().trim();

  switch (key) {
    case "r701dk5": // Akses ke SD terdekat
    case "r701ak4": // Jarak ke PAUD terdekat
      if (v.includes("mudah") || v.includes("dekat")) return 100;
      if (v.includes("sulit")) return 50;
      if (v.includes("tidak ada")) return 0;
      return 30;

    case "r702a": // Ketersediaan Program Keaksaraan
    case "r702b": // Ketersediaan Program Paket A/B/C
      if (v.includes("ada")) return 100;
      if (v.includes("tidak ada")) return 0;
      return 50;

    default:
      return 0;
  }
}

// 🔍 Hitung keberhasilan SDG 4
async function calculateSdg4Success(data: SDGData[]): Promise<number> {
  if (!data || data.length === 0) return 0;

  const total: number[] = [];
  for (const row of data) {
    const scores: number[] = [];

    // Numerik
    scores.push(numericScore(row["r703bk2"]));

    // Kategori
    scores.push(categoryScore("r701dk5", row["r701dk5"]));
    scores.push(categoryScore("r701ak4", row["r701ak4"]));
    scores.push(categoryScore("r702a", row["r702a"]));
    scores.push(categoryScore("r702b", row["r702b"]));

    // Rata-rata per desa
    const valid = scores.filter((s) => !isNaN(s));
    if (valid.length > 0) {
      const avg = valid.reduce((a, b) => a + b, 0) / valid.length;
      total.push(avg);
    }
  }

  // Rata-rata keseluruhan
  const overall =
    total.length > 0 ? total.reduce((a, b) => a + b, 0) / total.length : 0;

  return parseFloat(overall.toFixed(2));
}

// 🧩 Endpoint utama
export async function GET(): Promise<Response> {
  try {
    const { data: rows, error } = await supabase.from("sdgs_4").select("*");
    if (error) throw new Error(error.message);

    let successPercentage = 0;
    if (rows && rows.length > 0) {
      successPercentage = await calculateSdg4Success(rows);
    }

    return new Response(
      JSON.stringify({ goalNo: 4, successPercentage }),
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error in sdg-success-4:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

