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

// function doPost(e) {
//   try {
//     var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
//
//     // Leer datos: el navegador envía FormData con campo "data" que contiene JSON
//     var rawData = e.postData.contents;
//     var data;
//     try {
//       data = JSON.parse(rawData);
//     } catch(parseErr) {
//       // FormData llega como multipart, extraer el JSON del campo "data"
//       // Formato: ------Boundary...\r\n...name="data"\r\n\r\n{JSON}\r\n...------Boundary
//       var match = rawData.match(/"data"\s*\r\n\r\n([\s\S]*?)\r\n--/);
//       if (match) {
//         data = JSON.parse(match[1].trim());
//       } else {
//         throw new Error("No se pudo parsear los datos: " + rawData.substring(0, 200));
//       }
//     }
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
//         var levelKey = a.level && a.level.key ? a.level.key : '?';
//         parts.push((areaLabels[key] || key) + ': ' + a.score + '/100 (' + (levelLabels[levelKey] || levelKey) + ')');
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
//       data.id || '',
//       new Date().toLocaleString('es-PA', {timeZone: 'America/Panama'}),
//       sectorLabels[data.profile ? data.profile.sector : ''] || (data.profile ? data.profile.sector : ''),
//       tenureLabels[data.profile ? data.profile.tenure : ''] || (data.profile ? data.profile.tenure : ''),
//       teamLabels[data.profile ? data.profile.team : ''] || (data.profile ? data.profile.team : ''),
//       marketLabels[data.profile ? data.profile.market : ''] || (data.profile ? data.profile.market : ''),
//       areasText,
//       data.globalScore !== undefined ? data.globalScore : '',
//       areaScoresText,
//       levelLabels[(data.globalLevel && data.globalLevel.key) ? data.globalLevel.key : ''] || ((data.globalLevel && data.globalLevel.key) ? data.globalLevel.key : ''),
//       JSON.stringify(data.answers || {}),
//       data.qrSource || 'web'
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
// function doGet() {
//   return ContentService.createTextOutput(
//     JSON.stringify({ status: 'alive', app: 'WorkeaCheck™' })
//   ).setMimeType(ContentService.MimeType.JSON);
// }

// ═══════════════════════════════════════════════════════════════
// 👆 COPIA HASTA AQUÍ 👆
// ═══════════════════════════════════════════════════════════════
