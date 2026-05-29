import "./globals.css";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import { I18nProvider } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Talons Strategy Lab",
  description: "Trading strategy library + demo trade platform. SMC, indicators, memecoin, scalping & mean-reversion strategies.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <I18nProvider>
          <Nav />
          {children}
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}

function Footer() {
  return (
    <footer className="container" style={{ padding: "48px 24px", color: "var(--text-faint)", fontSize: 13, borderTop: "1px solid var(--border)", marginTop: 64 }}>
      <p className="mono">TALONS PROTOCOL · Strategy Lab · For demo purposes only, not financial advice.</p>
    </footer>
  );
}
