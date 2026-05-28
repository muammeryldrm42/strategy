"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/library", label: "Kütüphane" },
  { href: "/demo", label: "Demo Trade" },
  { href: "/playground", label: "Kendi Kodun" },
];

export default function Nav() {
  const path = usePathname();
  return (
    <nav className="nav">
      <div className="container nav-inner">
        <Link href="/" className="logo">TALONS<span>//LAB</span></Link>
        <div className="nav-links">
          {links.map((l) => {
            const active = l.href === "/" ? path === "/" : path.startsWith(l.href);
            return (
              <Link key={l.href} href={l.href} className={`nav-link ${active ? "active" : ""}`}>
                {l.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
