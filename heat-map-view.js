// Interfaz del mapa de calor: pinta lo que calcula heat-map.js.

const heatMapGrid = document.getElementById("heat-map");
const heatMapDetail = document.getElementById("heat-map-detail");
const heatMapLegend = document.getElementById("heat-map-legend");

// Rótulos de las filas, de lunes a domingo (solo lunes, miércoles y viernes).
const WEEKDAY_LABELS = ["L", "", "X", "", "V", "", ""];

let currentHeatMap = null;
let selectedDate = null; // día elegido; no se guarda

function renderHeatMap(sessions, today) {
  currentHeatMap = buildHeatMap(sessions, today);
  const days = currentHeatMap.weeks.flat().filter((day) => day !== null);

  // Tras la medianoche, el día elegido puede haber salido del periodo.
  if (!days.some((day) => day.date === selectedDate)) {
    selectedDate = null;
  }

  heatMapGrid.replaceChildren();
  addHeatMapLabels();
  currentHeatMap.weeks.forEach((week, weekIndex) => {
    week.forEach((day, dayIndex) => {
      if (day !== null) {
        const button = createDayButton(day);
        placeInGrid(button, weekIndex + 2, dayIndex + 2);
        heatMapGrid.appendChild(button);
      }
    });
  });

  renderLegend();
  updateSelection();
}

// La fila 1 es para los meses y la columna 1 para los días de la semana.
function placeInGrid(element, column, row) {
  element.style.gridColumn = column;
  element.style.gridRow = row;
}

function addHeatMapLabels() {
  currentHeatMap.monthLabels.forEach((text, i) => addLabel(text, i + 2, 1));
  WEEKDAY_LABELS.forEach((text, i) => addLabel(text, 1, i + 2));
}

function addLabel(text, column, row) {
  if (!text) {
    return;
  }
  const label = document.createElement("span");
  label.className = "heat-map-label";
  label.textContent = text;
  label.setAttribute("aria-hidden", "true"); // cada día ya dice su fecha completa
  placeInGrid(label, column, row);
  heatMapGrid.appendChild(label);
}

function createDayButton(day) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `heat-map-day level-${day.level}`;
  button.classList.toggle("is-today", day.isToday);
  button.dataset.date = day.date;
  button.setAttribute("aria-label", formatDayDetail(day));
  if (day.isToday) {
    button.setAttribute("aria-current", "date");
  }
  return button;
}

function renderLegend() {
  heatMapLegend.replaceChildren();
  for (const { level, label } of INTENSITY_LEVELS) {
    const item = document.createElement("li");
    const swatch = document.createElement("span");
    swatch.className = `heat-map-swatch level-${level}`;
    item.append(swatch, label);
    heatMapLegend.appendChild(item);
  }
}

// Actualiza las marcas y el detalle sin volver a pintar los días.
function updateSelection() {
  heatMapDetail.textContent = "";
  for (const button of heatMapGrid.querySelectorAll(".heat-map-day")) {
    const isSelected = button.dataset.date === selectedDate;
    const isTabStop = selectedDate === null ? button.classList.contains("is-today") : isSelected;
    button.setAttribute("aria-pressed", String(isSelected));
    button.tabIndex = isTabStop ? 0 : -1; // el mapa es una sola parada de tabulador
    if (isSelected) {
      heatMapDetail.textContent = button.getAttribute("aria-label");
    }
  }
}

function selectDayFromEvent(event) {
  const button = event.target.closest(".heat-map-day");
  if (button) {
    selectedDate = button.dataset.date;
    updateSelection();
  }
}

heatMapGrid.addEventListener("click", selectDayFromEvent);
heatMapGrid.addEventListener("focusin", selectDayFromEvent);

heatMapGrid.addEventListener("keydown", (event) => {
  const button = event.target.closest(".heat-map-day");
  if (!button || !event.key.startsWith("Arrow")) {
    return;
  }
  event.preventDefault(); // las flechas no desplazan la página
  const nextDate = findNextDate(currentHeatMap, button.dataset.date, event.key);
  heatMapGrid.querySelector(`[data-date="${nextDate}"]`).focus();
});
