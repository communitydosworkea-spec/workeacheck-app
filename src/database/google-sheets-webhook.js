/**
 * WorkeaCheckTM - Google Sheets Webhook (Apps Script)
 *
 * INSTRUCCIONES DE DESPLIEGUE:
 * - 1. Crea una Google Sheet con estas columnas en la fila 1:
 *    ID | Fecha | Sector | Antigüedad | Equipo | Mercado | Áreas | Score Global | Scores por Área | Nivel Global | Respuestas | QR Source
 *
 * - 2. Ve a Extensiones -> Apps Script
 *
 * - 3. Pega el código de abajo (la función doPost y doGet)
 *
 * - 4. Despliega -> Nueva implementación -> Aplicación web:
 *    - Ejecutar como: Ti
 *    - Acceso: Cualquier persona
 *
 * - 5. Copia la URL del despliegue y pégala en tu .env:
 *    VITE_GOOGLE_SHEETS_URL=https://script.google.com/macros/s/TU_ID/exec
 *
 * IMPORTANTE: El navegador envía los datos como FormData (campo "data" con JSON).
 * El script lee e.postData.contents y parsea el JSON interno.
 *
 * - CÓDIGO PARA APPS SCRIPT (copia y pega en el editor):
 */

// - COPIA DESDE AQUÍ HASTA EL FINAL -
// -

function doPost(e) {
  try {
    Logger.log("=== POST RECIBIDO ===");
    Logger.log("Contenido crudo: " + e.postData.contents);
    Logger.log("Content-Type: " + e.postData.type);
    
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Parse FormData: buscar el campo "data" con el JSON
    var rawData = e.postData.contents;
    var data;
    
    try {
      // Intentar parsear como JSON directo primero
      Logger.log("Intentando parsear como JSON directo...");
      data = JSON.parse(rawData);
      Logger.log("JSON parseado exitosamente");
    } catch(parseErr) {
      Logger.log("JSON directo falló, intentando FormData...");
      // Si falla, extraer del FormData multipart
      var match = rawData.match(/"data"\s*\r\n\r\n([\s\S]*?)\r\n--/);
      if (match) {
        Logger.log("Encontrado patrón FormData, decodificando...");
        data = JSON.parse(decodeURIComponent(match[1].trim()));
        Logger.log("FormData parseado exitosamente");
      } else {
        // Último intento: buscar patrón data=... y decodificar
        Logger.log("Buscando patrón data=...");
        var dataMatch = rawData.match(/data=(.+?)(?:&|$)/);
        if (dataMatch) {
          Logger.log("Encontrado patrón data=, decodificando...");
          data = JSON.parse(decodeURIComponent(dataMatch[1]));
          Logger.log("Data= parseado exitosamente");
        } else {
          Logger.log("ERROR: No se pudo parsear de ninguna forma");
          throw new Error("No se pudo parsear: " + rawData.substring(0, 200));
        }
      }
    }
    
    Logger.log("Datos parseados: " + JSON.stringify(data, null, 2));
    
    // Mapear niveles a etiquetas legibles
    var levelLabels = {'despegado':'? Despegado','ascenso':'? En Ascenso','pista':'? Rodando en Pista','tierra':'? En Tierra'};
    var sectorLabels = {'tec':'Tecnología','srv':'Servicios','leg':'Legal','sal':'Salud','fin':'Finanzas','com':'Comercio','con':'Construcción','edu':'Educación','gas':'Gastronomía','log':'Logística','mkt':'Marketing','mfg':'Manufactura','oth':'Otro'};
    var tenureLabels = {'m1':'<< 1 año','13':'1-3 años','37':'3-7 años','m7':'> 7 años'};
    var teamLabels = {'s1':'1 persona','25':'2-5','615':'6-15','m15':'> 15'};
    var marketLabels = {'pan':'Panamá','cam':'Centroamérica','int':'Internacional'};
    var areaLabels = {'fin':'Finanzas','mar':'Marca','ops':'Operaciones','tal':'Talento','leg':'Legal','tec':'Tech','est':'Estrategia'};
    
    // Construir scores por área como texto legible
    var areaScoresText = '';
    if (data.areaScores) {
      var parts = [];
      for (var key in data.areaScores) {
        var a = data.areaScores[key];
        var levelKey = a.level && a.level.key ? a.level.key : '?';
        parts.push((areaLabels[key]||key)+': '+a.score+'/100 ('+(levelLabels[levelKey]||levelKey)+')');
      }
      areaScoresText = parts.join(' | ');
    }
    
    // Construir áreas seleccionadas legibles
    var areasText = (data.selectedAreas||[]).map(function(id){return areaLabels[id]||id;}).join(', ');
    
    Logger.log("Datos procesados - Areas: " + areasText + ", Score: " + data.globalScore);
    
    // Agregar fila con datos legibles
    var row = [
      data.id||'',
      new Date().toLocaleString('es-PA',{timeZone:'America/Panama'}),
      sectorLabels[data.profile?data.profile.sector:'']||(data.profile?data.profile.sector:''),
      tenureLabels[data.profile?data.profile.tenure:'']||(data.profile?data.profile.tenure:''),
      teamLabels[data.profile?data.profile.team:'']||(data.profile?data.profile.team:''),
      marketLabels[data.profile?data.profile.market:'']||(data.profile?data.profile.market:''),
      areasText,
      data.globalScore!==undefined?data.globalScore:'',
      areaScoresText,
      levelLabels[(data.globalLevel&&data.globalLevel.key)?data.globalLevel.key:'']||((data.globalLevel&&data.globalLevel.key)?data.globalLevel.key:''),
      JSON.stringify(data.answers||{}),
      data.qrSource||'web'
    ];
    
    Logger.log("Fila a agregar: " + JSON.stringify(row, null, 2));
    
    sheet.appendRow(row);
    
    Logger.log("=== GUARDADO EXITOSO - Fila " + sheet.getLastRow() + " ===");
    
    return ContentService.createTextOutput(JSON.stringify({status:'ok',row:sheet.getLastRow()})).setMimeType(ContentService.MimeType.JSON);
    
  } catch(err) {
    Logger.log("=== ERROR ===");
    Logger.log("Error: " + err.message);
    Logger.log("Stack: " + err.stack);
    return ContentService.createTextOutput(JSON.stringify({status:'error',message:err.message})).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  Logger.log("GET request recibido");
  return ContentService.createTextOutput(JSON.stringify({status:'alive',app:'WorkeaCheck'})).setMimeType(ContentService.MimeType.JSON);
}
