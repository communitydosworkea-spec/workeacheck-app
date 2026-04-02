export default function StepIndicator({ current }) {
  const steps = [
    { n: 1, label: "Áreas" },
    { n: 2, label: "Diagnóstico" },
    { n: 3, label: "Resultados" },
  ];

  return (
    <nav className="step-ind" aria-label="Progreso del formulario">
      {steps.map((s, i) => (
        <div key={s.n} className="step-item">
          <div
            className={`step-dot ${current === s.n ? "active" : current > s.n ? "done" : ""}`}
            aria-current={current === s.n ? "step" : undefined}
          >
            {current > s.n ? "✓" : s.n}
          </div>
          <span className={`step-label ${current === s.n ? "active" : ""}`}>{s.label}</span>
          {i < steps.length - 1 && <div className="step-sep" aria-hidden="true" />}
        </div>
      ))}
    </nav>
  );
}
