// Lógica pura del mapa de calor: sin interfaz, sin datos guardados y sin consultar el reloj.
// Las fechas son textos "AAAA-MM-DD" en hora local.

// Devuelve la fecha local, o null si el texto no tiene ese formato o la fecha no existe.
function parseLocalDate(text) {
  if (typeof text !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return null;
  }
  const [year, month, day] = text.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  // JavaScript convierte el 31 de febrero en marzo: si cambia el texto, la fecha no existe.
  return formatLocalDate(date) === text ? date : null;
}

function formatLocalDate(date) {
  const year = String(date.getFullYear()).padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Suma días (o los resta, si amount es negativo) a una fecha válida.
function addDays(dateText, amount) {
  const date = parseLocalDate(dateText);
  date.setDate(date.getDate() + amount);
  return formatLocalDate(date);
}

// Devuelve el lunes de la semana de una fecha válida.
function getWeekStart(dateText) {
  // getDay() da 0 el domingo y 1 el lunes: así el lunes queda en 0 y el domingo en 6.
  const daysSinceMonday = (parseLocalDate(dateText).getDay() + 6) % 7;
  return addDays(dateText, -daysSinceMonday);
}

// ----- Sesiones -----

function isValidSession(session) {
  if (session === null || typeof session !== "object") {
    return false;
  }
  const { fecha, minutos } = session;
  return parseLocalDate(fecha) !== null && Number.isFinite(minutos) && minutos > 0;
}

// Devuelve un objeto { "AAAA-MM-DD": minutos }, sin sesiones dañadas ni futuras.
function sumMinutesByDate(sessions, today) {
  const minutesByDate = {};
  for (const session of sessions) {
    if (isValidSession(session) && session.fecha <= today) {
      minutesByDate[session.fecha] = (minutesByDate[session.fecha] || 0) + session.minutos;
    }
  }
  return minutesByDate;
}

// ----- Niveles de intensidad -----

// El nivel 1 es para más de 0 minutos; los demás empiezan justo en su mínimo.
const INTENSITY_LEVELS = [
  { level: 0, minimum: 0, label: "0 min" },
  { level: 1, minimum: 0, label: "Menos de 30" },
  { level: 2, minimum: 30, label: "30 o más" },
  { level: 3, minimum: 60, label: "60 o más" },
  { level: 4, minimum: 120, label: "120 o más" },
];

function getIntensityLevel(minutes) {
  if (minutes <= 0) {
    return 0;
  }
  let level = 1;
  for (const item of INTENSITY_LEVELS) {
    if (minutes >= item.minimum) {
      level = item.level;
    }
  }
  return level;
}

// ----- Mapa -----

const WEEKS_IN_HEAT_MAP = 12;
const DAYS_IN_WEEK = 7;
const MONTH_NAMES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function getMonthName(dateText) {
  return MONTH_NAMES[parseLocalDate(dateText).getMonth()];
}

// Devuelve un rótulo (o null) por semana: el mes que empieza en ella, si ya ha llegado.
function getMonthLabels(weekStarts, today) {
  const labels = weekStarts.map((weekStart) => {
    for (let day = 0; day < DAYS_IN_WEEK; day++) {
      const date = addDays(weekStart, day);
      if (date.endsWith("-01") && date <= today) {
        return getMonthName(date);
      }
    }
    return null;
  });

  // Si el periodo empieza a mitad de mes, la primera semana lleva ese mes,
  // salvo que el rótulo siguiente quede justo al lado.
  if (labels[0] === null && labels[1] === null) {
    labels[0] = getMonthName(weekStarts[0]);
  }
  return labels;
}

// Devuelve 12 semanas de 7 días (de lunes a domingo) y los rótulos de mes.
// Los días posteriores a hoy son null.
function buildHeatMap(sessions, today) {
  const minutesByDate = sumMinutesByDate(Array.isArray(sessions) ? sessions : [], today);
  const firstMonday = addDays(getWeekStart(today), -(WEEKS_IN_HEAT_MAP - 1) * DAYS_IN_WEEK);

  const weekStarts = [];
  const weeks = [];
  for (let week = 0; week < WEEKS_IN_HEAT_MAP; week++) {
    const monday = addDays(firstMonday, week * DAYS_IN_WEEK);
    const days = [];
    for (let i = 0; i < DAYS_IN_WEEK; i++) {
      const date = addDays(monday, i);
      const minutes = minutesByDate[date] || 0;
      const day = { date, minutes, level: getIntensityLevel(minutes), isToday: date === today };
      days.push(date > today ? null : day);
    }
    weekStarts.push(monday);
    weeks.push(days);
  }
  return { weeks, monthLabels: getMonthLabels(weekStarts, today) };
}

// Texto de un día, por ejemplo: "martes, 24 de noviembre de 2026: 75 min".
function formatDayDetail(day) {
  const dateText = parseLocalDate(day.date).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return `${dateText}: ${day.minutes} min`;
}

// Devuelve la fecha a la que lleva una flecha, o la misma si no hay ningún día en ese sitio.
function findNextDate(heatMap, date, key) {
  const moves = {
    ArrowUp: [0, -1],
    ArrowDown: [0, 1],
    ArrowLeft: [-1, 0],
    ArrowRight: [1, 0],
  };
  const move = moves[key];
  const week = heatMap.weeks.findIndex((days) => days.some((day) => day !== null && day.date === date));
  if (!move || week === -1) {
    return date;
  }
  const dayIndex = heatMap.weeks[week].findIndex((day) => day !== null && day.date === date);
  const targetWeek = heatMap.weeks[week + move[0]];
  const target = targetWeek ? targetWeek[dayIndex + move[1]] : null;
  return target ? target.date : date;
}

// En los tests (Node) se exportan las funciones; en el navegador, "module" no existe.
if (typeof module !== "undefined") {
  module.exports = {
    parseLocalDate,
    formatLocalDate,
    addDays,
    getWeekStart,
    isValidSession,
    sumMinutesByDate,
    INTENSITY_LEVELS,
    getIntensityLevel,
    getMonthLabels,
    buildHeatMap,
    formatDayDetail,
    findNextDate,
  };
}
