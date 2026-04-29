import { useMemo, useState } from "react";
import { AREAS, AREA_MAP, SECTORS, TENURE_OPTIONS, TEAM_OPTIONS, MARKET_OPTIONS } from "../lib/areas.js";
import { QUESTIONS } from "../lib/questions.js";
import { scoreAll } from "../lib/scoring.js";
import { persistSubmission } from "../lib/intelligence.js";

/** Scale question input */
function ScaleQuestion({ question, value, onChange }) {
  return (
    <div className="preg">
      <span className="q-code">{question.code}</span>
      <div className="scale-wrap">
        <span className="scale-label">{question.min}</span>
        <div className="scale-dots" role="group" aria-label={`Escala: ${question.text}`}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              className={`scale-dot-btn${value === String(n) ? " selected" : ""}`}
              onClick={() => onChange(question.id, String(n))}
              aria-label={`${n} de 5`}
              aria-pressed={value === String(n)}
            >
              {n}
            </button>
          ))}
        </div>
        <span className="scale-label scale-label-r">{question.max}</span>
      </div>
      <p className="q-text" style={{ marginTop: ".5rem", marginBottom: 0 }}>{question.text}</p>
    </div>
  );
}

/** Radio list question */
function RadioQuestion({ question, value, onChange }) {
  return (
    <div className="preg">
      <span className="q-code">{question.code}</span>
      <span className="q-text">{question.text}</span>
      <ul className="op-list" role="radiogroup" aria-label={question.text}>
        {question.options.map((opt) => (
          <li key={opt.value}>
            <label className={`op-item${value === opt.value ? " selected" : ""}`}>
              <input
                type="radio"
                name={question.id}
                value={opt.value}
                checked={value === opt.value}
                onChange={() => onChange(question.id, opt.value)}
              />
              {opt.label}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Progress calculator */
function useProgress(selectedAreas, answers, profile) {
  return useMemo(() => {
    const totalQ = selectedAreas.reduce((s, a) => s + (QUESTIONS[a]?.length ?? 0), 0) + 4; // +4 profile
    let answered = 0;
    if (profile.sector) answered++;
    if (profile.tenure) answered++;
    if (profile.team) answered++;
    if (profile.market) answered++;
    for (const areaId of selectedAreas) {
      for (const q of QUESTIONS[areaId] ?? []) {
        if (answers[q.id]) answered++;
      }
    }
    return { answered, total: totalQ, pct: Math.round((answered / Math.max(totalQ, 1)) * 100) };
  }, [selectedAreas, answers, profile]);
}

export default function Step2Questions({
  selectedAreas, profile, answers,
  onProfileChange, onAnswerChange, onBack, onResultsReady,
}) {
  const { answered, total, pct } = useProgress(selectedAreas, answers, profile);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    console.log("[WorkeaCheck] handleSubmit called");
    e?.preventDefault();
    
    setIsSubmitting(true);

    try {
      // 1. Calculate scores synchronously
      console.log("[WorkeaCheck] Calculating scores...");
      const { areaScores, globalScore, globalLevel } = scoreAll(selectedAreas, answers);
      console.log("[WorkeaCheck] Scores calculated:", { globalScore, globalLevel });

      // 2. Persist submission (always save)
      console.log("[WorkeaCheck] About to persist submission...");
      await persistSubmission({ selectedAreas, profile, answers, areaScores, globalScore, globalLevel });
      console.log("[WorkeaCheck] Submission persisted");

      // 3. Hand results up to App (no AI intelligence)
      onResultsReady({ areaScores, globalScore, globalLevel, intelligence: {} });
    } catch (err) {
      console.error("[WorkeaCheck] Error in handleSubmit:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="paso" aria-labelledby="h2-preg">
      <div className="w">
        <h2 id="h2-preg" style={{ fontSize: "1.7rem", fontWeight: 700, letterSpacing: "-.025em", marginBottom: ".35rem" }}>
          Tu diagnóstico empresarial
        </h2>
        <p style={{ fontSize: ".9rem", color: "var(--gris)", lineHeight: 1.7, marginBottom: "1.75rem" }}>
          Responde con honestidad — cuanto más preciso seas, más útil será tu resultado.
        </p>

        <form onSubmit={handleSubmit} noValidate>

          {/* PROFILE BLOCK */}
          <div className="block-card">
            <div className="block-card-header" style={{ background: "var(--gris-cl)" }}>
              <div className="block-icon" style={{ background: "var(--gris)" }}>👤</div>
              <div>
                <div className="block-title">Tu perfil empresarial</div>
                <div className="block-sub" style={{ color: "var(--gris)" }}>Perfil · 4 preguntas</div>
              </div>
            </div>
            <div className="block-body">

              <div className="preg">
                <label htmlFor="sec">
                  <span className="q-code">Perfil · 1</span>
                  <span className="q-text">¿En qué sector opera tu empresa?</span>
                </label>
                <select id="sec" className="sel" value={profile.sector} onChange={(e) => onProfileChange("sector", e.target.value)} required>
                  <option value="" disabled>Selecciona tu sector...</option>
                  {SECTORS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>

              <div className="preg">
                <span className="q-code">Perfil · 2</span>
                <span className="q-text">¿Cuánto tiempo lleva operando tu empresa?</span>
                <div className="pill-row">
                  {TENURE_OPTIONS.map((o) => (
                    <button key={o.value} type="button" className={`pill${profile.tenure === o.value ? " selected" : ""}`} onClick={() => onProfileChange("tenure", o.value)}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="preg">
                <span className="q-code">Perfil · 3</span>
                <span className="q-text">¿Cuántas personas trabajan en tu empresa?</span>
                <div className="pill-row">
                  {TEAM_OPTIONS.map((o) => (
                    <button key={o.value} type="button" className={`pill${profile.team === o.value ? " selected" : ""}`} onClick={() => onProfileChange("team", o.value)}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="preg" style={{ borderBottom: "none" }}>
                <span className="q-code">Perfil · 4</span>
                <span className="q-text">¿Cuál es tu mercado objetivo principal?</span>
                <div className="pill-row">
                  {MARKET_OPTIONS.map((o) => (
                    <button key={o.value} type="button" className={`pill${profile.market === o.value ? " selected" : ""}`} onClick={() => onProfileChange("market", o.value)}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* AREA BLOCKS */}
          {selectedAreas.map((areaId, idx) => {
            const area = AREA_MAP[areaId];
            const qs = QUESTIONS[areaId] ?? [];
            return (
              <div key={areaId} className="block-card" style={{ "--area-color": area.color }}>
                <div className="block-card-header" style={{ background: area.bg }}>
                  <div className="block-icon" style={{ background: area.color }}>{area.icon}</div>
                  <div>
                    <div className="block-title">{area.label}</div>
                    <div className="block-sub" style={{ color: area.textColor }}>
                      Área {area.index} · {area.service} · {qs.length} preguntas
                    </div>
                  </div>
                </div>
                <div className="block-body">
                  {qs.map((q) =>
                    q.type === "scale" ? (
                      <ScaleQuestion key={q.id} question={q} value={answers[q.id] ?? ""} onChange={onAnswerChange} />
                    ) : (
                      <RadioQuestion key={q.id} question={q} value={answers[q.id] ?? ""} onChange={onAnswerChange} />
                    )
                  )}
                </div>
              </div>
            );
          })}

          <p className="priv-note">
            Tus respuestas son 100% anónimas · No almacenamos nombre, correo ni teléfono
          </p>

          <div className="acc">
            <button type="button" className="btn btn-ghost" onClick={onBack} disabled={isSubmitting}>← Cambiar áreas</button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isSubmitting}
              style={{ minWidth: "200px" }}
            >
              {isSubmitting ? (
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className="spinner" style={{ 
                    display: "inline-block", 
                    width: "16px", 
                    height: "16px", 
                    border: "2px solid rgba(255,255,255,0.3)", 
                    borderTopColor: "#fff", 
                    borderRadius: "50%", 
                    animation: "spin 1s linear infinite" 
                  }}></span>
                  Cargando...
                </span>
              ) : (
                "Ver mi diagnóstico →"
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
