const STORAGE_KEY = 'academic_v3';

const state = {
  careers: [],
  periods: [],
  classes: [],
  students: [],
  enrollments: [],
  page: 1,
  pageSize: 10,
  query: '',
  filterCareerId: '',
  filterPeriodId: '',
  filterClassId: '',
  editingEnrollmentId: ''
};

const $ = (id) => document.getElementById(id);
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

function toast(message) {
  const el = $('toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove('show'), 2000);
}

function askConfirm(message, confirmText = 'Confirmar') {
  return new Promise((resolve) => {
    const dialog = $('confirmDialog');
    $('confirmText').textContent = message;
    $('okConfirm').textContent = confirmText;

    const close = (answer) => {
      dialog.close();
      $('okConfirm').onclick = null;
      $('cancelConfirm').onclick = null;
      resolve(answer);
    };

    $('okConfirm').onclick = () => close(true);
    $('cancelConfirm').onclick = () => close(false);
    dialog.showModal();
  });
}

function load() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  try {
    const parsed = JSON.parse(raw);
    state.careers = parsed.careers ?? [];
    state.periods = parsed.periods ?? [];
    state.classes = parsed.classes ?? [];
    state.students = parsed.students ?? [];
    state.enrollments = parsed.enrollments ?? [];
  } catch {
    toast('No se pudo leer el almacenamiento local');
  }
}

function save() {
  const payload = {
    careers: state.careers,
    periods: state.periods,
    classes: state.classes,
    students: state.students,
    enrollments: state.enrollments
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function byId(collection, id) {
  return collection.find((item) => item.id === id);
}

function enrollmentCountForClass(classId) {
  return state.enrollments.filter((item) => item.classId === classId).length;
}

function validateEnrollment(studentId, classId, periodId, ignoreEnrollmentId = '') {
  const klass = byId(state.classes, classId);
  if (!klass) return 'Clase no encontrada';

  const existingCount = state.enrollments.filter((item) => item.classId === classId && item.id !== ignoreEnrollmentId).length;
  if (existingCount >= Number(klass.capacity)) return `La clase ${klass.code} alcanzó su cupo máximo`;

  const duplicated = state.enrollments.some((item) => item.id !== ignoreEnrollmentId && item.studentId === studentId && item.classId === classId && item.periodId === periodId);
  if (duplicated) return 'El alumno ya está matriculado en esta clase para ese periodo';

  return '';
}

function catalogItemMarkup(label, deleteDataAttr, id) {
  return `<li><span>${label}</span><button class="btn danger" type="button" ${deleteDataAttr}="${id}">Eliminar</button></li>`;
}

function renderCatalogs() {
  $('careerList').innerHTML = state.careers.map((career) => catalogItemMarkup(career.name, 'data-del-career', career.id)).join('');
  $('periodList').innerHTML = state.periods.map((period) => catalogItemMarkup(period.name, 'data-del-period', period.id)).join('');

  $('classList').innerHTML = state.classes
    .map((klass) => {
      const count = enrollmentCountForClass(klass.id);
      return catalogItemMarkup(`${klass.code} · ${klass.name} (${count}/${klass.capacity})`, 'data-del-class', klass.id);
    })
    .join('');

  const careerOptions = '<option value="">Seleccione carrera</option>' + state.careers.map((career) => `<option value="${career.id}">${career.name}</option>`).join('');
  const periodOptions = '<option value="">Seleccione periodo</option>' + state.periods.map((period) => `<option value="${period.id}">${period.name}</option>`).join('');
  const classOptions = '<option value="">Seleccione clase</option>' + state.classes.map((klass) => `<option value="${klass.id}">${klass.code} · ${klass.name}</option>`).join('');
  const studentOptions = '<option value="">Seleccione alumno</option>' + state.students.map((student) => `<option value="${student.id}">${student.name} · ${student.doc}</option>`).join('');

  $('studentCareer').innerHTML = careerOptions;
  $('enrollPeriod').innerHTML = periodOptions;
  $('enrollClass').innerHTML = classOptions;
  $('enrollStudent').innerHTML = studentOptions;

  $('filterCareer').innerHTML = '<option value="">Todas las carreras</option>' + state.careers.map((career) => `<option value="${career.id}">${career.name}</option>`).join('');
  $('filterPeriod').innerHTML = '<option value="">Todos los periodos</option>' + state.periods.map((period) => `<option value="${period.id}">${period.name}</option>`).join('');
  $('filterClass').innerHTML = '<option value="">Todas las clases</option>' + state.classes.map((klass) => `<option value="${klass.id}">${klass.code}</option>`).join('');

  $('filterCareer').value = state.filterCareerId;
  $('filterPeriod').value = state.filterPeriodId;
  $('filterClass').value = state.filterClassId;
}

function lookupEnrollmentRow(enrollment) {
  const student = byId(state.students, enrollment.studentId);
  const career = student ? byId(state.careers, student.careerId) : null;
  const klass = byId(state.classes, enrollment.classId);
  const period = byId(state.periods, enrollment.periodId);
  return {
    id: enrollment.id,
    studentName: student?.name ?? '-',
    studentDoc: student?.doc ?? '-',
    careerName: career?.name ?? '-',
    className: klass ? `${klass.code} · ${klass.name}` : '-',
    periodName: period?.name ?? '-',
    studentId: student?.id ?? '',
    classId: klass?.id ?? '',
    periodId: period?.id ?? ''
  };
}

function filteredEnrollmentRows() {
  const q = state.query.trim().toLowerCase();

  return state.enrollments
    .map(lookupEnrollmentRow)
    .filter((row) => {
      const queryMatch = !q || row.studentName.toLowerCase().includes(q) || row.studentDoc.toLowerCase().includes(q) || row.className.toLowerCase().includes(q);
      const careerMatch = !state.filterCareerId || byId(state.students, row.studentId)?.careerId === state.filterCareerId;
      const periodMatch = !state.filterPeriodId || row.periodId === state.filterPeriodId;
      const classMatch = !state.filterClassId || row.classId === state.filterClassId;
      return queryMatch && careerMatch && periodMatch && classMatch;
    });
}

function renderTable() {
  const rows = filteredEnrollmentRows();
  const size = state.pageSize === 'all' ? rows.length || 1 : Number(state.pageSize);
  const totalPages = Math.max(1, Math.ceil(rows.length / size));

  state.page = Math.min(state.page, totalPages);
  const from = (state.page - 1) * size;
  const to = state.pageSize === 'all' ? rows.length : from + size;
  const currentPageRows = rows.slice(from, to);

  $('pageInfo').textContent = `${state.page} / ${totalPages} (${rows.length} registros)`;
  $('prevPage').disabled = state.page === 1 || state.pageSize === 'all';
  $('nextPage').disabled = state.page === totalPages || state.pageSize === 'all';

  const body = $('enrollmentTable').querySelector('tbody');
  body.innerHTML = currentPageRows
    .map(
      (row) => `<tr data-id="${row.id}">
      <td>${row.studentName}</td>
      <td>${row.studentDoc}</td>
      <td>${row.careerName}</td>
      <td>${row.className}</td>
      <td>${row.periodName}</td>
      <td>
        <button class="btn secondary" type="button" data-edit-enrollment="${row.id}">Editar</button>
        <button class="btn danger" type="button" data-del-enrollment="${row.id}">Eliminar</button>
      </td>
    </tr>`
    )
    .join('');
}

function render() {
  renderCatalogs();
  renderTable();
  save();
}

function resetEnrollmentForm() {
  $('enrollmentForm').reset();
  state.editingEnrollmentId = '';
  $('enrollmentForm').querySelector('button').textContent = 'Crear matrícula';
}

function bindForms() {
  $('careerForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const name = $('careerName').value.trim();
    if (!name) return;
    if (state.careers.some((career) => career.name.toLowerCase() === name.toLowerCase())) {
      return toast('Ya existe una carrera con ese nombre');
    }

    state.careers.push({ id: uid(), name });
    $('careerForm').reset();
    render();
    toast('Carrera registrada');
  });

  $('periodForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const name = $('periodName').value.trim();
    if (!name) return;
    if (state.periods.some((period) => period.name.toLowerCase() === name.toLowerCase())) {
      return toast('Periodo duplicado');
    }

    state.periods.push({ id: uid(), name });
    $('periodForm').reset();
    render();
    toast('Periodo registrado');
  });

  $('classForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const code = $('classCode').value.trim();
    const name = $('className').value.trim();
    const capacity = Number($('classCapacity').value);

    if (!code || !name || !capacity || capacity <= 0) {
      return toast('Completa código, nombre y cupo válido');
    }

    if (state.classes.some((klass) => klass.code.toLowerCase() === code.toLowerCase())) {
      return toast('Código de clase duplicado');
    }

    state.classes.push({ id: uid(), code, name, capacity });
    $('classForm').reset();
    render();
    toast('Clase registrada');
  });

  $('studentForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const name = $('studentName').value.trim();
    const doc = $('studentDoc').value.trim();
    const careerId = $('studentCareer').value;

    if (!name || !doc || !careerId) {
      return toast('Completa nombre, documento y carrera');
    }

    if (state.students.some((student) => student.doc.toLowerCase() === doc.toLowerCase())) {
      return toast('Documento duplicado');
    }

    state.students.push({ id: uid(), name, doc, careerId });
    $('studentForm').reset();
    render();
    toast('Alumno registrado');
  });

  $('enrollmentForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const studentId = $('enrollStudent').value;
    const classId = $('enrollClass').value;
    const periodId = $('enrollPeriod').value;

    if (!studentId || !classId || !periodId) {
      return toast('Debes seleccionar alumno, clase y periodo');
    }

    const error = validateEnrollment(studentId, classId, periodId, state.editingEnrollmentId);
    if (error) return toast(error);

    if (state.editingEnrollmentId) {
      state.enrollments = state.enrollments.map((item) =>
        item.id === state.editingEnrollmentId ? { ...item, studentId, classId, periodId } : item
      );
      resetEnrollmentForm();
      render();
      return toast('Matrícula actualizada');
    }

    state.enrollments.push({ id: uid(), studentId, classId, periodId });
    resetEnrollmentForm();
    render();
    toast('Matrícula creada');
  });
}

async function removeCareer(careerId) {
  const hasStudents = state.students.some((student) => student.careerId === careerId);
  if (hasStudents) return toast('No se puede borrar: la carrera está referenciada por alumnos');

  if (await askConfirm('¿Eliminar carrera seleccionada?', 'Eliminar carrera')) {
    state.careers = state.careers.filter((career) => career.id !== careerId);
    render();
    toast('Carrera eliminada');
  }
}

async function removePeriod(periodId) {
  const hasLinks = state.enrollments.some((enrollment) => enrollment.periodId === periodId);
  if (hasLinks) return toast('No se puede borrar: ese periodo ya tiene matrículas');

  if (await askConfirm('¿Eliminar periodo seleccionado?', 'Eliminar periodo')) {
    state.periods = state.periods.filter((period) => period.id !== periodId);
    render();
    toast('Periodo eliminado');
  }
}

async function removeClass(classId) {
  const hasLinks = state.enrollments.some((enrollment) => enrollment.classId === classId);
  if (hasLinks) return toast('No se puede borrar: la clase tiene matrículas asociadas');

  if (await askConfirm('¿Eliminar clase seleccionada?', 'Eliminar clase')) {
    state.classes = state.classes.filter((klass) => klass.id !== classId);
    render();
    toast('Clase eliminada');
  }
}

async function removeEnrollment(enrollmentId) {
  if (await askConfirm('¿Eliminar matrícula?', 'Eliminar matrícula')) {
    state.enrollments = state.enrollments.filter((enrollment) => enrollment.id !== enrollmentId);
    if (state.editingEnrollmentId === enrollmentId) resetEnrollmentForm();
    render();
    toast('Matrícula eliminada');
  }
}

function editEnrollment(enrollmentId) {
  const enrollment = byId(state.enrollments, enrollmentId);
  if (!enrollment) return;
  state.editingEnrollmentId = enrollmentId;
  $('enrollStudent').value = enrollment.studentId;
  $('enrollClass').value = enrollment.classId;
  $('enrollPeriod').value = enrollment.periodId;
  $('enrollmentForm').querySelector('button').textContent = 'Guardar cambios';
  toast('Modo edición activo');
}

function bindActions() {
  document.body.addEventListener('click', async (event) => {
    const button = event.target.closest('button');
    if (!button) return;

    if (button.dataset.delCareer) await removeCareer(button.dataset.delCareer);
    if (button.dataset.delPeriod) await removePeriod(button.dataset.delPeriod);
    if (button.dataset.delClass) await removeClass(button.dataset.delClass);
    if (button.dataset.delEnrollment) await removeEnrollment(button.dataset.delEnrollment);
    if (button.dataset.editEnrollment) editEnrollment(button.dataset.editEnrollment);
  });

  $('searchInput').addEventListener('input', (event) => {
    state.query = event.target.value;
    state.page = 1;
    renderTable();
  });

  $('filterCareer').addEventListener('change', (event) => {
    state.filterCareerId = event.target.value;
    state.page = 1;
    renderTable();
  });

  $('filterPeriod').addEventListener('change', (event) => {
    state.filterPeriodId = event.target.value;
    state.page = 1;
    renderTable();
  });

  $('filterClass').addEventListener('change', (event) => {
    state.filterClassId = event.target.value;
    state.page = 1;
    renderTable();
  });

  $('pageSize').addEventListener('change', (event) => {
    state.pageSize = event.target.value === 'all' ? 'all' : Number(event.target.value);
    state.page = 1;
    renderTable();
  });

  $('prevPage').addEventListener('click', () => {
    state.page -= 1;
    renderTable();
  });

  $('nextPage').addEventListener('click', () => {
    state.page += 1;
    renderTable();
  });

  $('themeToggle').addEventListener('click', () => {
    const current = document.documentElement.dataset.theme;
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    $('themeToggle').innerHTML = next === 'dark' ? '<span>☀️</span> Tema' : '<span>🌙</span> Tema';
    localStorage.setItem('theme', next);
  });

  $('exportBtn').addEventListener('click', () => {
    const payload = {
      careers: state.careers,
      periods: state.periods,
      classes: state.classes,
      students: state.students,
      enrollments: state.enrollments
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `academico-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast('Backup exportado');
  });

  $('importInput').addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      const parsed = JSON.parse(content);
      state.careers = Array.isArray(parsed.careers) ? parsed.careers : [];
      state.periods = Array.isArray(parsed.periods) ? parsed.periods : [];
      state.classes = Array.isArray(parsed.classes) ? parsed.classes : [];
      state.students = Array.isArray(parsed.students) ? parsed.students : [];
      state.enrollments = Array.isArray(parsed.enrollments) ? parsed.enrollments : [];
      state.page = 1;
      resetEnrollmentForm();
      render();
      toast('Datos importados con éxito');
    } catch {
      toast('Archivo inválido: no es un JSON compatible');
    }

    event.target.value = '';
  });

  $('printBtn').addEventListener('click', () => window.print());
}

function init() {
  document.documentElement.dataset.theme = localStorage.getItem('theme') || 'light';
  $('themeToggle').innerHTML = document.documentElement.dataset.theme === 'dark' ? '<span>☀️</span> Tema' : '<span>🌙</span> Tema';

  $('loading').classList.remove('hidden');
  setTimeout(() => {
    load();
    bindForms();
    bindActions();
    render();
    $('loading').classList.add('hidden');
    $('tableWrap').classList.remove('hidden');
  }, 650);
}

init();
