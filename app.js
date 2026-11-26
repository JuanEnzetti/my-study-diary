// ===== Diario de Estudio =====
// Cada sesión se guarda como un objeto así:
// { id: 1700000000000, fecha: "2026-11-19", tema: "Fracciones", minutos: 30 }

const CLAVE_GUARDADO = "diario-estudio-sesiones";

// Elementos de la página
const formulario = document.getElementById("formulario");
const campoFecha = document.getElementById("fecha");
const campoTema = document.getElementById("tema");
const campoMinutos = document.getElementById("minutos");
const rachaDias = document.getElementById("racha-dias");
const rachaTexto = document.getElementById("racha-texto");
const mejorRachaTexto = document.getElementById("mejor-racha-texto");
const avisoRecord = document.getElementById("aviso-record");
const diasMes = document.getElementById("dias-mes");
const dataNotice = document.getElementById("data-notice");
const dataNoticeText = document.getElementById("data-notice-text");
const dataNoticeItems = document.getElementById("data-notice-items");
const dataNoticeStatus = document.getElementById("data-notice-status");
const saveError = document.getElementById("save-error");
const listaSesiones = document.getElementById("lista-sesiones");
const sinSesiones = document.getElementById("sin-sesiones");

// ----- Fechas (siempre en hora local, nunca UTC) -----

// Convierte un objeto Date en texto "AAAA-MM-DD" usando la fecha local.
function fechaATexto(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return anio + "-" + mes + "-" + dia;
}

// Convierte un texto "AAAA-MM-DD" en un objeto Date local.
// (new Date("2026-11-19") lo interpretaría como UTC, por eso no lo usamos.)
function textoAFecha(texto) {
  const partes = texto.split("-");
  return new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
}

// Devuelve la fecha de hoy como "AAAA-MM-DD".
function hoyEnTexto() {
  return fechaATexto(new Date());
}

// Devuelve el día anterior a una fecha en texto.
function diaAnterior(texto) {
  const fecha = textoAFecha(texto);
  fecha.setDate(fecha.getDate() - 1);
  return fechaATexto(fecha);
}

// Muestra una fecha bonita en español, por ejemplo: "jueves, 19 de noviembre de 2026".
function fechaLegible(texto) {
  return textoAFecha(texto).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ----- Guardado en localStorage -----

// Devuelve las sesiones válidas, o null si no se pueden leer. Las dañadas siguen guardadas.
function readSessions() {
  try {
    const { isReadable, sessions } = parseStoredSessions(localStorage.getItem(CLAVE_GUARDADO));
    return isReadable ? sessions.filter(isValidSession) : null;
  } catch (error) {
    return null; // el navegador no deja leer; showDataNotice avisa de ello
  }
}

// Devuelve las sesiones para mostrarlas; si no se pueden leer, una lista vacía.
function cargarSesiones() {
  return readSessions() || [];
}

function readBackups() {
  const keys = Object.keys(localStorage).filter((key) => key.startsWith(BACKUP_PREFIX));
  keys.sort((a, b) => a.localeCompare(b, "es", { numeric: true })); // la 2 antes que la 10
  return keys.map((key) => ({ key, text: localStorage.getItem(key) }));
}

// Si los datos guardados son ilegibles, hace una copia. Falla si no puede hacerla.
function backUpUnreadableData() {
  const text = localStorage.getItem(CLAVE_GUARDADO);
  if (parseStoredSessions(text).isReadable) {
    return;
  }
  const key = getNewBackupKey(readBackups(), text);
  if (key !== null) {
    localStorage.setItem(key, text);
    if (localStorage.getItem(key) !== text) {
      throw new Error("La copia no coincide con los datos");
    }
  }
}

function saveSession(session) {
  backUpUnreadableData(); // si falla, no se llega a escribir encima
  const text = localStorage.getItem(CLAVE_GUARDADO);
  const base = parseStoredSessions(text).isReadable ? text : null;
  localStorage.setItem(CLAVE_GUARDADO, appendSession(base, session));
}

// ----- Aviso de datos que no se han podido leer -----

function showDataNotice() {
  dataNoticeItems.replaceChildren();
  dataNoticeStatus.textContent = "";
  try {
    const text = localStorage.getItem(CLAVE_GUARDADO);
    const isReadable = parseStoredSessions(text).isReadable;
    const backups = readBackups();
    const isBackedUp = isReadable || backups.some((backup) => backup.text === text);

    backups.forEach((backup, i) => addNoticeItem(`copia ${i + 1}`, backup.text));
    if (!isBackedUp) {
      addNoticeItem("datos sin copia", text);
    }
    dataNoticeText.textContent = isBackedUp
      ? "Algunos datos guardados no se han podido leer. Hemos conservado una copia en este navegador. Puedes copiarla y guardarla en un lugar seguro."
      : "Los datos guardados no se pueden leer y no hemos podido hacer una copia. No se guardará nada encima. Cópialos y guárdalos en un lugar seguro.";
    dataNotice.hidden = isBackedUp && backups.length === 0;
  } catch (error) {
    dataNoticeText.textContent =
      "Este navegador no permite leer tus sesiones. Revisa si tiene bloqueado guardar datos de esta página.";
    dataNotice.hidden = false;
  }
}

function addNoticeItem(name, text) {
  const item = document.createElement("li");
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "Copiar " + name;
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(text);
      dataNoticeStatus.textContent = "Se ha copiado: " + name + ".";
    } catch (error) {
      showTextToCopy(item, name, text);
    }
  });
  item.appendChild(button);
  dataNoticeItems.appendChild(item);
}

// Si el navegador no deja copiar, muestra el texto ya seleccionado.
function showTextToCopy(item, name, text) {
  let area = item.querySelector("textarea");
  if (area === null) {
    area = document.createElement("textarea");
    area.readOnly = true;
    area.value = text;
    area.name = "backup-text";
    area.setAttribute("aria-label", "Texto de: " + name);
    item.appendChild(area);
  }
  area.select();
  dataNoticeStatus.textContent = "No se ha podido copiar solo. El texto está seleccionado: cópialo a mano.";
}

// ----- Racha -----

// Cuenta los días seguidos con al menos una sesión que terminan hoy.
// Si hoy aún no hay sesión pero ayer sí, la racha sigue viva y se cuenta desde ayer.
function calcularRacha(sesiones) {
  // Conjunto con los días que tienen alguna sesión (sin repetidos).
  const diasConSesion = new Set();
  for (const sesion of sesiones) {
    diasConSesion.add(sesion.fecha);
  }

  let dia = hoyEnTexto();
  if (!diasConSesion.has(dia)) {
    dia = diaAnterior(dia);
  }

  let racha = 0;
  while (diasConSesion.has(dia)) {
    racha++;
    dia = diaAnterior(dia);
  }
  return racha;
}

// Busca la racha más larga de todo el historial.
// Varias sesiones el mismo día cuentan como un solo día y las fechas futuras no suman.
function calcularMejorRacha(sesiones) {
  const hoy = hoyEnTexto();

  // Días con sesión, sin repetidos y sin fechas futuras.
  const diasConSesion = new Set();
  for (const sesion of sesiones) {
    if (sesion.fecha <= hoy) {
      diasConSesion.add(sesion.fecha);
    }
  }

  // Los textos "AAAA-MM-DD" se ordenan bien como texto: de más antiguo a más reciente.
  const dias = Array.from(diasConSesion).sort();

  let mejor = 0;
  let enCurso = 0;
  for (let i = 0; i < dias.length; i++) {
    // Si el día anterior a este es el día previo de la lista, la racha continúa.
    if (i > 0 && diaAnterior(dias[i]) === dias[i - 1]) {
      enCurso++;
    } else {
      enCurso = 1;
    }
    if (enCurso > mejor) {
      mejor = enCurso;
    }
  }
  return mejor;
}

// ----- Días del mes -----

// Cuenta los días distintos con sesión en este mes (del día 1 a hoy). Las fechas futuras no cuentan.
function calcularDiasMes(sesiones) {
  const hoy = hoyEnTexto();
  const mesActual = hoy.slice(0, 7); // "AAAA-MM"

  // Un Set no guarda repetidos: varias sesiones el mismo día cuentan como un solo día.
  const diasConSesion = new Set();
  for (const sesion of sesiones) {
    if (sesion.fecha.startsWith(mesActual) && sesion.fecha <= hoy) {
      diasConSesion.add(sesion.fecha);
    }
  }
  return diasConSesion.size;
}

// ----- Pintar la página -----

function mostrarRacha(sesiones) {
  const racha = calcularRacha(sesiones);
  rachaDias.textContent = racha;
  rachaTexto.textContent = racha === 1 ? "día seguido estudiando" : "días seguidos estudiando";

  const mejorRacha = calcularMejorRacha(sesiones);
  mejorRachaTexto.textContent = "Mejor racha: " + mejorRacha + (mejorRacha === 1 ? " día" : " días");

  // La racha actual nunca supera a la mejor (ya está incluida en ella),
  // así que si son iguales, la racha actual es el récord.
  avisoRecord.hidden = !(racha > 0 && racha === mejorRacha);
}

function mostrarLista(sesiones) {
  // Ordenamos de la más reciente a la más antigua.
  // Si dos sesiones tienen la misma fecha, va primero la que se añadió después.
  const ordenadas = sesiones.slice().sort(function (a, b) {
    if (a.fecha !== b.fecha) {
      return a.fecha < b.fecha ? 1 : -1;
    }
    return b.id - a.id;
  });

  listaSesiones.innerHTML = "";
  sinSesiones.hidden = ordenadas.length > 0;

  for (const sesion of ordenadas) {
    const elemento = document.createElement("li");
    elemento.className = "sesion";

    const info = document.createElement("div");

    const tema = document.createElement("p");
    tema.className = "sesion-tema";
    tema.textContent = sesion.tema; // textContent evita que se interprete HTML

    const fecha = document.createElement("p");
    fecha.className = "sesion-fecha";
    fecha.textContent = fechaLegible(sesion.fecha);

    info.appendChild(tema);
    info.appendChild(fecha);

    const minutos = document.createElement("span");
    minutos.className = "sesion-minutos";
    minutos.textContent = sesion.minutos + " min";

    elemento.appendChild(info);
    elemento.appendChild(minutos);
    listaSesiones.appendChild(elemento);
  }
}

function mostrarTodo() {
  const sesiones = cargarSesiones();
  const hoy = hoyEnTexto(); // el mismo para el mapa y el total de la semana
  showDataNotice();
  renderHeatMap(sesiones, hoy);
  mostrarRacha(sesiones);
  refreshWeeklyGoal(sesiones, hoy);
  const dias = calcularDiasMes(sesiones);
  diasMes.textContent = dias + (dias === 1 ? " día" : " días");
  mostrarLista(sesiones);
}

// Pone la fecha de hoy en el formulario y no deja elegir días futuros.
function prepararCampoFecha() {
  const hoy = hoyEnTexto();
  campoFecha.value = hoy;
  campoFecha.max = hoy;
}

// ----- Formulario -----

formulario.addEventListener("submit", function (evento) {
  evento.preventDefault(); // evita que la página se recargue

  const fecha = campoFecha.value;
  const tema = campoTema.value.trim();
  const minutos = Number(campoMinutos.value);

  if (fecha === "") {
    alert("Elige una fecha.");
    return;
  }
  if (tema === "") {
    alert("Escribe el tema que has estudiado.");
    return;
  }
  if (!Number.isInteger(minutos) || minutos <= 0) {
    alert("Los minutos tienen que ser un número entero mayor que 0.");
    return;
  }

  try {
    saveSession({
      id: Date.now(),
      fecha: fecha,
      tema: tema,
      minutos: minutos,
    });
  } catch (error) {
    // El formulario no se limpia, para poder reintentarlo.
    showDataNotice();
    saveError.textContent =
      "La sesión no se ha guardado. Revisa si el navegador tiene espacio y permite guardar datos, y vuelve a intentarlo.";
    return;
  }
  saveError.textContent = "";

  // Limpiamos el formulario para la siguiente sesión.
  campoTema.value = "";
  campoMinutos.value = "";
  prepararCampoFecha();

  mostrarTodo();
});

// ----- Arranque -----
try {
  backUpUnreadableData();
} catch (error) {
  // showDataNotice explica el problema.
}
prepararCampoFecha();
mostrarTodo();
showGoalInField();
