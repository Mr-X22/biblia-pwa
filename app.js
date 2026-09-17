// ═══════════════════════════════════════
// BIBLIA RVR60 — App principal
// © 2026 Emanuel Marzano (Mr.X)
// ═══════════════════════════════════════

// ── Estado global ──
const state = {
  section: 'leer',
  bible: null,
  bookIndex: 0,
  chapterIndex: 0,
  fontSize: 'md',   // sm | md | lg | xl
  theme: 'light',
  verseStep: 'books', // books | chapters | verses
};

// ── Abreviaturas de libros ──
const ABBRS = [
  'Gn','Ex','Lv','Nm','Dt','Jos','Jue','Rt','1Sm','2Sm','1Re','2Re','1Cr','2Cr',
  'Esd','Ne','Est','Job','Sal','Pr','Ecl','Cant','Is','Jr','Lam','Ez','Dn',
  'Os','Jl','Am','Ab','Jon','Mi','Na','Ha','So','Hag','Za','Ml',
  'Mt','Mc','Lc','Jn','Hch','Rom','1Co','2Co','Gal','Ef','Fil','Col',
  '1Ts','2Ts','1Ti','2Ti','Tit','Flm','Heb','St','1Pe','2Pe','1Jn','2Jn','3Jn','Jud','Ap'
];

const FONT_SIZES = { sm: '13px', md: '15px', lg: '17px', xl: '20px' };

// ── LocalStorage helpers ──
function lsGet(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }

const favs = {
  list() { return lsGet('bible_favs') || []; },
  add(ref, text) { const l = this.list().filter(f => f.ref !== ref); l.unshift({ ref, text, ts: Date.now() }); lsSet('bible_favs', l.slice(0, 200)); },
  remove(ref) { lsSet('bible_favs', this.list().filter(f => f.ref !== ref)); },
  has(ref) { return this.list().some(f => f.ref === ref); }
};

const notes = {
  list() { return lsGet('bible_notes') || []; },
  get(ref) { return (this.list().find(n => n.ref === ref) || {}).note || ''; },
  set(ref, verseText, note) {
    const l = this.list().filter(n => n.ref !== ref);
    if (note.trim()) l.unshift({ ref, verseText, note, ts: Date.now() });
    lsSet('bible_notes', l.slice(0, 500));
  },
  list_all() { return lsGet('bible_notes') || []; }
};

const history = {
  list() { return lsGet('bible_hist') || []; },
  add(ref, bookIndex, chapterIndex) {
    const l = this.list().filter(h => h.ref !== ref);
    l.unshift({ ref, bookIndex, chapterIndex, ts: Date.now() });
    lsSet('bible_hist', l.slice(0, 50));
  }
};

const settings = {
  load() {
    state.fontSize = lsGet('bible_fontSize') || 'md';
    state.theme = lsGet('bible_theme') || 'light';
    document.documentElement.setAttribute('data-theme', state.theme);
    document.getElementById('verseList')?.style.setProperty('font-size', FONT_SIZES[state.fontSize]);
  },
  save() {
    lsSet('bible_fontSize', state.fontSize);
    lsSet('bible_theme', state.theme);
  }
};

// ── Utils ──
function esc(s) { return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function toast(msg) {
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
  document.body.appendChild(t); setTimeout(() => t.remove(), 2400);
}
function verseRef(bookIndex, chapterIndex, verseIndex) {
  const book = state.bible[bookIndex];
  return `${book.name} ${chapterIndex+1}:${verseIndex+1}`;
}
function timeAgo(ts) {
  const d = (Date.now() - ts) / 1000;
  if (d < 60) return 'Hace un momento';
  if (d < 3600) return `Hace ${Math.floor(d/60)} min`;
  if (d < 86400) return `Hace ${Math.floor(d/3600)} h`;
  return `Hace ${Math.floor(d/86400)} días`;
}

// ── CARGA DE BIBLIA ──
async function loadBible() {
  showLoading();
  try {
    const res = await fetch('./bible_rv1960.json');
    if (!res.ok) throw new Error();
    state.bible = await res.json();
    settings.load();
    renderSection('leer');
  } catch {
    showError();
  }
}

function showLoading() {
  document.getElementById('mainContent').innerHTML = `
    <div class="loading"><div class="spinner"></div><span>Cargando Biblia...</span></div>`;
}

function showError() {
  document.getElementById('mainContent').innerHTML = `
    <div class="loading" style="gap:16px;">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      <div style="text-align:center;">
        <strong>No se pudo cargar la Biblia</strong>
        <p style="margin-top:6px;font-size:13px;">Verifica que el archivo <code>bible_rv1960.json</code><br>se encuentre en la misma carpeta.</p>
      </div>
      <button class="btn-primary" onclick="loadBible()">Reintentar</button>
    </div>`;
}

// ── SECCIÓN ACTIVA ──
function renderSection(section) {
  state.section = section;
  document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.s === section));
  const titles = {
    leer: ['Biblia RVR60', 'Reina-Valera 1960'],
    buscar: ['Buscar', 'Encuentra versículos por palabra'],
    favoritos: ['Favoritos', 'Versículos guardados'],
    notas: ['Notas', 'Tus anotaciones personales'],
    historial: ['Historial', 'Lecturas recientes'],
    indice: ['Índice', '66 libros — AT y NT'],
    config: ['Configuración', 'Preferencias de la app'],
    acerca: ['Acerca de', 'Información de la aplicación'],
  };
  const [t, s] = titles[section] || ['—',''];
  document.getElementById('topTitle').textContent = t;
  document.getElementById('topSub').textContent = s;
  closeSidebar();

  if (section === 'leer') renderLeer();
  else if (section === 'buscar') renderBuscar();
  else if (section === 'favoritos') renderFavoritos();
  else if (section === 'notas') renderNotas();
  else if (section === 'historial') renderHistorial();
  else if (section === 'indice') renderIndice();
  else if (section === 'config') renderConfig();
  else if (section === 'acerca') renderAcerca();
}

// ── LEER ──
function renderLeer() {
  if (state.verseStep === 'books') renderBooks();
  else if (state.verseStep === 'chapters') renderChapters();
  else renderVerses();
}

function renderBooks() {
  const AT = [
    { label: 'Pentateuco', from: 0, to: 4 },
    { label: 'Históricos', from: 5, to: 16 },
    { label: 'Poéticos', from: 17, to: 21 },
    { label: 'Profetas Mayores', from: 22, to: 26 },
    { label: 'Profetas Menores', from: 27, to: 38 },
  ];
  const NT = [
    { label: 'Evangelios', from: 39, to: 42 },
    { label: 'Hechos', from: 43, to: 43 },
    { label: 'Epístolas Paulinas', from: 44, to: 56 },
    { label: 'Epístolas Generales', from: 57, to: 64 },
    { label: 'Apocalipsis', from: 65, to: 65 },
  ];

  function buildGrid(sections) {
    return sections.map(s => `
      <div class="section-title">${s.label}</div>
      <div class="book-grid">
        ${Array.from({length: s.to - s.from + 1}, (_,i) => i + s.from).map(i => `
          <button class="book-btn" onclick="goToBook(${i})">
            <span class="book-abbr">${ABBRS[i]}</span>
            <span class="book-name-sm">${esc(state.bible[i].name)}</span>
          </button>`).join('')}
      </div>`).join('');
  }

  document.getElementById('mainContent').innerHTML = `
    <div class="content">
      <div class="section-title" style="margin-top:0;">Antiguo Testamento</div>
      ${buildGrid(AT)}
      <div class="section-title" style="margin-top:20px;">Nuevo Testamento</div>
      ${buildGrid(NT)}
    </div>`;
}

function goToBook(i) {
  state.bookIndex = i;
  state.chapterIndex = 0;
  state.verseStep = 'chapters';
  renderChapters();
}

function renderChapters() {
  const book = state.bible[state.bookIndex];
  const totalChaps = book.chapters.length;
  const chaps = Array.from({length: totalChaps}, (_, i) => i);

  document.getElementById('mainContent').innerHTML = `
    <div class="content">
      <div class="breadcrumb">
        <button class="breadcrumb-btn" onclick="goBack('books')">Libros</button>
        <span>›</span>
        <span>${esc(book.name)}</span>
      </div>
      <div class="section-title">Capítulo</div>
      <div class="chap-grid">
        ${chaps.map(i => `
          <button class="chap-btn ${i===state.chapterIndex?'active':''}" onclick="goToChapter(${i})">${i+1}</button>
        `).join('')}
      </div>
    </div>`;
}

function goToChapter(i) {
  state.chapterIndex = i;
  state.verseStep = 'verses';
  const book = state.bible[state.bookIndex];
  history.add(`${book.name} ${i+1}`, state.bookIndex, i);
  renderVerses();
}

function renderVerses() {
  const book = state.bible[state.bookIndex];
  const verses = book.chapters[state.chapterIndex] || [];
  const totalChaps = book.chapters.length;
  const fontSize = FONT_SIZES[state.fontSize];

  document.getElementById('mainContent').innerHTML = `
    <div class="content">
      <div class="breadcrumb">
        <button class="breadcrumb-btn" onclick="goBack('books')">Libros</button>
        <span>›</span>
        <button class="breadcrumb-btn" onclick="goBack('chapters')">${esc(book.name)}</button>
        <span>›</span>
        <span>Capítulo ${state.chapterIndex + 1}</span>
      </div>
      <div id="verseList" style="font-size:${fontSize}">
        ${verses.map((text, i) => {
          const ref = verseRef(state.bookIndex, state.chapterIndex, i);
          const isFav = favs.has(ref);
          const hasNote = !!notes.get(ref);
          return `
            <div class="verse-item" id="v${i}">
              <span class="verse-num">${i+1}</span>
              <span class="verse-text">${esc(text)}</span>
              <div class="verse-actions">
                <button class="verse-action-btn ${isFav?'active':''}" title="Favorito" onclick="toggleFav(${i})">★</button>
                <button class="verse-action-btn ${hasNote?'active':''}" title="Nota" onclick="openNote(${i})">✏</button>
                <button class="verse-action-btn" title="Copiar" onclick="copyVerse(${i})">⎘</button>
              </div>
            </div>`;
        }).join('')}
      </div>
      <div style="display:flex;justify-content:space-between;margin-top:20px;padding-top:16px;border-top:1px solid var(--border-soft);">
        <button class="btn-ghost" onclick="goToChapter(${state.chapterIndex - 1})" ${state.chapterIndex===0?'disabled style="opacity:.4;cursor:not-allowed;"':''}>← Anterior</button>
        <span style="font-size:12px;color:var(--text-faint);align-self:center;">${state.chapterIndex+1} / ${totalChaps}</span>
        <button class="btn-ghost" onclick="goToChapter(${state.chapterIndex + 1})" ${state.chapterIndex===totalChaps-1?'disabled style="opacity:.4;cursor:not-allowed;"':''}>Siguiente →</button>
      </div>
    </div>`;
}

function goBack(to) {
  state.verseStep = to;
  renderLeer();
}

function toggleFav(verseIndex) {
  const book = state.bible[state.bookIndex];
  const ref = verseRef(state.bookIndex, state.chapterIndex, verseIndex);
  const text = book.chapters[state.chapterIndex][verseIndex];
  if (favs.has(ref)) { favs.remove(ref); toast('Eliminado de favoritos'); }
  else { favs.add(ref, text); toast('★ Agregado a favoritos'); }
  renderVerses();
}

function openNote(verseIndex) {
  const book = state.bible[state.bookIndex];
  const ref = verseRef(state.bookIndex, state.chapterIndex, verseIndex);
  const verseText = book.chapters[state.chapterIndex][verseIndex];
  const existing = notes.get(ref);

  const modal = document.createElement('div');
  modal.className = 'modal-bg';
  modal.innerHTML = `
    <div class="modal">
      <h3>Nota — ${esc(ref)}</h3>
      <p class="note-verse">${esc(verseText)}</p>
      <textarea class="note-textarea" id="noteText" placeholder="Escribe tu nota aquí...">${esc(existing)}</textarea>
      <div class="modal-btns">
        <button class="btn-ghost" onclick="this.closest('.modal-bg').remove()">Cancelar</button>
        ${existing?`<button class="btn-ghost" style="color:var(--red)" onclick="deleteNote('${ref}')">Eliminar</button>`:''}
        <button class="btn-primary" onclick="saveNote('${ref}', '${esc(ref)}')">Guardar</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  modal.querySelector('#noteText').focus();

  window._noteRef = ref;
  window._noteVerse = verseText;
  window._noteVerseIndex = verseIndex;
}

function saveNote(ref) {
  const text = document.getElementById('noteText').value;
  notes.set(ref, window._noteVerse, text);
  document.querySelector('.modal-bg')?.remove();
  toast('Nota guardada');
  renderVerses();
}

function deleteNote(ref) {
  notes.set(ref, '', '');
  document.querySelector('.modal-bg')?.remove();
  toast('Nota eliminada');
  renderVerses();
}

function copyVerse(verseIndex) {
  const book = state.bible[state.bookIndex];
  const ref = verseRef(state.bookIndex, state.chapterIndex, verseIndex);
  const text = book.chapters[state.chapterIndex][verseIndex];
  navigator.clipboard?.writeText(`${text} — ${ref}`).then(() => toast('Copiado al portapapeles')).catch(() => toast('No se pudo copiar'));
}

// ── BUSCAR ──
function renderBuscar() {
  document.getElementById('mainContent').innerHTML = `
    <div class="content">
      <div class="search-box">
        <input class="search-input" id="searchInput" placeholder="Escribe una palabra o frase..." />
        <button class="search-btn" onclick="doSearch()">Buscar</button>
      </div>
      <div id="searchResults"></div>
    </div>`;
  const inp = document.getElementById('searchInput');
  inp.focus();
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
}

function doSearch() {
  const q = (document.getElementById('searchInput')?.value || '').trim().toLowerCase();
  const container = document.getElementById('searchResults');
  if (!q || q.length < 2) { container.innerHTML = '<div class="search-empty">Escribe al menos 2 caracteres para buscar.</div>'; return; }

  const results = [];
  state.bible.forEach((book, bi) => {
    book.chapters.forEach((chapter, ci) => {
      chapter.forEach((verse, vi) => {
        if (verse.toLowerCase().includes(q)) {
          results.push({ book: book.name, bi, ci, vi, text: verse });
        }
      });
    });
  });

  if (!results.length) {
    container.innerHTML = `<div class="search-empty">Sin resultados para "<strong>${esc(q)}</strong>".<br>Intenta con otra palabra.</div>`;
    return;
  }

  // Resaltar coincidencias
  const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const shown = results.slice(0, 100);

  container.innerHTML = `
    <p style="font-size:12px;color:var(--text-faint);margin-bottom:12px;">${results.length} resultado${results.length!==1?'s':''} encontrado${results.length!==1?'s':''} ${results.length>100?'(mostrando los primeros 100)':''}</p>
    ${shown.map(r => `
      <div class="search-result" onclick="goToVerse(${r.bi},${r.ci},${r.vi})">
        <div class="search-ref">${esc(r.book)} ${r.ci+1}:${r.vi+1}</div>
        <div class="search-text">${r.text.replace(re, '<mark>$1</mark>')}</div>
      </div>`).join('')}`;
}

function goToVerse(bi, ci, vi) {
  state.bookIndex = bi;
  state.chapterIndex = ci;
  state.verseStep = 'verses';
  renderSection('leer');
  // Scroll al versículo
  setTimeout(() => {
    const el = document.getElementById(`v${vi}`);
    if (el) { el.classList.add('highlighted'); el.scrollIntoView({ behavior:'smooth', block:'center' }); }
  }, 100);
  history.add(`${state.bible[bi].name} ${ci+1}`, bi, ci);
}

// ── FAVORITOS ──
function renderFavoritos() {
  const list = favs.list();
  document.getElementById('mainContent').innerHTML = `
    <div class="content">
      ${!list.length ? `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <p>No tienes versículos favoritos aún.<br>Toca la estrella ★ al leer para agregar uno.</p>
        </div>` :
        list.map(f => `
          <div class="fav-item" onclick="goToVerseByRef('${esc(f.ref)}')">
            <div>
              <div class="fav-ref">${esc(f.ref)}</div>
              <div class="fav-text">${esc(f.text?.substring(0, 120))}${f.text?.length>120?'...':''}</div>
            </div>
            <button class="fav-del" onclick="event.stopPropagation();removeFav('${esc(f.ref)}')">✕</button>
          </div>`).join('')}
    </div>`;
}

function removeFav(ref) {
  favs.remove(ref); toast('Eliminado de favoritos'); renderFavoritos();
}

// ── NOTAS ──
function renderNotas() {
  const list = notes.list_all();
  document.getElementById('mainContent').innerHTML = `
    <div class="content">
      ${!list.length ? `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          <p>Todavía no tienes notas.<br>Toca el ícono ✏ al leer para agregar una.</p>
        </div>` :
        list.map(n => `
          <div class="fav-item" onclick="goToVerseByRef('${esc(n.ref)}')">
            <div style="flex:1;">
              <div class="fav-ref">${esc(n.ref)}</div>
              <div class="fav-text" style="font-style:italic;margin-bottom:5px;">${esc(n.verseText?.substring(0,80))}...</div>
              <div class="fav-text" style="color:var(--text);">${esc(n.note?.substring(0,120))}${n.note?.length>120?'...':''}</div>
              <div style="font-size:11px;color:var(--text-faint);margin-top:4px;">${timeAgo(n.ts)}</div>
            </div>
            <button class="fav-del" onclick="event.stopPropagation();deleteNoteFromList('${esc(n.ref)}')">✕</button>
          </div>`).join('')}
    </div>`;
}

function deleteNoteFromList(ref) {
  notes.set(ref, '', '');
  toast('Nota eliminada');
  renderNotas();
}

// ── HISTORIAL ──
function renderHistorial() {
  const list = history.list();
  document.getElementById('mainContent').innerHTML = `
    <div class="content">
      ${!list.length ? `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <p>Tu historial de lecturas aparecerá aquí.</p>
        </div>` :
        `<div style="display:flex;justify-content:flex-end;margin-bottom:12px;">
          <button class="btn-ghost" onclick="clearHist()" style="font-size:12px;">Limpiar historial</button>
        </div>` +
        list.map(h => `
          <div class="hist-item" onclick="goToChapterDirect(${h.bookIndex},${h.chapterIndex})">
            <div class="hist-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            </div>
            <div>
              <div class="hist-ref">${esc(h.ref)}</div>
              <div class="hist-time">${timeAgo(h.ts)}</div>
            </div>
          </div>`).join('')}
    </div>`;
}

function clearHist() {
  lsSet('bible_hist', []);
  renderHistorial();
}

function goToChapterDirect(bi, ci) {
  state.bookIndex = bi;
  state.chapterIndex = ci;
  state.verseStep = 'verses';
  renderSection('leer');
}

function goToVerseByRef(ref) {
  // Parsear ref como "Génesis 1:1"
  for (let bi = 0; bi < state.bible.length; bi++) {
    const book = state.bible[bi];
    if (ref.startsWith(book.name)) {
      const rest = ref.slice(book.name.length).trim();
      const [chStr, vStr] = rest.split(':');
      const ci = parseInt(chStr) - 1;
      const vi = parseInt(vStr) - 1;
      goToVerse(bi, ci, vi);
      return;
    }
  }
}

// ── CONFIGURACIÓN ──
function renderConfig() {
  document.getElementById('mainContent').innerHTML = `
    <div class="content">
      <div class="config-section">
        <div class="config-label">Apariencia</div>
        <div class="config-row">
          <div><div class="config-row-label">Tema oscuro</div></div>
          <button class="toggle ${state.theme==='dark'?'on':''}" id="themeToggle" onclick="toggleTheme()"></button>
        </div>
        <div class="config-row">
          <div><div class="config-row-label">Tamaño del texto</div><div class="config-row-sub">Tamaño de los versículos al leer</div></div>
          <div class="size-btns">
            <button class="size-btn ${state.fontSize==='sm'?'active':''}" onclick="setSize('sm')">A</button>
            <button class="size-btn ${state.fontSize==='md'?'active':''}" onclick="setSize('md')">A</button>
            <button class="size-btn ${state.fontSize==='lg'?'active':''}" onclick="setSize('lg')" style="font-size:15px;">A</button>
            <button class="size-btn ${state.fontSize==='xl'?'active':''}" onclick="setSize('xl')" style="font-size:18px;">A</button>
          </div>
        </div>
      </div>
      <div class="config-section">
        <div class="config-label">Datos</div>
        <div class="config-row">
          <div><div class="config-row-label">Favoritos guardados</div></div>
          <span style="font-size:13px;color:var(--accent);font-weight:600;">${favs.list().length}</span>
        </div>
        <div class="config-row">
          <div><div class="config-row-label">Notas personales</div></div>
          <span style="font-size:13px;color:var(--accent);font-weight:600;">${notes.list_all().length}</span>
        </div>
        <div class="config-row">
          <div><div class="config-row-label">Borrar todos los datos</div><div class="config-row-sub">Favoritos, notas e historial</div></div>
          <button class="btn-ghost" style="font-size:12px;color:var(--red);" onclick="clearAll()">Borrar todo</button>
        </div>
      </div>
    </div>`;
}

function toggleTheme() {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', state.theme);
  settings.save();
  renderConfig();
}

function setSize(size) {
  state.fontSize = size;
  settings.save();
  renderConfig();
}

function clearAll() {
  if (!confirm('¿Borrar todos los favoritos, notas e historial? Esta acción no se puede deshacer.')) return;
  ['bible_favs','bible_notes','bible_hist'].forEach(k => localStorage.removeItem(k));
  toast('Datos eliminados');
  renderConfig();
}

// ── ÍNDICE ──
const INDEX_SECTIONS = [
  { label:'Pentateuco — AT', from:0, to:4 },
  { label:'Históricos — AT', from:5, to:16 },
  { label:'Poéticos — AT', from:17, to:21 },
  { label:'Profetas Mayores — AT', from:22, to:26 },
  { label:'Profetas Menores — AT', from:27, to:38 },
  { label:'Evangelios — NT', from:39, to:42 },
  { label:'Hechos — NT', from:43, to:43 },
  { label:'Epístolas Paulinas — NT', from:44, to:56 },
  { label:'Epístolas Generales — NT', from:57, to:64 },
  { label:'Apocalipsis — NT', from:65, to:65 },
];

function renderIndice() {
  const bible = state.bible;
  let html = '<div class="content">';
  html += '<p style="font-size:12px;color:var(--text-muted);margin-bottom:14px;">Toca un libro para ir directamente a él.</p>';

  INDEX_SECTIONS.forEach((sec, si) => {
    // Separador AT/NT
    if (si === 5) html += '<div class="index-nt-label">✦ Nuevo Testamento ✦</div>';
    if (si === 0) html += '<div class="index-nt-label" style="margin-top:0;">✦ Antiguo Testamento ✦</div>';

    html += `<div class="index-section">
      <div class="index-section-title">${esc(sec.label.split(' — ')[0])}</div>
      <table class="index-table">`;

    for (let i = sec.from; i <= sec.to; i++) {
      const book = bible[i];
      const chaps = book.chapters.length;
      html += `<tr onclick="goToBookFromIndex(${i})">
        <td>${esc(book.name)}</td>
        <td>${chaps} cap.</td>
      </tr>`;
    }
    html += '</table></div>';
  });

  html += '</div>';
  document.getElementById('mainContent').innerHTML = html;
}

function goToBookFromIndex(i) {
  state.bookIndex = i;
  state.chapterIndex = 0;
  state.verseStep = 'chapters';
  renderSection('leer');
}

// ── ACERCA DE ──
function renderAcerca() {
  document.getElementById('mainContent').innerHTML = `
    <div class="content">
      <div class="about-card" style="text-align:center;padding:32px;">
        <div style="width:64px;height:64px;border-radius:16px;background:linear-gradient(145deg,var(--accent),var(--accent-dim));display:flex;align-items:center;justify-content:center;margin:0 auto 14px;">
          <svg viewBox="0 0 24 24" fill="#fff" width="30" height="30"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20"/></svg>
        </div>
        <h3 style="font-size:20px;margin-bottom:4px;">Biblia RVR60</h3>
        <p>Versión 1.0</p>
        <p style="margin-top:4px;font-size:12px;">© 2026 Emanuel Marzano (Mr.X)</p>
      </div>
      <div class="about-card">
        <h3>Contenido</h3>
        <p>Sagrada Biblia — Reina Valera 1960. 66 libros, ${state.bible ? state.bible.reduce((a,b)=>a+b.chapters.reduce((c,d)=>c+d.length,0),0).toLocaleString() : '31,104'} versículos.</p>
      </div>
      <div class="about-card">
        <h3>Tecnología</h3>
        <p>Aplicación web progresiva (PWA) construida con HTML, CSS y JavaScript. Funciona sin conexión a internet una vez instalada. Todos tus datos (favoritos, notas e historial) se guardan localmente en tu dispositivo.</p>
      </div>
      <div class="about-card">
        <h3>Desarrollador</h3>
        <p>Emanuel Marzano Villalobos (Mr.X)<br>Todos los derechos reservados.</p>
      </div>
    </div>`;
}

// ── SIDEBAR MÓVIL ──
function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('overlay').classList.add('open');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('overlay').classList.remove('open');
}

// ── INICIO ──
window.addEventListener('DOMContentLoaded', () => {
  // Nav clicks
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => renderSection(item.dataset.s));
  });
  document.getElementById('menuBtn').addEventListener('click', openSidebar);
  document.getElementById('overlay').addEventListener('click', closeSidebar);

  loadBible();
});
