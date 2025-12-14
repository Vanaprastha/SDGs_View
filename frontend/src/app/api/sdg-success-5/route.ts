import { supabase } from "@/lib/supabase/server";


interface SDGData {
  nama_desa: string;
  [key: string]: any;
}

// 🔹 Fungsi skor positif (semakin banyak makin baik)
function positiveScore(value: number, max: number): number {
  if (typeof value !== "number" || isNaN(value)) return 0;
  return Math.min(1, value / max) * 100;
}

// 🔹 Fungsi skor negatif (semakin kecil makin baik)
function negativeScore(value: number, max: number): number {
  if (typeof value !== "number" || isNaN(value)) return 100;
  return Math.max(0, (1 - Math.min(1, value / max))) * 100;
}

// 🔍 Hitung keberhasilan SDG 5
async function calculateSdg5Success(data: SDGData[]): Promise<number> {
  if (!data || data.length === 0) return 0;

  const total: number[] = [];

  for (const row of data) {
    const scores: number[] = [];

    // Positif (semakin banyak makin baik)
    scores.push(positiveScore(row["r705e"], 10)); // kader KB/KIA
    scores.push(positiveScore(row["r402b2"], 50)); // PMI perempuan
    scores.push(positiveScore(row["r402d2b"], 10)); // calon PMI legal

    // Negatif (semakin kecil makin baik)
    scores.push(negativeScore(row["r1307bk3"], 5)); // korban pembunuhan
    scores.push(negativeScore(row["r1307ak3"], 5)); // korban bunuh diri

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
    const { data: rows, error } = await supabase.from("sdgs_5").select("*");
    if (error) throw new Error(error.message);

    let successPercentage = 0;
    if (rows && rows.length > 0) {
      successPercentage = await calculateSdg5Success(rows);
    }

    return new Response(
      JSON.stringify({ goalNo: 5, successPercentage }),
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error in sdg-success-5:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

