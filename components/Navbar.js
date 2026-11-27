"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Tasks", href: "/tasks" },
  { label: "People", href: "/people" },
  { label: "Library", href: "/library" },
  { label: "About", href: "/about" },
];

function BrandHeader() {
  return (
    <div className="d-flex align-items-center gap-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </svg>
      <span className="fw-semibold">Workspace</span>
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* Mobile top bar (< md) */}
      <div className="d-md-none border-bottom bg-light px-3 py-2">
        <div className="d-flex align-items-center justify-content-between">
          <Link href="/" className="text-decoration-none text-dark">
            <BrandHeader />
          </Link>

          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation"
          >
            Menu
          </button>
        </div>

        {mobileOpen && (
          <aside className="mt-2 pt-2 border-top">
            <nav
              aria-label="Mobile navigation"
              className="nav flex-column gap-1"
            >
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`nav-link px-2 py-1 rounded ${
                    isActive(item.href)
                      ? "active bg-primary text-white fw-semibold"
                      : "text-dark"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
        )}
      </div>

      {/* Desktop sidebar (>= md) */}
      <aside
        className="d-none d-md-flex flex-column border-end bg-light p-3"
        style={{ width: "230px", minHeight: "100vh", flexShrink: 0 }}
      >
        <div className="pb-3 mb-3 border-bottom">
          <Link href="/" className="text-decoration-none text-dark">
            <BrandHeader />
          </Link>
        </div>

        <nav aria-label="Main navigation" className="nav flex-column gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link px-3 py-2 rounded ${
                isActive(item.href)
                  ? "active bg-primary text-white fw-semibold"
                  : "text-dark"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
