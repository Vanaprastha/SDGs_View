import { createClient } from "@supabase/supabase-js";

// Pastikan variabel lingkungan sudah diatur
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

// Gunakan pola Singleton untuk memastikan hanya satu instance client yang dibuat
// di sisi server (API Routes).
// Catatan: Untuk Next.js App Router, createClient di API Routes biasanya tidak menyebabkan
// masalah GoTrueClient karena setiap request adalah environment baru,
// tetapi konsolidasi ini adalah praktik terbaik.
export const supabase = createClient(supabaseUrl, supabaseKey);
