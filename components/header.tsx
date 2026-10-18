"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
const links = [
  ["/", "HOME"],
  ["/projects", "Personal Project"],
  ["/current", "Current Project"],
  ["/about", "About Me"],
];
export default function Header() {
  const path = usePathname();
  const [dark, setDark] = useState(false);
  useEffect(
    () => setDark(document.documentElement.dataset.theme === "dark"),
    [],
  );
  function toggle() {
    const d = !dark;
    setDark(d);
    document.documentElement.dataset.theme = d ? "dark" : "light";
    try {
      localStorage.setItem("portfolio-theme", d ? "dark" : "light");
    } catch {}
  }
  return (
    <>
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/">
          Portfolio<span>.</span>
        </Link>
        <nav aria-label="주 메뉴">
          {links.map(([url, label]) => (
            <Link
              key={url}
              href={url}
              aria-current={path === url ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
        <button
          className="icon-button theme-toggle"
          onClick={toggle}
          aria-label={dark ? "라이트모드로 전환" : "다크모드로 전환"}
        >
          {dark ? <Sun size={19} /> : <Moon size={19} />}
        </button>
    </>
  );
}
