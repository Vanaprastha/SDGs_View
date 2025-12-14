import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || "";

function hasEnv() {
  return Boolean(url && key);
}

export async function GET(req: NextRequest) {
  const { pathname } = new URL(req.url);
  const parts = pathname.split("/");
  const goalStr = parts[parts.length - 1];
  const goalNum = parseInt(goalStr, 10) || 1;

  if (isNaN(goalNum) || goalNum < 1 || goalNum > 17) {
    return NextResponse.json({ error: "goal harus 1..17" }, { status: 400 });
  }

  // fallback demo jika env kosong
  if (!hasEnv()) {
    return NextResponse.json([
      {
        nama_desa: "RINGIN REJO",
        latitude: -7.806,
        longitude: 112.017,
        cluster: 0,
        arti_cluster: "Rendah",
        indikator: [
          "1. Contoh indikator A: 64",
          "2. Contoh indikator B: Ada",
        ],
      },
    ]);
  }

  const supabase = createClient(url, key);
  const tableName = `sdgs_${goalNum}`;

  const { data: sdgs, error: err1 } = await supabase.from(tableName).select("*");
  if (err1) return NextResponse.json({ error: err1.message }, { status: 500 });

  const { data: lokasi } = await supabase.from("location_village").select("*");
  const lokasiMap: Record<string, any> = {};
  lokasi?.forEach((row) => {
    lokasiMap[(row.nama_desa || "").trim().toUpperCase()] = {
      lat: row.latitude,
      lon: row.longitude,
    };
  });

  const fieldNames = Object.keys(sdgs?.[0] || {}).filter(
    (k) => !["nama_desa", "cluster", "arti_cluster"].includes(k)
  );

  const { data: labels } = await supabase
    .from("feature_label")
    .select("kode_kolom, nama_kolom, arti_data")
    .in("kode_kolom", fieldNames);

  // mapping kode_kolom → { nama: string, values: { "1": "Ada", "2": "Tidak Ada" } }
  const labelMap: Record<
    string,
    { nama: string; values: Record<string, string> }
  > = {};

  labels?.forEach((r) => {
    const kode = r.kode_kolom.toLowerCase();
    if (!labelMap[kode]) {
      labelMap[kode] = { nama: r.nama_kolom || r.kode_kolom, values: {} };
    }

    if (r.arti_data?.includes("=")) {
      const parts = r.arti_data.split(",");
      parts.forEach((p) => {
        if (p.includes("=")) {
          const [val, arti] = p.split("=");
          const kodeVal = String(val).trim();
          const artiVal = String(arti).trim();
          labelMap[kode].values[kodeVal] = artiVal;
        }
      });
    } else {
      // arti_data tanpa "=" → numerik → gunakan arti_data sebagai nama indikator
      labelMap[kode].nama = r.arti_data || r.nama_kolom || r.kode_kolom;
    }
  });

  const result = (sdgs || []).map((row) => {
    const indikator: string[] = [];
    let counter = 1;

    fieldNames.forEach((k) => {
      const key = k.toLowerCase();
      const lbl = labelMap[key];
      const rawVal = row[k];

      if (lbl) {
        if (Object.keys(lbl.values).length > 0) {
          const arti = lbl.values[String(rawVal).trim()] ?? rawVal;
          indikator.push(`${counter}. ${lbl.nama}: ${arti}`);
        } else {
          indikator.push(`${counter}. ${lbl.nama}: ${rawVal}`);
        }
      } else {
        indikator.push(`${counter}. ${k}: ${rawVal}`);
      }
      counter++;
    });

    const lv = lokasiMap[(row.nama_desa || "").trim().toUpperCase()] || {};
    return {
      nama_desa: row.nama_desa,
      latitude: lv.lat ?? null,
      longitude: lv.lon ?? null,
      cluster: row.cluster ?? null,
      arti_cluster: row.arti_cluster ?? "",
      indikator,
    };
  });

  return NextResponse.json(result);
}

