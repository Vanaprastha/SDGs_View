import { supabase } from "@/lib/supabase/server";


interface SDG10Data {
  nama_desa: string;
  "Akses Air Minum Aman": string;
  "Keberadaan paket layanan terkait stunting untuk akses jamban sehat": string;
  "jumlah surat keterangan miskin diterbitkan": number;
  "ketersediaan program jaminan layanan kesehatan khusus untuk ibu hamil": string;
  "Keberadaan paket layanan terkait stunting: PMT ibu hamil KEK/ risiko tinggi dari keluarga miskin": string;
}

async function calculateSdg10Success(data: SDG10Data[]): Promise<number> {
  if (!data || data.length === 0) return 0;

  let successScores: number[] = [];

  data.forEach((row) => {
    // --- 1️⃣ Indikator SKTM (semakin sedikit semakin baik)
    const s = row["jumlah surat keterangan miskin diterbitkan"] || 0;
    // Diasumsikan 100 = nol miskin, 0 = 100 SKTM
    const sScore = Math.max(0, (1 - s / 100) * 100);
    successScores.push(sScore);

    // --- 2️⃣ Indikator biner: ada/tidak ada
    const binaryKeys = [
      "Akses Air Minum Aman",
      "Keberadaan paket layanan terkait stunting untuk akses jamban sehat",
      "ketersediaan program jaminan layanan kesehatan khusus untuk ibu hamil",
      "Keberadaan paket layanan terkait stunting: PMT ibu hamil KEK/ risiko tinggi dari keluarga miskin",
    ];

    binaryKeys.forEach((key) => {
      const val = (row[key] || "").toString().toLowerCase();
      if (val === "ada") successScores.push(100);
      else if (val === "tidak ada") successScores.push(0);
    });
  });

  // --- 3️⃣ Rata-rata keseluruhan seluruh desa
  const avgSuccess = successScores.reduce((a, b) => a + b, 0) / successScores.length;
  return parseFloat(avgSuccess.toFixed(2));
}

export async function GET(): Promise<Response> {
  try {
    // Ambil data SDG 10 dari Supabase
    const { data: rows, error } = await supabase.from("sdgs_10").select("*");
    if (error) throw new Error(error.message);

    let successPercentage = 0;
    if (rows && rows.length > 0) {
      successPercentage = await calculateSdg10Success(rows as SDG10Data[]);
    }

    return new Response(
      JSON.stringify({ goalNo: 10, successPercentage }),
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ Error in sdg-success-10:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

