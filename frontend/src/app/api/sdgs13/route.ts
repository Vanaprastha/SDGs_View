import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY as string
);

export async function GET(): Promise<Response> {
  const { data: rows, error } = await supabase.from("sdgs_13").select("*");
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  const { data: labels } = await supabase
    .from("feature_label")
    .select("kode_kolom,nama_kolom,arti_data");

  const labelMap: Record<string, { nama: string; arti: string }> = {}
  if (labels) {
    labels.forEach((l: any) => {
      labelMap[l.kode_kolom] = { nama: l.nama_kolom, arti: l.arti_data };
    });
  }

  const mapped = (rows ?? []).map((row: any) => {
    const newRow: Record<string, any> = { nama_desa: row.nama_desa };
    Object.keys(row).forEach((k) => {
      if (k !== "nama_desa" && labelMap[k]) {
        const artiData = labelMap[k].arti;
        if (artiData && artiData.includes("=")) {
          const mapping: Record<string, string> = {}
          artiData.split(",").forEach((p: string) => {
            const [val, label] = p.split("=");
            if (val && label) mapping[val.trim()] = label.trim();
          });
          newRow[labelMap[k].nama] = mapping[row[k]] || row[k];
        } else {
          newRow[labelMap[k].nama] = row[k];
        }
      }
    });
    return newRow;
  });

  return new Response(JSON.stringify(mapped), { status: 200 });
}
