import "./globals.css";
import type { Metadata } from "next";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Talons Strategy Lab",
  description: "Trading strateji kütüphanesi + demo trade platformu. SMC, indikatör ve memecoin stratejileri.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <Nav />
        {children}
        <footer className="container" style={{ padding: "48px 24px", color: "var(--text-faint)", fontSize: 13, borderTop: "1px solid var(--border)", marginTop: 64 }}>
          <p className="mono">TALONS PROTOCOL · Strategy Lab · Demo amaçlıdır, finansal tavsiye değildir.</p>
        </footer>
      </body>
    </html>
  );
}
