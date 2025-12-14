export async function GET(request: Request): Promise<Response> {
  const MAX_RETRY = 3;
  let attempt = 0;

  // Use localhost for internal API calls (avoid cyclical routing through Cloudflare)
  const base = `http://localhost:3000`;

  // Fetch strict: langsung error kalau gagal
  const fetchStrict = async (path: string) => {
    const res = await fetch(`${base}/api/${path}`, { cache: "no-store" });

    if (!res.ok) {
      throw new Error(`Failed to load ${path} - status ${res.status}`);
    }

    return res.json();
  };

  // Daftar endpoint SDG 1–17
  const routes = Array.from({ length: 17 }, (_, i) => `sdg-success-${i + 1}`);

  while (attempt < MAX_RETRY) {
    attempt++;

    try {
      console.log(`🔄 Attempt ${attempt} - fetching SDG success serially...`);

      const results: any[] = [];

      // -------------- SERIAL LOOP (lebih stabil untuk server) --------------
      for (const route of routes) {
        console.log(`➡️ Fetching: ${route} ...`);

        const data = await fetchStrict(route);
        results.push(data);

        // delay kecil 100ms antar request (opsional, bisa dihapus)
        await new Promise((r) => setTimeout(r, 100));
      }
      // -------------------------------------------------------------------

      console.log("✅ All SDGs fetched successfully in serial mode!");
      return new Response(JSON.stringify(results), { status: 200 });

    } catch (e: any) {
      console.error(`❌ Attempt ${attempt} failed: ${e.message}`);

      // tunggu 300ms sebelum retry ulang semua
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  // Jika gagal 3x = error final
  return new Response(
    JSON.stringify({
      error: "Failed fetching SDG endpoints after multiple retries (serial)",
    }),
    { status: 500 }
  );
}
