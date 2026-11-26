"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const user = sessionStorage.getItem("user");
    setIsLoggedIn(Boolean(token || user));
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setIsLoggedIn(false);
  };

  return (
    <header className="border-bottom bg-light py-2 px-3">
      <nav className="d-flex flex-wrap justify-content-between align-items-center gap-3">
        {/* Logo + Brand */}
        <Link
          href="/"
          className="d-flex align-items-center gap-2 text-decoration-none text-dark fw-bold"
        >
          <Image
            src="/next.svg"
            alt="Workspace Logo"
            width={72}
            height={18}
            priority
          />
          <span>Dashboard</span>
        </Link>

        {/* Page Links in a Flex Row */}
        <div className="d-flex flex-wrap align-items-center gap-3">
          <Link href="/" className="text-decoration-none text-dark">
            Dashboard
          </Link>
          <Link href="/projects" className="text-decoration-none text-dark">
            Projects
          </Link>
          <Link href="/tasks" className="text-decoration-none text-dark">
            Tasks
          </Link>
          <Link href="/users" className="text-decoration-none text-dark">
            Users
          </Link>
          <Link href="/library" className="text-decoration-none text-dark">
            Library
          </Link>
          <Link href="/about" className="text-decoration-none text-dark">
            About
          </Link>
        </div>

        {/* Login / Session Status with Icon using Ternary */}
        <div className="d-flex align-items-center gap-2">
          {isLoggedIn ? (
            <>
              <span className="badge text-bg-success d-flex align-items-center gap-1">
                <span>&#128100;</span>
                <span>Logged In</span>
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-outline-danger btn-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="btn btn-primary btn-sm d-flex align-items-center gap-1"
            >
              <span>&#128273;</span>
              <span>Login</span>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
