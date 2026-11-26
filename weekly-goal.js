// Lógica pura del objetivo semanal: sin interfaz, sin datos guardados y sin consultar el reloj.

const MAX_WEEKLY_GOAL = 10080; // los minutos que tiene una semana

// Valida lo escrito en el campo. "status" es "empty", "valid" o "invalid".
function parseGoalInput(text) {
  const trimmedText = text.trim();
  if (trimmedText === "") {
    return { status: "empty", goal: null };
  }
  const goal = Number(trimmedText);
  const hasOnlyDigits = /^[0-9]+$/.test(trimmedText);
  if (hasOnlyDigits && goal >= 1 && goal <= MAX_WEEKLY_GOAL) {
    return { status: "valid", goal };
  }
  return { status: "invalid", goal: null };
}

// Valida lo guardado (null si no hay nada). Solo admite las cifras justas, sin ceros delante.
function parseStoredGoal(text) {
  if (text === null) {
    return { goal: null, isDamaged: false };
  }
  const { status, goal } = parseGoalInput(text);
  if (status === "valid" && String(goal) === text) {
    return { goal, isDamaged: false };
  }
  return { goal: null, isDamaged: true };
}

// Suma los minutos de lunes a hoy. Usa getWeekStart e isValidSession, de heat-map.js.
// Suma en el orden guardado: agrupar por día cambiaría el resultado con decimales.
function getWeeklyTotal(sessions, today) {
  const monday = getWeekStart(today);
  let total = 0;
  for (const session of sessions) {
    if (isValidSession(session) && session.fecha >= monday && session.fecha <= today) {
      total += session.minutos;
    }
  }
  return total;
}

// Texto, porcentaje de la barra (máximo 100) y si se ha cumplido. Sin objetivo, "goal" es null.
function getGoalProgress(total, goal) {
  if (goal === null) {
    return { text: `${total} min`, percent: null, isAchieved: false };
  }
  return {
    text: `${total} de ${goal} min`,
    percent: Math.min((total / goal) * 100, 100),
    isAchieved: total >= goal,
  };
}

// En los tests (Node) se exportan las funciones; en el navegador, "module" no existe.
if (typeof module !== "undefined") {
  module.exports = { MAX_WEEKLY_GOAL, parseGoalInput, parseStoredGoal, getWeeklyTotal, getGoalProgress };
}
