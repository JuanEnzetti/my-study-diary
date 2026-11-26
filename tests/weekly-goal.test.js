const { test, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const SOURCE_PATH = path.join(__dirname, "..", "weekly-goal.js");
const { MAX_WEEKLY_GOAL, parseGoalInput, parseStoredGoal, getWeeklyTotal, getGoalProgress } = require(SOURCE_PATH);
const { parseLocalDate, formatLocalDate, addDays, getWeekStart, isValidSession } = require("../heat-map.js");

// En el navegador estas funciones de heat-map.js ya son globales.
Object.assign(globalThis, { getWeekStart, isValidSession });

const originalTimeZone = process.env.TZ;

afterEach(() => {
  if (originalTimeZone === undefined) {
    delete process.env.TZ;
  } else {
    process.env.TZ = originalTimeZone;
  }
});

// ----- T1: objetivo escrito -----

const INVALID_TEXTS = [
  "0",
  "000",
  "-5",
  "+300",
  "30.5",
  "30,5",
  "abc",
  "-",
  "1e3",
  "300.0",
  "10.080",
  "10 080",
  "10081",
  "٣٠٠",
  "３００",
  "9".repeat(5000),
];

test("T1 el objetivo máximo es 10080 minutos", () => {
  assert.equal(MAX_WEEKLY_GOAL, 10080);
});

test("T1 parseGoalInput acepta enteros de 1 a 10080", () => {
  for (const [text, goal] of [["1", 1], ["300", 300], ["10079", 10079], ["10080", 10080]]) {
    assert.deepEqual(parseGoalInput(text), { status: "valid", goal }, text);
  }
});

test("T1 parseGoalInput ignora los ceros delante y los espacios de los extremos", () => {
  const texts = ["0300", " 300 ", "  0300", "\t300\t", " 300 ", "0".repeat(5000) + "300"];
  for (const text of texts) {
    assert.deepEqual(parseGoalInput(text), { status: "valid", goal: 300 }, JSON.stringify(text.slice(0, 20)));
  }
});

test("T1 parseGoalInput distingue el campo vacío o solo con espacios", () => {
  for (const text of ["", " ", "    ", "\t", " "]) {
    assert.deepEqual(parseGoalInput(text), { status: "empty", goal: null }, JSON.stringify(text));
  }
});

test("T1 parseGoalInput rechaza lo que no es un objetivo válido", () => {
  for (const text of [...INVALID_TEXTS, "0x10", "null", "Infinity", " abc "]) {
    assert.deepEqual(parseGoalInput(text), { status: "invalid", goal: null }, text.slice(0, 20));
  }
});

// ----- T1: objetivo guardado -----

test("T1 parseStoredGoal sin nada guardado no da objetivo ni daño", () => {
  assert.deepEqual(parseStoredGoal(null), { goal: null, isDamaged: false });
});

test("T1 parseStoredGoal acepta solo las cifras de un objetivo válido", () => {
  for (const [text, goal] of [["1", 1], ["300", 300], ["10080", 10080]]) {
    assert.deepEqual(parseStoredGoal(text), { goal, isDamaged: false }, text);
  }
});

test("T1 parseStoredGoal trata como dañado cualquier otro contenido", () => {
  const texts = [...INVALID_TEXTS, "", " ", "20000", "0300", " 300 ", "300\n", "null", "undefined", "[300]", '"300"'];
  for (const text of texts) {
    assert.deepEqual(parseStoredGoal(text), { goal: null, isDamaged: true }, JSON.stringify(text.slice(0, 20)));
  }
});

// ----- T1: pureza y carga -----

test("T1 weekly-goal.js no usa DOM, almacenamiento, reloj ni UTC", () => {
  const source = fs.readFileSync(SOURCE_PATH, "utf8");
  const forbidden = [/\bdocument\b/, /\bwindow\b/, /localStorage/, /Date\.now/, /\bnew Date\b/, /\bperformance\b/, /toISOString/, /\bgetUTC/];
  for (const pattern of forbidden) {
    assert.doesNotMatch(source, pattern);
  }
});

test("T1 weekly-goal.js se carga como script clásico, sin module", () => {
  const context = vm.createContext({});
  vm.runInContext(fs.readFileSync(SOURCE_PATH, "utf8"), context);
  assert.equal(vm.runInContext('parseGoalInput("300").goal', context), 300);
});

// ----- T2: total semanal -----

function session(fecha, minutos) {
  return { id: 1, fecha, tema: "Prueba", minutos };
}

// Una sesión por día desde el domingo anterior hasta el lunes siguiente (9 días).
// Cada una vale el doble que la anterior: así el total dice qué días se han sumado.
function sessionsAroundWeek(monday) {
  return Array.from({ length: 9 }, (_, i) => session(addDays(monday, i - 1), 2 ** i));
}

test("T2 getWeeklyTotal sin sesiones da 0", () => {
  assert.equal(getWeeklyTotal([], "2026-11-25"), 0);
});

test("T2 getWeeklyTotal en lunes solo cuenta el lunes", () => {
  assert.equal(getWeeklyTotal(sessionsAroundWeek("2026-11-23"), "2026-11-23"), 2);
});

test("T2 getWeeklyTotal entre semana cuenta de lunes a hoy, sin fechas futuras", () => {
  assert.equal(getWeeklyTotal(sessionsAroundWeek("2026-11-23"), "2026-11-25"), 2 + 4 + 8);
});

test("T2 getWeeklyTotal en domingo cuenta los siete días y no los de otras semanas", () => {
  assert.equal(getWeeklyTotal(sessionsAroundWeek("2026-11-23"), "2026-11-29"), 2 + 4 + 8 + 16 + 32 + 64 + 128);
});

test("T2 getWeeklyTotal empieza de nuevo el lunes", () => {
  const sessions = [session("2026-11-29", 350)];
  assert.equal(getWeeklyTotal(sessions, "2026-11-29"), 350);
  assert.equal(getWeeklyTotal(sessions, "2026-11-30"), 0);
});

test("T2 getWeeklyTotal suma todas las sesiones del mismo día", () => {
  const sessions = [session("2026-11-25", 30), session("2026-11-23", 40), session("2026-11-25", 20)];
  assert.equal(getWeeklyTotal(sessions, "2026-11-25"), 90);
});

test("T2 getWeeklyTotal no suma sesiones dañadas", () => {
  const damaged = [
    null,
    undefined,
    "texto",
    7,
    {},
    session("2026-11-24T10:00", 10),
    session("24/11/2026", 10),
    session(20261124, 10),
    session("2026-11-24", "10"),
    session("2026-11-24", 0),
    session("2026-11-24", -5),
    session("2026-11-24", NaN),
    session("2026-11-24", Infinity),
    session("2026-11-24", null),
  ];
  assert.equal(getWeeklyTotal([...damaged, session("2026-11-24", 30)], "2026-11-25"), 30);
  // El 31 de noviembre no existe, aunque como texto quede entre el lunes y hoy.
  assert.equal(getWeeklyTotal([session("2026-11-31", 10), session("2026-12-01", 20)], "2026-12-02"), 20);
});

test("T2 getWeeklyTotal no cambia las sesiones recibidas", () => {
  const sessions = Object.freeze([Object.freeze(session("2026-11-25", 30)), Object.freeze(session("2026-11-24", 20))]);
  assert.equal(getWeeklyTotal(sessions, "2026-11-25"), 50);
});

// ----- T2: calendario -----

test("T2 getWeeklyTotal no pierde ni repite días en cambios de hora ni al cruzar mes o año", () => {
  const mondays = [
    "2026-03-23", // cambio de hora en Madrid: domingo 29/03
    "2026-10-19", // cambio de hora en Madrid: domingo 25/10
    "2026-03-02", // cambio de hora en Nueva York: domingo 08/03
    "2026-10-26", // cambio de hora en Nueva York: domingo 01/11; cruza de mes
    "2026-08-31", // cruza de mes
    "2026-12-28", // cruza de año
    "2028-02-28", // 29 de febrero
  ];
  for (const zone of ["Europe/Madrid", "America/New_York", "America/Santiago", "UTC"]) {
    process.env.TZ = zone;
    for (const monday of mondays) {
      const sessions = sessionsAroundWeek(monday);
      let expected = 0;
      for (let i = 0; i < 7; i++) {
        expected += 2 ** (i + 1);
        assert.equal(getWeeklyTotal(sessions, addDays(monday, i)), expected, `${zone} ${addDays(monday, i)}`);
      }
      assert.equal(getWeeklyTotal(sessions, addDays(monday, 7)), 2 ** 8, `${zone}: lunes siguiente`);
    }
  }
});

test("T2 la zona horaria de las pruebas cambia de verdad la hora", () => {
  process.env.TZ = "Europe/Madrid";
  assert.equal(parseLocalDate("2026-03-28").getTimezoneOffset(), -60);
  assert.equal(parseLocalDate("2026-03-30").getTimezoneOffset(), -120);
  assert.equal(parseLocalDate("2026-10-24").getTimezoneOffset(), -120);
  assert.equal(parseLocalDate("2026-10-26").getTimezoneOffset(), -60);
});

test("T2 una sesión de las 00:30 cuenta en su día local", () => {
  process.env.TZ = "Europe/Madrid";
  // A las 00:30 de estos lunes, en UTC todavía es domingo.
  for (const [year, month, day] of [[2026, 3, 30], [2026, 10, 26], [2026, 11, 23]]) {
    const now = new Date(year, month - 1, day, 0, 30);
    const today = formatLocalDate(now);
    assert.notEqual(now.getUTCDate(), day);
    assert.equal(getWeeklyTotal([session(today, 25), session(addDays(today, -1), 40)], today), 25, today);
  }
});

// ----- T2: decimales -----

test("T2 getWeeklyTotal conserva los decimales sin redondear", () => {
  const sessions = [session("2026-11-24", 0.1), session("2026-11-25", 0.2)];
  assert.equal(getWeeklyTotal(sessions, "2026-11-25"), 0.30000000000000004);
});

test("T2 getWeeklyTotal suma en el orden guardado, sin agrupar por día", () => {
  const sameDay = Array.from({ length: 10 }, () => session("2026-11-25", 0.1));
  const twoDays = Array.from({ length: 10 }, (_, i) => session(i % 2 === 0 ? "2026-11-24" : "2026-11-25", 0.1));
  assert.equal(getWeeklyTotal(sameDay, "2026-11-25"), 0.9999999999999999);
  assert.equal(getWeeklyTotal(twoDays, "2026-11-25"), 0.9999999999999999);
});

// ----- T3: progreso -----

test("T3 getGoalProgress con objetivo da el texto, el porcentaje y si está cumplido", () => {
  const cases = [
    { total: 0, text: "0 de 300 min", percent: 0, isAchieved: false },
    { total: 90, text: "90 de 300 min", percent: 30, isAchieved: false },
    { total: 300, text: "300 de 300 min", percent: 100, isAchieved: true },
    { total: 350, text: "350 de 300 min", percent: 100, isAchieved: true },
  ];
  for (const { total, ...expected } of cases) {
    assert.deepEqual(getGoalProgress(total, 300), expected);
  }
});

test("T3 getGoalProgress no redondea hacia arriba cuando falta poco", () => {
  const almost = getGoalProgress(299, 300);
  assert.equal(almost.text, "299 de 300 min");
  assert.equal(almost.percent.toFixed(2), "99.67");
  assert.equal(almost.isAchieved, false);

  const maximum = getGoalProgress(10079, 10080);
  assert.equal(maximum.text, "10079 de 10080 min");
  assert.ok(maximum.percent > 99.99 && maximum.percent < 100);
  assert.equal(maximum.isAchieved, false);
});

test("T3 getGoalProgress conserva los decimales del total", () => {
  assert.equal(getGoalProgress(0.1 + 0.2, 300).text, "0.30000000000000004 de 300 min");

  const almost = getGoalProgress(0.9999999999999999, 1);
  assert.equal(almost.text, "0.9999999999999999 de 1 min");
  assert.ok(almost.percent < 100);
  assert.equal(almost.isAchieved, false);
});

test("T3 getGoalProgress en los objetivos mínimo y máximo", () => {
  assert.deepEqual(getGoalProgress(1, 1), { text: "1 de 1 min", percent: 100, isAchieved: true });
  assert.deepEqual(getGoalProgress(10080, 10080), { text: "10080 de 10080 min", percent: 100, isAchieved: true });
});

test("T3 getGoalProgress sin objetivo solo da el total", () => {
  for (const [total, text] of [[0, "0 min"], [350, "350 min"], [0.1 + 0.2, "0.30000000000000004 min"]]) {
    assert.deepEqual(getGoalProgress(total, null), { text, percent: null, isAchieved: false });
  }
});

test("T3 getGoalProgress cambia al cambiar o quitar el objetivo", () => {
  assert.deepEqual(getGoalProgress(350, 400), { text: "350 de 400 min", percent: 87.5, isAchieved: false });
  assert.deepEqual(getGoalProgress(350, 300), { text: "350 de 300 min", percent: 100, isAchieved: true });
  assert.deepEqual(getGoalProgress(350, null), { text: "350 min", percent: null, isAchieved: false });
});
