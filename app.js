const STORAGE_KEY = "sistemaAcademicoData";
const THEME_KEY = "sistemaAcademicoTheme";

const initialState = {
  carreras: [],
  clases: [],
  anios: [],
  alumnos: [],
  carreraAnio: [],
  anioClase: [],
  matriculas: [],
};

const uiState = {
  search: "",
  filterAnio: "",
  filterCarrera: "",
  page: 1,
  pageSize: 10,
};

let state = loadState();

function generateId(prefix) {
  if (window.crypto?.randomUUID) return `${prefix}-${window.crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return structuredClone(initialState);
  try {
    const parsed = JSON.parse(raw);
    return { ...structuredClone(initialState), ...parsed };
  } catch {
    return structuredClone(initialState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function byId(list, id) {
  return list.find((item) => item.id === id);
}

function notify(message, type = "success") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 2600);
}

function openModal({ title, message }) {
  return new Promise((resolve) => {
    const modal = document.getElementById("modal");
    const titleNode = document.getElementById("modal-title");
    const messageNode = document.getElementById("modal-message");
    const confirmBtn = document.getElementById("modal-confirm");
    const cancelBtn = document.getElementById("modal-cancel");

    titleNode.textContent = title;
    messageNode.textContent = message;
    modal.classList.add("active");

    const cleanup = (result) => {
      modal.classList.remove("active");
      confirmBtn.removeEventListener("click", onConfirm);
      cancelBtn.removeEventListener("click", onCancel);
      resolve(result);
    };
    const onConfirm = () => cleanup(true);
    const onCancel = () => cleanup(false);

    confirmBtn.addEventListener("click", onConfirm);
    cancelBtn.addEventListener("click", onCancel);
  });
}


function openAlumnoEditor(alumno) {
  return new Promise((resolve) => {
    const modal = document.getElementById("modal");
    const titleNode = document.getElementById("modal-title");
    const messageNode = document.getElementById("modal-message");
    const confirmBtn = document.getElementById("modal-confirm");
    const cancelBtn = document.getElementById("modal-cancel");

    titleNode.textContent = "Editar alumno";
    messageNode.innerHTML = `
      <label>Nombre
        <input id="edit-alumno-nombre" type="text" value="${alumno.nombre}" />
      </label>
      <label>Documento
        <input id="edit-alumno-documento" type="text" value="${alumno.documento}" />
      </label>
    `;
    modal.classList.add("active");

    const cleanup = (result) => {
      modal.classList.remove("active");
      messageNode.textContent = "";
      confirmBtn.removeEventListener("click", onConfirm);
      cancelBtn.removeEventListener("click", onCancel);
      resolve(result);
    };
    const onConfirm = () => {
      const nombre = document.getElementById("edit-alumno-nombre").value.trim();
      const documento = document.getElementById("edit-alumno-documento").value.trim();
      cleanup({ nombre, documento });
    };
    const onCancel = () => cleanup(null);

    confirmBtn.addEventListener("click", onConfirm);
    cancelBtn.addEventListener("click", onCancel);
  });
}

function fillSelect(id, values, labeler, placeholder = "Seleccione...") {
  const select = document.getElementById(id);
  const previous = select.value;
  select.innerHTML = `<option value="">${placeholder}</option>`;
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value.id;
    option.textContent = labeler(value);
    select.appendChild(option);
  });
  if (values.some((item) => item.id === previous)) {
    select.value = previous;
  }
}

function renderSimpleLists() {
  document.getElementById("lista-carreras").innerHTML = state.carreras
    .map(
      (carrera) => `<li data-id="${carrera.id}">
      ${carrera.nombre} (${carrera.codigo})
      <button type="button" class="mini danger" data-action="delete-carrera" data-id="${carrera.id}">Eliminar</button>
    </li>`
    )
    .join("");

  document.getElementById("lista-clases").innerHTML = state.clases
    .map(
      (clase) => `<li data-id="${clase.id}">
      ${clase.nombre} (${clase.codigo}) - Cupo: ${clase.cupoMaximo}
      <button type="button" class="mini danger" data-action="delete-clase" data-id="${clase.id}">Eliminar</button>
    </li>`
    )
    .join("");

  document.getElementById("lista-anios").innerHTML = state.anios
    .map(
      (anio) => `<li data-id="${anio.id}">
      ${anio.nombre} - ${anio.periodo}
      <button type="button" class="mini danger" data-action="delete-anio" data-id="${anio.id}">Eliminar</button>
    </li>`
    )
    .join("");

  document.getElementById("lista-alumnos").innerHTML = state.alumnos
    .map(
      (alumno) => `<li data-id="${alumno.id}">
      ${alumno.nombre} (${alumno.documento})
      <button type="button" class="mini" data-action="edit-alumno" data-id="${alumno.id}">Editar</button>
      <button type="button" class="mini danger" data-action="delete-alumno" data-id="${alumno.id}">Eliminar</button>
    </li>`
    )
    .join("");

  document.getElementById("lista-carrera-anio").innerHTML = state.carreraAnio
    .map((rel) => {
      const carrera = byId(state.carreras, rel.carreraId)?.nombre ?? "N/A";
      const anio = byId(state.anios, rel.anioId)?.nombre ?? "N/A";
      return `<li>${carrera} ↔ ${anio}</li>`;
    })
    .join("");

  document.getElementById("lista-anio-clase").innerHTML = state.anioClase
    .map((rel) => {
      const clase = byId(state.clases, rel.claseId)?.nombre ?? "N/A";
      const anio = byId(state.anios, rel.anioId)?.nombre ?? "N/A";
      return `<li>${anio} ↔ ${clase}</li>`;
    })
    .join("");

  document.getElementById("lista-matriculas").innerHTML = state.matriculas
    .map((rel) => {
      const alumno = byId(state.alumnos, rel.alumnoId)?.nombre ?? "N/A";
      const clase = byId(state.clases, rel.claseId)?.nombre ?? "N/A";
      const anio = byId(state.anios, rel.anioId)?.nombre ?? "N/A";
      return `<li>${anio} ↔ ${clase} ↔ ${alumno}</li>`;
    })
    .join("");
}

function populateSelectors() {
  fillSelect("select-carrera", state.carreras, (c) => `${c.nombre} (${c.codigo})`);
  fillSelect("select-anio-carrera", state.anios, (a) => `${a.nombre} - ${a.periodo}`);
  fillSelect("select-anio-clase", state.anios, (a) => `${a.nombre} - ${a.periodo}`);
  fillSelect("select-clase", state.clases, (c) => `${c.nombre} (${c.codigo})`);
  fillSelect("select-anio-matricula", state.anios, (a) => `${a.nombre} - ${a.periodo}`);
  fillSelect("select-clase-matricula", state.clases, (c) => `${c.nombre} (${c.codigo})`);
  fillSelect("select-alumno-matricula", state.alumnos, (a) => `${a.nombre} (${a.documento})`);

  fillSelect("filter-anio", state.anios, (a) => `${a.nombre}`, "Todos los años");
  fillSelect("filter-carrera", state.carreras, (c) => `${c.nombre}`, "Todas las carreras");
}

function buildTableRows() {
  return state.matriculas.map((matricula) => {
    const alumno = byId(state.alumnos, matricula.alumnoId);
    const anio = byId(state.anios, matricula.anioId);
    const clase = byId(state.clases, matricula.claseId);
    const carreraRel = state.carreraAnio.find((rel) => rel.anioId === matricula.anioId);
    const carrera = carreraRel ? byId(state.carreras, carreraRel.carreraId) : null;

    return {
      id: matricula.id,
      alumno: alumno?.nombre ?? "N/A",
      documento: alumno?.documento ?? "N/A",
      carrera: carrera?.nombre ?? "Sin carrera",
      carreraId: carrera?.id ?? "",
      anio: anio?.nombre ?? "Sin año",
      anioId: anio?.id ?? "",
      clase: clase?.nombre ?? "Sin clase",
    };
  });
}

function applyFilters(rows) {
  let filtered = [...rows];

  if (uiState.filterAnio) {
    filtered = filtered.filter((row) => row.anioId === uiState.filterAnio);
  }
  if (uiState.filterCarrera) {
    filtered = filtered.filter((row) => row.carreraId === uiState.filterCarrera);
  }
  if (uiState.search) {
    const term = uiState.search.toLowerCase();
    filtered = filtered.filter((row) =>
      [row.alumno, row.documento, row.carrera, row.anio, row.clase]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }

  return filtered;
}

function renderTable() {
  const tbody = document.getElementById("tabla-alumnos-body");
  const rows = applyFilters(buildTableRows());
  const pageInfo = document.getElementById("page-info");

  const totalPages = uiState.pageSize === "all" ? 1 : Math.max(1, Math.ceil(rows.length / uiState.pageSize));
  uiState.page = Math.min(uiState.page, totalPages);

  const start = uiState.pageSize === "all" ? 0 : (uiState.page - 1) * uiState.pageSize;
  const end = uiState.pageSize === "all" ? rows.length : start + uiState.pageSize;
  const visibleRows = rows.slice(start, end);

  tbody.innerHTML =
    visibleRows
      .map(
        (row) => `<tr data-id="${row.id}">
      <td>${row.alumno}</td>
      <td>${row.documento}</td>
      <td>${row.carrera}</td>
      <td>${row.anio}</td>
      <td>${row.clase}</td>
      <td class="no-print">
        <button type="button" class="mini danger" data-action="delete-matricula" data-id="${row.id}">Eliminar</button>
      </td>
    </tr>`
      )
      .join("") || '<tr><td colspan="6">No hay resultados para mostrar.</td></tr>';

  pageInfo.textContent = `Página ${uiState.page} de ${totalPages}`;
  document.getElementById("prev-page").disabled = uiState.page <= 1;
  document.getElementById("next-page").disabled = uiState.page >= totalPages;
}

function render() {
  renderSimpleLists();
  populateSelectors();
  renderTable();
  saveState();
}

function existsDuplicate(list, key, value) {
  return list.some((item) => item[key].toLowerCase() === value.toLowerCase());
}

function addUniqueRelation(list, payload, keys) {
  const exists = list.some((item) => keys.every((key) => item[key] === payload[key]));
  if (exists) return false;
  list.push(payload);
  return true;
}

function hasReferences(entity, id) {
  if (entity === "carrera") {
    return state.carreraAnio.some((rel) => rel.carreraId === id);
  }
  if (entity === "anio") {
    return (
      state.carreraAnio.some((rel) => rel.anioId === id) ||
      state.anioClase.some((rel) => rel.anioId === id) ||
      state.matriculas.some((rel) => rel.anioId === id)
    );
  }
  return false;
}

function setupTheme() {
  const saved = localStorage.getItem(THEME_KEY) || "light";
  document.body.setAttribute("data-theme", saved);
  document.getElementById("btn-theme").textContent = saved === "dark" ? "☀️ Modo claro" : "🌙 Modo oscuro";
}

function setupActions() {
  document.getElementById("btn-theme").addEventListener("click", () => {
    const current = document.body.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.body.setAttribute("data-theme", current);
    localStorage.setItem(THEME_KEY, current);
    document.getElementById("btn-theme").textContent = current === "dark" ? "☀️ Modo claro" : "🌙 Modo oscuro";
  });

  document.getElementById("btn-print").addEventListener("click", () => window.print());

  document.getElementById("btn-export").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup-sistema-academico-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notify("Backup exportado correctamente.");
  });

  document.getElementById("import-file").addEventListener("change", (event) => {
    const [file] = event.target.files;
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        state = { ...structuredClone(initialState), ...parsed };
        render();
        notify("Backup importado correctamente.");
      } catch {
        notify("No se pudo importar el archivo JSON.", "error");
      }
      event.target.value = "";
    };
    reader.readAsText(file);
  });

  document.getElementById("search-input").addEventListener("input", (event) => {
    uiState.search = event.target.value.trim();
    uiState.page = 1;
    renderTable();
  });

  document.getElementById("filter-anio").addEventListener("change", (event) => {
    uiState.filterAnio = event.target.value;
    uiState.page = 1;
    renderTable();
  });

  document.getElementById("filter-carrera").addEventListener("change", (event) => {
    uiState.filterCarrera = event.target.value;
    uiState.page = 1;
    renderTable();
  });

  document.getElementById("page-size").addEventListener("change", (event) => {
    uiState.pageSize = event.target.value === "all" ? "all" : Number(event.target.value);
    uiState.page = 1;
    renderTable();
  });

  document.getElementById("prev-page").addEventListener("click", () => {
    uiState.page = Math.max(1, uiState.page - 1);
    renderTable();
  });

  document.getElementById("next-page").addEventListener("click", () => {
    uiState.page += 1;
    renderTable();
  });

  document.body.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const { action, id } = button.dataset;

    if (action === "delete-carrera") {
      if (hasReferences("carrera", id)) {
        notify("No se puede eliminar la carrera porque tiene relaciones activas.", "error");
        return;
      }
      if (await openModal({ title: "Eliminar carrera", message: "¿Deseas eliminar esta carrera?" })) {
        state.carreras = state.carreras.filter((item) => item.id !== id);
        render();
      }
    }

    if (action === "delete-anio") {
      if (hasReferences("anio", id)) {
        notify("No se puede eliminar el año porque tiene asociaciones activas.", "error");
        return;
      }
      if (await openModal({ title: "Eliminar año", message: "¿Deseas eliminar este año escolar?" })) {
        state.anios = state.anios.filter((item) => item.id !== id);
        render();
      }
    }

    if (action === "delete-clase") {
      if (state.anioClase.some((rel) => rel.claseId === id) || state.matriculas.some((rel) => rel.claseId === id)) {
        notify("No se puede eliminar la clase porque tiene asociaciones activas.", "error");
        return;
      }
      if (await openModal({ title: "Eliminar clase", message: "¿Deseas eliminar esta clase?" })) {
        state.clases = state.clases.filter((item) => item.id !== id);
        render();
      }
    }

    if (action === "edit-alumno") {
      const alumno = byId(state.alumnos, id);
      if (!alumno) return;
      const payload = await openAlumnoEditor(alumno);
      if (!payload) return;
      const duplicado = state.alumnos.some(
        (item) => item.id !== id && item.documento.toLowerCase() === payload.documento.toLowerCase()
      );
      if (duplicado) {
        notify("Ya existe otro alumno con ese documento.", "error");
        return;
      }
      alumno.nombre = payload.nombre;
      alumno.documento = payload.documento;
      render();
      notify("Alumno actualizado.");
    }

    if (action === "delete-alumno") {
      if (state.matriculas.some((rel) => rel.alumnoId === id)) {
        notify("No se puede eliminar el alumno porque tiene matrículas activas.", "error");
        return;
      }
      if (await openModal({ title: "Eliminar alumno", message: "¿Deseas eliminar este alumno?" })) {
        state.alumnos = state.alumnos.filter((item) => item.id !== id);
        render();
      }
    }

    if (action === "delete-matricula") {
      if (await openModal({ title: "Eliminar matrícula", message: "¿Deseas eliminar esta matrícula?" })) {
        state.matriculas = state.matriculas.filter((item) => item.id !== id);
        render();
      }
    }
  });
}

function setupForms() {
  document.getElementById("form-carrera").addEventListener("submit", (event) => {
    event.preventDefault();
    const nombre = document.getElementById("carrera-nombre").value.trim();
    const codigo = document.getElementById("carrera-codigo").value.trim();

    if (existsDuplicate(state.carreras, "codigo", codigo)) {
      notify("Ya existe una carrera con ese código.", "error");
      return;
    }

    state.carreras.push({ id: generateId("carrera"), nombre, codigo });
    event.target.reset();
    render();
    notify("Carrera guardada.");
  });

  document.getElementById("form-clase").addEventListener("submit", (event) => {
    event.preventDefault();
    const nombre = document.getElementById("clase-nombre").value.trim();
    const codigo = document.getElementById("clase-codigo").value.trim();
    const cupoMaximo = Number(document.getElementById("clase-cupo").value);

    if (existsDuplicate(state.clases, "codigo", codigo)) {
      notify("Ya existe una clase con ese código.", "error");
      return;
    }

    state.clases.push({ id: generateId("clase"), nombre, codigo, cupoMaximo });
    event.target.reset();
    document.getElementById("clase-cupo").value = "30";
    render();
    notify("Clase guardada.");
  });

  document.getElementById("form-anio").addEventListener("submit", (event) => {
    event.preventDefault();
    const nombre = document.getElementById("anio-nombre").value.trim();
    const periodo = document.getElementById("anio-periodo").value.trim();

    if (
      state.anios.some(
        (item) => item.nombre.toLowerCase() === nombre.toLowerCase() && item.periodo.toLowerCase() === periodo.toLowerCase()
      )
    ) {
      notify("Ese año y periodo ya existe.", "error");
      return;
    }

    state.anios.push({ id: generateId("anio"), nombre, periodo });
    event.target.reset();
    render();
    notify("Año guardado.");
  });

  document.getElementById("form-alumno").addEventListener("submit", (event) => {
    event.preventDefault();
    const nombre = document.getElementById("alumno-nombre").value.trim();
    const documento = document.getElementById("alumno-doc").value.trim();

    if (existsDuplicate(state.alumnos, "documento", documento)) {
      notify("Ya existe un alumno con ese documento.", "error");
      return;
    }

    state.alumnos.push({ id: generateId("alumno"), nombre, documento });
    event.target.reset();
    render();
    notify("Alumno guardado.");
  });

  document.getElementById("form-carrera-anio").addEventListener("submit", (event) => {
    event.preventDefault();
    const carreraId = document.getElementById("select-carrera").value;
    const anioId = document.getElementById("select-anio-carrera").value;
    if (!carreraId || !anioId) return;

    const ok = addUniqueRelation(state.carreraAnio, { id: generateId("ca"), carreraId, anioId }, ["carreraId", "anioId"]);
    if (!ok) {
      notify("Esa asociación carrera-año ya existe.", "error");
      return;
    }

    render();
    notify("Asociación carrera-año creada.");
  });

  document.getElementById("form-anio-clase").addEventListener("submit", (event) => {
    event.preventDefault();
    const anioId = document.getElementById("select-anio-clase").value;
    const claseId = document.getElementById("select-clase").value;
    if (!anioId || !claseId) return;

    const ok = addUniqueRelation(state.anioClase, { id: generateId("ac"), anioId, claseId }, ["anioId", "claseId"]);
    if (!ok) {
      notify("Esa asociación año-clase ya existe.", "error");
      return;
    }

    render();
    notify("Asociación año-clase creada.");
  });

  document.getElementById("form-matricula").addEventListener("submit", (event) => {
    event.preventDefault();
    const anioId = document.getElementById("select-anio-matricula").value;
    const claseId = document.getElementById("select-clase-matricula").value;
    const alumnoId = document.getElementById("select-alumno-matricula").value;
    if (!anioId || !claseId || !alumnoId) return;

    const claseVigente = state.anioClase.some((rel) => rel.anioId === anioId && rel.claseId === claseId);
    if (!claseVigente) {
      notify("La clase no está asociada al año seleccionado.", "error");
      return;
    }

    const duplicada = state.matriculas.some(
      (item) => item.anioId === anioId && item.claseId === claseId && item.alumnoId === alumnoId
    );
    if (duplicada) {
      notify("El alumno ya está matriculado en esa clase para ese año.", "error");
      return;
    }

    const clase = byId(state.clases, claseId);
    const ocupados = state.matriculas.filter((item) => item.anioId === anioId && item.claseId === claseId).length;
    if (clase && ocupados >= clase.cupoMaximo) {
      notify(`La clase alcanzó su cupo máximo (${clase.cupoMaximo}).`, "error");
      return;
    }

    state.matriculas.push({ id: generateId("matricula"), anioId, claseId, alumnoId });
    event.target.reset();
    render();
    notify("Matrícula creada.");
  });
}

function showSkeleton() {
  document.getElementById("table-skeleton").classList.add("active");
  setTimeout(() => {
    document.getElementById("table-skeleton").classList.remove("active");
    render();
  }, 600);
}

setupTheme();
setupActions();
setupForms();
showSkeleton();
