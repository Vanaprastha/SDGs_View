# 🌱 SDGs Interactive Clustering System (Versi Full Safe)

```mermaid
graph TD
  A[👩‍💻 User pilih SDG di Web (Next.js)] --> B[📄 Fetch tabel dari Supabase]
  B --> C[✏️ Edit indikator di tabel]
  C --> D[🚀 Klik tombol "Clustering"]
  D --> E[📡 FastAPI (port 9000) menerima JSON data]
  E --> F[🧠 Model .pickle melakukan clustering]
  F --> G[📤 Update cluster & arti_cluster ke Supabase]
  G --> H[📊 Frontend auto-refresh tampilkan hasil baru]
```

## Konfigurasi Frontend
Buat file `.env.local` di folder `frontend/` berisi:

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:9000
```
