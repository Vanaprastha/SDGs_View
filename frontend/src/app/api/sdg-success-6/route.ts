import { supabase } from "@/lib/supabase/server";


interface SDGData {
  nama_desa: string;
  [key: string]: any;
}

// 🔢 Skor numerik
function numericScore(value: number, max: number = 10): number {
  if (typeof value !== "number" || isNaN(value)) return 0;
  return Math.min(1, value / max) * 100;
}

// 🔤 Skor kategori
function categoryScore(key: string, value: any): number {
  if (value === null || value === undefined) return 0;
  const v = String(value).toLowerCase().trim();

  switch (key) {
    case "r1502_5": // Akses Air Minum Aman
      return v.includes("ada") ? 100 : 0;

    case "r506a": // Fasilitas buang air besar
      if (v.includes("jamban sendiri")) return 100;
      if (v.includes("umum") || v.includes("bersama")) return 70;
      return 50;

    case "r511c1": // Pencemaran Limbah Sungai
      return v.includes("tidak ada") ? 100 : 0;

    case "r507": // Tempat/saluran pembuangan limbah cair
      if (v.includes("lubang resapan")) return 100;
      if (v.includes("tanah terbuka") || v.includes("dalam lubang")) return 50;
      return 0;

    default:
      return 0;
  }
}

// 🔍 Hitung keberhasilan SDG 6
async function calculateSdg6Success(data: SDGData[]): Promise<number> {
  if (!data || data.length === 0) return 0;

  const total: number[] = [];

  for (const row of data) {
    const scores: number[] = [];

    // Numerik
    scores.push(numericScore(row["r809e"]));

    // Kategori
    scores.push(categoryScore("r1502_5", row["r1502_5"]));
    scores.push(categoryScore("r506a", row["r506a"]));
    scores.push(categoryScore("r511c1", row["r511c1"]));
    scores.push(categoryScore("r507", row["r507"]));

    const valid = scores.filter((s) => !isNaN(s));
    if (valid.length > 0) {
      const avg = valid.reduce((a, b) => a + b, 0) / valid.length;
      total.push(avg);
    }
  }

  const overall =
    total.length > 0 ? total.reduce((a, b) => a + b, 0) / total.length : 0;

  return parseFloat(overall.toFixed(2));
}

// 🧩 Endpoint utama
export async function GET(): Promise<Response> {
  try {
    const { data: rows, error } = await supabase.from("sdgs_6").select("*");
    if (error) throw new Error(error.message);

    let successPercentage = 0;
    if (rows && rows.length > 0) {
      successPercentage = await calculateSdg6Success(rows);
    }

    return new Response(
      JSON.stringify({ goalNo: 6, successPercentage }),
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error in sdg-success-6:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

