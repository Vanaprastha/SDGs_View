# SDGs Dashboard Final (Glass + SDG Colors + Team)

- Next.js 15 + React 18 + Tailwind v4 + Recharts
- Sidebar & Main equal height (`h-screen`)
- Background foto: `public/assets/background.webp` + overlay gelap
- SDG cards berwarna, Tentang berisi 4 foto tim & keunggulan

## Jalankan
```bash
npm i
npm run dev
```

Ganti logo di `public/logo-pemda.png` dan foto tim di `public/assets/team/*.webp`.


## Fitur Baru: Penggaturan (Tema & Background)

- **Tema**: Ganti antara *Dark* dan *Light*. Tersimpan otomatis di `localStorage` (`sdgs_theme`).
- **Background**: Pakai default, pilih contoh online, atau **upload gambar sendiri**. Disimpan di `localStorage` (`sdgs_bg`) dan diterapkan lewat CSS variable `--bg-url`.

### Cara Kerja Singkat
- `src/app/layout.tsx` menyuntikkan script kecil di `<head>` untuk membaca preferensi sebelum render, mencegah FOUC.
- `src/app/globals.css` pakai CSS variables untuk `glass-*`, warna teks, overlay, dan `--bg-url`.
- Halaman baru: `src/app/penggaturan/page.tsx`.


### Perubahan MobileNav
- Tambah item **Penggaturan**
- Jadikan bar navigasi sticky (top-0, z-30), dapat di-scroll horizontal (overflow-x-auto, no-scrollbar)
