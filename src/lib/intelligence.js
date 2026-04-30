/**
 * WorkeaCheck™ — Data Persistence Layer
 *
 * Persists submission data to Google Sheets via Apps Script webhook.
 * No AI generation - scores-only mode.
 */

import { QUESTIONS } from "./questions.js";

const SHEETS_URL = import.meta.env.VITE_GOOGLE_SHEETS_URL || "https://script.google.com/macros/s/AKfycbwedBVj3DuO4kQtBlwjsRbs1BeWuiFwOwSDt4X8WBLNLGxAZpsLq68MtkYffPv7wspx/exec";

/**
 * Format questions and answers as readable text
 */
function formatQuestionsAndAnswers(selectedAreas, answers) {
  const areaLabels = {
    fin: 'Finanzas',
    mar: 'Marca',
    ops: 'Operaciones',
    tal: 'Talento',
    leg: 'Legal',
    tec: 'Tech',
    est: 'Estrategia'
  };

  const formatted = [];

  for (const areaId of selectedAreas) {
    const areaQuestions = QUESTIONS[areaId] || [];
    const areaParts = [];

    for (const question of areaQuestions) {
      const answer = answers[question.id];
      if (answer !== undefined && answer !== null && answer !== '') {
        // Format the answer based on question type
        let formattedAnswer;
        if (question.type === 'scale') {
          formattedAnswer = answer; // Scale is just a number
        } else if (question.options) {
          // Radio/select - find the label for the value
          const option = question.options.find(opt => opt.value === answer);
          formattedAnswer = option ? option.label : answer;
        } else {
          formattedAnswer = answer;
        }

        areaParts.push(`${question.code}: ${question.text} (${formattedAnswer})`);
      }
    }

    if (areaParts.length > 0) {
      formatted.push(`${areaLabels[areaId] || areaId}: ${areaParts.join(' | ')}`);
    }
  }

  return formatted.join('\n');
}

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
  // Generate short readable ID: WCHK + random 4 digits
  const shortId = 'WCHK-' + Math.floor(1000 + Math.random() * 9000);
  
  const data = {
    id: shortId,
    selectedAreas: payload.selectedAreas,
    profile: payload.profile,
    answers: payload.answers,
    areaScores: payload.areaScores,
    globalScore: payload.globalScore,
    globalLevel: payload.globalLevel,
    qrSource: payload.qrSource ?? "web",
    formattedQuestionsAndAnswers: formatQuestionsAndAnswers(payload.selectedAreas, payload.answers),
  };

  if (!SHEETS_URL) {
    console.info("[WorkeaCheck™] Google Sheets URL not configured. Submission data:", data);
    return;
  }

  console.log("[WorkeaCheck] Data to send:", JSON.stringify(data, null, 2));

  try {
    // Try JSON first, fallback to FormData if needed
    const response = await fetch(SHEETS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    console.log("[WorkeaCheck] Response status:", response.status);
    const responseText = await response.text();
    console.log("[WorkeaCheck] Response body:", responseText);
    console.info("[WorkeaCheck] Submission saved to Google Sheets");
  } catch (err) {
    console.warn("[WorkeaCheck] JSON failed, trying FormData:", err.message);
    // Fallback to FormData
    const form = new FormData();
    form.append("data", JSON.stringify(data));
    const response = await fetch(SHEETS_URL, {
      method: "POST",
      body: form,
    });
    console.log("[WorkeaCheck] FormData response status:", response.status);
    const responseText = await response.text();
    console.log("[WorkeaCheck] FormData response body:", responseText);
    console.info("[WorkeaCheck] Submission saved via FormData");
  }
}
