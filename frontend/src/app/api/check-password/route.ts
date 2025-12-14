import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const password = String(body?.password || "");
    if (!password) {
      return NextResponse.json({ ok: false, error: "Password kosong." }, { status: 400 });
    }
    if (password === process.env.UPLOAD_PASSWORD) {
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ ok: false, error: "Sandi salah." }, { status: 401 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Terjadi kesalahan." }, { status: 500 });
  }
}