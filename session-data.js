// Lógica pura para leer y guardar sesiones sin perder datos.
// Trabaja con textos: quien llama se encarga de leerlos y escribirlos en el navegador.

const BACKUP_PREFIX = "diario-estudio-copia-";

// Interpreta el texto guardado (null si nunca se ha guardado nada).
function parseStoredSessions(text) {
  if (text === null) {
    return { isReadable: true, sessions: [] };
  }
  try {
    const data = JSON.parse(text);
    if (Array.isArray(data)) {
      return { isReadable: true, sessions: data };
    }
  } catch (error) {
    // No es JSON: se trata igual que cualquier dato ilegible.
  }
  return { isReadable: false, sessions: [] };
}

// Devuelve el texto con la sesión añadida. No reescribe lo anterior: así las sesiones
// dañadas quedan exactamente como estaban.
function appendSession(text, session) {
  const { isReadable, sessions } = parseStoredSessions(text);
  if (!isReadable) {
    throw new Error("Los datos guardados no se pueden leer");
  }
  const newText = JSON.stringify(session);
  if (sessions.length === 0) {
    return `[${newText}]`;
  }
  const withoutBracket = text.trimEnd().slice(0, -1);
  return `${withoutBracket},${newText}]`;
}

// Devuelve la clave para una copia nueva, o null si ya hay una copia idéntica.
// backups es una lista de { key, text }.
function getNewBackupKey(backups, text) {
  if (backups.some((backup) => backup.text === text)) {
    return null;
  }
  let lastNumber = 0;
  for (const { key } of backups) {
    const number = Number(key.slice(BACKUP_PREFIX.length));
    if (Number.isInteger(number) && number > lastNumber) {
      lastNumber = number;
    }
  }
  return BACKUP_PREFIX + (lastNumber + 1);
}

// En los tests (Node) se exportan las funciones; en el navegador, "module" no existe.
if (typeof module !== "undefined") {
  module.exports = { BACKUP_PREFIX, parseStoredSessions, appendSession, getNewBackupKey };
}
