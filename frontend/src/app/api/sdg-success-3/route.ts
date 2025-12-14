import { supabase } from "@/lib/supabase/server";


interface SDGData {
  nama_desa: string;
  [key: string]: any;
}

// 🔢 Fungsi skor numerik (semakin besar semakin baik)
function numericScore(value: number, max: number): number {
  if (typeof value !== "number" || isNaN(value)) return 0;
  return Math.min(1, value / max) * 100;
}

// 🔤 Fungsi skor kategori
function categoryScore(value: any): number {
  if (value === null || value === undefined) return 0;
  const v = String(value).toLowerCase().trim();
  if (v.includes("ada")) return 100;
  if (v.includes("tidak")) return 0;
  return 50;
}

// 🔍 Hitung keberhasilan SDG 3
async function calculateSdg3Success(data: SDGData[]): Promise<number> {
  if (!data || data.length === 0) return 0;

  const total: number[] = [];
  for (const row of data) {
    const scores: number[] = [];

    // 🔢 Numerik (semakin banyak makin baik)
    scores.push(numericScore(row["r704ck2"], 1));  // Jumlah Puskesmas rawat inap
    scores.push(numericScore(row["r705a"], 10));   // Jumlah Posyandu aktif
    scores.push(numericScore(row["r705e"], 10));   // Jumlah Kader KB/KIA

    // 🔤 Kategori (program tersedia)
    scores.push(categoryScore(row["r1502_7"])); // layanan kesehatan ibu hamil
    scores.push(categoryScore(row["r1502_8"])); // layanan kesehatan bayi baduta

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
    const { data: rows, error } = await supabase.from("sdgs_3").select("*");
    if (error) throw new Error(error.message);

    let successPercentage = 0;
    if (rows && rows.length > 0) {
      successPercentage = await calculateSdg3Success(rows);
    }

    return new Response(
      JSON.stringify({ goalNo: 3, successPercentage }),
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error in sdg-success-3:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

