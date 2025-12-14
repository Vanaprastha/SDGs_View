import { supabase } from "@/lib/supabase/server";



// Determine if a value should be considered "success" (1 / true / "ya"/"ada")
export function isSuccessValue(v: any) {
  if (v === null || v === undefined) return false;
  if (typeof v === "number") return v === 1 || v === 100;
  if (typeof v === "boolean") return v === true;
  const s = String(v).toLowerCase().trim();
  return ["1","ya","ada","tersedia","baik","aktif","punya","memiliki"].includes(s);
}

// Compute average success percentage for a given sdgs table
export async function computeSdgSuccessPercentage(tableName: string): Promise<number> {
  const { data: rows, error } = await supabase.from(tableName).select("*");
  if (error || !rows) return 0;

  // Collect candidate binary columns, skip identification columns
  const skipKeys = new Set(["nama_desa","id","desa_id","kecamatan","kota","created_at","updated_at","cluster","arti_cluster"]);
  let successes: number[] = [];

  for (const row of rows as any[]) {
    const keys = Object.keys(row).filter(k => !skipKeys.has(k));
    let rowMarks: number[] = [];
    for (const k of keys) {
      const v = row[k];
      // Use heuristic: numeric {0,1} or small integers or strings like "ada/ya"
      if (v === 0 || v === 1 || typeof v === "boolean" || (typeof v === "string" && v.length <= 10)) {
        rowMarks.push(isSuccessValue(v) ? 1 : 0);
      }
    }
    if (rowMarks.length) {
      const pct = rowMarks.reduce((a,b)=>a+b,0) / rowMarks.length * 100;
      successes.push(pct);
    }
  }

  if (!successes.length) return 0;
  const avg = successes.reduce((a,b)=>a+b,0) / successes.length;
  return parseFloat(avg.toFixed(2));
}
