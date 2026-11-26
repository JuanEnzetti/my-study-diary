// Interfaz del objetivo semanal.

const WEEKLY_GOAL_KEY = "diario-estudio-objetivo-semanal";
const GOAL_NOTICE_TEXT =
  "No se ha podido leer el objetivo semanal. Si habías guardado uno, ahora no se muestra.";
const INVALID_GOAL_TEXT = "Escribe un número entero de 1 a 10080, sin puntos ni comas.";
const SAVE_GOAL_ERROR_TEXT =
  "El objetivo no se ha guardado. Revisa si el navegador tiene espacio y permite guardar datos, y vuelve a intentarlo.";
const REMOVE_GOAL_ERROR_TEXT =
  "El objetivo no se ha quitado. Revisa si el navegador permite guardar datos, y vuelve a intentarlo.";

const weeklyTotalText = document.getElementById("minutos-semana");
const weeklyGoalBar = document.getElementById("weekly-goal-bar");
const weeklyGoalFill = document.getElementById("weekly-goal-fill");
const weeklyGoalAchieved = document.getElementById("weekly-goal-achieved");
const weeklyGoalNotice = document.getElementById("weekly-goal-notice");
const weeklyGoalForm = document.getElementById("weekly-goal-form");
const weeklyGoalInput = document.getElementById("weekly-goal-input");
const weeklyGoalError = document.getElementById("weekly-goal-error");

// Lo que muestra esta página; no cambia solo, aunque pase la medianoche.
let currentGoal = null;
let currentTotal = 0;

// Lee el objetivo y actualiza el progreso. No toca el campo ni el error.
function refreshWeeklyGoal(sessions, today) {
  const { goal, isDamaged } = readStoredGoal();
  currentGoal = goal;
  setTextIfChanged(weeklyGoalNotice, isDamaged ? GOAL_NOTICE_TEXT : "");
  currentTotal = getWeeklyTotal(sessions, today);
  renderWeeklyGoal();
}

function readStoredGoal() {
  try {
    return parseStoredGoal(localStorage.getItem(WEEKLY_GOAL_KEY));
  } catch (error) {
    return { goal: null, isDamaged: true }; // el navegador no deja leer: mismo aviso
  }
}

function renderWeeklyGoal() {
  const { text, percent, isAchieved } = getGoalProgress(currentTotal, currentGoal);
  setTextIfChanged(weeklyTotalText, text);
  weeklyGoalBar.hidden = currentGoal === null;
  weeklyGoalAchieved.hidden = !isAchieved;
  if (currentGoal !== null) {
    // Sin cumplir, deja al menos 2 px vacíos para que no parezca llena.
    weeklyGoalFill.style.width = isAchieved ? "100%" : `min(${percent}%, 100% - 2px)`;
  }
}

// Si el texto no cambia, no se reescribe: así el lector de pantalla no lo repite.
function setTextIfChanged(element, text) {
  if (element.textContent !== text) {
    element.textContent = text;
  }
}

function showGoalInField() {
  weeklyGoalInput.value = currentGoal === null ? "" : String(currentGoal);
}

// Guarda el objetivo; con null, lo quita. Falla si el navegador no lo permite.
function storeGoal(goal) {
  if (goal !== null) {
    localStorage.setItem(WEEKLY_GOAL_KEY, String(goal));
  } else if (localStorage.getItem(WEEKLY_GOAL_KEY) !== null) {
    localStorage.removeItem(WEEKLY_GOAL_KEY);
  }
}

// Cada error es un párrafo nuevo: así el lector de pantalla lo anuncia aunque se repita.
function showGoalError(text) {
  const paragraph = document.createElement("p");
  paragraph.textContent = text;
  weeklyGoalError.replaceChildren(paragraph);
}

weeklyGoalForm.addEventListener("submit", (event) => {
  event.preventDefault(); // evita que la página se recargue

  const { status, goal } = parseGoalInput(weeklyGoalInput.value);
  if (status === "invalid") {
    showGoalError(INVALID_GOAL_TEXT);
    return;
  }
  try {
    storeGoal(goal); // con el campo vacío, "goal" es null
  } catch (error) {
    // No se ha guardado ni quitado: lo demás que se ve no cambia.
    showGoalError(status === "empty" ? REMOVE_GOAL_ERROR_TEXT : SAVE_GOAL_ERROR_TEXT);
    return;
  }

  currentGoal = goal;
  showGoalInField();
  weeklyGoalError.replaceChildren();
  setTextIfChanged(weeklyGoalNotice, "");
  const sessions = readSessions();
  if (sessions !== null) {
    currentTotal = getWeeklyTotal(sessions, hoyEnTexto());
  } // si no se pueden leer, se mantiene el total que se mostraba
  renderWeeklyGoal();
});
