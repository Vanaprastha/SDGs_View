from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import pickle
from pathlib import Path
from supabase_utils import supabase_update

app = FastAPI(title="SDGs Clustering API")

# 🔐 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/run-clustering")
async def run_clustering(request: Request):
    body = await request.json()
    sdg_number = body.get("sdg_number")
    data = body.get("data", [])

    if not sdg_number or not data:
        return {"error": "sdg_number dan data wajib diisi"}

    df = pd.DataFrame(data)
    model_path = Path(f"models/model_sdg{sdg_number}.pkl")

    if not model_path.exists():
        return {"error": f"Model SDG {sdg_number} belum tersedia. Tambahkan file {model_path.name} ke folder /models."}

    # 🔹 Load model
    try:
        model = pickle.load(open(model_path, "rb"))
        model_type = type(model).__name__
        print(f"🧠 Model SDG {sdg_number} terdeteksi: {model_type}")
    except Exception as e:
        return {"error": f"Gagal memuat model: {str(e)}"}

    # 🔹 Load fitur & indeks kategori
    features_path = Path(f"models/features_sdg{sdg_number}.pkl")
    cat_idx_path = Path(f"models/cat_idx_sdg{sdg_number}.pkl")

    if not features_path.exists() or not cat_idx_path.exists():
        return {"error": f"File fitur atau indeks kategori tidak ditemukan untuk SDG {sdg_number}."}

    try:
        features = pickle.load(open(features_path, "rb"))
        cat_idx = pickle.load(open(cat_idx_path, "rb"))
    except Exception as e:
        return {"error": f"Gagal memuat file fitur/indeks kategori: {str(e)}"}

    # 🔹 Siapkan data prediksi
    try:
        df_for_predict = df[features].copy()
    except KeyError as e:
        return {"error": f"Kolom hilang di data input: {str(e)}"}

    num_cols = [features[i] for i in range(len(features)) if i not in cat_idx]
    cat_cols = [features[i] for i in cat_idx]

    for c in cat_cols:
        df_for_predict[c] = df_for_predict[c].astype(str)

    X_predict = df_for_predict.to_numpy()

    # 🔹 Prediksi cluster (otomatis deteksi jenis model)
    try:
        if hasattr(model, "predict"):
            # 1️⃣ Jika model K-Prototypes
            if "categorical" in model.predict.__code__.co_varnames:
                df["cluster"] = model.predict(X_predict, categorical=cat_idx)
            # 2️⃣ Jika model K-Means (sklearn)
            elif "kmodes" not in model_type.lower():
                df["cluster"] = model.predict(X_predict)
            # 3️⃣ Jika model KModes
            else:
                df["cluster"] = model.predict(X_predict, categorical=cat_idx)
        else:
            raise ValueError("Model tidak memiliki fungsi predict()")
    except Exception as e:
        return {"error": f"Gagal melakukan prediksi: {str(e)}"}

    # 🔢 Pemetaan arti_cluster (makna tiap cluster untuk dashboard)
    arti_maps = {
        1: {
            0: "Desa Prioritas Penanganan Kemiskinan",
            1: "Desa dengan Kemiskinan Terdata Rendah",
        },
        2: {
            0: "Tidak ada kerawanan pangan, pertanian tidak rusak, tetapi kegiatan penguatan seperti pupuk organik belum berjalan. Infrastruktur akses lancar sepanjang tahun.",
            1: "Kondisi pangan aman, tetapi akses produksi pertanian masih bergantung pada cuaca (rawan hujan deras).",
            2: "Aman pangan, ada inisiatif penggunaan pupuk organik oleh sebagian warga.",
        },
        3: {
            0: "Desa sudah memiliki akses program kesehatan dasar seperti ibu hamil dan balita, namun jumlah kader dan dukungan lapangan masih minim, sehingga layanan belum optimal.",
            1: "Desa memiliki aktivitas posyandu dan kader yang cukup aktif, dengan program kesehatan berjalan baik meskipun belum ada fasilitas rawat inap atau puskesmas besar.",
        },
        4: {
            0: "Akses Pendidikan Rendah",
            1: "Cukup",
            2: "Tinggi",
        },
        5: {
            0: "Desa Kader KB Standar",
            1: "Desa Kader KB Unggul",
        },
        6: {
            0: "Jumlah Lembaga Air Banyak, Limbah ke Tanah",
            1: "Jumlah Lembaga Air Sedikit, Limbah Bervariasi",
        },
        7: {
            0: "Desa Mayoritas Berlistrik",
            1: "Desa Sepenuhnya Berlistrik",
        },
        8: {
            0: "Desa Industri Mikro Rendah",
            1: "Desa Industri Mikro Tinggi",
        },
        9: {
            0: "Kesenjangan Digital",
            1: "Desa Infrastruktur Terbaik",
            2: "Desa Akses Jalan Terbatas",
        },
        10: {
            0: "Desa dengan akses layanan pemerataan kesenjangan ada, dengan tingkat ketimpangan tinggi",
            1: "Desa dengan akses layanan pemerataan kesenjangan ada, dengan tingkat ketimpangan rendah",
        },
        11: {
            0: "Desa Bebas Kumuh & Kesiapsiagaan Rendah",
            1: "Desa Rentan & Belum Berkelanjutan",
            2: "Desa Tangguh & Permukiman Sehat",
        },
        12: {
            0: "Desa Mandiri Daur Ulang Dasar",
            1: "Desa Partisipatif Minim Fasilitas",
            2: "Desa Fasilitas Ada tapi Tidak Aktif",
            3: "Desa Kesadaran Rendah tapi Ada Partisipasi Pemilahan Sampah",
        },
        13: {
            0: "Desa Pasif terhadap perubahan iklim namun memiliki sistem peringatan bencana.",
            1: "Desa Pasif terhadap perubahan iklim dan tidak memiliki sistem peringatan bencana.",
        },
        14: {
            0: "Desa Non-Pesisir",
            1: "Desa Pesisir dan ada pemanfaatan potensi laut",
        },
        15: {
            0: "Desa jauh dari hutan dan minim aktivitas konservasi; masyarakat belum terlibat dalam pelestarian lingkungan.",
            1: "Desa di luar hutan tapi memiliki kesadaran lingkungan dengan kegiatan penanaman pohon (walau risiko kebakaran rendah).",
            2: "Desa dekat kawasan hutan namun belum aktif berpartisipasi dalam upaya pelestarian hutan.",
            3: "Desa di tepi hutan dengan keterlibatan aktif masyarakat dalam kegiatan penghijauan dan pelestarian.",
        },
        16: {
            0: "Desa Adat Kuat & Aman",
            1: "Desa Aman Partisipatif",
        },
        17: {
            0: "Desa Mandiri Non-Kolaboratif",
            1: "Desa Kolaboratif Dasar",
        },
    }

    arti_map = arti_maps.get(int(sdg_number), {0: "Tertinggal", 1: "Menengah", 2: "Maju"})
    df["arti_cluster"] = df["cluster"].map(arti_map)

    # 🔹 Update hasil ke Supabase
    updated = supabase_update(sdg_number, df)

    # 🔹 Kembalikan hasil ke frontend
    result_data = df.to_dict(orient="records")

    return {
        "message": f"Clustering berhasil untuk SDG {sdg_number}",
        "count": updated,
        "results": result_data
    }

# 🚀 Jalankan backend
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=9000)

