export default function Header() {
  return (
    <header className="cab" role="banner">
      <a href="/" className="cab__logo" aria-label="WorkeaCenter — inicio">
        <span className="cab__wordmark">
          Workea<span>Center</span>
        </span>
        <span style={{ color: "var(--borde)", margin: "0 .1rem" }} aria-hidden="true">·</span>
        <span className="cab__badge">WorkeaCheck™</span>
      </a>
      <p className="cab__time">≈ 5–8 min</p>
    </header>
  );
}
