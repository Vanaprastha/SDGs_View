import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || "";

function hasEnv() {
  return Boolean(url && key);
}

// Data desa hardcoded untuk demo mode
const demoVillages = [
  { nama_desa: 'MOJOREJO', latitude: '-8.2609867', longitude: '112.3566442' },
  { nama_desa: 'PURWOREJO', latitude: '-8.2673636', longitude: '112.3231228' },
  { nama_desa: 'RINGIN REJO', latitude: '-8.3041574968', longitude: '112.333909392' },
  { nama_desa: 'SUKOREJO', latitude: '-8.2845846641', longitude: '112.357976738' },
  { nama_desa: 'SUMBERARUM', latitude: '-8.2483801', longitude: '112.3386668' },
  { nama_desa: 'TUGU REJO', latitude: '-8.2872786', longitude: '112.3823571' },
  { nama_desa: 'TULUNGREJO', latitude: '-8.2840246449', longitude: '112.322512067' },
  { nama_desa: 'WATES', latitude: '-8.25236244851039', longitude: '112.376464939584' },
];

export async function GET(req: NextRequest) {
  try {
    // Fallback jika env kosong
    if (!hasEnv()) {
      return NextResponse.json(demoVillages);
    }

    // Koneksi ke Supabase
    const supabase = createClient(url, key);

    // Ambil data desa dari tabel location_village
    const { data, error } = await supabase
      .from("location_village")
      .select("nama_desa, latitude, longitude");

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: `Gagal mengambil data desa: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
