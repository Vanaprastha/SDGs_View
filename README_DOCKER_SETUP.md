# Panduan Deployment Docker untuk Proyek SDGS Dashboard

Proyek ini terdiri dari dua komponen utama:
1.  **Backend**: Python/FastAPI (Port 8000)
2.  **Frontend**: Next.js (Port 3000)

Deployment dilakukan menggunakan **Docker Compose** untuk mengorkestrasi kedua layanan.

## 1. Persiapan Variabel Lingkungan

Anda perlu membuat file `.env` di setiap folder (`backend` dan `frontend`) berdasarkan file `.env.example` yang sudah tersedia.

### A. Backend (`./backend/.env`)

Buat file `./backend/.env` dan isi dengan konfigurasi Anda:

\`\`\`
# Variabel Lingkungan untuk Backend (Python/FastAPI)

# Supabase Configuration
# Ganti dengan URL dan Service Role Key Supabase Anda
SUPABASE_URL=YOUR_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY

# Gemini API Key untuk fitur AI
GEMINI_API_KEY=YOUR_GEMINI_API_KEY

# Port aplikasi (Jangan diubah)
PORT=8000
\`\`\`

### B. Frontend (`./frontend/.env.local`)

Buat file `./frontend/.env.local` (sesuai konvensi Next.js) dan isi dengan konfigurasi Anda:

\`\`\`
# Variabel Lingkungan untuk Frontend (Next.js)

# URL Backend (Gunakan nama service Docker untuk komunikasi internal)
NEXT_PUBLIC_BACKEND_URL=http://sdgs_backend:8000

# Supabase Configuration (Public Key)
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

# Port aplikasi (Jangan diubah)
PORT=3000

# Password untuk fitur upload (jika ada)
UPLOAD_PASSWORD=YOUR_UPLOAD_PASSWORD
\`\`\`

## 2. Deployment di aaPanel

Asumsi: Anda sudah menginstal **Docker Manager** di aaPanel.

1.  **Unggah Proyek**: Unggah seluruh folder proyek ini ke server Anda (misalnya di `/root/sdgs-project/`).
2.  **Akses Terminal**: Buka Terminal di aaPanel atau SSH ke server.
3.  **Navigasi**: Masuk ke direktori proyek:
    \`\`\`bash
    cd /root/sdgs-project/
    \`\`\`
4.  **Jalankan Docker Compose**: Jalankan perintah berikut untuk membangun image dan menjalankan container di latar belakang:
    \`\`\`bash
    docker compose up -d --build
    \`\`\`
5.  **Verifikasi**: Pastikan kedua container berjalan:
    \`\`\`bash
    docker ps
    \`\`\`

## 3. Konfigurasi Reverse Proxy (aaPanel)

Aplikasi frontend berjalan di port **3000** di dalam Docker. Anda perlu mengarahkan domain Anda ke port ini.

1.  **Buat Situs Web**: Di aaPanel, buat situs web baru (misalnya `sdgs.domainanda.com`).
2.  **Konfigurasi Reverse Proxy**:
    *   Masuk ke pengaturan situs web.
    *   Pilih menu **Reverse Proxy**.
    *   **Proxy Name**: `SDGS Frontend`
    *   **Target URL**: `http://127.0.0.1:3000`
    *   Klik **Submit**.

Sekarang, aplikasi Anda dapat diakses melalui domain yang Anda atur di aaPanel.
\`\`\`
