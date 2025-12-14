import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Papa from "papaparse";

const tableWhitelist = new Set(Array.from({ length: 17 }, (_, i) => `sdgs_${i + 1}`));

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const password = String(form.get("password") || "");
    const sdg = Number(form.get("sdg") || "");
    const file = form.get("file") as File | null;

    if (!password || password !== process.env.UPLOAD_PASSWORD) {
      return NextResponse.json({ error: "Sandi salah atau tidak diisi." }, { status: 401 });
    }
    if (!sdg || sdg < 1 || sdg > 17) {
      return NextResponse.json({ error: "Parameter SDGs tidak valid." }, { status: 400 });
    }
    if (!file) {
      return NextResponse.json({ error: "File CSV wajib diunggah." }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Konfigurasi Supabase belum lengkap." }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const csvText = await file.text();
    const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
    if (parsed.errors?.length) {
      return NextResponse.json({ error: `CSV bermasalah: ${parsed.errors[0].message}` }, { status: 400 });
    }
    const rows = (parsed.data as any[]) || [];
    const csvCols = (parsed.meta.fields || []) as string[];

    const tableName = `sdgs_${sdg}`;
    if (!tableWhitelist.has(tableName)) {
      return NextResponse.json({ error: "Tabel tidak diizinkan." }, { status: 400 });
    }

    // Dapatkan kolom tabel via sample row
    const { data: existing, error: fetchErr } = await supabase.from(tableName).select("*").limit(1);
    if (fetchErr) {
      return NextResponse.json({ error: "Gagal membaca struktur tabel dari Supabase." }, { status: 500 });
    }

        const tableCols = existing && existing.length > 0 ? Object.keys(existing[0]) : csvCols;

    // === Mode Aman: Upsert Only (tanpa hapus data) ===
    const protectedCols = new Set(["cluster", "arti_cluster"]); // tidak boleh diubah dari CSV
    if (!tableCols.includes("nama_desa")) {
      return NextResponse.json({ error: "Kolom kunci nama_desa tidak ditemukan pada tabel." }, { status: 500 });
    }

    const updatableCols = tableCols.filter(c => c !== "nama_desa" && !protectedCols.has(c));
    const normalizedRows = rows.map((r: any) => {
      if (r["nama_desa"] === undefined || r["nama_desa"] === null || String(r["nama_desa"]).trim() == "") {
        throw new Error("Setiap baris harus memiliki nama_desa (kunci).");
      }
      const o: any = { nama_desa: String(r["nama_desa"]).trim() };
      for (const c of updatableCols) {
        if (Object.prototype.hasOwnProperty.call(r, c)) o[c] = r[c];
      }
	      return o;
	    });
	
	    // Insert batch per 500 baris
    const batchSize = 500;
    let inserted = 0;
    for (let i = 0; i < normalizedRows.length; i += batchSize) {
  const chunk = normalizedRows.slice(i, i + batchSize);
  const { error: upsertErr } = await supabase
    .from(tableName)
    .upsert(chunk, { onConflict: "nama_desa" });
  if (upsertErr) {
    return NextResponse.json({ error: `Gagal menyimpan data: ${upsertErr.message}` }, { status: 500 });
  }
  inserted += chunk.length;
}


    return NextResponse.json({ ok: true, inserted, table: tableName });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message || "Terjadi kesalahan server." }, { status: 500 });
  }
}