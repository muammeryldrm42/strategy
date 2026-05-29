"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/lib/i18n";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Nav() {
  const path = usePathname();
  const { t } = useT();

  const links = [
    { href: "/library", key: "nav.library" },
    { href: "/demo", key: "nav.demo" },
    { href: "/playground", key: "nav.playground" },
  ];

  return (
    <nav className="nav">
      <div className="container nav-inner">
        <Link href="/" className="logo">TALONS<span>//LAB</span></Link>
        <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {links.map((l) => {
            const active = path.startsWith(l.href);
            return (
              <Link key={l.href} href={l.href} className={`nav-link ${active ? "active" : ""}`}>
                {t(l.key)}
              </Link>
            );
          })}
          <div style={{ marginLeft: 6 }}>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </nav>
  );
}
