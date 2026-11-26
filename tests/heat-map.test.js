const { test, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const SOURCE_PATH = path.join(__dirname, "..", "heat-map.js");
const {
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
} = require(SOURCE_PATH);

const originalTimeZone = process.env.TZ;

afterEach(() => {
  if (originalTimeZone === undefined) {
    delete process.env.TZ;
  } else {
    process.env.TZ = originalTimeZone;
  }
});

// ----- T1: fechas locales -----

test("T1 parseLocalDate interpreta la fecha en hora local", () => {
  const date = parseLocalDate("2026-11-25");
  assert.equal(date.getFullYear(), 2026);
  assert.equal(date.getMonth(), 10);
  assert.equal(date.getDate(), 25);
});

test("T1 parseLocalDate acepta el 29 de febrero solo en años bisiestos", () => {
  assert.notEqual(parseLocalDate("2028-02-29"), null);
  assert.equal(parseLocalDate("2026-02-29"), null);
});

test("T1 parseLocalDate rechaza fechas que no existen", () => {
  for (const text of ["2026-02-31", "2026-04-31", "2026-13-01", "2026-00-10", "2026-01-00"]) {
    assert.equal(parseLocalDate(text), null, text);
  }
});

test("T1 parseLocalDate exige el formato AAAA-MM-DD", () => {
  const texts = ["", "2026-2-3", "26-02-03", "2026/02/03", "2026-02-03T10:00", " 2026-02-03", "2026-02-03\n", "hoy"];
  for (const text of texts) {
    assert.equal(parseLocalDate(text), null, JSON.stringify(text));
  }
});

test("T1 parseLocalDate rechaza valores que no son texto", () => {
  for (const value of [undefined, null, 20260203, {}, ["2026-02-03"], true]) {
    assert.equal(parseLocalDate(value), null, String(value));
  }
});

test("T1 formatLocalDate rellena con ceros y usa el día local", () => {
  assert.equal(formatLocalDate(new Date(2026, 0, 5)), "2026-01-05");
  assert.equal(formatLocalDate(new Date(2026, 10, 25, 0, 30)), "2026-11-25");
  assert.equal(formatLocalDate(new Date(2026, 10, 25, 23, 59)), "2026-11-25");
});

test("T1 addDays suma y resta cruzando mes, año y 29 de febrero", () => {
  assert.equal(addDays("2026-11-25", 0), "2026-11-25");
  assert.equal(addDays("2026-11-30", 1), "2026-12-01");
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(addDays("2027-01-01", -1), "2026-12-31");
  assert.equal(addDays("2028-02-28", 1), "2028-02-29");
  assert.equal(addDays("2028-03-01", -1), "2028-02-29");
  assert.equal(addDays("2026-11-23", -77), "2026-09-07");
});

test("T1 addDays no repite ni salta días en los cambios de hora", () => {
  // La comprobación del desfase confirma que la zona horaria se ha aplicado de verdad.
  const cases = [
    { zone: "Europe/Madrid", before: "2026-03-28", change: "2026-03-29", after: "2026-03-30", offsets: [-60, -120] },
    { zone: "Europe/Madrid", before: "2026-10-24", change: "2026-10-25", after: "2026-10-26", offsets: [-120, -60] },
    { zone: "America/New_York", before: "2026-03-07", change: "2026-03-08", after: "2026-03-09", offsets: [300, 240] },
    { zone: "America/New_York", before: "2026-10-31", change: "2026-11-01", after: "2026-11-02", offsets: [240, 300] },
  ];
  for (const { zone, before, change, after, offsets } of cases) {
    process.env.TZ = zone;
    assert.equal(parseLocalDate(before).getTimezoneOffset(), offsets[0], zone);
    assert.equal(parseLocalDate(after).getTimezoneOffset(), offsets[1], zone);
    assert.equal(addDays(before, 1), change, zone);
    assert.equal(addDays(change, 1), after, zone);
    assert.equal(addDays(after, -1), change, zone);
    assert.equal(addDays(change, -1), before, zone);
  }
});

test("T1 getWeekStart devuelve el lunes de la semana", () => {
  assert.equal(getWeekStart("2026-11-23"), "2026-11-23"); // lunes
  assert.equal(getWeekStart("2026-11-25"), "2026-11-23"); // miércoles
  assert.equal(getWeekStart("2026-11-29"), "2026-11-23"); // domingo
  assert.equal(getWeekStart("2026-11-30"), "2026-11-30"); // lunes siguiente
});

test("T1 getWeekStart cruza mes, año y cambio de hora", () => {
  assert.equal(getWeekStart("2026-10-01"), "2026-09-28");
  assert.equal(getWeekStart("2027-01-02"), "2026-12-28");
  process.env.TZ = "Europe/Madrid";
  assert.equal(getWeekStart("2026-03-29"), "2026-03-23");
  assert.equal(getWeekStart("2026-10-25"), "2026-10-19");
});

// ----- Pureza y carga -----

test("T1 heat-map.js no usa DOM, almacenamiento, reloj ni UTC", () => {
  const source = fs.readFileSync(SOURCE_PATH, "utf8");
  const forbidden = [/\bdocument\b/, /\bwindow\b/, /localStorage/, /Date\.now/, /new Date\(\s*\)/, /toISOString/, /\bgetUTC/];
  for (const pattern of forbidden) {
    assert.doesNotMatch(source, pattern);
  }
});

test("T1 heat-map.js se carga como script clásico, sin module", () => {
  const context = vm.createContext({});
  vm.runInContext(fs.readFileSync(SOURCE_PATH, "utf8"), context);
  assert.equal(vm.runInContext('addDays("2026-12-31", 1)', context), "2027-01-01");
});

// ----- T2: sesiones válidas y suma por día -----

const session = (fecha, minutos) => ({ id: 1, fecha, tema: "Tema", minutos });

const DAMAGED_SESSIONS = [
  null,
  undefined,
  7,
  "texto",
  [],
  {},
  { minutos: 30 },
  session("2026-02-31", 30),
  session("2026-2-3", 30),
  session(20261125, 30),
  session("2026-11-25", 0),
  session("2026-11-25", -5),
  session("2026-11-25", "30"),
  session("2026-11-25", ""),
  session("2026-11-25", NaN),
  session("2026-11-25", Infinity),
  { fecha: "2026-11-25" },
];

test("T2 isValidSession acepta fecha real y minutos mayores que 0", () => {
  assert.equal(isValidSession(session("2026-11-25", 1)), true);
  assert.equal(isValidSession(session("2028-02-29", 0.5)), true);
});

test("T2 isValidSession rechaza sesiones dañadas", () => {
  for (const damaged of DAMAGED_SESSIONS) {
    assert.equal(isValidSession(damaged), false, JSON.stringify(damaged));
  }
});

test("T2 sumMinutesByDate suma las sesiones del mismo día", () => {
  const sessions = [session("2026-11-25", 20), session("2026-11-24", 5), session("2026-11-25", 20)];
  assert.deepEqual({ ...sumMinutesByDate(sessions, "2026-11-25") }, { "2026-11-25": 40, "2026-11-24": 5 });
});

test("T2 sumMinutesByDate ignora dañadas y futuras", () => {
  const sessions = [...DAMAGED_SESSIONS, session("2026-11-25", 15), session("2026-11-26", 90)];
  assert.deepEqual({ ...sumMinutesByDate(sessions, "2026-11-25") }, { "2026-11-25": 15 });
});

test("T2 la lógica no modifica las sesiones", () => {
  const sessions = [session("2026-11-25", 20), session("2026-02-31", 5), null];
  const before = JSON.stringify(sessions);
  sessions.forEach((item) => item && Object.freeze(item));
  Object.freeze(sessions);
  sumMinutesByDate(sessions, "2026-11-25");
  buildHeatMap(sessions, "2026-11-25");
  assert.equal(JSON.stringify(sessions), before);
});

// ----- T3: niveles -----

test("T3 getIntensityLevel respeta los límites de cada nivel", () => {
  const cases = [
    [0, 0], [0.5, 1], [1, 1], [29, 1], [29.5, 1], [30, 2], [59, 2],
    [59.5, 2], [60, 3], [119, 3], [120, 4], [1500, 4],
  ];
  for (const [minutes, level] of cases) {
    assert.equal(getIntensityLevel(minutes), level, String(minutes));
  }
});

test("T3 la leyenda tiene cinco niveles que coinciden con el cálculo", () => {
  const labels = ["0 min", "Menos de 30", "30 o más", "60 o más", "120 o más"];
  assert.deepEqual(INTENSITY_LEVELS.map((item) => item.label), labels);
  assert.deepEqual(INTENSITY_LEVELS.map((item) => item.level), [0, 1, 2, 3, 4]);
  for (const { level, minimum } of INTENSITY_LEVELS.slice(2)) {
    assert.equal(getIntensityLevel(minimum), level);
    assert.equal(getIntensityLevel(minimum - 0.1), level - 1);
  }
});

// ----- T4: construcción del mapa -----

const allDays = (heatMap) => heatMap.weeks.flat().filter((day) => day !== null);
const findDay = (heatMap, date) => allDays(heatMap).find((day) => day.date === date);

function assertConsecutive(days) {
  for (let i = 1; i < days.length; i++) {
    assert.equal(days[i].date, addDays(days[i - 1].date, 1));
  }
}

test("T4 un miércoles: del 07/09/2026 al 25/11/2026, con huecos futuros", () => {
  const heatMap = buildHeatMap([], "2026-11-25");
  const days = allDays(heatMap);
  assert.equal(heatMap.weeks.length, 12);
  assert.ok(heatMap.weeks.every((week) => week.length === 7));
  assert.equal(days[0].date, "2026-09-07");
  assert.equal(days.at(-1).date, "2026-11-25");
  assert.deepEqual(heatMap.weeks[11].slice(3), [null, null, null, null]);
  assert.equal(days.length, 80);
  assertConsecutive(days);
});

test("T4 un lunes solo muestra un día de la semana actual", () => {
  const heatMap = buildHeatMap([], "2026-11-23");
  assert.equal(heatMap.weeks[11].filter(Boolean).length, 1);
  assert.equal(heatMap.weeks[11][0].date, "2026-11-23");
});

test("T4 un domingo muestra los 84 días, de lunes a domingo", () => {
  const heatMap = buildHeatMap([], "2026-11-29");
  assert.equal(allDays(heatMap).length, 84);
  for (const week of heatMap.weeks) {
    assert.deepEqual(week.map((day) => parseLocalDate(day.date).getDay()), [1, 2, 3, 4, 5, 6, 0]);
  }
});

test("T4 solo hoy está marcado", () => {
  const marked = allDays(buildHeatMap([], "2026-11-25")).filter((day) => day.isToday);
  assert.deepEqual(marked.map((day) => day.date), ["2026-11-25"]);
});

test("T4 incluye el primer día y excluye el anterior", () => {
  const heatMap = buildHeatMap([session("2026-09-07", 30), session("2026-09-06", 90)], "2026-11-25");
  assert.equal(findDay(heatMap, "2026-09-07").level, 2);
  assert.equal(findDay(heatMap, "2026-09-06"), undefined);
  assert.equal(allDays(heatMap).filter((day) => day.minutes > 0).length, 1);
});

test("T4 no repite ni salta días con año nuevo, bisiesto y cambios de hora", () => {
  // Todos estos días son domingo: el periodo tiene 84 días.
  const todays = ["2027-01-31", "2028-03-05", "2026-04-05", "2026-11-01", "2026-03-29", "2026-10-25"];
  for (const zone of ["Europe/Madrid", "America/New_York", "America/Buenos_Aires", "America/Santiago"]) {
    process.env.TZ = zone;
    for (const today of todays) {
      const days = allDays(buildHeatMap([], today));
      assert.equal(days.length, 84, `${zone} ${today}`);
      assert.equal(days.at(-1).date, today);
      assertConsecutive(days);
    }
  }
  assert.ok(findDay(buildHeatMap([], "2028-03-05"), "2028-02-29"));
});

test("T4 el periodo depende solo del hoy recibido", () => {
  assert.deepEqual(buildHeatMap([], "2026-11-25"), buildHeatMap([], "2026-11-25"));
  assert.equal(allDays(buildHeatMap([], "2026-11-30"))[0].date, "2026-09-14");
});

test("T4 niveles y sumas de los casos límite", () => {
  const minutes = [29, 30, 59, 60, 119, 120, 1500];
  const sessions = minutes.map((value, i) => session(addDays("2026-11-25", -i), value));
  sessions.push(null, session("2026-11-18", 20), session("2026-11-18", 20), session("2026-11-18", -3));
  const heatMap = buildHeatMap(sessions, "2026-11-25");
  const levels = minutes.map((_, i) => findDay(heatMap, addDays("2026-11-25", -i)).level);
  assert.deepEqual(levels, [1, 2, 2, 3, 3, 4, 4]);
  assert.equal(findDay(heatMap, "2026-11-19").minutes, 1500);
  assert.equal(findDay(heatMap, "2026-11-18").minutes, 40);
  assert.equal(findDay(heatMap, "2026-11-18").level, 2);
});

test("T4 una sesión nueva solo cambia su día", () => {
  const before = buildHeatMap([session("2026-11-20", 20)], "2026-11-25");
  const after = buildHeatMap([session("2026-11-20", 20), session("2026-11-21", 60)], "2026-11-25");
  const changed = allDays(after).filter((day) => day.minutes !== findDay(before, day.date).minutes);
  assert.deepEqual(changed.map((day) => day.date), ["2026-11-21"]);
});

test("T4 una sesión anterior al periodo no cambia el mapa", () => {
  assert.deepEqual(buildHeatMap([session("2026-01-10", 60)], "2026-11-25"), buildHeatMap([], "2026-11-25"));
});

test("T4 sin sesiones legibles, todo el periodo está en nivel 0", () => {
  for (const sessions of [[], null, undefined, {}, 5, "texto", DAMAGED_SESSIONS]) {
    const days = allDays(buildHeatMap(sessions, "2026-11-25"));
    assert.equal(days.length, 80);
    assert.ok(days.every((day) => day.level === 0 && day.minutes === 0));
  }
});

// ----- T5: rótulos de mes -----

const labelsFor = (today) => buildHeatMap([], today).monthLabels;

test("T5 rotula la semana del día 1 y el primer mes si empieza a mitad", () => {
  const expected = Array(12).fill(null);
  expected[0] = "sep";
  expected[3] = "oct"; // semana del 28/09 al 04/10
  expected[7] = "nov"; // semana del 26/10 al 01/11
  assert.deepEqual(labelsFor("2026-11-25"), expected);
});

test("T5 día 1 en la primera columna", () => {
  // Primera semana: del 31/08 al 06/09
  assert.equal(labelsFor("2026-11-22")[0], "sep");
});

test("T5 día 1 en la segunda columna: la primera queda sin rótulo", () => {
  // Primera semana: del 24/08 al 30/08
  const labels = labelsFor("2026-11-15");
  assert.equal(labels[0], null);
  assert.equal(labels[1], "sep");
});

test("T5 día 1 en la última columna, solo si ya ha llegado", () => {
  assert.equal(labelsFor("2026-12-01")[11], "dic");
  assert.equal(labelsFor("2026-11-30")[11], null);
});

test("T5 los doce meses están en español", () => {
  const months = [];
  for (let month = 1; month <= 12; month++) {
    const monday = getWeekStart(`2026-${String(month).padStart(2, "0")}-01`);
    months.push(getMonthLabels([monday], "2026-12-31")[0]);
  }
  assert.deepEqual(months, ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]);
});

// ----- T6: detalle y flechas -----

test("T6 formatDayDetail muestra fecha completa y minutos", () => {
  assert.equal(formatDayDetail({ date: "2026-11-24", minutes: 75 }), "martes, 24 de noviembre de 2026: 75 min");
  assert.equal(formatDayDetail({ date: "2026-11-25", minutes: 0 }), "miércoles, 25 de noviembre de 2026: 0 min");
});

test("T6 findNextDate se mueve en las cuatro direcciones", () => {
  const heatMap = buildHeatMap([], "2026-11-25");
  assert.equal(findNextDate(heatMap, "2026-11-17", "ArrowUp"), "2026-11-16");
  assert.equal(findNextDate(heatMap, "2026-11-17", "ArrowDown"), "2026-11-18");
  assert.equal(findNextDate(heatMap, "2026-11-17", "ArrowLeft"), "2026-11-10");
  assert.equal(findNextDate(heatMap, "2026-11-17", "ArrowRight"), "2026-11-24");
});

test("T6 findNextDate no sale del mapa ni entra en huecos", () => {
  const heatMap = buildHeatMap([], "2026-11-25");
  const cases = [
    ["2026-11-16", "ArrowUp"], // lunes
    ["2026-11-22", "ArrowDown"], // domingo
    ["2026-09-08", "ArrowLeft"], // primera semana
    ["2026-11-24", "ArrowRight"], // última semana
    ["2026-11-25", "ArrowDown"], // mañana es un hueco
    ["2026-11-20", "ArrowRight"], // el viernes de esta semana es un hueco
    ["2026-11-17", "Enter"],
  ];
  for (const [date, key] of cases) {
    assert.equal(findNextDate(heatMap, date, key), date, `${date} ${key}`);
  }
});
