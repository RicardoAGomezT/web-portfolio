"use client";

import { useEffect } from "react";

export function Nav() {
  useEffect(() => {
    // Restore saved theme
    try {
      const saved = localStorage.getItem("theme");
      if (saved) document.documentElement.dataset.theme = saved;
    } catch (_) {}
  }, []);

  function toggleTheme() {
    const root = document.documentElement;
    const isDark =
      root.dataset.theme === "dark" ||
      (!root.dataset.theme &&
        matchMedia("(prefers-color-scheme: dark)").matches);
    const next = isDark ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch (_) {}
  }

  return (
    <nav className="site-nav">
      <a className="nav-logo" href="#">
        <span className="nav-logo-mark">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </span>
        <span className="nav-logo-text">
          <span className="nav-logo-name">Ricardo Gómez</span>
          <span className="nav-logo-role">AI Engineer · AI DevOps</span>
        </span>
      </a>
      <ul className="nav-links">
        <li><a href="#stack">Sobre mí</a></li>
        <li><a href="#proyectos">Proyectos</a></li>
        <li><a href="#certificaciones">Certificaciones</a></li>
      </ul>
      <div className="nav-right">
        <button className="theme-btn" onClick={toggleTheme} aria-label="Cambiar tema">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        </button>
        <a className="btn-nav" href="mailto:ricardo.gomezt1108@hotmail.com">Contactar →</a>
      </div>
    </nav>
  );
}
