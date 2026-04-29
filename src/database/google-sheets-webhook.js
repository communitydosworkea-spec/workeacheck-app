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
 * 3. Pega el código de abajo (la función doPost)
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
 * ──────────────────────────────────────────────────────────────────────
 *
 * CÓDIGO PARA APPS SCRIPT (copia y pega en el editor):
 */

// ═══════════════════════════════════════════════════════════════
// 👇 COPIA DESDE AQUÍ HASTA EL FINAL 👇
// ═══════════════════════════════════════════════════════════════

// function doPost(e) {
//   try {
//     var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
//     var data = JSON.parse(e.postData.contents);
//
//     // Mapear niveles a etiquetas legibles
//     var levelLabels = {
//       'despegado': '✈ Despegado',
//       'ascenso': '↑ En Ascenso',
//       'pista': '→ Rodando en Pista',
//       'tierra': '⚑ En Tierra'
//     };
//
//     // Mapear códigos a etiquetas legibles para marketing
//     var sectorLabels = {
//       'tec': 'Tecnología', 'srv': 'Servicios', 'leg': 'Legal',
//       'sal': 'Salud', 'fin': 'Finanzas', 'com': 'Comercio',
//       'con': 'Construcción', 'edu': 'Educación', 'gas': 'Gastronomía',
//       'log': 'Logística', 'mkt': 'Marketing', 'mfg': 'Manufactura',
//       'oth': 'Otro'
//     };
//     var tenureLabels = {
//       'm1': '< 1 año', '13': '1-3 años', '37': '3-7 años', 'm7': '> 7 años'
//     };
//     var teamLabels = {
//       's1': '1 persona', '25': '2-5', '615': '6-15', 'm15': '> 15'
//     };
//     var marketLabels = {
//       'pan': 'Panamá', 'cam': 'Centroamérica', 'int': 'Internacional'
//     };
//     var areaLabels = {
//       'fin': 'Finanzas', 'mar': 'Marca', 'ops': 'Operaciones',
//       'tal': 'Talento', 'leg': 'Legal', 'tec': 'Tech', 'est': 'Estrategia'
//     };
//
//     // Construir scores por área como texto legible
//     var areaScoresText = '';
//     if (data.areaScores) {
//       var parts = [];
//       for (var key in data.areaScores) {
//         var a = data.areaScores[key];
//         parts.push((areaLabels[key] || key) + ': ' + a.score + '/100 (' + (levelLabels[a.level?.key] || a.level?.key || '?') + ')');
//       }
//       areaScoresText = parts.join(' | ');
//     }
//
//     // Construir áreas seleccionadas legibles
//     var areasText = (data.selectedAreas || []).map(function(id) {
//       return areaLabels[id] || id;
//     }).join(', ');
//
//     // Agregar fila con datos legibles
//     sheet.appendRow([
//       data.id || '',                                          // ID
//       new Date().toLocaleString('es-PA', {timeZone: 'America/Panama'}), // Fecha
//       sectorLabels[data.profile?.sector] || data.profile?.sector || '',  // Sector
//       tenureLabels[data.profile?.tenure] || data.profile?.tenure || '',  // Antigüedad
//       teamLabels[data.profile?.team] || data.profile?.team || '',        // Equipo
//       marketLabels[data.profile?.market] || data.profile?.market || '',  // Mercado
//       areasText,                                               // Áreas
//       data.globalScore ?? '',                                  // Score Global
//       areaScoresText,                                           // Scores por Área
//       levelLabels[data.globalLevel?.key] || data.globalLevel?.key || '', // Nivel Global
//       JSON.stringify(data.answers || {}),                       // Respuestas (JSON)
//       data.qrSource || 'web'                                   // QR Source
//     ]);
//
//     return ContentService.createTextOutput(
//       JSON.stringify({ status: 'ok', row: sheet.getLastRow() })
//     ).setMimeType(ContentService.MimeType.JSON);
//
//   } catch (err) {
//     return ContentService.createTextOutput(
//       JSON.stringify({ status: 'error', message: err.message })
//     ).setMimeType(ContentService.MimeType.JSON);
//   }
// }
//
// // GET para verificar que el webhook está activo
// function doGet() {
//   return ContentService.createTextOutput(
//     JSON.stringify({ status: 'alive', app: 'WorkeaCheck™' })
//   ).setMimeType(ContentService.MimeType.JSON);
// }

// ═══════════════════════════════════════════════════════════════
// 👆 COPIA HASTA AQUÍ 👆
// ═══════════════════════════════════════════════════════════════
