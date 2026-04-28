import { useState, useEffect, useRef } from "react";
import { AREA_MAP } from "../lib/areas.js";

/** Score gauge visual */
function ScoreGauge({ score, color }) {
  const circumference = 2 * Math.PI * 38;
  const dash = (score / 100) * circumference;
  return (
    <svg width="90" height="90" viewBox="0 0 90 90" aria-hidden="true">
      <circle cx="45" cy="45" r="38" fill="none" stroke="var(--gris-cl)" strokeWidth="7" />
      <circle
        cx="45" cy="45" r="38" fill="none"
        stroke={color} strokeWidth="7"
        strokeDasharray={`${dash} ${circumference - dash}`}
        strokeLinecap="round"
        transform="rotate(-90 45 45)"
        style={{ transition: "stroke-dasharray 1s ease" }}
      />
      <text x="45" y="50" textAnchor="middle" fontSize="18" fontWeight="800" fill="var(--negro)" fontFamily="var(--font-display)">
        {score}
      </text>
    </svg>
  );
}

/** Confetti particle */
function spawnConfetti(container) {
  const colors = ["#1D9E75", "#185FA5", "#534AB7", "#BA7517", "#993C1D", "#3B6D11", "#7B2D61", "#FFD700", "#FF6B6B"];
  const shapes = ["circle", "rect", "triangle"];
  const count = 120;

  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    const color = colors[Math.floor(Math.random() * colors.length)];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    const size = Math.random() * 10 + 6;
    const startX = Math.random() * window.innerWidth;
    const duration = Math.random() * 2500 + 2000;
    const delay = Math.random() * 800;

    el.style.cssText = `
      position: fixed;
      top: -20px;
      left: ${startX}px;
      width: ${size}px;
      height: ${size}px;
      background: ${shape !== "triangle" ? color : "transparent"};
      border-radius: ${shape === "circle" ? "50%" : shape === "rect" ? "2px" : "0"};
      border-left: ${shape === "triangle" ? `${size / 2}px solid transparent` : "none"};
      border-right: ${shape === "triangle" ? `${size / 2}px solid transparent` : "none"};
      border-bottom: ${shape === "triangle" ? `${size}px solid ${color}` : "none"};
      pointer-events: none;
      z-index: 9999;
      opacity: 1;
      animation: confettiFall ${duration}ms ${delay}ms ease-in forwards;
    `;
    container.appendChild(el);
    setTimeout(() => el.remove(), duration + delay + 100);
  }
}

/** Individual area result block — no CTA, no score justification section */
function AreaResult({ areaId, areaScore, intel }) {
  const area = AREA_MAP[areaId];
  const { score, level } = areaScore;
  const hasIntel = !!intel;

  return (
    <div style={{ marginBottom: "2.5rem" }}>
      {/* Area header */}
      <div className="sec-title" style={{ "--color": area.color }}>
        <span style={{ background: area.bg, color: area.textColor, padding: ".25rem .75rem", borderRadius: "30px", fontSize: ".75rem", fontWeight: 700 }}>
          Área {area.index}
        </span>
        <span style={{ fontSize: "1rem", fontWeight: 700 }}>{area.label}</span>
      </div>

      {/* Score Card */}
      <div className="score-card">
        <div className="score-card-header">
          <div>
            <div className="score-card-title">{area.service}</div>
            <div className="level-badge" style={{ background: level.tagBg, color: level.tagColor }}>
              {level.label}
            </div>
          </div>
          <ScoreGauge score={score} color={area.color} />
        </div>

        {/* AI Headline */}
        {hasIntel && intel.headline && (
          <p style={{ fontSize: "1rem", fontStyle: "italic", color: "var(--negro)", marginBottom: ".75rem", lineHeight: 1.5 }}>
            "{intel.headline}"
          </p>
        )}

        {/* AI Score Justification */}
        {hasIntel && intel.scoreJustification && (
          <p style={{ fontSize: ".85rem", color: "var(--gris)", lineHeight: 1.7, borderTop: "1px solid var(--gris-cl)", paddingTop: ".75rem", marginTop: ".5rem" }}>
            {intel.scoreJustification}
          </p>
        )}

        <p style={{ fontSize: ".875rem", color: "var(--gris)", marginTop: ".875rem", lineHeight: 1.75 }}>
          {level.message}
        </p>
      </div>

      {/* Critical Point */}
      {hasIntel && intel.criticalPoint && (
        <div className="critical-card">
          <div className="critical-label">⚑ Punto crítico a evaluar</div>
          <div className="critical-title">{intel.criticalPoint.title}</div>
          <p className="critical-desc">{intel.criticalPoint.description}</p>
          <div className="critical-impact">{intel.criticalPoint.impact}</div>
        </div>
      )}

      {/* Checklist */}
      {hasIntel && intel.checklist && intel.checklist.length > 0 && (
        <div className="checklist-card">
          <h4>✓ Pasos concretos para avanzar</h4>
          {intel.checklist.map((item, idx) => (
            <div className="cl-item" key={idx}>
              <div className="cl-num">{idx + 1}</div>
              <div className="cl-content">
                <div className="cl-step">{item.step}</div>
                <div className="cl-detail">{item.detail}</div>
                <div className="cl-meta">
                  {item.resource && <span className="cl-resource">🟢 {item.resource}</span>}
                  {item.timeframe && <span className="cl-timeframe">⏱ {item.timeframe}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Loading overlay while AI processes */
function LoadingState({ selectedAreas }) {
  const [msgIdx, setMsgIdx] = useState(0);
  const messages = [
    "Analizando tus respuestas...",
    "Calculando tu nivel de despegue...",
    "Identificando puntos críticos...",
    "Generando recomendaciones personalizadas...",
    "Preparando tu diagnóstico...",
  ];

  useEffect(() => {
    const t = setInterval(() => setMsgIdx((i) => (i + 1) % messages.length), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="loading-state">
      <div className="spinner" />
      <p style={{ fontWeight: 700, fontSize: "1rem", color: "var(--negro)", marginBottom: ".5rem" }}>
        {messages[msgIdx]}
      </p>
      <p>
        Estamos procesando {selectedAreas.length} área{selectedAreas.length > 1 ? "s" : ""} con inteligencia real.
        <br />Esto puede tomar hasta 15 segundos.
      </p>
    </div>
  );
}

/** Global score summary */
function GlobalSummary({ globalScore, globalLevel, selectedAreas }) {
  return (
    <div className="results-hero">
      <div className="level-badge" style={{ background: globalLevel.tagBg, color: globalLevel.tagColor, fontSize: ".78rem" }}>
        {globalLevel.label} — Score Global
      </div>
      <h2>Tu diagnóstico WorkeaCheck™</h2>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1.5rem", margin: "1.5rem 0", flexWrap: "wrap" }}>
        <ScoreGauge score={globalScore} color="var(--verde)" />
        <div style={{ textAlign: "left" }}>
          <div style={{ fontSize: ".72rem", color: "var(--gris)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: ".25rem" }}>Puntuación Global</div>
          <div style={{ fontSize: "3.5rem", fontFamily: "var(--font-display)", lineHeight: 1, color: "var(--negro)", fontWeight: 400 }}>{globalScore}<span style={{ fontSize: "1.5rem", color: "var(--gris)" }}>/100</span></div>
        </div>
      </div>
      <p style={{ fontSize: ".9rem", color: "var(--gris)", maxWidth: "480px", margin: "0 auto", lineHeight: 1.8 }}>
        {globalLevel.message}
      </p>
      <div style={{ display: "flex", gap: ".5rem", justifyContent: "center", flexWrap: "wrap", marginTop: "1.25rem" }}>
        {selectedAreas.map((areaId) => {
          const area = AREA_MAP[areaId];
          return (
            <span key={areaId} style={{ background: area.bg, color: area.textColor, padding: ".25rem .75rem", borderRadius: "30px", fontSize: ".72rem", fontWeight: 600 }}>
              {area.service}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/** Single CTA for all areas */
function ConciergeCTA({ selectedAreas }) {
  const serviceList = selectedAreas
    .map((id) => AREA_MAP[id]?.service)
    .filter(Boolean)
    .join(", ");

  return (
    <div className="concierge-cta" style={{ marginBottom: "2rem" }}>
      <p>¿Listo para pasar al siguiente nivel?</p>
      <p>
        Nuestro equipo de Concierge Empresarial puede acompañarte a implementar las recomendaciones
        de {selectedAreas.length > 1 ? "todas tus áreas" : "tu área"} ({serviceList}) en semanas, no meses.
      </p>
      <a
        href="https://workeacenter.com/concierge"
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-primary"
        style={{ fontSize: ".87rem" }}
      >
        Agenda una sesión gratuita →
      </a>
    </div>
  );
}

/** Google Review CTA with confetti on viewport entry */
function GoogleCTA() {
  const ref = useRef(null);
  const confettiContainerRef = useRef(null);
  const firedRef = useRef(false);

  useEffect(() => {
    // Inject confetti keyframe animation once
    if (!document.getElementById("confetti-style")) {
      const style = document.createElement("style");
      style.id = "confetti-style";
      style.textContent = `
        @keyframes confettiFall {
          0%   { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg) scale(0.5); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    // Create a fixed container for confetti particles
    const container = document.createElement("div");
    container.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:hidden;";
    document.body.appendChild(container);
    confettiContainerRef.current = container;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !firedRef.current) {
          firedRef.current = true;
          spawnConfetti(container);
        }
      },
      { threshold: 0.4 }
    );

    if (ref.current) observer.observe(ref.current);

    return () => {
      observer.disconnect();
      container.remove();
    };
  }, []);

  return (
    <div className="google-cta" role="complementary" aria-label="Invitación a dejar reseña" ref={ref}>
      <span className="google-cta__stars" aria-hidden="true">⭐⭐⭐⭐⭐</span>
      <h3 className="google-cta__title">¿Te fue útil tu WorkeaCheck™?</h3>
      <p className="google-cta__desc">
        Ayúdanos a llegar a más personas como tú. Deja tu reseña en Google y recoge tu regalo
        en recepción. Solo toma 60 segundos.
      </p>
      <div className="google-cta__incentive">🎁 Recoge tu regalo en recepción</div>
      <br />
      <a
        href="https://g.page/r/workeacenter/review"
        target="_blank"
        rel="noopener noreferrer"
        className="google-cta__btn"
      >
        <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#4285F4", color: "#fff", fontSize: ".7rem", fontWeight: 900, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>G</span>
        Dejar mi reseña en Google
      </a>
      <p className="google-cta__note">Muestra esta pantalla en recepción para reclamar tu regalo.</p>
    </div>
  );
}

/** Main Results component */
export default function Step3Results({ results, selectedAreas, profile, onRestart }) {
  const { areaScores, globalScore, globalLevel, intelligence } = results;
  const [isLoading, setIsLoading] = useState(!intelligence || Object.keys(intelligence).length === 0);

  useEffect(() => {
    if (intelligence && Object.keys(intelligence).length > 0) setIsLoading(false);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [intelligence]);

  if (isLoading) return <div className="paso"><div className="w"><LoadingState selectedAreas={selectedAreas} /></div></div>;

  return (
    <section className="paso" aria-labelledby="h3-res">
      <div className="w">
        <GlobalSummary globalScore={globalScore} globalLevel={globalLevel} selectedAreas={selectedAreas} />

        <hr style={{ border: "none", borderTop: "1px solid var(--borde)", margin: "2rem 0" }} aria-hidden="true" />

        {/* Per-area results */}
        {selectedAreas.map((areaId) => (
          <AreaResult
            key={areaId}
            areaId={areaId}
            areaScore={areaScores[areaId]}
            intel={intelligence?.[areaId]}
          />
        ))}

        {/* Single Concierge CTA after all areas */}
        <ConciergeCTA selectedAreas={selectedAreas} />

        {/* Google Review CTA with confetti */}
        <GoogleCTA />

        {/* Restart */}
        <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
          <button className="btn btn-ghost" onClick={onRestart}>
            ← Hacer otro diagnóstico
          </button>
        </div>
      </div>
    </section>
  );
}
