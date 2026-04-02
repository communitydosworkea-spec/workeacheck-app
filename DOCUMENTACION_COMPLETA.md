# Documentación Completa - WorkeaCheck™ App

## 📋 Resumen del Proyecto

**WorkeaCheck™** es una aplicación web de diagnóstico empresarial creada para WorkeaCenter en Ciudad de Panamá. Es una herramienta de 3 pasos que permite a los "Workeros" evaluar diferentes áreas de su negocio en 5-8 minutos y recibir resultados personalizados con inteligencia AI.

---

## 🏗️ Arquitectura Técnica

### Stack Principal
- **Frontend**: React 19.2.4 + Vite 8.0.1
- **Estilos**: CSS puro con sistema de diseño personalizado
- **Inteligencia AI**: Anthropic Claude API (claude-sonnet-4-20250514)
- **Build**: Vite con configuración para React

### Estructura de Archivos

```
workeacheck-app/
├── public/                     # Assets estáticos
├── src/
│   ├── components/            # Componentes React
│   │   ├── Header.jsx         # Header con logo y tiempo estimado
│   │   ├── StepIndicator.jsx  # Indicador de progreso (3 pasos)
│   │   ├── Step1Areas.jsx     # Selección de áreas (1-3 áreas)
│   │   ├── Step2Questions.jsx # Formulario de preguntas por área
│   │   └── Step3Results.jsx   # Resultados con AI y recomendaciones
│   ├── lib/                   # Lógica de negocio
│   │   ├── areas.js          # Definición de 7 áreas empresariales
│   │   ├── questions.js      # Banco de preguntas (5 por área)
│   │   ├── scoring.js        # Motor de cálculo de scores (0-100)
│   │   └── intelligence.js   # Integración con Anthropic API
│   ├── styles/
│   │   └── globals.css       # Sistema de diseño completo
│   ├── App.jsx               # Componente principal con estado
│   ├── main.jsx              # Punto de entrada React
│   └── index.css             # Estilos base Vite
├── index.html                # HTML template con metadatos SEO
├── package.json              # Dependencias y scripts
└── vite.config.js           # Configuración Vite
```

---

## 🎨 Sistema de Diseño

### Colores Principales (CSS Variables)
```css
--verde: #1D9E75;          /* Color primario */
--verde-osc: #0F6E56;      /* Verde oscuro */
--verde-cl: #E1F5EE;       /* Verde claro */
--negro: #111110;          /* Texto principal */
--gris: #6B6A66;           /* Texto secundario */
--fondo: #F8F7F3;          /* Fondo principal */
--blanco: #FFFFFF;         /* Blanco puro */
--borde: #E2E0D8;          /* Bordes */
```

### Tipografía
- **Body**: DM Sans (system-ui fallback)
- **Display**: DM Serif Display (Georgia fallback)
- **Mono**: ui-monospace (Consolas fallback)

### Componentes UI Clave
- **Area Cards**: Tarjetas seleccionables con máximo 3 opciones
- **Scale Questions**: Escala visual 1-5 con puntos interactivos
- **Radio Lists**: Lista de opciones con selección visual
- **Pills**: Botones de selección múltiples (perfil)
- **Progress Bar**: Barra de progreso con porcentaje
- **Score Gauge**: Visual circular SVG para scores

---

## 📊 Flujo de Usuario (3 Pasos)

### Paso 1: Selección de Áreas
- **Componente**: `Step1Areas.jsx`
- **Funcionalidad**: 
  - Hero con explicación del diagnóstico
  - 7 áreas empresariales disponibles
  - Selección mínima 1, máxima 3 áreas
  - Validación visual de límite
- **Áreas Disponibles**:
  1. Finanzas (Contabilidad · Auditorías)
  2. Marca (Imagen Corporativa · Marketing)
  3. Operaciones (Consultoría · Auditorías)
  4. Talento (Talento Humano · Formación)
  5. Legal (Legal)
  6. Tecnología (Consultoría Tech)
  7. Estrategia (Consultoría Estratégica)

### Paso 2: Diagnóstico
- **Componente**: `Step2Questions.jsx`
- **Funcionalidad**:
  - Perfil empresarial (4 preguntas obligatorias)
  - 5 preguntas por área seleccionada
  - Barra de progreso en tiempo real
  - 2 tipos de preguntas: escala (1-5) y radio options
- **Tipos de Preguntas**:
  - **Scale**: Escala visual 1-5 (ej: "Sin visibilidad" → "Visibilidad total")
  - **Radio**: Opciones múltiples predefinidas
- **Perfil Empresarial**:
  - Sector (13 opciones)
  - Antigüedad (4 rangos)
  - Tamaño equipo (4 rangos)
  - Mercado objetivo (3 opciones)

### Paso 3: Resultados
- **Componente**: `Step3Results.jsx`
- **Funcionalidad**:
  - Score global con gauge visual
  - Resultados por área individual
  - Inteligencia AI generada por Claude
  - Checklist de acciones concretas
  - Puntos críticos identificados
  - CTAs para servicios WorkeaCenter

---

## 🧠 Motor de Inteligencia

### Sistema de Scoring
- **Archivo**: `scoring.js`
- **Lógica**:
  - Cada pregunta tiene un peso (total 100 por área)
  - Scale 1-5 → normalizado a 0-100 linealmente
  - Radio options → mapeo through VALUE_SCORES lookup
  - Score final = promedio ponderado de respuestas
- **Niveles de Despegue**:
  - **80+**: ✈ Despegado (azul)
  - **60-79**: ↑ En Ascenso (verde)
  - **40-59**: → Rodando en Pista (amarillo)
  - **<40**: ⚑ En Tierra (rojo)

### Integración AI (Anthropic Claude)
- **Archivo**: `intelligence.js`
- **Modelo**: claude-sonnet-4-20250514
- **Proceso**:
  1. Construcción de prompt estructurado con contexto
  2. Llamada a API Anthropic con respuestas del usuario
  3. Parseo de respuesta JSON estructurada
  4. Generación de elementos personalizados:
     - `scoreJustification`: Explicación narrativa del score
     - `headline`: Frase motivacional ejecutiva
     - `criticalPoint`: Problema prioritario a resolver
     - `checklist`: 3-5 pasos accionables con recursos WorkeaCenter

---

## 🔧 Configuración y Variables de Entorno

### Variables .env Requeridas
```bash
VITE_ANTHROPIC_API_KEY=sk-ant-xxx  # API key de Anthropic Claude
```

### Scripts npm
```json
{
  "dev": "vite",           # Servidor desarrollo
  "build": "vite build",   # Build producción
  "preview": "vite preview", # Preview build local
  "lint": "eslint ."       # Linting código
}
```

---

## 📱 Componentes React Detallados

### App.jsx (Componente Principal)
- **Estado Principal**:
  - `step`: Paso actual (1, 2, 3)
  - `selectedAreas`: Array de IDs seleccionados
  - `profile`: Objeto con datos empresariales
  - `answers`: Objeto plano con respuestas
  - `results`: Objeto con resultados finales
- **Callbacks Principales**:
  - `handleAreaToggle`: Selección/deselección de áreas
  - `handleProfileChange`: Cambios en perfil
  - `handleAnswerChange`: Cambios en respuestas
  - `handleResultsReady`: Procesamiento final con AI

### Header.jsx
- Logo WorkeaCenter con badge "WorkeaCheck™"
- Tiempo estimado "≈ 5–8 min"
- Sticky header con blur backdrop

### StepIndicator.jsx
- 3 pasos: Áreas → Diagnóstico → Resultados
- Estados: active, done, pending
- Navegación visual con puntos numerados

### Step1Areas.jsx
- Grid de tarjetas de áreas (responsive)
- Validación de máximo 3 áreas
- Estados visuales: selected, maxed, hover
- Notice boxes con instrucciones

### Step2Questions.jsx
- **ProgressBar**: Calculado en tiempo real
- **Block Cards**: Por área + perfil
- **ScaleQuestion**: Componente para preguntas 1-5
- **RadioQuestion**: Componente para opciones múltiples
- **Form handling**: Submit asíncono con AI

### Step3Results.jsx
- **LoadingState**: Spinner con mensajes rotativos
- **GlobalSummary**: Score global con gauge
- **AreaResult**: Resultados individuales por área
- **ScoreGauge**: Componente SVG visual
- **Google CTA**: Sección para reseñas
- **Concierge CTA**: Llamadas a acción servicios

---

## 🎯 Lógica de Negocio (lib/)

### areas.js - Definición de Áreas
- **AREAS**: Array de 7 objetos con metadata completa
- **AREA_MAP**: Lookup object por ID
- **SECTORS**: 13 sectores económicos
- **TENURE_OPTIONS**: 4 rangos de antigüedad
- **TEAM_OPTIONS**: 4 rangos de tamaño
- **MARKET_OPTIONS**: 3 mercados objetivo

### questions.js - Banco de Preguntas
- **QUESTIONS**: Objeto con 5 preguntas por área
- **Estructura de pregunta**:
  ```javascript
  {
    id: "fv",              // ID único
    type: "scale",         // "scale" | "radio"
    code: "F-1",          // Código visual
    text: "Pregunta...",  // Texto completo
    weight: 30,           // Peso en score (0-100)
    // Para scale:
    min: "Sin visibilidad",
    max: "Visibilidad total",
    // Para radio:
    options: [
      { value: "si", label: "Sí, lo calculo..." }
    ]
  }
  ```

### scoring.js - Motor de Cálculo
- **calculateAreaScore()**: Score individual por área
- **getLevel()**: Determina nivel de despegue
- **scoreAll()**: Procesa todas las áreas seleccionadas
- **buildScoreJustification()**: Genera explicación del score

### intelligence.js - Capa AI
- **generateAreaIntelligence()**: Llamada a Anthropic API
- **generateAllIntelligence()**: Procesamiento paralelo
- **buildPrompt()**: Construcción de prompt estructurado
- **persistSubmission()**: Stub para futura integración Supabase

---

## 🚀 Despliegue y Producción

### Build para Producción
```bash
npm run build
# Genera carpeta dist/ con archivos estáticos
```

### Consideraciones de Seguridad
- **API Key**: Nunca exponer en frontend (proxy en backend)
- **CORS**: Configurar para dominios permitidos
- **HTTPS**: Obligatorio para producción
- **Analytics**: Considerar integración con Google Analytics

### Optimizaciones Implementadas
- **Code splitting**: Automático por Vite
- **Tree shaking**: Eliminación de código no usado
- **CSS variables**: Sistema de diseño eficiente
- **React.memo**: Para componentes pesados si es necesario
- **Lazy loading**: Para futuras expansiones

---

## 🔮 Roadmap Futuro

### Phase 2: Backend & Persistencia
- Integración con Supabase para almacenamiento
- Sistema de autenticación (opcional)
- Dashboard de analytics para WorkeaCenter
- Export de resultados en PDF

### Phase 3: Mejoras UX
- Modo oscuro completo
- Animaciones micro-interacciones
- Progressive Web App (PWA)
- Multi-idioma (inglés/portugués)

### Phase 4: Analytics Business
- Seguimiento de conversión a servicios
- Integración con CRM WorkeaCenter
- Sistema de referrals
- Gamificación y logros

---

## 🐛 Debugging y Troubleshooting

### Issues Comunes
1. **API Key no funciona**: Verificar variable VITE_ANTHROPIC_API_KEY
2. **Scores no calculan**: Revisar que todas las preguntas tengan peso
3. **AI no responde**: Checkear límites de API y formato del prompt
4. **Estilos no aplican**: Verificar import de globals.css

### Console Logs Útiles
- `[WorkeaCheck™] AI generation failed` - Error en API Anthropic
- `[WorkeaCheck™] Submission ready for persistence` - Datos listos para guardar

### Testing Manual
1. Flujo completo con 1 área
2. Flujo con 3 áreas (máximo)
3. Validación de formularios
4. Estados de loading y error
5. Responsiveness móvil

---

## 📞 Contacto y Soporte

**WorkeaCenter**
- Sortis Business Tower, Obarrio, Ciudad de Panamá
- Web: workeacenter.com
- Email: info@workeacenter.com
- Tel: +507 6832 2442

**Notas Técnicas**
- Los datos son 100% anónimos
- Sin registro ni correo requerido
- Tiempo estimado: 5-8 minutos
- Resultados inmediatos con AI

---

*Documento generado automáticamente - Última actualización: Abril 2026*
