import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// --- fungsi deteksi SDG yang ditanya
function detectTargetTables(question: string): number[] {
  const nums = Array.from(
    new Set(
      (question.match(/\b(1?[0-7]|[1-9])\b/g) || []).map((n) =>
        parseInt(n, 10)
      )
    )
  ).filter((n) => n >= 1 && n <= 17);

  return nums.length ? nums : Array.from({ length: 17 }, (_, i) => i + 1);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const question: string = (body?.q || body?.question || "").toString();

    if (!question.trim()) {
      return new Response(JSON.stringify({ error: "Question is required" }), { status: 400 });
    }

    const targets = detectTargetTables(question);
    const previews: Record<string, any[]> = {};

    const baseUrl = "http://localhost:3000";
    for (const n of targets) {
      try {
        const res = await fetch(`${baseUrl}/api/sdgs${n}`, { cache: "no-store" });
        if (!res.ok) continue;
        previews[`sdgs_${n}`] = await res.json();
      } catch {
        continue;
      }
    }

    const prompt = `
Anda adalah analis data profesional untuk dashboard SDGs desa.
Buat ringkasan insight berdasarkan pertanyaan pengguna dalam **bullet points** menggunakan tanda "-", profesional, ringkas, dan 100% akurat.

Pertanyaan pengguna: "${question}"

Data JSON:
${Object.entries(previews)
        .map(
          ([table, rows]) =>
            `${table}:\n${JSON.stringify((rows as any[]).slice(0, 8), null, 2)}`
        )
        .join("\n\n")}

Aturan penting:
1. Gunakan **satu poin per indikator atau perbedaan desa**.
2. Awali setiap poin dengan "- " (dash + spasi).
3. Jika seluruh desa memiliki nilai identik pada suatu indikator, tulis satu poin.
4. Jika ada desa berbeda, tulis poin terpisah untuk desa yang berbeda.
5. Maksimal 7–10 poin.
6. Jangan menambahkan interpretasi atau kategori baru di luar data JSON.
7. Gunakan **bold** untuk angka dan nama desa penting.
8. Di akhir, tutup dengan: "Apakah Anda ingin melihat analisis lebih detail untuk SDG tertentu?"

Tugas: tuliskan insight dalam bentuk bullet points yang bersih dan akurat.
`;

    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    return new Response(JSON.stringify({ answer, previews, used: targets }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || "Unknown error" }), { status: 500 });
  }
}

