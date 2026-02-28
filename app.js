const STORAGE_KEY = "sistemaAcademicoData";

const initialState = {
  carreras: [],
  clases: [],
  anios: [],
  alumnos: [],
  carreraAnio: [],
  anioClase: [],
  anioAlumno: [],
};

let state = loadState();

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return structuredClone(initialState);
  try {
    return { ...structuredClone(initialState), ...JSON.parse(raw) };
  } catch {
    return structuredClone(initialState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function byId(list, id) {
  return list.find((item) => item.id === id);
}

function fillList(id, values, mapper) {
  const container = document.getElementById(id);
  container.innerHTML = values.map(mapper).join("");
}

function fillSelect(id, values, labeler) {
  const select = document.getElementById(id);
  const previous = select.value;
  select.innerHTML = `<option value="">Seleccione...</option>`;
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value.id;
    option.textContent = labeler(value);
    select.appendChild(option);
  });
  if (values.some((value) => value.id === previous)) {
    select.value = previous;
  }
}

function render() {
  fillList("lista-carreras", state.carreras, (c) => `<li>${c.nombre} (${c.codigo})</li>`);
  fillList("lista-clases", state.clases, (c) => `<li>${c.nombre} (${c.codigo})</li>`);
  fillList("lista-anios", state.anios, (a) => `<li>${a.nombre} - ${a.periodo}</li>`);
  fillList("lista-alumnos", state.alumnos, (a) => `<li>${a.nombre} (${a.documento})</li>`);

  fillSelect("select-carrera", state.carreras, (c) => `${c.nombre} (${c.codigo})`);
  fillSelect("select-anio-carrera", state.anios, (a) => `${a.nombre} - ${a.periodo}`);
  fillSelect("select-anio-clase", state.anios, (a) => `${a.nombre} - ${a.periodo}`);
  fillSelect("select-clase", state.clases, (c) => `${c.nombre} (${c.codigo})`);
  fillSelect("select-anio-alumno", state.anios, (a) => `${a.nombre} - ${a.periodo}`);
  fillSelect("select-alumno", state.alumnos, (a) => `${a.nombre} (${a.documento})`);

  fillList(
    "lista-carrera-anio",
    state.carreraAnio,
    (rel) => `<li>${byId(state.carreras, rel.carreraId)?.nombre ?? "N/A"} ↔ ${
      byId(state.anios, rel.anioId)?.nombre ?? "N/A"
    }</li>`
  );
  fillList(
    "lista-anio-clase",
    state.anioClase,
    (rel) => `<li>${byId(state.anios, rel.anioId)?.nombre ?? "N/A"} ↔ ${
      byId(state.clases, rel.claseId)?.nombre ?? "N/A"
    }</li>`
  );
  fillList(
    "lista-anio-alumno",
    state.anioAlumno,
    (rel) => `<li>${byId(state.anios, rel.anioId)?.nombre ?? "N/A"} ↔ ${
      byId(state.alumnos, rel.alumnoId)?.nombre ?? "N/A"
    }</li>`
  );

  renderTable();
}

function renderTable() {
  const tbody = document.getElementById("tabla-alumnos-body");

  const rows = state.alumnos
    .map((alumno) => {
      const aniosAlumno = state.anioAlumno.filter((rel) => rel.alumnoId === alumno.id);

      if (!aniosAlumno.length) {
        return `
          <tr>
            <td>${alumno.nombre}</td>
            <td>${alumno.documento}</td>
            <td>Sin asignar</td>
            <td>Sin asignar</td>
            <td>Sin asignar</td>
          </tr>`;
      }

      return aniosAlumno
        .map((rel) => {
          const anio = byId(state.anios, rel.anioId);
          const carreraRel = state.carreraAnio.find((r) => r.anioId === rel.anioId);
          const carrera = carreraRel ? byId(state.carreras, carreraRel.carreraId) : null;

          const clases = state.anioClase
            .filter((r) => r.anioId === rel.anioId)
            .map((r) => byId(state.clases, r.claseId)?.nombre)
            .filter(Boolean)
            .join(", ");

          return `
            <tr>
              <td>${alumno.nombre}</td>
              <td>${alumno.documento}</td>
              <td>${carrera?.nombre ?? "Sin carrera"}</td>
              <td>${anio?.nombre ?? "Sin año"}</td>
              <td>${clases || "Sin clases"}</td>
            </tr>`;
        })
        .join("");
    })
    .join("");

  tbody.innerHTML = rows || '<tr><td colspan="5">No hay alumnos registrados.</td></tr>';
}

function addUniqueRelation(list, payload, keys) {
  const exists = list.some((item) => keys.every((key) => item[key] === payload[key]));
  if (!exists) {
    list.push(payload);
    return true;
  }
  return false;
}

document.getElementById("form-carrera").addEventListener("submit", (event) => {
  event.preventDefault();
  state.carreras.push({
    id: uid("carrera"),
    nombre: document.getElementById("carrera-nombre").value.trim(),
    codigo: document.getElementById("carrera-codigo").value.trim(),
  });
  event.target.reset();
  saveState();
  render();
});

document.getElementById("form-clase").addEventListener("submit", (event) => {
  event.preventDefault();
  state.clases.push({
    id: uid("clase"),
    nombre: document.getElementById("clase-nombre").value.trim(),
    codigo: document.getElementById("clase-codigo").value.trim(),
  });
  event.target.reset();
  saveState();
  render();
});

document.getElementById("form-anio").addEventListener("submit", (event) => {
  event.preventDefault();
  state.anios.push({
    id: uid("anio"),
    nombre: document.getElementById("anio-nombre").value.trim(),
    periodo: document.getElementById("anio-periodo").value.trim(),
  });
  event.target.reset();
  saveState();
  render();
});

document.getElementById("form-alumno").addEventListener("submit", (event) => {
  event.preventDefault();
  state.alumnos.push({
    id: uid("alumno"),
    nombre: document.getElementById("alumno-nombre").value.trim(),
    documento: document.getElementById("alumno-doc").value.trim(),
  });
  event.target.reset();
  saveState();
  render();
});

document.getElementById("form-carrera-anio").addEventListener("submit", (event) => {
  event.preventDefault();
  const carreraId = document.getElementById("select-carrera").value;
  const anioId = document.getElementById("select-anio-carrera").value;
  if (!carreraId || !anioId) return;

  addUniqueRelation(state.carreraAnio, { carreraId, anioId }, ["carreraId", "anioId"]);

  saveState();
  render();
});

document.getElementById("form-anio-clase").addEventListener("submit", (event) => {
  event.preventDefault();
  const anioId = document.getElementById("select-anio-clase").value;
  const claseId = document.getElementById("select-clase").value;
  if (!anioId || !claseId) return;

  addUniqueRelation(state.anioClase, { anioId, claseId }, ["anioId", "claseId"]);

  saveState();
  render();
});

document.getElementById("form-anio-alumno").addEventListener("submit", (event) => {
  event.preventDefault();
  const anioId = document.getElementById("select-anio-alumno").value;
  const alumnoId = document.getElementById("select-alumno").value;
  if (!anioId || !alumnoId) return;

  addUniqueRelation(state.anioAlumno, { anioId, alumnoId }, ["anioId", "alumnoId"]);

  saveState();
  render();
});

render();
