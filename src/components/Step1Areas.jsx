import { AREAS } from "../lib/areas.js";

export default function Step1Areas({ selectedAreas, onToggle, onNext }) {
  const maxReached = selectedAreas.length >= 3;

  return (
    <section className="paso" aria-labelledby="h1-ini">
      <div className="w">
        <header className="hero">
          <p className="hero__eyebrow">Exclusivo para Workeros · Ciudad de Panamá</p>
          <h1 id="h1-ini" className="hero__h">
            Workea<span>Check™</span>
          </h1>
          <p className="hero__sl">"Tu chequeo de despegue empresarial"</p>
          <p className="hero__d">
            En menos de 8 minutos descubre el estado real de tu empresa. El diagnóstico está
            basado exactamente en tus respuestas — sin plantillas genéricas.
          </p>
          <ul className="chips">
            <li className="chip">100% gratuito</li>
            <li className="chip">Resultados inmediatos</li>
            <li className="chip">Sin registro</li>
            <li className="chip">Datos anónimos</li>
          </ul>
        </header>

        <div className="nota" role="note">
          <p>
            <strong>¿Cómo funciona?</strong> Elige entre 1 y 3 áreas. Solo verás las preguntas y
            el diagnóstico de lo que seleccionaste — nada más.
          </p>
        </div>

        {maxReached && (
          <div className="nota" role="status" style={{ borderColor: "#BA7517", background: "#FEF3DC" }}>
            <p style={{ color: "#854F0B" }}>
              <strong>Máximo 3 áreas.</strong> Deselecciona una para elegir otra diferente.
            </p>
          </div>
        )}

        <fieldset style={{ border: "none", marginBottom: "1.5rem" }}>
          <legend style={{ fontSize: "1rem", fontWeight: 600, color: "var(--negro)", marginBottom: "1.125rem", width: "100%" }}>
            ¿Qué quieres chequear en tu empresa hoy?{" "}
            <span style={{ fontWeight: 400, color: "var(--gris)", fontSize: ".88rem" }}>
              ({selectedAreas.length}/3 seleccionadas)
            </span>
          </legend>

          <div className="area-grid">
            {AREAS.map((area) => {
              const isSel = selectedAreas.includes(area.id);
              const isMaxed = maxReached && !isSel;
              return (
                <label
                  key={area.id}
                  className={`area-card${isSel ? " selected" : ""}${isMaxed ? " maxed" : ""}`}
                  style={{
                    "--ac": area.color,
                    "--ac-bg": area.bg,
                    cursor: isMaxed ? "not-allowed" : "pointer",
                  }}
                  onClick={() => !isMaxed && onToggle(area.id)}
                >
                  <input
                    type="checkbox"
                    checked={isSel}
                    onChange={() => !isMaxed && onToggle(area.id)}
                    aria-label={area.label}
                    style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
                  />
                  <div className="area-check">{isSel ? "✓" : ""}</div>
                  <span className="area-num" aria-hidden="true">Área {area.index}</span>
                  <span className="area-title">{area.label}</span>
                  <span className="area-desc">{area.description}</span>
                  <span
                    className="area-badge"
                    style={{ background: area.bg, color: area.textColor }}
                  >
                    {area.service}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <p className="priv-note">
          Respuestas 100% anónimas · Sin nombre ni correo · Solo para mejorar los servicios de WorkeaCenter
        </p>

        <div className="acc">
          <button
            className="btn btn-primary"
            onClick={onNext}
            disabled={selectedAreas.length === 0}
            aria-disabled={selectedAreas.length === 0}
          >
            Iniciar mi diagnóstico →
          </button>
        </div>
      </div>
    </section>
  );
}
