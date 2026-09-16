// app.js
// Aplicación principal de Biblia PWA
// Esta aplicación es completamente independiente.


const state = {

    view: 'reader',

    bookIndex: 42,

    chapterIndex: 2,

    selectedVerses: [],

    searchQuery: '',

    searchResults: [],

    favorites: [],

    notes: [],

    history: [],

    showNumbers: true,

    darkMode: false

};


// =====================================================
// ALMACENAMIENTO LOCAL
// =====================================================

const STORAGE = {

    favorites: 'biblia-favorites',

    notes: 'biblia-notes',

    history: 'biblia-history',

    settings: 'biblia-settings'

};


// =====================================================
// INICIO
// =====================================================

document.addEventListener(
    'DOMContentLoaded',
    () => {

        loadLocalData();

        setupGlobalEvents();

        initializeBible();

    }
);


// =====================================================
// CARGAR DATOS LOCALES
// =====================================================

function loadLocalData() {

    try {

        state.favorites =
            JSON.parse(
                localStorage.getItem(
                    STORAGE.favorites
                )
            ) || [];

    } catch {

        state.favorites = [];

    }


    try {

        state.notes =
            JSON.parse(
                localStorage.getItem(
                    STORAGE.notes
                )
            ) || [];

    } catch {

        state.notes = [];

    }


    try {

        state.history =
            JSON.parse(
                localStorage.getItem(
                    STORAGE.history
                )
            ) || [];

    } catch {

        state.history = [];

    }


    try {

        const settings =
            JSON.parse(
                localStorage.getItem(
                    STORAGE.settings
                )
            ) || {};


        state.showNumbers =
            settings.showNumbers !== false;


        state.darkMode =
            settings.darkMode === true;

    } catch {

        state.showNumbers = true;

        state.darkMode = false;

    }


    applySettings();

}


// =====================================================
// GUARDAR DATOS
// =====================================================

function saveFavorites() {

    localStorage.setItem(
        STORAGE.favorites,
        JSON.stringify(
            state.favorites
        )
    );

}


function saveNotes() {

    localStorage.setItem(
        STORAGE.notes,
        JSON.stringify(
            state.notes
        )
    );

}


function saveHistory() {

    localStorage.setItem(
        STORAGE.history,
        JSON.stringify(
            state.history
        )
    );

}


function saveSettings() {

    localStorage.setItem(
        STORAGE.settings,
        JSON.stringify({

            showNumbers:
                state.showNumbers,

            darkMode:
                state.darkMode

        })
    );

}


// =====================================================
// CONFIGURACIÓN VISUAL
// =====================================================

function applySettings() {

    document.body.classList.toggle(
        'dark-mode',
        state.darkMode
    );

}


// =====================================================
// CARGAR BIBLIA
// =====================================================

async function initializeBible() {

    const content =
        document.getElementById(
            'appContent'
        );


    if (content) {

        content.innerHTML = `

            <div class="empty-card">

                <div style="font-size:40px;">
                    📖
                </div>

                <h2>
                    Cargando Biblia
                </h2>

                <p id="loadingMessage">
                    Preparando Biblia RVR60...
                </p>

            </div>

        `;

    }


    const success =
        await bible.load(
            message => {

                const loadingMessage =
                    document.getElementById(
                        'loadingMessage'
                    );


                if (loadingMessage) {

                    loadingMessage.textContent =
                        message;

                }

            }
        );


    if (!success) {

        if (content) {

            content.innerHTML = `

                <div class="empty-card">

                    <div style="font-size:40px;">
                        ⚠️
                    </div>

                    <h2>
                        No se pudo cargar la Biblia
                    </h2>

                    <p>
                        Verifica que el archivo
                        <strong>
                            bible_rv1960.json
                        </strong>
                        se encuentre en la
                        carpeta principal.
                    </p>

                    <p>
                        También debes abrir la
                        aplicación mediante un
                        servidor local.
                    </p>

                    <button
                        class="primary-button"
                        onclick="location.reload()">

                        Reintentar

                    </button>

                </div>

            `;

        }

        return;

    }


    // Buscar Juan como capítulo inicial

    const juanIndex =
        bible.data.findIndex(
            book =>
                book &&
                book.name &&
                book.name.toLowerCase() ===
                'juan'
        );


    if (juanIndex !== -1) {

        state.bookIndex =
            juanIndex;


        const book =
            bible.getBook(
                state.bookIndex
            );


        if (
            book &&
            Array.isArray(
                book.chapters
            )
        {

            if (
                book.chapters.length >= 3
            ) {

                state.chapterIndex = 2;

            } else {

                state.chapterIndex = 0;

            }

        }

    }


    addHistory();

    render();

}


// =====================================================
// EVENTOS GLOBALES
// =====================================================

function setupGlobalEvents() {

    document.addEventListener(
        'click',
        event => {

            const viewButton =
                event.target.closest(
                    '[data-view]'
                );


            if (viewButton) {

                changeView(
                    viewButton.dataset.view
                );

                return;

            }


            const closeButton =
                event.target.closest(
                    '[data-close-menu]'
                );


            if (closeButton) {

                closeMenu();

            }

        }
    );


    const overlay =
        document.getElementById(
            'overlay'
        );


    if (overlay) {

        overlay.addEventListener(
            'click',
            closeMenu
        );

    }


    const searchButton =
        document.getElementById(
            'openSearch'
        );


    if (searchButton) {

        searchButton.addEventListener(
            'click',
            () => {

                changeView(
                    'search'
                );


                setTimeout(
                    () => {

                        const input =
                            document.getElementById(
                                'searchInput'
                            );


                        if (input) {

                            input.focus();

                        }

                    },
                    100
                );

            }
        );

    }


    const menuButton =
        document.getElementById(
            'menuButton'
        );


    if (menuButton) {

        menuButton.addEventListener(
            'click',
            openMenu
        );

    }

}


// =====================================================
// MENÚ
// =====================================================

function openMenu() {

    const menu =
        document.getElementById(
            'sideMenu'
        );


    const overlay =
        document.getElementById(
            'overlay'
        );


    if (menu) {

        menu.classList.add(
            'open'
        );

    }


    if (overlay) {

        overlay.classList.add(
            'show'
        );

    }

}


function closeMenu() {

    const menu =
        document.getElementById(
            'sideMenu'
        );


    const overlay =
        document.getElementById(
            'overlay'
        );


    if (menu) {

        menu.classList.remove(
            'open'
        );

    }


    if (overlay) {

        overlay.classList.remove(
            'show'
        );

    }

}


// =====================================================
// CAMBIAR VISTA
// =====================================================

function changeView(view) {

    state.view = view;

    state.selectedVerses = [];

    closeMenu();

    render();

}


// =====================================================
// RENDER PRINCIPAL
// =====================================================

function render() {

    const content =
        document.getElementById(
            'appContent'
        );


    if (!content) {

        return;

    }


    if (!bible.loaded) {

        content.innerHTML = `

            <div class="empty-card">

                <h2>
                    La Biblia todavía no está disponible
                </h2>

            </div>

        `;

        return;

    }


    switch (state.view) {

        case 'reader':

            renderReader(content);

            break;


        case 'search':

            renderSearch(content);

            break;


        case 'favorites':

            renderFavorites(content);

            break;


        case 'notes':

            renderNotes(content);

            break;


        case 'history':

            renderHistory(content);

            break;


        case 'settings':

            renderSettings(content);

            break;


        case 'about':

            renderAbout(content);

            break;


        default:

            state.view = 'reader';

            renderReader(content);

    }


    updateNavigation();

}


// =====================================================
// NAVEGACIÓN
// =====================================================

function updateNavigation() {

    document
        .querySelectorAll(
            '[data-view]'
        )
        .forEach(button => {

            button.classList.toggle(
                'active',
                button.dataset.view ===
                state.view
            );

        });

}


// =====================================================
// LECTOR
// =====================================================

function renderReader(content) {

    const book =
        bible.getBook(
            state.bookIndex
        );


    if (!book) {

        content.innerHTML = `

            <div class="empty-card">

                <h2>
                    Libro no encontrado
                </h2>

            </div>

        `;

        return;

    }


    const chapter =
        bible.getChapter(
            state.bookIndex,
            state.chapterIndex
        );


    state.selectedVerses =
        state.selectedVerses.filter(
            index =>
                index >= 0 &&
                index < chapter.length
        );


    const isFavoriteChapter =
        state.favorites.some(
            item =>
                item.type === 'chapter' &&
                item.bookIndex ===
                    state.bookIndex &&
                item.chapterIndex ===
                    state.chapterIndex
        );


    content.innerHTML = `

        <section class="reader">

            <div class="reader-header">

                <div class="selector-row">

                    <div class="select-card">

                        <label>
                            Libro
                        </label>

                        <select id="bookSelect">

                            ${
                                bible.data
                                    .map(
                                        (
                                            item,
                                            index
                                        ) => `

                                        <option
                                            value="${index}"
                                            ${
                                                index ===
                                                state.bookIndex
                                                    ? 'selected'
                                                    : ''
                                            }
                                        >
                                            ${escapeHtml(
                                                item.name
                                            )}
                                        </option>

                                    `
                                    )
                                    .join('')
                            }

                        </select>

                    </div>


                    <div class="select-card">

                        <label>
                            Capítulo
                        </label>

                        <select
                            id="chapterSelect"
                        >

                            ${
                                book.chapters
                                    .map(
                                        (
                                            _,
                                            index
                                        ) => `

                                        <option
                                            value="${index}"
                                            ${
                                                index ===
                                                state.chapterIndex
                                                    ? 'selected'
                                                    : ''
                                            }
                                        >
                                            ${index + 1}
                                        </option>

                                    `
                                    )
                                    .join('')
                            }

                        </select>

                    </div>

                </div>


                <div class="reader-title">

                    <div>

                        <h1>

                            ${escapeHtml(
                                book.name
                            )}

                            ${state.chapterIndex + 1}

                        </h1>

                        <p>

                            ${chapter.length}
                            versículos

                        </p>

                    </div>


                    <button
                        id="favoriteChapterButton"
                        class="icon-button"
                        title="Guardar capítulo"
                    >

                        ${
                            isFavoriteChapter
                                ? '★'
                                : '☆'
                        }

                    </button>

                </div>

            </div>


            <div class="verse-list">

                ${
                    chapter.length
                        ? chapter
                              .map(
                                  (
                                      verse,
                                      index
                                  ) =>
                                      renderVerse(
                                          verse,
                                          index
                                      )
                              )
                              .join('')
                        : `

                            <div class="empty-card">

                                No hay versículos
                                disponibles.

                            </div>

                        `
                }

            </div>


            ${
                state.selectedVerses.length
                    ? renderSelectionPanel()
                    : ''
            }


            <div class="chapter-navigation">

                <button
                    id="previousChapter"
                    class="secondary-button"
                >

                    ← Anterior

                </button>


                <button
                    id="nextChapter"
                    class="primary-button"
                >

                    Siguiente →

                </button>

            </div>

        </section>

    `;


    bindReaderEvents();

}


// =====================================================
// RENDERIZAR VERSÍCULO
// =====================================================

function renderVerse(
    verse,
    index
) {

    const selected =
        state.selectedVerses.includes(
            index
        );


    return `

        <div
            class="
                verse
                ${selected ? 'selected' : ''}
            "
            data-verse="${index}"
        >

            ${
                state.showNumbers
                    ? `

                        <span class="verse-number">

                            ${index + 1}

                        </span>

                    `
                    : ''
            }


            <span class="verse-text">

                ${escapeHtml(verse)}

            </span>

        </div>

    `;

}


// =====================================================
// PANEL DE SELECCIÓN
// =====================================================

function renderSelectionPanel() {

    const count =
        state.selectedVerses.length;


    return `

        <div class="selection-panel">

            <div>

                <strong>

                    ${count}

                    ${
                        count === 1
                            ? 'versículo seleccionado'
                            : 'versículos seleccionados'
                    }

                </strong>

                <small>

                    Selecciona una acción

                </small>

            </div>


            <div class="action-grid">

                <button
                    class="action-button"
                    id="favoriteSelected"
                >

                    ⭐

                    <span>
                        Favorito
                    </span>

                </button>


                <button
                    class="action-button"
                    id="noteSelected"
                >

                    📝

                    <span>
                        Nota
                    </span>

                </button>


                <button
                    class="action-button"
                    id="copySelected"
                >

                    📋

                    <span>
                        Copiar
                    </span>

                </button>


                <button
                    class="action-button"
                    id="shareSelected"
                >

                    📤

                    <span>
                        Compartir
                    </span>

                </button>


                <button
                    class="action-button"
                    id="clearSelection"
                >

                    ✕

                    <span>
                        Limpiar
                    </span>

                </button>

            </div>

        </div>

    `;

}


// =====================================================
// EVENTOS DEL LECTOR
// =====================================================

function bindReaderEvents() {

    const bookSelect =
        document.getElementById(
            'bookSelect'
        );


    if (bookSelect) {

        bookSelect.addEventListener(
            'change',
            () => {

                state.bookIndex =
                    Number(
                        bookSelect.value
                    );


                state.chapterIndex = 0;

                state.selectedVerses = [];

                addHistory();

                render();

            }
        );

    }


    const chapterSelect =
        document.getElementById(
            'chapterSelect'
        );


    if (chapterSelect) {

        chapterSelect.addEventListener(
            'change',
            () => {

                state.chapterIndex =
                    Number(
                        chapterSelect.value
                    );


                state.selectedVerses = [];

                addHistory();

                render();

            }
        );

    }


    document
        .querySelectorAll(
            '.verse[data-verse]'
        )
        .forEach(
            verseElement => {

                verseElement.addEventListener(
                    'click',
                    () => {

                        const index =
                            Number(
                                verseElement
                                    .dataset
                                    .verse
                            );


                        toggleVerseSelection(
                            index
                        );

                    }
                );

            }
        );


    const previous =
        document.getElementById(
            'previousChapter'
        );


    if (previous) {

        previous.addEventListener(
            'click',
            previousChapter
        );

    }


    const next =
        document.getElementById(
            'nextChapter'
        );


    if (next) {

        next.addEventListener(
            'click',
            nextChapter
        );

    }


    const favoriteChapter =
        document.getElementById(
            'favoriteChapterButton'
        );


    if (favoriteChapter) {

        favoriteChapter.addEventListener(
            'click',
            favoriteCurrentChapter
        );

    }


    bindSelectionEvents();

}


// =====================================================
// SELECCIONAR VERSÍCULO
// =====================================================

function toggleVerseSelection(
    index
) {

    if (
        state.selectedVerses.includes(
            index
        )
    ) {

        state.selectedVerses =
            state.selectedVerses.filter(
                item =>
                    item !== index
            );

    } else {

        state.selectedVerses.push(
            index
        );


        state.selectedVerses.sort(
            (a, b) => a - b
        );

    }


    render();

}


// =====================================================
// CAPÍTULO ANTERIOR
// =====================================================

function previousChapter() {

    if (
        state.chapterIndex > 0
    ) {

        state.chapterIndex--;

    } else if (
        state.bookIndex > 0
    ) {

        state.bookIndex--;

        const book =
            bible.getBook(
                state.bookIndex
            );


        state.chapterIndex =
            Math.max(
                0,
                book.chapters.length - 1
            );

    } else {

        toast(
            'Ya estás en el primer capítulo de la Biblia.'
        );

        return;

    }


    state.selectedVerses = [];

    addHistory();

    render();

}


// =====================================================
// CAPÍTULO SIGUIENTE
// =====================================================

function nextChapter() {

    const book =
        bible.getBook(
            state.bookIndex
        );


    if (
        state.chapterIndex <
        book.chapters.length - 1
    ) {

        state.chapterIndex++;

    } else if (
        state.bookIndex <
        bible.data.length - 1
    ) {

        state.bookIndex++;

        state.chapterIndex = 0;

    } else {

        toast(
            'Ya estás en el último capítulo de la Biblia.'
        );

        return;

    }


    state.selectedVerses = [];

    addHistory();

    render();

}


// =====================================================
// HISTORIAL
// =====================================================

function addHistory() {

    const book =
        bible.getBook(
            state.bookIndex
        );


    if (!book) {

        return;

    }


    const item = {

        bookIndex:
            state.bookIndex,

        chapterIndex:
            state.chapterIndex,

        reference:
            `${book.name} ${
                state.chapterIndex + 1
            }`,

        date:
            new Date().toISOString()

    };


    state.history =
        state.history.filter(
            old =>
                !(
                    old.bookIndex ===
                        item.bookIndex &&
                    old.chapterIndex ===
                        item.chapterIndex
                )
        );


    state.history.unshift(
        item
    );


    state.history =
        state.history.slice(
            0,
            50
        );


    saveHistory();

}


// =====================================================
// FAVORITO DE VERSÍCULOS
// =====================================================

function favoriteSelected() {

    if (
        !state.selectedVerses.length
    ) {

        return;

    }


    const start =
        Math.min(
            ...state.selectedVerses
        );


    const end =
        Math.max(
            ...state.selectedVerses
        );


    const payload =
        bible.buildVersePayload(
            state.bookIndex,
            state.chapterIndex,
            start,
            end
        );


    if (!payload) {

        return;

    }


    const exists =
        state.favorites.some(
            item =>
                item.reference ===
                payload.reference
        );


    if (exists) {

        state.favorites =
            state.favorites.filter(
                item =>
                    item.reference !==
                    payload.reference
            );


        toast(
            'Eliminado de favoritos.'
        );

    } else {

        state.favorites.unshift({

            type:
                'verse',

            bookIndex:
                state.bookIndex,

            chapterIndex:
                state.chapterIndex,

            verseStart:
                start,

            verseEnd:
                end,

            reference:
                payload.reference,

            text:
                payload.text

        });


        toast(
            'Agregado a favoritos.'
        );

    }


    saveFavorites();

    render();

}


// =====================================================
// FAVORITO DE CAPÍTULO
// =====================================================

function favoriteCurrentChapter() {

    const book =
        bible.getBook(
            state.bookIndex
        );


    if (!book) {

        return;

    }


    const reference =
        `${book.name} ${
            state.chapterIndex + 1
        }`;


    const exists =
        state.favorites.some(
            item =>
                item.type === 'chapter' &&
                item.bookIndex ===
                    state.bookIndex &&
                item.chapterIndex ===
                    state.chapterIndex
        );


    if (exists) {

        state.favorites =
            state.favorites.filter(
                item =>
                    !(
                        item.type ===
                            'chapter' &&
                        item.bookIndex ===
                            state.bookIndex &&
                        item.chapterIndex ===
                            state.chapterIndex
                    )
            );


        toast(
            'Capítulo eliminado de favoritos.'
        );

    } else {

        const chapter =
            bible.getChapter(
                state.bookIndex,
                state.chapterIndex
            );


        state.favorites.unshift({

            type:
                'chapter',

            bookIndex:
                state.bookIndex,

            chapterIndex:
                state.chapterIndex,

            reference,

            text:
                chapter.join('\n')

        });


        toast(
            'Capítulo guardado en favoritos.'
        );

    }


    saveFavorites();

    render();

}


// =====================================================
// NOTA
// =====================================================

function addNoteForSelection() {

    if (
        !state.selectedVerses.length
    ) {

        return;

    }


    const start =
        Math.min(
            ...state.selectedVerses
        );


    const end =
        Math.max(
            ...state.selectedVerses
        );


    const payload =
        bible.buildVersePayload(
            state.bookIndex,
            state.chapterIndex,
            start,
            end
        );


    if (!payload) {

        return;

    }


    const note =
        prompt(
            `Escribe tu nota para ${payload.reference}:`
        );


    if (
        note === null ||
        note.trim() === ''
    ) {

        return;

    }


    state.notes.unshift({

        id:
            Date.now(),

        bookIndex:
            state.bookIndex,

        chapterIndex:
            state.chapterIndex,

        verseStart:
            start,

        verseEnd:
            end,

        reference:
            payload.reference,

        text:
            payload.text,

        note:
            note.trim(),

        date:
            new Date().toISOString()

    });


    saveNotes();

    toast(
        'Nota guardada.'
    );


    state.selectedVerses = [];

    render();

}


// =====================================================
// COPIAR VERSÍCULO
// =====================================================

async function copySelected() {

    const payload =
        getSelectedPayload();


    if (!payload) {

        return;

    }


    const text =
        `${payload.reference}\n${payload.text}`;


    try {

        await navigator.clipboard.writeText(
            text
        );


        toast(
            'Versículo copiado.'
        );

    } catch {

        fallbackCopy(text);

    }

}


// =====================================================
// COMPARTIR
// =====================================================

async function shareSelected() {

    const payload =
        getSelectedPayload();


    if (!payload) {

        return;

    }


    const text =
        `${payload.reference}\n${payload.text}`;


    if (
        navigator.share
    ) {

        try {

            await navigator.share({

                title:
                    payload.reference,

                text

            });

        } catch {

            // El usuario canceló
            // la ventana de compartir.

        }

    } else {

        fallbackCopy(text);

    }

}


// =====================================================
// COPIAR SIN CLIPBOARD API
// =====================================================

function fallbackCopy(text) {

    const textarea =
        document.createElement(
            'textarea'
        );


    textarea.value = text;

    textarea.style.position =
        'fixed';

    textarea.style.opacity =
        '0';


    document.body.appendChild(
        textarea
    );


    textarea.select();


    try {

        document.execCommand(
            'copy'
        );


        toast(
            'Texto copiado.'
        );

    } catch {

        toast(
            'No se pudo copiar el texto.'
        );

    }


    textarea.remove();

}


// =====================================================
// OBTENER SELECCIÓN
// =====================================================

function getSelectedPayload() {

    if (
        !state.selectedVerses.length
    ) {

        toast(
            'Selecciona al menos un versículo.'
        );

        return null;

    }


    const start =
        Math.min(
            ...state.selectedVerses
        );


    const end =
        Math.max(
            ...state.selectedVerses
        );


    return bible.buildVersePayload(
        state.bookIndex,
        state.chapterIndex,
        start,
        end
    );

}


// =====================================================
// EVENTOS DE SELECCIÓN
// =====================================================

function bindSelectionEvents() {

    const favorite =
        document.getElementById(
            'favoriteSelected'
        );


    if (favorite) {

        favorite.addEventListener(
            'click',
            favoriteSelected
        );

    }


    const note =
        document.getElementById(
            'noteSelected'
        );


    if (note) {

        note.addEventListener(
            'click',
            addNoteForSelection
        );

    }


    const copy =
        document.getElementById(
            'copySelected'
        );


    if (copy) {

        copy.addEventListener(
            'click',
            copySelected
        );

    }


    const share =
        document.getElementById(
            'shareSelected'
        );


    if (share) {

        share.addEventListener(
            'click',
            shareSelected
        );

    }


    const clear =
        document.getElementById(
            'clearSelection'
        );


    if (clear) {

        clear.addEventListener(
            'click',
            () => {

                state.selectedVerses = [];

                render();

            }
        );

    }

}


// =====================================================
// BÚSQUEDA
// =====================================================

function renderSearch(content) {

    content.innerHTML = `

        <section>

            <h1>
                Buscar
            </h1>

            <div class="search-box">

                <input
                    id="searchInput"
                    type="search"
                    placeholder="Buscar en la Biblia..."
                    value="${escapeHtml(
                        state.searchQuery
                    )}"
                />


                <button
                    id="searchButton"
                    title="Buscar"
                >

                    🔍

                </button>

            </div>


            <div id="searchResults">

                ${
                    state.searchQuery
                        ? renderSearchResults()
                        : `

                            <div class="empty-card">

                                <div style="font-size:40px;">
                                    🔎
                                </div>

                                <h2>
                                    Buscar en la Biblia
                                </h2>

                                <p>
                                    Escribe una palabra
                                    o frase para buscar
                                    entre los versículos.
                                </p>

                            </div>

                        `
                }

            </div>

        </section>

    `;


    const input =
        document.getElementById(
            'searchInput'
        );


    const button =
        document.getElementById(
            'searchButton'
        );


    if (input) {

        input.addEventListener(
            'keydown',
            event => {

                if (
                    event.key === 'Enter'
                ) {

                    performSearch(
                        input.value
                    );

                }

            }
        );

    }


    if (button) {

        button.addEventListener(
            'click',
            () => {

                performSearch(
                    input.value
                );

            }
        );

    }


    document
        .querySelectorAll(
            '[data-search-book]'
        )
        .forEach(
            element => {

                element.addEventListener(
                    'click',
                    () => {

                        state.bookIndex =
                            Number(
                                element.dataset
                                    .searchBook
                            );


                        state.chapterIndex =
                            Number(
                                element.dataset
                                    .searchChapter
                            );


                        state.selectedVerses = [];


                        state.view =
                            'reader';


                        addHistory();

                        render();

                    }
                );

            }
        );

}


// =====================================================
// REALIZAR BÚSQUEDA
// =====================================================

function performSearch(
    query
) {

    state.searchQuery =
        query.trim();


    if (!state.searchQuery) {

        state.searchResults = [];

        render();

        return;

    }


    const search =
        normalizeText(
            state.searchQuery
        );


    const results = [];

    const MAX_RESULTS = 100;


    for (
        let bookIndex = 0;
        bookIndex < bible.data.length;
        bookIndex++
    ) {

        const book =
            bible.data[
                bookIndex
            ];


        if (
            !book ||
            !Array.isArray(
                book.chapters
            )
        ) {

            continue;

        }


        for (
            let chapterIndex = 0;
            chapterIndex <
                book.chapters.length;
            chapterIndex++
        ) {

            const chapter =
                book.chapters[
                    chapterIndex
                ];


            if (
                !Array.isArray(
                    chapter
                )
            ) {

                continue;

            }


            for (
                let verseIndex = 0;
                verseIndex < chapter.length;
                verseIndex++
            ) {

                const verse =
                    String(
                        chapter[
                            verseIndex
                        ]
                    );


                if (
                    normalizeText(
                        verse
                    ).includes(
                        search
                    )
                ) {

                    results.push({

                        bookIndex,

                        chapterIndex,

                        verseIndex,

                        bookName:
                            book.name,

                        verse

                    });


                    if (
                        results.length >=
                        MAX_RESULTS
                    ) {

                        break;

                    }

                }

            }


            if (
                results.length >=
                MAX_RESULTS
            ) {

                break;

            }

        }


        if (
            results.length >=
            MAX_RESULTS
        ) {

            break;

        }

    }


    state.searchResults =
        results;


    render();

}


// =====================================================
// RESULTADOS
// =====================================================

function renderSearchResults() {

    const results =
        state.searchResults;


    if (!results.length) {

        return `

            <div class="empty-card">

                <div style="font-size:40px;">
                    🔎
                </div>

                <h2>
                    No encontramos resultados
                </h2>

                <p>
                    Intenta con otra palabra
                    o frase.
                </p>

            </div>

        `;

    }


    return `

        <div>

            <p style="margin-bottom:12px;">

                ${results.length}
                resultado(s)

                ${
                    results.length === 100
                        ? ' — se muestran los primeros 100'
                        : ''
                }

            </p>


            ${
                results
                    .map(
                        result => `

                            <div
                                class="result-card"
                                data-search-book="${result.bookIndex}"
                                data-search-chapter="${result.chapterIndex}"
                            >

                                <strong>

                                    ${escapeHtml(
                                        result.bookName
                                    )}

                                    ${
                                        result.chapterIndex +
                                        1
                                    }:${
                                        result.verseIndex +
                                        1
                                    }

                                </strong>


                                <p>

                                    ${highlightSearch(
                                        result.verse,
                                        state.searchQuery
                                    )}

                                </p>

                            </div>

                        `
                    )
                    .join('')
            }

        </div>

    `;

}


// =====================================================
// FAVORITOS
// =====================================================

function renderFavorites(content) {

    if (
        !state.favorites.length
    ) {

        content.innerHTML = `

            <div class="empty-card">

                <div style="font-size:40px;">
                    ⭐
                </div>

                <h2>
                    No tienes favoritos
                </h2>

                <p>
                    Selecciona versículos o capítulos
                    para guardarlos aquí.
                </p>

            </div>

        `;

        return;

    }


    content.innerHTML = `

        <section>

            <h1>
                Favoritos
            </h1>

            <p>
                ${state.favorites.length}
                elemento(s) guardado(s)
            </p>


            ${
                state.favorites
                    .map(
                        (
                            item,
                            index
                        ) => `

                            <div
                                class="list-card"
                                data-favorite="${index}"
                            >

                                <strong>

                                    ${escapeHtml(
                                        item.reference
                                    )}

                                </strong>


                                <p>

                                    ${escapeHtml(
                                        item.text
                                    )}

                                </p>

                            </div>

                        `
                    )
                    .join('')
            }

        </section>

    `;


    document
        .querySelectorAll(
            '[data-favorite]'
        )
        .forEach(
            element => {

                element.addEventListener(
                    'click',
                    () => {

                        const index =
                            Number(
                                element.dataset
                                    .favorite
                            );


                        const item =
                            state.favorites[
                                index
                            ];


                        if (!item) {

                            return;

                        }


                        state.bookIndex =
                            item.bookIndex;


                        state.chapterIndex =
                            item.chapterIndex;


                        state.view =
                            'reader';


                        state.selectedVerses = [];


                        render();

                    }
                );

            }
        );

}


// =====================================================
// NOTAS
// =====================================================

function renderNotes(content) {

    if (
        !state.notes.length
    ) {

        content.innerHTML = `

            <div class="empty-card">

                <div style="font-size:40px;">
                    📝
                </div>

                <h2>
                    No tienes notas
                </h2>

                <p>
                    Selecciona un versículo
                    y agrega una nota.
                </p>

            </div>

        `;

        return;

    }


    content.innerHTML = `

        <section>

            <h1>
                Notas
            </h1>


            ${
                state.notes
                    .map(
                        (
                            item,
                            index
                        ) => `

                            <div
                                class="note-card"
                            >

                                <strong>

                                    ${escapeHtml(
                                        item.reference
                                    )}

                                </strong>


                                <p>

                                    ${escapeHtml(
                                        item.note
                                    )}

                                </p>


                                <small>

                                    ${escapeHtml(
                                        item.text
                                    )}

                                </small>


                                <div
                                    class="modal-actions"
                                    style="margin-top:12px;"
                                >

                                    <button
                                        class="secondary-button"
                                        data-note-open="${index}"
                                    >

                                        Abrir

                                    </button>


                                    <button
                                        class="secondary-button"
                                        data-note-delete="${index}"
                                    >

                                        Eliminar

                                    </button>

                                </div>

                            </div>

                        `
                    )
                    .join('')
            }

        </section>

    `;


    document
        .querySelectorAll(
            '[data-note-open]'
        )
        .forEach(
            element => {

                element.addEventListener(
                    'click',
                    () => {

                        const index =
                            Number(
                                element.dataset
                                    .noteOpen
                            );


                        const item =
                            state.notes[
                                index
                            ];


                        if (!item) {

                            return;

                        }


                        state.bookIndex =
                            item.bookIndex;


                        state.chapterIndex =
                            item.chapterIndex;


                        state.selectedVerses = [];


                        state.view =
                            'reader';


                        render();

                    }
                );

            }
        );


    document
        .querySelectorAll(
            '[data-note-delete]'
        )
        .forEach(
            element => {

                element.addEventListener(
                    'click',
                    () => {

                        const index =
                            Number(
                                element.dataset
                                    .noteDelete
                            );


                        state.notes.splice(
                            index,
                            1
                        );


                        saveNotes();

                        render();

                        toast(
                            'Nota eliminada.'
                        );

                    }
                );

            }
        );

}


// =====================================================
// HISTORIAL
// =====================================================

function renderHistory(content) {

    if (
        !state.history.length
    ) {

        content.innerHTML = `

            <div class="empty-card">

                <div style="font-size:40px;">
                    🕘
                </div>

                <h2>
                    No hay historial
                </h2>

                <p>
                    Los capítulos que leas
                    aparecerán aquí.
                </p>

            </div>

        `;

        return;

    }


    content.innerHTML = `

        <section>

            <h1>
                Historial
            </h1>


            ${
                state.history
                    .map(
                        (
                            item,
                            index
                        ) => `

                            <div
                                class="list-row"
                                data-history="${index}"
                            >

                                <div>

                                    <strong>

                                        ${escapeHtml(
                                            item.reference
                                        )}

                                    </strong>


                                    <small>

                                        ${formatDate(
                                            item.date
                                        )}

                                    </small>

                                </div>


                                <span>
                                    →
                                </span>

                            </div>

                        `
                    )
                    .join('')
            }

        </section>

    `;


    document
        .querySelectorAll(
            '[data-history]'
        )
        .forEach(
            element => {

                element.addEventListener(
                    'click',
                    () => {

                        const index =
                            Number(
                                element.dataset
                                    .history
                            );


                        const item =
                            state.history[
                                index
                            ];


                        if (!item) {

                            return;

                        }


                        state.bookIndex =
                            item.bookIndex;


                        state.chapterIndex =
                            item.chapterIndex;


                        state.selectedVerses = [];


                        state.view =
                            'reader';


                        render();

                    }
                );

            }
        );

}


// =====================================================
// CONFIGURACIÓN
// =====================================================

function renderSettings(content) {

    content.innerHTML = `

        <section>

            <h1>
                Configuración
            </h1>


            <div class="setting-card">

                <div>

                    <strong>
                        Mostrar números de versículos
                    </strong>

                    <p>
                        Muestra u oculta los números
                        delante de cada versículo.
                    </p>

                </div>


                <label class="switch">

                    <input
                        type="checkbox"
                        id="showNumbers"
                        ${
                            state.showNumbers
                                ? 'checked'
                                : ''
                        }
                    >

                    <span></span>

                </label>

            </div>


            <div class="setting-card">

                <div>

                    <strong>
                        Modo oscuro
                    </strong>

                    <p>
                        Cambia la apariencia
                        de la aplicación.
                    </p>

                </div>


                <label class="switch">

                    <input
                        type="checkbox"
                        id="darkMode"
                        ${
                            state.darkMode
                                ? 'checked'
                                : ''
                        }
                    >

                    <span></span>

                </label>

            </div>


            <div class="setting-card">

                <div>

                    <strong>
                        Biblia instalada
                    </strong>

                    <p>
                        ${
                            bible.data.length
                        }
                        libros disponibles.
                    </p>

                </div>

            </div>

        </section>

    `;


    const showNumbers =
        document.getElementById(
            'showNumbers'
        );


    if (showNumbers) {

        showNumbers.addEventListener(
            'change',
            () => {

                state.showNumbers =
                    showNumbers.checked;


                saveSettings();

                render();

            }
        );

    }


    const darkMode =
        document.getElementById(
            'darkMode'
        );


    if (darkMode) {

        darkMode.addEventListener(
            'change',
            () => {

                state.darkMode =
                    darkMode.checked;


                saveSettings();

                applySettings();

            }
        );

    }

}


// =====================================================
// ACERCA DE
// =====================================================

function renderAbout(content) {

    content.innerHTML = `

        <section>

            <div class="empty-card">

                <div style="font-size:50px;">
                    📖
                </div>


                <h1>
                    Biblia RVR60
                </h1>


                <p>
                    Aplicación bíblica independiente
                    para lectura, búsqueda,
                    favoritos y notas.
                </p>


                <p style="margin-top:10px;">

                    ${
                        bible.data.length
                    }
                    libros disponibles.

                </p>

            </div>

        </section>

    `;

}


// =====================================================
// UTILIDADES
// =====================================================

function normalizeText(text) {

    return String(text)
        .normalize('NFD')
        .replace(
            /[\u0300-\u036f]/g,
            ''
        )
        .toLowerCase();

}


function escapeHtml(text) {

    return String(text)
        .replace(
            /&/g,
            '&amp;'
        )
        .replace(
            /</g,
            '&lt;'
        )
        .replace(
            />/g,
            '&gt;'
        )
        .replace(
            /"/g,
            '&quot;'
        )
        .replace(
            /'/g,
            '&#039;'
        );

}


function escapeRegex(text) {

    return text.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
    );

}


function highlightSearch(
    text,
    query
) {

    const escaped =
        escapeHtml(text);


    const normalizedQuery =
        escapeHtml(query);


    if (!normalizedQuery) {

        return escaped;

    }


    const regex =
        new RegExp(
            `(${escapeRegex(
                normalizedQuery
            )})`,
            'gi'
        );


    return escaped.replace(
        regex,
        '<mark>$1</mark>'
    );

}


function formatDate(date) {

    try {

        return new Date(
            date
        ).toLocaleString(
            'es-MX',
            {
                dateStyle:
                    'short',

                timeStyle:
                    'short'
            }
        );

    } catch {

        return '';

    }

}


// =====================================================
// TOAST
// =====================================================

function toast(message) {

    let element =
        document.getElementById(
            'toast'
        );


    if (!element) {

        element =
            document.createElement(
                'div'
            );


        element.id =
            'toast';


        element.className =
            'toast';


        document.body.appendChild(
            element
        );

    }


    element.textContent =
        message;


    element.classList.add(
        'show'
    );


    clearTimeout(
        element._timeout
    );


    element._timeout =
        setTimeout(
            () => {

                element.classList.remove(
                    'show'
                );

            },
            2500
        );

}