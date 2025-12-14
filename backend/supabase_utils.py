import os
import pandas as pd
from supabase import create_client, Client

# 🔑 Inisialisasi koneksi Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError("❌ Environment variable SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY belum diset!")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

def supabase_update(sdg_number: int, df: pd.DataFrame) -> int:
    """
    Fungsi untuk memperbarui data hasil clustering ke tabel Supabase.
    Update dilakukan dengan upsert berdasarkan kolom 'nama_desa'.
    """
    table_name = f"sdgs_{sdg_number}"

    # Pastikan kolom wajib ada
    if "nama_desa" not in df.columns:
        raise ValueError("Kolom 'nama_desa' tidak ditemukan di DataFrame!")

    if "cluster" not in df.columns or "arti_cluster" not in df.columns:
        raise ValueError("Kolom 'cluster' atau 'arti_cluster' tidak ditemukan di DataFrame!")

    # Konversi DataFrame ke list of dicts
    records = df.to_dict(orient="records")

    print(f"🟢 Mengirim {len(records)} baris ke Supabase (tabel: {table_name})...")

    try:
        # Gunakan upsert agar data lama dengan nama_desa yang sama diperbarui
        response = supabase.table(table_name).upsert(
            records,
            on_conflict="nama_desa"  # pastikan kolom ini unique di Supabase
        ).execute()

        if response.data:
            print(f"✅ Berhasil update {len(response.data)} baris ke tabel {table_name}.")
            return len(response.data)
        else:
            print(f"⚠️ Tidak ada data yang diperbarui (response kosong).")
            return 0

    except Exception as e:
        print(f"❌ Gagal update ke Supabase: {e}")
        return 0

