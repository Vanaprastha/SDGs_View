import { supabase } from "@/lib/supabase/server";


interface SDGData {
  nama_desa: string;
  [key: string]: any;
}

// 🔹 Skor numerik positif (semakin besar makin baik)
function positiveScore(value: number, max: number): number {
  if (typeof value !== "number" || isNaN(value)) return 0;
  return Math.min(1, value / max) * 100;
}

// 🔹 Skor numerik negatif (semakin kecil makin baik)
function negativeScore(value: number, max: number): number {
  if (typeof value !== "number" || isNaN(value)) return 100;
  return Math.max(0, (1 - Math.min(1, value / max))) * 100;
}

// 🔤 Skor kategori
function categoryScore(value: any): number {
  if (value === null || value === undefined) return 0;
  const v = String(value).toLowerCase().trim();
  if (v.includes("ada")) return 100;
  if (v.includes("tidak ada")) return 0;
  return 50;
}

// 🔍 Hitung keberhasilan SDG 7
async function calculateSdg7Success(data: SDGData[]): Promise<number> {
  if (!data || data.length === 0) return 0;

  const total: number[] = [];

  for (const row of data) {
    const scores: number[] = [];

    // Numerik
    scores.push(negativeScore(row["r501b"], 10)); // keluarga tanpa listrik
    scores.push(positiveScore(row["r510b8k4"], 5)); // waduk untuk listrik

    // Kategori
    scores.push(categoryScore(row["r1504a"])); // program energi terbarukan
    scores.push(categoryScore(row["r503a6"])); // penggunaan biogas
    scores.push(categoryScore(row["r1503a"])); // sarana energi masyarakat

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
    const { data: rows, error } = await supabase.from("sdgs_7").select("*");
    if (error) throw new Error(error.message);

    let successPercentage = 0;
    if (rows && rows.length > 0) {
      successPercentage = await calculateSdg7Success(rows);
    }

    return new Response(
      JSON.stringify({ goalNo: 7, successPercentage }),
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error in sdg-success-7:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

