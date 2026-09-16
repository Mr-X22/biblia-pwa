```javascript
// app.js
// Aplicación principal de Biblia RVR60
// Aplicación completamente independiente.

// =====================================================
// ESTADO
// =====================================================

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
// ALMACENAMIENTO
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

                    <button
                        class="primary-button"
                        onclick="location.reload()"
                    >
                        Reintentar
                    </button>

                </div>

            `;

        }

        return;

    }


    // =================================================
    // BUSCAR JUAN COMO CAPÍTULO INICIAL
    // =================================================

    const juanIndex =
        bible.data.findIndex(

            book =>
                book &&
                book.name &&
                book.name
                    .toLowerCase() ===
                'juan'

        );


    if (juanIndex !== -1) {

        state.bookIndex =
            juanIndex;


        const book =
            bible.getBook(
                state.bookIndex
            );


        // CORRECCIÓN:
        // El paréntesis del if estaba incompleto.

        if (
            book &&
            Array.isArray(
                book.chapters
            )
        ) {

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
        .forEach(

            button => {

                button.classList.toggle(

                    'active',

                    button.dataset.view ===
                    state.view

                );

            }

        );

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
// SELECCIÓN DE VERSÍCULOS
// =====================================================

function toggleVerseSelection(index) {

    const position =
        state.selectedVerses.indexOf(
            index
        );


    if (position === -1) {

        state.selectedVerses.push(
            index
        );

    } else {

        state.selectedVerses.splice(
            position,
            1
        );

    }


    state.selectedVerses.sort(
        (a, b) => a - b
    );


    render();

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

        const previousBook =
            bible.getBook(
                state.bookIndex
            );


        if (
            previousBook &&
            Array.isArray(
                previousBook.chapters
            ) &&
            previousBook.chapters.length
        ) {

            state.chapterIndex =
                previousBook.chapters.length - 1;

        } else {

            state.chapterIndex = 0;

        }

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


    if (!book) {

        return;

    }


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

    }


    state.selectedVerses = [];

    addHistory();

    render();

}


// =====================================================
// FAVORITO DEL CAPÍTULO
// =====================================================

function favoriteCurrentChapter() {

    const existing =
        state.favorites.findIndex(

            item =>

                item.type === 'chapter' &&

                item.bookIndex ===
                    state.bookIndex &&

                item.chapterIndex ===
                    state.chapterIndex

        );


    if (existing !== -1) {

        state.favorites.splice(
            existing,
            1
        );

        toast(
            'Capítulo eliminado de favoritos'
        );

    } else {

        const book =
            bible.getBook(
                state.bookIndex
            );


        state.favorites.push({

            type: 'chapter',

            bookIndex:
                state.bookIndex,

            chapterIndex:
                state.chapterIndex,

            reference:
                `${book.name} ${state.chapterIndex + 1}`,

            date:
                new Date().toISOString()

        });


        toast(
            'Capítulo guardado en favoritos'
        );

    }


    saveFavorites();

    render();

}


// =====================================================
// FAVORITOS DE VERSÍCULOS
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


    const exists =
        state.favorites.some(

            item =>

                item.type === 'verse' &&

                item.reference ===
                    payload.reference

        );


    if (exists) {

        toast(
            'Ya está guardado en favoritos'
        );

        return;

    }


    state.favorites.push({

        type: 'verse',

        bookIndex:
            state.bookIndex,

        chapterIndex:
            state.chapterIndex,

        startVerse:
            start,

        endVerse:
            end,

        reference:
            payload.reference,

        text:
            payload.text,

        date:
            new Date().toISOString()

    });


    saveFavorites();

    toast(
        'Versículo guardado en favoritos'
    );

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


    const noteText =
        prompt(
            'Escribe tu nota:'
        );


    if (
        !noteText ||
        !noteText.trim()
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


    state.notes.push({

        id:
            Date.now(),

        bookIndex:
            state.bookIndex,

        chapterIndex:
            state.chapterIndex,

        startVerse:
            start,

        endVerse:
            end,

        reference:
            payload.reference,

        text:
            payload.text,

        note:
            noteText.trim(),

        date:
            new Date().toISOString()

    });


    saveNotes();

    toast(
        'Nota guardada'
    );

}


// =====================================================
// COPIAR
// =====================================================

async function copySelected() {

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


    const text =
        `${payload.reference}\n${payload.text}`;


    try {

        if (
            navigator.clipboard &&
            navigator.clipboard.writeText
        ) {

            await navigator.clipboard.writeText(
                text
            );

        } else {

            copyFallback(text);

        }


        toast(
            'Texto copiado'
        );

    } catch {

        copyFallback(text);

        toast(
            'Texto copiado'
        );

    }

}


// =====================================================
// COMPARTIR
// =====================================================

async function shareSelected() {

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


    const text =
        `${payload.reference}\n${payload.text}`;


    if (
        navigator.share
    ) {

        try {

            await navigator.share({

                title:
                    payload.reference,

                text:
                    text

            });

        } catch {

            // El usuario canceló el diálogo.

        }

        return;

    }


    copyFallback(text);

    toast(
        'Compartir no está disponible. Texto copiado.'
    );

}


// =====================================================
// COPIA DE RESPALDO
// =====================================================

function copyFallback(text) {

    const textarea =
        document.createElement(
            'textarea'
        );


    textarea.value = text;

    textarea.style.position =
        'fixed';

    textarea.style.left =
        '-9999px';


    document.body.appendChild(
        textarea
    );


    textarea.select();

    document.execCommand(
        'copy'
    );


    textarea.remove();

}


// =====================================================
// BÚSQUEDA
// =====================================================

function renderSearch(content) {

    content.innerHTML = `

        <section class="search-view">

            <div class="search-box">

                <input
                    id="searchInput"
                    type="search"
                    placeholder="Buscar en la Biblia..."
                    value="${escapeHtml(
                        state.searchQuery
                    )}"
                >

                <button
                    id="searchButton"
                    class="primary-button"
                >
                    Buscar
                </button>

            </div>


            <div id="searchResults">

                ${
                    state.searchQuery
                        ? renderSearchResults()
                        : `
                            <div class="empty-card">

                                <h2>
                                    Buscar en la Biblia
                                </h2>

                                <p>
                                    Escribe una palabra,
                                    frase o referencia.
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


    if (button) {

        button.addEventListener(
            'click',
            performSearch
        );

    }


    if (input) {

        input.addEventListener(

            'keydown',

            event => {

                if (
                    event.key === 'Enter'
                ) {

                    performSearch();

                }

            }

        );

    }


    bindSearchResults();

}


// =====================================================
// REALIZAR BÚSQUEDA
// =====================================================

function performSearch() {

    const input =
        document.getElementById(
            'searchInput'
        );


    if (!input) {

        return;

    }


    const query =
        input.value.trim();


    state.searchQuery =
        query;


    state.searchResults = [];


    if (!query) {

        render();

        return;

    }


    const normalizedQuery =
        normalizeText(query);


    for (
        let bookIndex = 0;
        bookIndex < bible.data.length;
        bookIndex++
    ) {

        const book =
            bible.data[bookIndex];


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
            chapterIndex < book.chapters.length;
            chapterIndex++
        ) {

            const chapter =
                book.chapters[chapterIndex];


            if (
                !Array.isArray(chapter)
            ) {

                continue;

            }


            for (
                let verseIndex = 0;
                verseIndex < chapter.length;
                verseIndex++
            ) {

                const verse =
                    chapter[verseIndex];


                if (
                    normalizeText(
                        verse
                    ).includes(
                        normalizedQuery
                    )
                ) {

                    state.searchResults.push({

                        bookIndex,

                        chapterIndex,

                        verseIndex,

                        bookName:
                            book.name,

                        reference:
                            `${book.name} ${chapterIndex + 1}:${verseIndex + 1}`,

                        text:
                            verse

                    });


                    if (
                        state.searchResults.length >= 100
                    ) {

                        break;

                    }

                }

            }


            if (
                state.searchResults.length >= 100
            ) {

                break;

            }

        }


        if (
            state.searchResults.length >= 100
        ) {

            break;

        }

    }


    render();

}


// =====================================================
// RESULTADOS DE BÚSQUEDA
// =====================================================

function renderSearchResults() {

    if (
        !state.searchResults.length
    ) {

        return `

            <div class="empty-card">

                <h2>
                    No se encontraron resultados
                </h2>

                <p>
                    Intenta con otra palabra.
                </p>

            </div>

        `;

    }


    return `

        <div class="search-results">

            <p class="results-count">

                ${state.searchResults.length}

                resultado(s)

            </p>


            ${

                state.searchResults

                    .map(

                        (result, index) => `

                            <button
                                class="result-card"
                                data-result="${index}"
                            >

                                <strong>

                                    ${escapeHtml(
                                        result.reference
                                    )}

                                </strong>

                                <p>

                                    ${highlightSearch(
                                        result.text,
                                        state.searchQuery
                                    )}

                                </p>

                            </button>

                        `

                    )

                    .join('')

            }

        </div>

    `;

}


// =====================================================
// EVENTOS DE RESULTADOS
// =====================================================

function bindSearchResults() {

    document
        .querySelectorAll(
            '[data-result]'
        )
        .forEach(

            element => {

                element.addEventListener(

                    'click',

                    () => {

                        const index =
                            Number(
                                element.dataset.result
                            );


                        const result =
                            state.searchResults[
                                index
                            ];


                        if (!result) {

                            return;

                        }


                        state.bookIndex =
                            result.bookIndex;


                        state.chapterIndex =
                            result.chapterIndex;


                        state.selectedVerses = [

                            result.verseIndex

                        ];


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
// FAVORITOS
// =====================================================

function renderFavorites(content) {

    if (
        !state.favorites.length
    ) {

        content.innerHTML = `

            <div class="empty-card">

                <h2>
                    No tienes favoritos
                </h2>

                <p>
                    Guarda capítulos o versículos
                    para encontrarlos aquí.
                </p>

            </div>

        `;

        return;

    }


    content.innerHTML = `

        <section>

            <div class="page-header">

                <h1>
                    Favoritos
                </h1>

                <p>
                    Tus capítulos y versículos guardados.
                </p>

            </div>


            <div class="list">

                ${

                    state.favorites

                        .map(

                            (item, index) => `

                                <button
                                    class="list-card"
                                    data-favorite="${index}"
                                >

                                    <strong>

                                        ${escapeHtml(
                                            item.reference
                                        )}

                                    </strong>

                                    <span>

                                        ${
                                            item.type ===
                                            'chapter'

                                                ? 'Capítulo'

                                                : 'Versículo'
                                        }

                                    </span>

                                </button>

                            `

                        )

                        .join('')

                }

            </div>

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
                                element.dataset.favorite
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


                        state.selectedVerses = [];


                        if (
                            item.type === 'verse'
                        ) {

                            for (
                                let i =
                                    item.startVerse;
                                i <=
                                    item.endVerse;
                                i++
                            ) {

                                state.selectedVerses.push(
                                    i
                                );

                            }

                        }


                        state.view =
                            'reader';


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

                <h2>
                    No tienes notas
                </h2>

                <p>
                    Selecciona un versículo
                    para crear una nota.
                </p>

            </div>

        `;

        return;

    }


    content.innerHTML = `

        <section>

            <div class="page-header">

                <h1>
                    Notas
                </h1>

                <p>
                    Tus anotaciones bíblicas.
                </p>

            </div>


            <div class="notes-list">

                ${

                    state.notes

                        .map(

                            (note, index) => `

                                <article
                                    class="note-card"
                                >

                                    <strong>

                                        ${escapeHtml(
                                            note.reference
                                        )}

                                    </strong>

                                    <p>

                                        ${escapeHtml(
                                            note.note
                                        )}

                                    </p>

                                    <small>

                                        ${formatDate(
                                            note.date
                                        )}

                                    </small>

                                    <div class="modal-actions">

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

                                </article>

                            `

                        )

                        .join('')

                }

            </div>

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
                                element.dataset.noteOpen
                            );


                        const note =
                            state.notes[
                                index
                            ];


                        if (!note) {

                            return;

                        }


                        state.bookIndex =
                            note.bookIndex;


                        state.chapterIndex =
                            note.chapterIndex;


                        state.selectedVerses = [];


                        for (
                            let i =
                                note.startVerse;
                            i <=
                                note.endVerse;
                            i++
                        ) {

                            state.selectedVerses.push(
                                i
                            );

                        }


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
                                element.dataset.noteDelete
                            );


                        state.notes.splice(
                            index,
                            1
                        );


                        saveNotes();

                        render();

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

                <h2>
                    Historial vacío
                </h2>

                <p>
                    Los capítulos que visites
                    aparecerán aquí.
                </p>

            </div>

        `;

        return;

    }


    content.innerHTML = `

        <section>

            <div class="page-header">

                <h1>
                    Historial
                </h1>

            </div>


            <div class="list">

                ${

                    state.history

                        .map(

                            (item, index) => `

                                <button
                                    class="list-card"
                                    data-history="${index}"
                                >

                                    <strong>

                                        ${escapeHtml(
                                            item.reference
                                        )}

                                    </strong>

                                    <span>

                                        ${formatDate(
                                            item.date
                                        )}

                                    </span>

                                </button>

                            `

                        )

                        .join('')

                }

            </div>

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
                                element.dataset.history
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
// AGREGAR AL HISTORIAL
// =====================================================

function addHistory() {

    if (
        !bible ||
        !bible.data ||
        !bible.data[state.bookIndex]
    ) {

        return;

    }


    const book =
        bible.data[
            state.bookIndex
        ];


    const reference =
        `${book.name} ${state.chapterIndex + 1}`;


    state.history =
        state.history.filter(

            item =>
                !(
                    item.bookIndex ===
                        state.bookIndex &&

                    item.chapterIndex ===
                        state.chapterIndex
                )

        );


    state.history.unshift({

        bookIndex:
            state.bookIndex,

        chapterIndex:
            state.chapterIndex,

        reference,

        date:
            new Date().toISOString()

    });


    state.history =
        state.history.slice(
            0,
            50
        );


    saveHistory();

}


// =====================================================
// CONFIGURACIÓN
// =====================================================

function renderSettings(content) {

    content.innerHTML = `

        <section>

            <div class="page-header">

                <h1>
                    Configuración
                </h1>

            </div>


            <div class="setting-card">

                <div>

                    <strong>
                        Mostrar números de versículo
                    </strong>

                    <p>
                        Muestra u oculta los números
                        delante del texto.
                    </p>

                </div>


                <label class="switch">

                    <input
                        type="checkbox"
                        id="showNumbersSwitch"
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
                        Cambia la apariencia de la aplicación.
                    </p>

                </div>


                <label class="switch">

                    <input
                        type="checkbox"
                        id="darkModeSwitch"
                        ${
                            state.darkMode
                                ? 'checked'
                                : ''
                        }
                    >

                    <span></span>

                </label>

            </div>

        </section>

    `;


    const showNumbers =
        document.getElementById(
            'showNumbersSwitch'
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
            'darkModeSwitch'
        );


    if (darkMode) {

        darkMode.addEventListener(

            'change',

            () => {

                state.darkMode =
                    darkMode.checked;

                saveSettings();

                applySettings();

                render();

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

            <div class="page-header">

                <h1>
                    Acerca de
                </h1>

            </div>


            <div class="empty-card">

                <div style="font-size:50px;">
                    📖
                </div>

                <h2>
                    Biblia RVR60
                </h2>

                <p>
                    Aplicación independiente para
                    lectura y estudio de la Biblia.
                </p>

                <p>
                    Incluye lectura, búsqueda,
                    favoritos, notas e historial.
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

    return String(text).replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
    );

}


function highlightSearch(
    text,
    query
) {

    const safeText =
        escapeHtml(text);


    if (!query) {

        return safeText;

    }


    const safeQuery =
        escapeRegex(
            escapeHtml(query)
        );


    return safeText.replace(

        new RegExp(
            `(${safeQuery})`,
            'gi'
        ),

        '<mark>$1</mark>'

    );

}


function formatDate(date) {

    try {

        return new Date(
            date
        ).toLocaleString(
            'es-MX'
        );

    } catch {

        return '';

    }

}


function toast(message) {

    const element =
        document.getElementById(
            'toast'
        );


    if (!element) {

        return;

    }


    element.textContent =
        message;


    element.classList.add(
        'show'
    );


    clearTimeout(
        toast.timer
    );


    toast.timer =
        setTimeout(

            () => {

                element.classList.remove(
                    'show'
                );

            },

            2500

        );

}
```
