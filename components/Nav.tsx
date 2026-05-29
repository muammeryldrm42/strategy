"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
<<<<<<< HEAD
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

=======

const links = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/library", label: "Kütüphane" },
  { href: "/demo", label: "Demo Trade" },
  { href: "/playground", label: "Kendi Kodun" },
];

export default function Nav() {
  const path = usePathname();
>>>>>>> 40b8debf6aee9c31feaea4d0f6fbe1f5b8d83814
  return (
    <nav className="nav">
      <div className="container nav-inner">
        <Link href="/" className="logo">TALONS<span>//LAB</span></Link>
<<<<<<< HEAD
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
=======
        <div className="nav-links">
          {links.map((l) => {
            const active = l.href === "/" ? path === "/" : path.startsWith(l.href);
            return (
              <Link key={l.href} href={l.href} className={`nav-link ${active ? "active" : ""}`}>
                {l.label}
              </Link>
            );
          })}
>>>>>>> 40b8debf6aee9c31feaea4d0f6fbe1f5b8d83814
        </div>
      </div>
    </nav>
  );
}
