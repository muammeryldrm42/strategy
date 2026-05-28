import Link from "next/link";
import { STRATEGIES, CATEGORY_LABELS, byCategory } from "@/lib/registry";

export default function Home() {
  const cats = ["smc", "indicators", "memecoin"] as const;
  return (
    <main className="container" style={{ paddingTop: 64, paddingBottom: 48 }}>
      <section className="fade-up" style={{ textAlign: "center", padding: "48px 0 64px" }}>
        <div className="mono" style={{ color: "var(--green)", fontSize: 13, letterSpacing: "0.3em", marginBottom: 16 }}>
          // 22 STRATEJI · 3 DİL · DEMO TRADE
        </div>
        <h1 className="display" style={{ fontSize: "clamp(36px, 6vw, 68px)", lineHeight: 1.05, marginBottom: 20 }}>
          STRATEGY <span style={{ color: "var(--green)", textShadow: "var(--shadow-green)" }}>LAB</span>
        </h1>
        <p style={{ color: "var(--text-dim)", fontSize: 18, maxWidth: 620, margin: "0 auto 36px", lineHeight: 1.6 }}>
          SMC, klasik indikatör ve memecoin trading stratejilerini incele, kodlarını al, $1000 demo bakiye ile canlı fiyatlar üzerinde test et. İstersen kendi stratejini kod olarak yaz.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/demo" className="btn btn-primary">⚡ Demo Trade Başlat</Link>
          <Link href="/library" className="btn">📚 Stratejileri Gör</Link>
          <Link href="/playground" className="btn btn-ghost">{"</>"} Kendi Kodun</Link>
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 48 }}>
        {[
          { t: "Kütüphane", d: "22 strateji, her biri Python + TypeScript + Pine Script kodu ile. Detaylı giriş/çıkış kuralları.", h: "/library", c: "var(--cyan)" },
          { t: "Demo Trade", d: "Strateji seç, canlı Binance fiyatlarıyla otomatik demo işlem. P&L takibi, $1000 başlangıç.", h: "/demo", c: "var(--green)" },
          { t: "Playground", d: "Kendi strateji mantığını JS olarak yaz, sandbox'ta çalıştır, demo trade yap.", h: "/playground", c: "var(--purple)" },
        ].map((x) => (
          <Link key={x.t} href={x.h} className="panel" style={{ padding: 24, transition: "all .15s", display: "block" }}>
            <div className="display" style={{ fontSize: 20, color: x.c, marginBottom: 10 }}>{x.t}</div>
            <p style={{ color: "var(--text-dim)", fontSize: 14, lineHeight: 1.6 }}>{x.d}</p>
          </Link>
        ))}
      </section>

      <section>
        <div className="display" style={{ fontSize: 24, marginBottom: 8 }}>STRATEJİLER</div>
        <p className="mono" style={{ color: "var(--text-faint)", fontSize: 13, marginBottom: 24 }}>{STRATEGIES.length} strateji · 3 kategori</p>
        {cats.map((cat) => (
          <div key={cat} style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: 15, color: "var(--text-dim)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              <span className={`tag tag-${cat}`}>{CATEGORY_LABELS[cat]}</span>
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
              {byCategory(cat).map((s) => (
                <Link key={s.id} href={`/library#${s.id}`} className="panel" style={{ padding: 16, display: "block", transition: "all .15s" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{s.name}</span>
                    {s.run ? <span className="mono long" style={{ fontSize: 10 }}>● DEMO</span> : <span className="mono" style={{ fontSize: 10, color: "var(--text-faint)" }}>OFF-CHAIN</span>}
                  </div>
                  <p style={{ color: "var(--text-dim)", fontSize: 13, lineHeight: 1.5 }}>{s.short}</p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
