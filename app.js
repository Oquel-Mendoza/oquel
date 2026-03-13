const STORAGE_KEY = 'academic_v2';

const state = {
  careers: [],
  periods: [],
  classes: [],
  students: [],
  page: 1,
  pageSize: 10,
  query: '',
  filterCareerId: '',
  filterPeriodId: ''
};

const $ = (id) => document.getElementById(id);
const uid = () => crypto.randomUUID();

function toast(message) {
  const el = $('toast');
  $('toastText').textContent = message;
  el.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove('show'), 1800);
}

function load() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    Object.assign(state, JSON.parse(raw));
  } catch {
    toast('No se pudo cargar almacenamiento local');
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    careers: state.careers,
    periods: state.periods,
    classes: state.classes,
    students: state.students
  }));
}

function askConfirm(message) {
  return new Promise((resolve) => {
    const dialog = $('confirmDialog');
    $('confirmText').textContent = message;
    const close = (value) => {
      dialog.close();
      $('okConfirm').onclick = null;
      $('cancelConfirm').onclick = null;
      resolve(value);
    };
    $('okConfirm').onclick = () => close(true);
    $('cancelConfirm').onclick = () => close(false);
    dialog.showModal();
  });
}


function updateThemeButton() {
  const dark = document.documentElement.dataset.theme === 'dark';
  $('themeToggle').innerHTML = `<svg class="icon"><use href="${dark ? '#i-sun' : '#i-moon'}"></use></svg><span>${dark ? 'Modo claro' : 'Modo oscuro'}</span>`;
}

function renderCatalogs() {
  const careerList = $('careerList');
  const periodList = $('periodList');
  const classList = $('classList');

  careerList.innerHTML = state.careers.map(c => `<li><span>${c.name}</span><button data-del-career="${c.id}" class="btn danger icon-btn"><svg class="icon"><use href="#i-trash"></use></svg><span>Eliminar</span></button></li>`).join('');
  periodList.innerHTML = state.periods.map(p => `<li><span>${p.name}</span><button data-del-period="${p.id}" class="btn danger icon-btn"><svg class="icon"><use href="#i-trash"></use></svg><span>Eliminar</span></button></li>`).join('');
  classList.innerHTML = state.classes.map(c => `<li><span>${c.code} · ${c.name} <small>(${c.enrolled}/${c.capacity})</small></span><button data-del-class="${c.id}" class="btn danger icon-btn"><svg class="icon"><use href="#i-trash"></use></svg><span>Eliminar</span></button></li>`).join('');

  const optionsCareers = '<option value="">Seleccione carrera</option>' + state.careers.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  const optionsPeriods = '<option value="">Seleccione periodo</option>' + state.periods.map(p => `<option value="${p.id}">${p.name}</option>`).join('');

  $('studentCareer').innerHTML = optionsCareers;
  $('studentPeriod').innerHTML = optionsPeriods;
  $('filterCareer').innerHTML = '<option value="">Todas las carreras</option>' + state.careers.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  $('filterPeriod').innerHTML = '<option value="">Todos los periodos</option>' + state.periods.map(p => `<option value="${p.id}">${p.name}</option>`).join('');

  $('filterCareer').value = state.filterCareerId;
  $('filterPeriod').value = state.filterPeriodId;
}

function filterStudents() {
  const q = state.query.toLowerCase();
  return state.students.filter((s) => {
    const qMatch = !q || s.name.toLowerCase().includes(q) || s.doc.includes(q);
    const cMatch = !state.filterCareerId || s.careerId === state.filterCareerId;
    const pMatch = !state.filterPeriodId || s.periodId === state.filterPeriodId;
    return qMatch && cMatch && pMatch;
  });
}

function renderStudents() {
  const all = filterStudents();
  const pages = Math.max(1, Math.ceil(all.length / state.pageSize));
  state.page = Math.min(state.page, pages);
  const start = (state.page - 1) * state.pageSize;
  const rows = all.slice(start, start + state.pageSize);

  $('pageInfo').textContent = `${state.page} / ${pages}`;
  $('prevPage').disabled = state.page === 1;
  $('nextPage').disabled = state.page === pages;

  $('studentTable').querySelector('tbody').innerHTML = rows.map((s) => {
    const career = state.careers.find(c => c.id === s.careerId)?.name || '-';
    const period = state.periods.find(p => p.id === s.periodId)?.name || '-';
    return `<tr><td>${s.name}</td><td>${s.doc}</td><td>${career}</td><td>${period}</td><td><button class="btn danger icon-btn" data-del-student="${s.id}"><svg class="icon"><use href="#i-trash"></use></svg><span>Eliminar</span></button></td></tr>`;
  }).join('');
}

function render() {
  renderCatalogs();
  renderStudents();
  save();
}

function bindForms() {
  $('careerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('careerName').value.trim();
    if (!name) return;
    if (state.careers.some(c => c.name.toLowerCase() === name.toLowerCase())) return toast('Carrera duplicada');
    state.careers.push({ id: uid(), name });
    $('careerName').value = '';
    render();
  });

  $('periodForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('periodName').value.trim();
    if (!name) return;
    if (state.periods.some(p => p.name.toLowerCase() === name.toLowerCase())) return toast('Periodo duplicado');
    state.periods.push({ id: uid(), name });
    $('periodName').value = '';
    render();
  });

  $('classForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const code = $('classCode').value.trim();
    const name = $('className').value.trim();
    const capacity = Number($('classCapacity').value);
    if (!code || !name || !capacity) return;
    if (state.classes.some(c => c.code.toLowerCase() === code.toLowerCase())) return toast('Código de clase duplicado');
    state.classes.push({ id: uid(), code, name, capacity, enrolled: 0 });
    $('classForm').reset();
    render();
  });

  $('studentForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('studentName').value.trim();
    const doc = $('studentDoc').value.trim();
    const careerId = $('studentCareer').value;
    const periodId = $('studentPeriod').value;
    if (!name || !doc || !careerId || !periodId) return;
    if (state.students.some(s => s.doc === doc)) return toast('Documento duplicado');
    state.students.push({ id: uid(), name, doc, careerId, periodId });
    $('studentForm').reset();
    render();
  });
}

function bindActions() {
  document.body.addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const careerId = btn.dataset.delCareer;
    if (careerId) {
      if (state.students.some(s => s.careerId === careerId)) return toast('No se puede borrar carrera con alumnos');
      if (await askConfirm('¿Eliminar carrera?')) {
        state.careers = state.careers.filter(c => c.id !== careerId);
        render();
      }
    }

    const periodId = btn.dataset.delPeriod;
    if (periodId) {
      if (state.students.some(s => s.periodId === periodId)) return toast('No se puede borrar periodo con alumnos');
      if (await askConfirm('¿Eliminar periodo?')) {
        state.periods = state.periods.filter(p => p.id !== periodId);
        render();
      }
    }

    const classId = btn.dataset.delClass;
    if (classId && await askConfirm('¿Eliminar clase?')) {
      state.classes = state.classes.filter(c => c.id !== classId);
      render();
    }

    const studentId = btn.dataset.delStudent;
    if (studentId && await askConfirm('¿Eliminar alumno?')) {
      state.students = state.students.filter(s => s.id !== studentId);
      render();
    }
  });

  $('searchInput').addEventListener('input', (e) => { state.query = e.target.value; state.page = 1; renderStudents(); });
  $('filterCareer').addEventListener('change', (e) => { state.filterCareerId = e.target.value; state.page = 1; renderStudents(); });
  $('filterPeriod').addEventListener('change', (e) => { state.filterPeriodId = e.target.value; state.page = 1; renderStudents(); });
  $('pageSize').addEventListener('change', (e) => { state.pageSize = Number(e.target.value); state.page = 1; renderStudents(); });
  $('prevPage').addEventListener('click', () => { state.page -= 1; renderStudents(); });
  $('nextPage').addEventListener('click', () => { state.page += 1; renderStudents(); });
  $('printBtn').addEventListener('click', () => window.print());

  $('themeToggle').addEventListener('click', () => {
    const current = document.documentElement.dataset.theme;
    document.documentElement.dataset.theme = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', document.documentElement.dataset.theme);
    updateThemeButton();
  });

  $('exportBtn').addEventListener('click', () => {
    const blob = new Blob([localStorage.getItem(STORAGE_KEY) || '{}'], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'academico-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  $('importInput').addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      const parsed = JSON.parse(text);
      state.careers = parsed.careers ?? [];
      state.periods = parsed.periods ?? [];
      state.classes = parsed.classes ?? [];
      state.students = parsed.students ?? [];
      render();
      toast('Datos importados');
    } catch {
      toast('JSON inválido');
    }
  });
}

function init() {
  document.documentElement.dataset.theme = localStorage.getItem('theme') || 'light';
  updateThemeButton();
  $('loading').classList.remove('hidden');
  setTimeout(() => {
    load();
    bindForms();
    bindActions();
    render();
    $('loading').classList.add('hidden');
    $('studentTable').classList.remove('hidden');
  }, 700);
}

init();
