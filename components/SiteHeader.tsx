import ThemeToggle from "./ThemeToggle";

export default function SiteHeader() {
  return (
    <header className="top">
      <div className="brand">
        <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
          <circle cx="15" cy="15" r="13" fill="none" stroke="var(--accent)" strokeWidth="2.4" />
          <path d="M15 6.5 L18 15 L15 23.5 L12 15 Z" fill="var(--accent)" />
          <circle cx="15" cy="15" r="2.2" fill="var(--paper)" />
        </svg>
        <span className="brand-name">Rumbo</span>
      </div>
      <div className="top-right">
        <span className="eyebrow hide-on-narrow">Modelo RIASEC · Holland</span>
        <ThemeToggle />
      </div>
    </header>
  );
}
