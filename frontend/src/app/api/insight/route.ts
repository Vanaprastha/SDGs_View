import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sdg = parseInt(searchParams.get("sdg") || "0", 10);

    if (!sdg || sdg < 1 || sdg > 17) {
      return new Response(
        JSON.stringify({ error: "Invalid or missing sdg parameter (1–17)" }),
        { status: 400 }
      );
    }

    // Ambil data SDG dari endpoint /api/sdgsX (gunakan localhost untuk internal request)
    // Ini menghindari circular request melalui Cloudflare Tunnel
    const dataUrl = `http://localhost:3000/api/sdgs${sdg}`;

    const resSDG = await fetch(dataUrl, { cache: "no-store" });

    if (!resSDG.ok) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch data from ${dataUrl}` }),
        { status: 500 }
      );
    }

    const sdgData = await resSDG.json();

    // 🔐 Prompt untuk menghasilkan bullet points
    const prompt = `
Anda adalah analis data profesional. Buat ringkasan insight SDG ${sdg} 
dalam **bullet points** menggunakan tanda "-", profesional, ringkas, dan 100% akurat
berdasarkan JSON berikut. Jangan menambahkan, mengubah, atau menafsirkan data di luar JSON.

Data JSON:
${JSON.stringify(sdgData, null, 2)}

Aturan penting:
1. Gunakan **satu poin per indikator atau perbedaan desa**.
2. Jika seluruh desa memiliki nilai identik pada suatu indikator, tulis satu poin.
3. Jika ada desa berbeda, tulis poin terpisah untuk desa yang berbeda.
4. Maksimal 7–10 poin.
5. Jangan menambahkan interpretasi atau kategori baru di luar data JSON.

Tugas: tuliskan insight dalam bentuk bullet points yang bersih dan akurat.
`;

    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    return new Response(JSON.stringify({ insight: answer }), { status: 200 });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}

