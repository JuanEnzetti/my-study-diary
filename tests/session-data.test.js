const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const SOURCE_PATH = path.join(__dirname, "..", "session-data.js");
const { parseStoredSessions, appendSession, getNewBackupKey, BACKUP_PREFIX } = require(SOURCE_PATH);

const NEW_SESSION = { id: 2, fecha: "2026-11-25", tema: 'Comillas " y ]', minutos: 30 };

test("RF-1 sin datos o con lista vacía, se puede leer", () => {
  assert.deepEqual(parseStoredSessions(null), { isReadable: true, sessions: [] });
  assert.deepEqual(parseStoredSessions("[]"), { isReadable: true, sessions: [] });
});

test("RF-1 lo que no es una lista es ilegible", () => {
  for (const text of ["", " ", '[{"id":1,"fec', "null", "5", '"texto"', '{"a":1}', "true"]) {
    assert.deepEqual(parseStoredSessions(text), { isReadable: false, sessions: [] }, text);
  }
});

test("RF-5 una lista con elementos dañados es legible y se devuelve entera", () => {
  const { isReadable, sessions } = parseStoredSessions('[null,7,{"fecha":"2026-02-31"}]');
  assert.equal(isReadable, true);
  assert.equal(sessions.length, 3);
});

test("RF-6 appendSession añade al final sin reescribir lo anterior", () => {
  const texts = [
    '[{"id":1,"fecha":"2026-11-24","tema":"a","minutos":5}]',
    '[ null , 7,{"minutos":1e999,"x":1.0,"x":2} ]\n',
    '["acaba en ]"]',
  ];
  for (const text of texts) {
    const result = appendSession(text, NEW_SESSION);
    const previous = text.trimEnd().slice(0, -1);
    assert.ok(result.startsWith(previous), text);
    const parsed = JSON.parse(result);
    assert.equal(parsed.length, JSON.parse(text).length + 1);
    assert.deepEqual(parsed.at(-1), NEW_SESSION);
  }
});

test("RF-6 appendSession empieza una lista si no hay sesiones", () => {
  for (const text of [null, "[]", " [ ] "]) {
    assert.deepEqual(JSON.parse(appendSession(text, NEW_SESSION)), [NEW_SESSION]);
  }
});

test("RF-6 guardar varias veces conserva el orden", () => {
  let text = null;
  for (const id of [1, 2, 3]) {
    text = appendSession(text, { ...NEW_SESSION, id });
  }
  assert.deepEqual(JSON.parse(text).map((item) => item.id), [1, 2, 3]);
});

test("RF-1 appendSession se niega a escribir sobre datos ilegibles", () => {
  for (const text of ["", "[1", "null", "{}"]) {
    assert.throws(() => appendSession(text, NEW_SESSION), text);
  }
});

test("RF-3 getNewBackupKey no repite una copia idéntica", () => {
  const backups = [{ key: BACKUP_PREFIX + "1", text: "[1" }];
  assert.equal(getNewBackupKey(backups, "[1"), null);
});

test("RF-3 getNewBackupKey nunca reutiliza una clave", () => {
  assert.equal(getNewBackupKey([], "x"), BACKUP_PREFIX + "1");
  const backups = [
    { key: BACKUP_PREFIX + "10", text: "a" },
    { key: BACKUP_PREFIX + "2", text: "b" },
    { key: BACKUP_PREFIX + "raro", text: "c" },
  ];
  assert.equal(getNewBackupKey(backups, "x"), BACKUP_PREFIX + "11");
});

test("session-data.js es puro", () => {
  const source = fs.readFileSync(SOURCE_PATH, "utf8");
  assert.doesNotMatch(source, /\bdocument\b|\bwindow\b|localStorage|\bDate\b/);
});
