import { supabase } from "@/lib/supabase/server";


function numericScore(value: number, max: number): number {
  if (typeof value !== "number" || isNaN(value)) return 0;
  return Math.min(1, value / max) * 100;
}

function categoryScore(key: string, value: any): number {
  if (!value) return 0;
  const v = String(value).toLowerCase();

  switch (key) {
    case "r403a":
      if (v.includes("industri") || v.includes("jasa") || v.includes("perdagangan"))
        return 100;
      if (v.includes("pertanian")) return 85;
      return 50;
    case "r1207a":
      return v.includes("ada") ? 100 : 0;
    default:
      return 0;
  }
}

async function calculateSdg8Success(data: any[]): Promise<number> {
  const scores = data.map((row) => {
    const score =
      numericScore(row["r1403a"], 2) * 0.20 +
      numericScore(row["r1201a8"], 2) * 0.25 +
      numericScore(row["r510b5k4"], 1) * 0.10 +
      categoryScore("r403a", row["r403a"]) * 0.20 +
      categoryScore("r1207a", row["r1207a"]) * 0.25;
    return score;
  });

  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  return parseFloat(avg.toFixed(2));
}

export async function GET(): Promise<Response> {
  try {
    const { data, error } = await supabase.from("sdgs_8").select("*");
    if (error) throw new Error(error.message);

    const successPercentage = data?.length ? await calculateSdg8Success(data) : 0;

    return new Response(
      JSON.stringify({ goalNo: 8, successPercentage }),
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error in sdg-success-8:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

