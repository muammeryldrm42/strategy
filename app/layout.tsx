import "./globals.css";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
<<<<<<< HEAD
import { I18nProvider } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Talons Strategy Lab",
  description: "Trading strategy library + demo trade platform. SMC, indicators, memecoin, scalping & mean-reversion strategies.",
=======

export const metadata: Metadata = {
  title: "Talons Strategy Lab",
  description: "Trading strateji kütüphanesi + demo trade platformu. SMC, indikatör ve memecoin stratejileri.",
>>>>>>> 40b8debf6aee9c31feaea4d0f6fbe1f5b8d83814
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
<<<<<<< HEAD
    <html lang="en">
      <body>
        <I18nProvider>
          <Nav />
          {children}
          <Footer />
        </I18nProvider>
=======
    <html lang="tr">
      <body>
        <Nav />
        {children}
        <footer className="container" style={{ padding: "48px 24px", color: "var(--text-faint)", fontSize: 13, borderTop: "1px solid var(--border)", marginTop: 64 }}>
          <p className="mono">TALONS PROTOCOL · Strategy Lab · Demo amaçlıdır, finansal tavsiye değildir.</p>
        </footer>
>>>>>>> 40b8debf6aee9c31feaea4d0f6fbe1f5b8d83814
      </body>
    </html>
  );
}
<<<<<<< HEAD

function Footer() {
  return (
    <footer className="container" style={{ padding: "48px 24px", color: "var(--text-faint)", fontSize: 13, borderTop: "1px solid var(--border)", marginTop: 64 }}>
      <p className="mono">TALONS PROTOCOL · Strategy Lab · For demo purposes only, not financial advice.</p>
    </footer>
  );
}
=======
>>>>>>> 40b8debf6aee9c31feaea4d0f6fbe1f5b8d83814
