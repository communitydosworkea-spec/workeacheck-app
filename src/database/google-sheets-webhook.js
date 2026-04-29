/**
 * WorkeaCheck™ — Google Sheets Webhook (Apps Script)
 *
 * INSTRUCCIONES DE DESPLIEGUE:
 * ──────────────────────────
 * 1. Crea una Google Sheet con estas columnas en la fila 1:
 *    ID | Fecha | Sector | Antigüedad | Equipo | Mercado | Áreas | Score Global | Scores por Área | Nivel Global | Respuestas | QR Source
 *
 * 2. Ve a Extensiones → Apps Script
 *
 * 3. Pega el código de abajo (la función doPost y doGet)
 *
 * 4. Despliega → Nueva implementación → Aplicación web:
 *    - Ejecutar como: Ti
 *    - Acceso: Cualquier persona
 *
 * 5. Copia la URL del despliegue y pégala en tu .env:
 *    VITE_GOOGLE_SHEETS_URL=https://script.google.com/macros/s/TU_ID/exec
 *
 * 6. Comparte la Sheet con tu equipo de marketing (solo lectura)
 *
 * IMPORTANTE: El navegador envía los datos como FormData (campo "data" con JSON).
 * El script lee e.postData.contents y parsea el JSON interno.
 *
 * ──────────────────────────────────────────────────────────────────────
 *
 * CÓDIGO PARA APPS SCRIPT (copia y pega en el editor):
 */

// ═══════════════════════════════════════════════════════════════
// 👇 COPIA DESDE AQUÍ HASTA EL FINAL 👇
// ═══════════════════════════════════════════════════════════════



// ═══════════════════════════════════════════════════════════════
// 👆 COPIA HASTA AQUÍ 👆
// ═══════════════════════════════════════════════════════════════
