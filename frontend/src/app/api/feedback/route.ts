import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || "";

function hasEnv() {
  return Boolean(url && key);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validasi input
    const { sdg_goal, problem_title, problem_description, reporter_name, reporter_contact, nama_desa } = body;

    if (!sdg_goal || !problem_title || !problem_description || !reporter_name || !nama_desa) {
      return NextResponse.json(
        { error: "sdg_goal, problem_title, problem_description, dan reporter_name wajib diisi" },
        { status: 400 }
      );
    }

    // Validasi SDG goal (1-17)
    const goalNum = parseInt(sdg_goal, 10);
    if (isNaN(goalNum) || goalNum < 1 || goalNum > 17) {
      return NextResponse.json(
        { error: "sdg_goal harus berupa angka antara 1-17" },
        { status: 400 }
      );
    }

    // Ambil koordinat dari nama_desa
    let location_lat = null;
    let location_lon = null;

    if (hasEnv()) {
      const supabase = createClient(url, key);
      const { data: villageData, error: villageError } = await supabase
        .from("location_village")
        .select("latitude, longitude")
        .eq("nama_desa", nama_desa)
        .single();

      if (villageError || !villageData) {
        console.error("Supabase village error:", villageError);
        return NextResponse.json(
          { error: "Nama desa tidak ditemukan atau gagal mengambil koordinat" },
          { status: 400 }
        );
      }

      location_lat = parseFloat(villageData.latitude);
      location_lon = parseFloat(villageData.longitude);
    } else {
      // Fallback for demo mode (using hardcoded data from villages API)
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
      const selectedVillage = demoVillages.find(v => v.nama_desa === nama_desa);
      if (selectedVillage) {
        location_lat = parseFloat(selectedVillage.latitude);
        location_lon = parseFloat(selectedVillage.longitude);
      }
    }

    if (!isFinite(location_lat) || !isFinite(location_lon)) {
      return NextResponse.json(
        { error: "Koordinat lokasi tidak valid setelah pencarian desa" },
        { status: 400 }
      );
    }

    // Fallback jika env kosong
    if (!hasEnv()) {
      return NextResponse.json(
        {
          message: "Feedback berhasil disimpan (demo mode)",
          data: {
            sdg_goal: goalNum,
            problem_title,
            problem_description,
            reporter_name,
            nama_desa,
            location_lat,
            location_lon,
            status: "Diajukan",
          },
        },
        { status: 201 }
      );
    }

    // Koneksi ke Supabase
    const supabase = createClient(url, key);

    // Siapkan data untuk disimpan
    const feedbackData = {
      sdg_goal: goalNum,
      problem_title,
      problem_description,
      location_lat,
      location_lon,
      reporter_name,
      reporter_contact: reporter_contact || null,
      nama_desa,
      status: "Diajukan",
    };

    // Insert ke tabel feedback_sdgs
    const { data, error } = await supabase
      .from("feedback_sdgs")
      .insert([feedbackData])
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: `Gagal menyimpan feedback: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Feedback berhasil disimpan",
        data: data?.[0] || feedbackData,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}

// GET endpoint untuk mengambil semua feedback atau filter berdasarkan SDG goal
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (id) {
    if (!hasEnv()) {
      return NextResponse.json({ error: 'Check status by ID is not available in demo mode' }, { status: 400 });
    }

    const supabase = createClient(url, key);
    const { data, error } = await supabase
      .from('feedback_sdgs')
      .select('id, problem_title, status')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: `Failed to fetch feedback status: ${error.message}` }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Problem ID not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  }

  try {
    const { searchParams } = new URL(req.url);
    const goalStr = searchParams.get("goal");

    if (!hasEnv()) {
      // Demo data
      return NextResponse.json([
        {
          id: "demo-1",
          sdg_goal: 1,
          problem_title: "Kemiskinan di Desa A",
          problem_description: "Tingkat kemiskinan masih tinggi",
          nama_desa: "MOJOREJO",
          location_lat: -8.2609867,
          location_lon: 112.3566442,
          reporter_name: "Budi",
          status: "Diajukan",
        },
      ]);
    }

    const supabase = createClient(url, key);
    let query = supabase.from("feedback_sdgs").select("*");

    if (goalStr) {
      const goalNum = parseInt(goalStr, 10);
      if (!isNaN(goalNum) && goalNum >= 1 && goalNum <= 17) {
        query = query.eq("sdg_goal", goalNum);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: `Gagal mengambil feedback: ${error.message}` },
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
