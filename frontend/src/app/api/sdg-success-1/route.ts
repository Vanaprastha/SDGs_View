import { supabase } from "@/lib/supabase/server";



interface SDGData {
  nama_desa: string;
  [key: string]: any;
}

async function calculateSdg1Success(sdg1Data: SDGData[]): Promise<number> {
  if (!sdg1Data || sdg1Data.length === 0) return 0;
  const totalSuccesses: number[] = [];

  const sktmValue = sdg1Data[0].r710;
  if (typeof sktmValue === "number") {
    const sktmSuccess = Math.max(0, (1 - sktmValue / 50)) * 100;
    totalSuccesses.push(sktmSuccess);
  }

  const binaryIndicators = ["r1502_7", "r1502_8", "r1502_4", "r1502_9"];
  binaryIndicators.forEach((indicator) => {
    const value = sdg1Data[0][indicator];
    if (value === 1) totalSuccesses.push(100);
    else if (value === 0) totalSuccesses.push(0);
  });

  if (totalSuccesses.length === 0) return 0;
  const averageSuccess = totalSuccesses.reduce((sum, val) => sum + val, 0) / totalSuccesses.length;
  return parseFloat(averageSuccess.toFixed(2));
}

export async function GET(): Promise<Response> {
  try {
    const { data: rows, error } = await supabase.from("sdgs_1").select("*");
    if (error) throw new Error(error.message);

    let successPercentage = 0;
    if (rows && rows.length > 0) {
      successPercentage = await calculateSdg1Success(rows);
    }

    return new Response(JSON.stringify({ goalNo: 1, successPercentage }), { status: 200 });
  } catch (err: any) {
    console.error("Error in sdg-success-1:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
