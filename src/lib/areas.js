/**
 * WorkeaCheck™ — Area & Question Definitions
 * Paleta basada en azul #0A0563 — tonos derivados por luminosidad y saturación.
 * Cada área mantiene su lógica de color diferenciado, ahora en familia azul-índigo.
 */

export const AREAS = [
  {
    id: "fin",
    index: "01",
    label: "¿Mis finanzas están en orden?",
    description: "Control financiero, flujo de caja, contabilidad y decisiones basadas en datos.",
    service: "Contabilidad · Auditorías",
    icon: "$",
    color: "#0A0563",      /* azul principal */
    bg: "#E5E4F5",
    textColor: "#060340",
    conciergeAction: "agenda una sesión con nuestro equipo de Contabilidad",
  },
  {
    id: "mar",
    index: "02",
    label: "¿Mi marca comunica lo que realmente vale?",
    description: "Identidad visual, presencia digital, propuesta de valor y canales de adquisición.",
    service: "Imagen Corporativa · Marketing",
    icon: "◈",
    color: "#1A3BAA",      /* azul medio */
    bg: "#E6EDFB",
    textColor: "#1A3BAA",
    conciergeAction: "agenda una sesión con nuestro equipo de Imagen Corporativa",
  },
  {
    id: "ops",
    index: "03",
    label: "¿Mi negocio puede crecer sin depender solo de mí?",
    description: "Madurez de procesos, documentación operativa y capacidad real de escalar.",
    service: "Consultoría · Auditorías",
    icon: "⚙",
    color: "#2D5BE3",      /* azul brillante */
    bg: "#EAF0FD",
    textColor: "#1E45B8",
    conciergeAction: "agenda una auditoría de procesos con nuestros consultores",
  },
  {
    id: "tal",
    index: "04",
    label: "¿Tengo el equipo correcto para el siguiente nivel?",
    description: "Estructura de equipo, gaps de talento, contratación y retención.",
    service: "Talento Humano · Formación",
    icon: "◎",
    color: "#4B35C8",      /* violeta-azul */
    bg: "#EDEAFC",
    textColor: "#3624A0",
    conciergeAction: "agenda una revisión de estructura con nuestro equipo de RRHH",
  },
  {
    id: "leg",
    index: "05",
    label: "¿Estoy protegido legalmente?",
    description: "Contratos, estructura societaria, propiedad intelectual y cumplimiento en Panamá.",
    service: "Legal",
    icon: "⚖",
    color: "#0B3D7A",      /* azul marino */
    bg: "#E3EBF8",
    textColor: "#0B3D7A",
    conciergeAction: "agenda una revisión legal con nuestros asesores en Panamá",
  },
  {
    id: "tec",
    index: "06",
    label: "¿Mi empresa está preparada para el futuro digital?",
    description: "Digitalización, automatización, CRM e inteligencia artificial aplicada.",
    service: "Consultoría Tech",
    icon: "◉",
    color: "#0D6BB5",      /* azul cielo oscuro */
    bg: "#E2F0FA",
    textColor: "#0A5490",
    conciergeAction: "agenda una auditoría tecnológica con nuestros consultores Tech",
  },
  {
    id: "est",
    index: "07",
    label: "¿Tengo una estrategia clara para los próximos 3 años?",
    description: "Visión documentada, escalabilidad del modelo, mentores y acceso a financiamiento.",
    service: "Consultoría Estratégica",
    icon: "△",
    color: "#06204D",      /* azul noche */
    bg: "#E0E6F2",
    textColor: "#06204D",
    conciergeAction: "agenda una sesión de planificación estratégica con nuestros mentores",
  },
];

export const AREA_MAP = Object.fromEntries(AREAS.map((a) => [a.id, a]));

export const SECTORS = [
  { value: "tec", label: "Tecnología y software" },
  { value: "srv", label: "Servicios profesionales" },
  { value: "leg", label: "Legal y cumplimiento" },
  { value: "sal", label: "Salud y bienestar" },
  { value: "fin", label: "Finanzas e inversión" },
  { value: "com", label: "Comercio y retail" },
  { value: "con", label: "Construcción e inmobiliario" },
  { value: "edu", label: "Educación y formación" },
  { value: "gas", label: "Gastronomía y hospitalidad" },
  { value: "log", label: "Logística y transporte" },
  { value: "mkt", label: "Marketing y comunicación" },
  { value: "mfg", label: "Manufactura e industria" },
  { value: "oth", label: "Otro" },
];

export const TENURE_OPTIONS = [
  { value: "m1", label: "Menos de 1 año" },
  { value: "13", label: "Entre 1 y 3 años" },
  { value: "37", label: "Entre 3 y 7 años" },
  { value: "m7", label: "Más de 7 años" },
];

export const TEAM_OPTIONS = [
  { value: "s1", label: "Solo yo" },
  { value: "25", label: "2–5 personas" },
  { value: "615", label: "6–15 personas" },
  { value: "m15", label: "Más de 15 personas" },
];

export const MARKET_OPTIONS = [
  { value: "pan", label: "Solo Panamá" },
  { value: "cam", label: "Centroamérica" },
  { value: "int", label: "Regional / Internacional" },
];