/**
 * WorkeaCheck™ — Data Persistence Layer
 *
 * Persists submission data to Google Sheets via Apps Script webhook.
 * No AI generation - scores-only mode.
 */

const SHEETS_URL = import.meta.env.VITE_GOOGLE_SHEETS_URL || "https://script.google.com/macros/s/AKfycbxNLzcKFGfywIQ79CU1C3gXLsCACFahLizSWktIg3gy05qFpTnwss6nH-OnUXfKdMu2/exec";

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
