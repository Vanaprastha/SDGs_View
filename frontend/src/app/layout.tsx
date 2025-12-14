import "./globals.css";
import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";

export const metadata: Metadata = {
  title: "Smart Dashboard SDGs Wates",
  description: "Monitoring SDGs, prediksi, clustering, dan chatbot.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning className="theme-light" style={{}}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* 🔥 Paksa Light theme tanpa membaca localStorage */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  try {
    var html = document.documentElement;
    html.classList.remove('theme-light','theme-dark');
    html.classList.add('theme-light'); // selalu Light
  } catch(e) {}
})();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-dashboard relative text-neutral-100">
        {/* Portal container for overlays - must be outside elements with backdrop-filter */}
        <div id="portal-root" className="fixed inset-0 pointer-events-none z-[9999]" style={{ isolation: 'isolate' }}></div>
        <div className="max-w-[1440px] mx-auto p-2 sm:p-4">
          <div className="flex flex-col md:flex-row gap-2 sm:gap-4 min-h-screen">
            <div className="md:hidden"><MobileNav /></div>
            <Sidebar />
            <main className="flex-1 glass-1 min-h-[70vh] md:h-screen overflow-y-auto p-3 sm:p-4 rounded-2xl relative">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
