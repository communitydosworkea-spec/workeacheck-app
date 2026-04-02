/**
 * WorkeaCheck™ — Scoring Engine
 *
 * Converts raw form answers into weighted numerical scores (0–100)
 * for each selected area. The score is the primary input for
 * determining the "Altitud de Despegue" level and for seeding the
 * AI prompt with accurate context.
 *
 * DESIGN NOTES:
 * ─────────────
 * - Each question carries a `weight` (sum = 100 per area).
 * - Scale questions (1–5) → normalized to 0–100 linearly.
 * - Radio questions → resolved through a VALUE_SCORES lookup table.
 * - A per-question raw score is multiplied by (weight / 100) and
 *   accumulated to produce the area score.
 * - The global score is the simple average of all area scores.
 */

import { QUESTIONS } from "./questions.js";

/** Map every radio/select answer value → a 0-100 quality score */
const VALUE_SCORES = {
  // Finanzas
  si: 100,
  par: 55,
  no: 10,
  ext: 95,
  int: 85,
  yo: 35,
  nada: 5,
  men: 50,

  // Operaciones
  "70": 90,
  "40": 55,
  "20": 25,
  "90": 5,

  // Talento
  inf: 40,
  oca: 50,

  // Legal
  alg: 45,
  sa: 95,
  ind: 55,
  nat: 10,
  nse: 15,

  // Tech
  xls: 35,
  exp: 45,
  bas: 40,

  // Estrategia
  int: 45,
  "par": 50,
};

/**
 * Converts a scale value (string "1"–"5") into a 0–100 score.
 * @param {string} val - The selected scale value
 * @returns {number}
 */
function scaleToScore(val) {
  const n = parseInt(val, 10);
  if (isNaN(n)) return 0;
  return Math.round(((n - 1) / 4) * 100);
}

/**
 * Resolves a radio/select answer to its 0-100 score.
 * @param {string} val
 * @returns {number}
 */
function radioToScore(val) {
  return VALUE_SCORES[val] ?? 50;
}

/**
 * Calculates the weighted score for a single area.
 *
 * @param {string} areaId - e.g. "fin", "mar"
 * @param {Object} answers - flat answers map { questionId: value }
 * @returns {{ score: number, breakdown: Array<{id, score, weight, contribution}> }}
 */
export function calculateAreaScore(areaId, answers) {
  const questions = QUESTIONS[areaId] ?? [];
  let totalContribution = 0;
  let totalWeight = 0;
  const breakdown = [];

  for (const q of questions) {
    const raw = answers[q.id];
    if (raw === undefined || raw === null || raw === "") continue;

    const rawScore =
      q.type === "scale" ? scaleToScore(raw) : radioToScore(raw);

    const contribution = rawScore * (q.weight / 100);
    totalContribution += contribution;
    totalWeight += q.weight;

    breakdown.push({
      id: q.id,
      code: q.code,
      text: q.text,
      answer: raw,
      rawScore,
      weight: q.weight,
      contribution: Math.round(contribution),
    });
  }

  // Normalize if not all questions answered
  const score =
    totalWeight > 0
      ? Math.round((totalContribution / totalWeight) * 100)
      : 0;

  return { score, breakdown };
}

/**
 * Returns the "Altitud de Despegue" level object for a given score.
 * @param {number} score
 * @returns {{ key: string, label: string, tagBg: string, tagColor: string, message: string }}
 */
export function getLevel(score) {
  if (score >= 80) {
    return {
      key: "despegado",
      label: "✈ Despegado",
      tagBg: "#E6F1FB",
      tagColor: "#185FA5",
      message:
        "Estás operando en un nivel sólido. Es momento de escalar y conectar con otros Workeros para seguir creciendo.",
    };
  }
  if (score >= 60) {
    return {
      key: "ascenso",
      label: "↑ En Ascenso",
      tagBg: "#E1F5EE",
      tagColor: "#0F6E56",
      message:
        "Vas en la dirección correcta. Con el acompañamiento adecuado, el próximo nivel está más cerca de lo que crees.",
    };
  }
  if (score >= 40) {
    return {
      key: "pista",
      label: "→ Rodando en Pista",
      tagBg: "#FEF3DC",
      tagColor: "#854F0B",
      message:
        "Tienes la base, pero aún no has alcanzado velocidad de despegue. Pequeños ajustes generarán grandes resultados.",
    };
  }
  return {
    key: "tierra",
    label: "⚑ En Tierra",
    tagBg: "#FCEBEB",
    tagColor: "#A32D2D",
    message:
      "Tu negocio tiene brechas importantes en esta área. La buena noticia: identificarlas es el primer paso para despegar.",
  };
}

/**
 * Scores all selected areas and computes a global composite score.
 *
 * @param {string[]} selectedAreas - e.g. ["fin", "mar"]
 * @param {Object} answers - flat answer map
 * @returns {{
 *   areaScores: Object<string, {score, breakdown, level}>,
 *   globalScore: number,
 *   globalLevel: Object
 * }}
 */
export function scoreAll(selectedAreas, answers) {
  const areaScores = {};
  let sum = 0;

  for (const areaId of selectedAreas) {
    const { score, breakdown } = calculateAreaScore(areaId, answers);
    areaScores[areaId] = {
      score,
      breakdown,
      level: getLevel(score),
    };
    sum += score;
  }

  const globalScore =
    selectedAreas.length > 0
      ? Math.round(sum / selectedAreas.length)
      : 0;

  return {
    areaScores,
    globalScore,
    globalLevel: getLevel(globalScore),
  };
}

/**
 * Builds the scoring justification string used in the UI and AI prompt.
 * Identifies the 2 lowest-scoring and 1 highest-scoring questions
 * as key evidence for the score assigned.
 *
 * @param {Array} breakdown
 * @param {number} score
 * @returns {string}
 */
export function buildScoreJustification(breakdown, score) {
  if (!breakdown || breakdown.length === 0)
    return "Puntuación basada en las respuestas proporcionadas.";

  const sorted = [...breakdown].sort((a, b) => a.rawScore - b.rawScore);
  const weakest = sorted[0];
  const strongest = sorted[sorted.length - 1];

  const band =
    score >= 80
      ? "alto"
      : score >= 60
      ? "intermedio-alto"
      : score >= 40
      ? "intermedio-bajo"
      : "crítico";

  return (
    `Score ${score}/100 (nivel ${band}). ` +
    `Área más débil detectada: "${weakest?.code}" con ${weakest?.rawScore}/100. ` +
    `Mayor fortaleza: "${strongest?.code}" con ${strongest?.rawScore}/100. ` +
    `Ponderación aplicada por importancia estratégica de cada dimensión.`
  );
}
