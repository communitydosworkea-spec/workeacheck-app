/**
 * WorkeaCheck™ — Intelligence Layer
 *
 * Calls the Anthropic API to generate deeply personalized, actionable
 * diagnoses for each evaluated area. The AI receives structured context
 * (score, breakdown, profile, area) and returns three mandatory elements:
 *
 *   1. scoreJustification  — Why this score was assigned (narrative)
 *   2. criticalPoint       — The single most important issue to address
 *   3. checklist           — 3–5 concrete, actionable steps
 *
 * INTEGRATION NOTES:
 * ─────────────────────────────────────────────────────────────────────
 * • Uses `fetch` against the Anthropic /v1/messages endpoint.
 * • API key is injected at build time via VITE_ANTHROPIC_API_KEY (.env).
 *   Never commit a real key. For production, proxy through a backend.
 * • All calls are wrapped in `generateAreaIntelligence()` which returns
 *   a structured `AreaIntelligence` object.
 *
 * SUPABASE NOTE (future phase):
 * ─────────────────────────────────────────────────────────────────────
 * Once Supabase is integrated, call `persistSubmission()` (stub below)
 * AFTER `generateAreaIntelligence()` resolves, passing the full payload.
 * See database/schema.sql for the target table structure.
 */

import { buildScoreJustification } from "./scoring.js";
import { AREA_MAP, SECTORS } from "./areas.js";
import { QUESTIONS } from "./questions.js";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";

// ─── TYPE DOCUMENTATION ──────────────────────────────────────────────────────

/**
 * @typedef {Object} AreaIntelligence
 * @property {string}   areaId
 * @property {number}   score              - 0–100
 * @property {string}   scoreJustification - Narrative explanation of the score
 * @property {Object}   criticalPoint      - The top-priority issue
 * @property {string}   criticalPoint.title
 * @property {string}   criticalPoint.description
 * @property {string}   criticalPoint.impact  - Why this matters strategically
 * @property {Array}    checklist          - 3–5 steps
 * @property {string}   checklist[].step
 * @property {string}   checklist[].detail
 * @property {string}   checklist[].resource  - WorkeaCenter service that helps
 * @property {string}   checklist[].timeframe - "Esta semana" | "Este mes" | "Q1"
 * @property {string}   level              - "tierra"|"pista"|"ascenso"|"despegado"
 * @property {string}   levelMessage
 * @property {string}   headline           - Short motivational headline for UI
 */

// ─── PROMPT BUILDER ───────────────────────────────────────────────────────────

/**
 * Constructs the structured prompt for the AI to generate the diagnosis.
 *
 * @param {Object} params
 * @param {string}   params.areaId
 * @param {number}   params.score
 * @param {Array}    params.breakdown      - Per-question score details
 * @param {Object}   params.profile        - { sector, tenure, team, market }
 * @param {string}   params.levelKey
 * @param {string}   params.levelMessage
 * @returns {string}
 */
function buildPrompt({ areaId, score, breakdown, profile, levelKey, levelMessage }) {
  const area = AREA_MAP[areaId];
  const questions = QUESTIONS[areaId] ?? [];

  // Resolve human-readable sector label
  const sectorLabel =
    SECTORS.find((s) => s.value === profile.sector)?.label ?? profile.sector;

  // Build a readable Q&A transcript
  const qaTranscript = breakdown
    .map((b) => {
      const q = questions.find((q) => q.id === b.id);
      return `  [${b.code}] "${q?.text ?? b.id}" → respuesta: "${b.answer}" | puntuación bruta: ${b.rawScore}/100 (peso: ${b.weight}%)`;
    })
    .join("\n");

  const scoreJustification = buildScoreJustification(breakdown, score);

  return `Eres el motor de diagnóstico empresarial de WorkeaCheck™, la herramienta de inteligencia de WorkeaCenter (Sortis Business Tower, Ciudad de Panamá). Tu función es generar diagnósticos consultivos de alto nivel — no genéricos, no superficiales. Cada respuesta debe sentirse como el output de un consultor senior que entiende el contexto específico de esta empresa.

CONTEXTO DEL WORKERO:
─────────────────────
• Área evaluada: ${area.label}
• Servicio Concierge asociado: ${area.service}
• Score calculado: ${score}/100
• Nivel de Despegue: ${levelKey} — "${levelMessage}"
• Sector: ${sectorLabel}
• Antigüedad: ${profile.tenure}
• Tamaño del equipo: ${profile.team}
• Mercado objetivo: ${profile.market}

JUSTIFICACIÓN DEL SCORE (ya calculada):
────────────────────────────────────────
${scoreJustification}

RESPUESTAS DETALLADAS DEL WORKERO:
───────────────────────────────────
${qaTranscript}

TU MISIÓN:
──────────
Genera un diagnóstico en JSON estricto (sin markdown, sin texto adicional). La respuesta debe ser un objeto JSON válido con EXACTAMENTE esta estructura:

{
  "scoreJustification": "string — 2-3 oraciones explicando el score ${score}/100 desde una perspectiva consultiva. Menciona las 2 debilidades más críticas y 1 fortaleza. Sin frases genéricas.",
  "headline": "string — frase motivacional de 8-12 palabras que capture el estado actual del negocio en esta área. Directa, honesta, ejecutiva.",
  "criticalPoint": {
    "title": "string — nombre del punto crítico (4-7 palabras, sustantivado)",
    "description": "string — 2-3 oraciones describiendo el problema específico detectado, usando evidencia de las respuestas del Workero",
    "impact": "string — 1-2 oraciones explicando el impacto estratégico real si esto no se resuelve en los próximos 6 meses"
  },
  "checklist": [
    {
      "step": "string — título del paso (verbo + objeto, máx 8 palabras)",
      "detail": "string — 1-2 oraciones con la acción concreta, específica y medible",
      "resource": "string — servicio de WorkeaCenter que ayuda (ej: 'Concierge de Contabilidad', 'Sesión de Imagen Corporativa', etc.)",
      "timeframe": "string — 'Esta semana' | 'Este mes' | 'En 30 días' | 'En 90 días'"
    }
  ]
}

REGLAS OBLIGATORIAS:
• checklist debe tener EXACTAMENTE entre 3 y 5 items.
• Cada paso del checklist debe ser accionable hoy, no aspiracional.
• Al menos 1 paso del checklist debe referenciar un servicio del Concierge de WorkeaCenter.
• El scoreJustification DEBE incluir el número ${score} y las palabras clave que lo justifican.
• El criticalPoint.impact debe mencionar consecuencias empresariales tangibles (pérdida de ingresos, riesgo legal, pérdida de talento, etc.).
• NUNCA uses frases genéricas como "es importante", "considera hacer", "deberías pensar en".
• Habla en segunda persona directa ("tu empresa", "tus procesos", "debes").
• Tono: consultor ejecutivo senior, no coach motivacional.

Responde SOLO con el JSON. Sin texto antes ni después.`;
}

// ─── MAIN AI CALL ─────────────────────────────────────────────────────────────

/**
 * Calls the Anthropic API and returns a parsed AreaIntelligence object.
 *
 * @param {Object} params
 * @param {string}   params.areaId
 * @param {number}   params.score
 * @param {Array}    params.breakdown
 * @param {Object}   params.profile
 * @param {string}   params.levelKey
 * @param {string}   params.levelMessage
 * @returns {Promise<AreaIntelligence>}
 */
export async function generateAreaIntelligence(params) {
  const { areaId, score, levelKey, levelMessage } = params;
  const area = AREA_MAP[areaId];

  const prompt = buildPrompt(params);

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // ⚠️ In production: proxy this call through your own backend.
      // Never expose an API key to the browser in a public app.
      "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY ?? "",
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1200,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const rawText = data.content?.[0]?.text ?? "";

  // Strip any accidental markdown fences before parsing
  const cleaned = rawText.replace(/```json|```/gi, "").trim();
  const parsed = JSON.parse(cleaned);

  return {
    areaId,
    score,
    level: levelKey,
    levelMessage,
    areaLabel: area.label,
    areaService: area.service,
    ...parsed,
  };
}

/**
 * Orchestrates intelligence generation for ALL selected areas in parallel.
 *
 * @param {string[]}  selectedAreas
 * @param {Object}    areaScores    - Output of `scoreAll()`
 * @param {Object}    profile
 * @returns {Promise<Object<string, AreaIntelligence>>}
 */
export async function generateAllIntelligence(selectedAreas, areaScores, profile) {
  const results = await Promise.all(
    selectedAreas.map((areaId) => {
      const { score, breakdown, level } = areaScores[areaId];
      return generateAreaIntelligence({
        areaId,
        score,
        breakdown,
        profile,
        levelKey: level.key,
        levelMessage: level.message,
      });
    })
  );

  return Object.fromEntries(results.map((r) => [r.areaId, r]));
}

// ─── GOOGLE SHEETS PERSISTENCE ─────────────────────────────────────────────

const SHEETS_URL = import.meta.env.VITE_GOOGLE_SHEETS_URL ?? "";

/**
 * Persists an anonymous submission to Google Sheets via Apps Script webhook.
 *
 * Setup: see /src/database/google-sheets-webhook.js for instructions.
 * Add VITE_GOOGLE_SHEETS_URL to your .env file.
 *
 * @param {Object} payload
 * @param {string[]}  payload.selectedAreas
 * @param {Object}    payload.profile
 * @param {Object}    payload.answers
 * @param {Object}    payload.areaScores
 * @param {number}    payload.globalScore
 * @param {Object}    payload.globalLevel
 * @param {string}    payload.qrSource      - QR location identifier
 * @returns {Promise<void>}
 */
export async function persistSubmission(payload) {
  const data = {
    id: crypto.randomUUID?.() ?? Date.now().toString(36),
    selectedAreas: payload.selectedAreas,
    profile: payload.profile,
    answers: payload.answers,
    areaScores: payload.areaScores,
    globalScore: payload.globalScore,
    globalLevel: payload.globalLevel,
    qrSource: payload.qrSource ?? "web",
  };

  if (!SHEETS_URL) {
    console.info("[WorkeaCheck™] Google Sheets URL not configured. Submission data:", data);
    return;
  }

  try {
    // Google Apps Script requires FormData (not JSON) for cross-origin POST
    const form = new FormData();
    form.append("data", JSON.stringify(data));

    await fetch(SHEETS_URL, {
      method: "POST",
      body: form,
    });
    console.info("[WorkeaCheck™] Submission saved to Google Sheets");
  } catch (err) {
    console.warn("[WorkeaCheck™] Google Sheets save failed:", err.message);
  }
}
