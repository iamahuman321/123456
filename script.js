// Global state
let currentNote = null
let currentPage = "notes"
let notes = JSON.parse(localStorage.getItem("notes")) || []
let categories = JSON.parse(localStorage.getItem("categories")) || [{ id: "all", name: "All" }]
let currentFilter = "all"
let currentListType = ""
let autoSaveTimeout = null
let notesSearch = null

// Translations
const translations = {
  en: {
    notes: "NOTES",
    categories: "CATEGORIES",
    settings: "SETTINGS",
    addNote: "ADD NOTE",
    editNote: "EDIT NOTE",
    noNotes: "You don't have any notes yet",
    noCategories: "You don't have any categories yet",
    titlePlaceholder: "Your title...",
    contentPlaceholder: "Type your note here...",
    categoryPlaceholder: "New category...",
    save: "SAVE",
    cancel: "CANCEL",
    delete: "DELETE",
    created: "CREATED",
    updated: "UPDATED",
    all: "All",
    theme: "THEME",
    language: "LANGUAGE",
    version: "VERSION",
    addPassword: "ADD PASSWORD",
    removePassword: "REMOVE PASSWORD",
    enterPassword: "Enter password...",
    passwordHint: "Password must be at least 4 characters",
    deleteNote: "DELETE NOTE",
    confirmDelete: "Are you sure you want to delete this note?",
    categoryAdded: "Category added",
    categoryDeleted: "Category deleted",
    noteDeleted: "Note deleted",
    passwordSet: "Password set",
    passwordRemoved: "Password removed",
    wrongPassword: "Wrong password",
    bulletedList: "Bulleted List",
    numberedList: "Numbered List",
    checklist: "Checklist",
    addItem: "Add item",
    searchNotes: "Search notes...",
    noSearchResults: "No notes found matching your search",
    searchHistory: "Recent searches",
    clearHistory: "Clear search history",
  },
  es: {
    notes: "NOTAS",
    categories: "CATEGORÍAS",
    settings: "AJUSTES",
    addNote: "AÑADIR NOTA",
    editNote: "EDITAR NOTA",
    noNotes: "Todavía no tienes notas",
    noCategories: "Todavía no tienes categorías",
    titlePlaceholder: "Tu título...",
    contentPlaceholder: "Escribe tu nota aquí...",
    categoryPlaceholder: "Nueva categoría...",
    save: "GUARDAR",
    cancel: "CANCELAR",
    delete: "ELIMINAR",
    created: "CREADO",
    updated: "ACTUALIZADO",
    all: "Todo",
    theme: "TEMA",
    language: "IDIOMA",
    version: "VERSIÓN",
    addPassword: "AÑADIR CONTRASEÑA",
    removePassword: "ELIMINAR CONTRASEÑA",
    enterPassword: "Ingresa contraseña...",
    passwordHint: "La contraseña debe tener al menos 4 caracteres",
    deleteNote: "ELIMINAR NOTA",
    confirmDelete: "¿Estás seguro de que quieres eliminar esta nota?",
    categoryAdded: "Categoría añadida",
    categoryDeleted: "Categoría eliminada",
    noteDeleted: "Nota eliminada",
    passwordSet: "Contraseña establecida",
    passwordRemoved: "Contraseña eliminada",
    wrongPassword: "Contraseña incorrecta",
    bulletedList: "Lista con viñetas",
    numberedList: "Lista numerada",
    checklist: "Lista de verificación",
    addItem: "Añadir elemento",
    searchNotes: "Buscar notas...",
    noSearchResults: "No se encontraron notas que coincidan con tu búsqueda",
    searchHistory: "Búsquedas recientes",
    clearHistory: "Limpiar historial de búsqueda",
  },
  fr: {
    notes: "NOTES",
    categories: "CATÉGORIES",
    settings: "PARAMÈTRES",
    addNote: "AJOUTER NOTE",
    editNote: "MODIFIER NOTE",
    noNotes: "Vous n'avez pas encore de notes",
    noCategories: "Vous n'avez pas encore de catégories",
    titlePlaceholder: "Votre titre...",
    contentPlaceholder: "Tapez votre note ici...",
    categoryPlaceholder: "Nouvelle catégorie...",
    save: "ENREGISTRER",
    cancel: "ANNULER",
    delete: "SUPPRIMER",
    created: "CRÉÉ",
    updated: "MIS À JOUR",
    all: "Tous",
    theme: "THÈME",
    language: "LANGUE",
    version: "VERSION",
    addPassword: "AJOUTER MOT DE PASSE",
    removePassword: "SUPPRIMER MOT DE PASSE",
    enterPassword: "Entrez le mot de passe...",
    passwordHint: "Le mot de passe doit avoir au moins 4 caractères",
    deleteNote: "SUPPRIMER NOTE",
    confirmDelete: "Êtes-vous sûr de vouloir supprimer cette note?",
    categoryAdded: "Catégorie ajoutée",
    categoryDeleted: "Catégorie supprimée",
    noteDeleted: "Note supprimée",
    passwordSet: "Mot de passe défini",
    passwordRemoved: "Mot de passe supprimé",
    wrongPassword: "Mot de passe incorrect",
    bulletedList: "Liste à puces",
    numberedList: "Liste numérotée",
    checklist: "Liste de contrôle",
    addItem: "Ajouter un élément",
    searchNotes: "Rechercher des notes...",
    noSearchResults: "Aucune note trouvée correspondant à votre recherche",
    searchHistory: "Recherches récentes",
    clearHistory: "Effacer l'historique de recherche",
  },
  de: {
    notes: "NOTIZEN",
    categories: "KATEGORIEN",
    settings: "EINSTELLUNGEN",
    addNote: "NOTIZ HINZUFÜGEN",
    editNote: "NOTIZ BEARBEITEN",
    noNotes: "Du hast noch keine Notizen",
    noCategories: "Du hast noch keine Kategorien",
    titlePlaceholder: "Dein Titel...",
    contentPlaceholder: "Schreib deine Notiz hier...",
    categoryPlaceholder: "Neue Kategorie...",
    save: "SPEICHERN",
    cancel: "ABBRECHEN",
    delete: "LÖSCHEN",
    created: "ERSTELLT",
    updated: "AKTUALISIERT",
    all: "Alle",
    theme: "THEMA",
    language: "SPRACHE",
    version: "VERSION",
    addPassword: "PASSWORT HINZUFÜGEN",
    removePassword: "PASSWORT ENTFERNEN",
    enterPassword: "Passwort eingeben...",
    passwordHint: "Das Passwort muss mindestens 4 Zeichen haben",
    deleteNote: "NOTIZ LÖSCHEN",
    confirmDelete: "Bist du sicher, dass du diese Notiz löschen möchtest?",
    categoryAdded: "Kategorie hinzugefügt",
    categoryDeleted: "Kategorie gelöscht",
    noteDeleted: "Notiz gelöscht",
    passwordSet: "Passwort gesetzt",
    passwordRemoved: "Passwort entfernt",
    wrongPassword: "Falsches Passwort",
    bulletedList: "Punkteliste",
    numberedList: "Nummerierte Liste",
    checklist: "Checkliste",
    addItem: "Element hinzufügen",
    searchNotes: "Notizen suchen...",
    noSearchResults: "Keine Notizen gefunden, die Ihrer Suche entsprechen",
    searchHistory: "Letzte Suchen",
    clearHistory: "Suchverlauf löschen",
  },
}

let currentLanguage = localStorage.getItem("language") || "en"
let searchQuery = ""
let isSearchActive = false

// Translation function
function t(key) {
  return translations[currentLanguage]?.[key] || translations.en[key] || key
}

// Utility functions
function generateId() {
  return Math.random().toString(36).substr(2, 9)
}

function formatDate(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleDateString(currentLanguage, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hash = await crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

function showToast(message) {
  const toast = document.getElementById("toast")
  const toastMessage = document.getElementById("toastMessage")
  toastMessage.textContent = message
  toast.classList.add("show")
  setTimeout(() => {
    toast.classList.remove("show")
  }, 3000)
}

// Add Firebase integration to the saveData function
function saveData() {
  localStorage.setItem("notes", JSON.stringify(notes))
  localStorage.setItem("categories", JSON.stringify(categories))

  // Also save to Firebase if user is logged in
  if (window.authFunctions && window.authFunctions.saveUserData) {
    window.authFunctions.saveUserData()
  }

  // Update search index
  if (notesSearch) {
    notesSearch.buildSearchIndex(notes)
  }
}

// Search functionality
function initSearch() {
  // Initialize search engine
  if (window.NotesSearch) {
    notesSearch = new window.NotesSearch()
    notesSearch.buildSearchIndex(notes)
  }

  const searchBtn = document.getElementById('searchBtn')
  const searchContainer = document.getElementById('searchContainer')
  const searchInput = document.getElementById('searchInput')
  const searchClear = document.getElementById('searchClear')

  if (!searchBtn || !searchContainer || !searchInput || !searchClear) {
    return // Elements not found, probably not on main page
  }

  searchBtn.addEventListener('click', () => {
    toggleSearch()
  })

  searchClear.addEventListener('click', () => {
    clearSearch()
  })

  searchInput.addEventListener('input', (e) => {
    handleSearchInput(e.target.value)
  })

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      performSearch(e.target.value)
    } else if (e.key === 'Escape') {
      closeSearch()
    }
  })

  // Setup search suggestions
  setupSearchSuggestions()
}

function toggleSearch() {
  const searchContainer = document.getElementById('searchContainer')
  const searchInput = document.getElementById('searchInput')
  
  if (searchContainer.classList.contains('active')) {
    closeSearch()
  } else {
    openSearch()
  }
}

function openSearch() {
  const searchContainer = document.getElementById('searchContainer')
  const searchInput = document.getElementById('searchInput')
  
  searchContainer.classList.add('active')
  searchInput.focus()
  isSearchActive = true
  
  // Show search suggestions
  showSearchSuggestions('')
}

function closeSearch() {
  const searchContainer = document.getElementById('searchContainer')
  const searchInput = document.getElementById('searchInput')
  
  searchContainer.classList.remove('active')
  searchInput.value = ''
  isSearchActive = false
  
  // Clear search and show all notes
  if (searchQuery) {
    searchQuery = ''
    renderNotes()
  }
  
  hideSearchSuggestions()
}

function clearSearch() {
  const searchInput = document.getElementById('searchInput')
  searchInput.value = ''
  searchQuery = ''
  renderNotes()
  hideSearchSuggestions()
}

function handleSearchInput(query) {
  if (query.length === 0) {
    hideSearchSuggestions()
    if (searchQuery) {
      searchQuery = ''
      renderNotes()
    }
    return
  }
  
  showSearchSuggestions(query)
}

function performSearch(query) {
  if (!query || !notesSearch) {
    clearSearch()
    return
  }
  
  searchQuery = query.trim()
  
  if (searchQuery) {
    notesSearch.addToHistory(searchQuery)
    renderNotes()
    hideSearchSuggestions()
  }
}

function setupSearchSuggestions() {
  // Create suggestions container if it doesn't exist
  const searchContainer = document.getElementById('searchContainer')
  if (!searchContainer) return
  
  const suggestionsContainer = document.createElement('div')
  suggestionsContainer.className = 'search-suggestions'
  suggestionsContainer.id = 'searchSuggestions'
  searchContainer.appendChild(suggestionsContainer)
}

function showSearchSuggestions(query) {
  if (!notesSearch) return
  
  const suggestionsContainer = document.getElementById('searchSuggestions')
  if (!suggestionsContainer) return
  
  const suggestions = notesSearch.getSuggestions(query, notes, categories)
  
  if (suggestions.length === 0) {
    hideSearchSuggestions()
    return
  }
  
  suggestionsContainer.innerHTML = suggestions.map(suggestion => `
    <div class="search-suggestion" onclick="selectSuggestion('${suggestion.text}')">
      <i class="${suggestion.icon}"></i>
      <div class="search-suggestion-content">
        <div class="search-suggestion-text">${suggestion.text}</div>
        ${suggestion.description ? `<div class="search-suggestion-desc">${suggestion.description}</div>` : ''}
      </div>
    </div>
  `).join('')
  
  suggestionsContainer.style.display = 'block'
}

function hideSearchSuggestions() {
  const suggestionsContainer = document.getElementById('searchSuggestions')
  if (suggestionsContainer) {
    suggestionsContainer.style.display = 'none'
  }
}

function selectSuggestion(text) {
  const searchInput = document.getElementById('searchInput')
  searchInput.value = text
  performSearch(text)
}

// Theme management
function initTheme() {
  const savedTheme = localStorage.getItem("theme") || "system"
  const themeSelect = document.getElementById("themeSelect")
  if (themeSelect) {
    themeSelect.value = savedTheme
  }
  applyTheme(savedTheme)
}

function applyTheme(theme) {
  const body = document.body
  body.removeAttribute("data-theme")

  if (theme === "system") {
    // Use system preference
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      body.setAttribute("data-theme", "dark")
    } else {
      body.setAttribute("data-theme", "light")
    }
  } else {
    body.setAttribute("data-theme", theme)
  }

  localStorage.setItem("theme", theme)
}

// Language management
function initLanguage() {
  const languageSelect = document.getElementById("languageSelect")
  if (languageSelect) {
    languageSelect.value = currentLanguage
  }
  updateLanguage()
}

function updateLanguage() {
  // Update all translatable elements
  document.querySelectorAll("[data-translate]").forEach((element) => {
    const key = element.getAttribute("data-translate")
    element.textContent = t(key)
  })

  // Update placeholders
  document.querySelectorAll("[data-translate-placeholder]").forEach((element) => {
    const key = element.getAttribute("data-translate-placeholder")
    element.placeholder = t(key)
  })

  // Update search placeholder
  const searchInput = document.getElementById("searchInput")
  if (searchInput) {
    searchInput.placeholder = t("searchNotes")
  }

  localStorage.setItem("language", currentLanguage)
}

// Navigation
// Update the showPage function to include animations
function showPage(pageId) {
  // Get current active page
  const currentActivePage = document.querySelector(".page.active")

  // Hide all pages with animation
  if (currentActivePage) {
    // Don't immediately remove active class to allow animation to play
    currentActivePage.style.animation = "fadeOut 0.2s ease forwards"

    setTimeout(() => {
      currentActivePage.classList.remove("active")
      currentActivePage.style.animation = ""

      // Show selected page with animation
      const newPage = document.getElementById(pageId)
      if (newPage) {
        newPage.classList.add("active")

        // Choose animation based on page type
        if (pageId === "editorPage") {
          newPage.style.animation = "slideInRight 0.3s ease forwards"
        } else if (currentActivePage.id === "editorPage") {
          newPage.style.animation = "slideInLeft 0.3s ease forwards"
        } else {
          newPage.style.animation = "fadeIn 0.3s ease forwards"
        }
      }
    }, 200) // Match the fadeOut animation duration
  } else {
    // If no active page, just show the new one
    const newPage = document.getElementById(pageId)
    if (newPage) {
      newPage.classList.add("active")
      newPage.style.animation = "fadeIn 0.3s ease forwards"
    }
  }

  // Update navigation
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.remove("active")
  })

  const activeNavItem = document.querySelector(`[data-page="${pageId.replace("Page", "")}"]`)
  if (activeNavItem) {
    activeNavItem.classList.add("active")
  }

  // Update header
  const titles = {
    notesPage: t("notes"),
    categoriesPage: t("categories"),
    settingsPage: t("settings"),
    editorPage: currentNote ? t("editNote") : t("addNote"),
  }

  const headerTitle = document.getElementById("headerTitle")
  if (headerTitle) {
    headerTitle.textContent = titles[pageId] || t("notes")
  }

  // Show/hide back button
  const backBtn = document.getElementById("backBtn")
  const menuBtn = document.getElementById("menuBtn")

  if (pageId === "editorPage" || pageId === "categoriesPage" || pageId === "settingsPage") {
    if (backBtn) backBtn.classList.remove("hidden")
    if (menuBtn) menuBtn.classList.add("hidden")
  } else {
    if (backBtn) backBtn.classList.add("hidden")
    if (menuBtn) menuBtn.classList.remove("hidden")
  }

  currentPage = pageId.replace("Page", "")

  // Close sidebar on mobile
  const sidebar = document.getElementById("sidebar")
  if (sidebar) {
    sidebar.classList.remove("open")
  }

  // Close search if switching pages
  if (isSearchActive && pageId !== "notesPage") {
    closeSearch()
  }
}

// Notes management
function renderNotes() {
  const container = document.getElementById("notesContainer")
  if (!container) return

  // Query emptyState fresh each time to avoid stale reference
  const emptyState = document.getElementById("emptyState")

  console.log("renderNotes called with currentFilter:", currentFilter)
  console.log("Total notes count:", notes.length)
  console.log("Search query:", searchQuery)

  let filteredNotes = notes

  // Apply search filter first
  if (searchQuery && notesSearch) {
    filteredNotes = notesSearch.search(searchQuery, {
      notes: filteredNotes,
      categories: categories,
      searchInContent: true,
      searchInTitle: true,
      searchInCategories: true,
      searchInLists: true
    })
  }

  // Then apply category filter
  filteredNotes = filteredNotes.filter((note) => {
    if (currentFilter === "all") return true
    // Defensive check: ensure note.categories is an array
    if (!Array.isArray(note.categories)) return false
    return note.categories.includes(currentFilter)
  })

  console.log("Filtered notes count:", filteredNotes.length)

  if (filteredNotes.length === 0) {
    container.innerHTML = ""
    if (emptyState instanceof Node) {
      container.appendChild(emptyState)
      emptyState.style.display = "block"
      
      // Update empty state message based on search
      const emptyMessage = emptyState.querySelector('p')
      if (emptyMessage) {
        if (searchQuery) {
          emptyMessage.textContent = t("noSearchResults")
        } else {
          emptyMessage.textContent = t("noNotes")
        }
      }
    } else {
      console.error("emptyState is not a DOM Node:", emptyState)
    }
    return
  }

  if (emptyState instanceof Node) {
    emptyState.style.display = "none"
  }

  container.innerHTML = filteredNotes
    .map((note) => {
      const date = formatDate(note.updatedAt || note.createdAt)
      const hasPassword = note.password
      const hasImages = note.images && note.images.length > 0
      const hasList = note.list && note.list.items && note.list.items.length > 0

      return `
            <div class="note-card fade-in" onclick="openNote('${note.id}')">
                <div class="note-header">
                    <h3 class="note-title">${note.title || "Untitled"}</h3>
                    <div class="note-actions-header">
                        ${hasPassword ? '<i class="fas fa-lock note-lock"></i>' : ""}
                        <button class="action-btn share-note-btn" onclick="event.stopPropagation(); shareNoteFromList('${note.id}')" title="Share">
                            <i class="fas fa-share"></i>
                        </button>
                    </div>
                </div>
                ${!hasPassword && note.content ? `<div class="note-content">${note.content}</div>` : ""}
                ${!hasPassword && hasList ? renderNoteList(note.list) : ""}
                ${!hasPassword && hasImages ? renderNoteImages(note.images) : ""}
                <div class="note-date">${t("updated")}: ${date}</div>
                <button class="note-delete" onclick="event.stopPropagation(); deleteNote('${note.id}')" title="Delete note">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `
    })
    .join("")
}

function renderNoteList(list) {
  if (!list || !list.items || list.items.length === 0) return ""

  const items = list.items
    .slice(0, 3)
    .map((item, index) => {
      let prefix = ""
      if (list.type === "numbered") {
        prefix = `${index + 1}.`
      } else if (list.type === "bulleted") {
        prefix = "•"
      } else if (list.type === "checklist") {
        prefix = item.checked ? "☑" : "☐"
      }

      return `
            <div class="note-list-item">
                <span>${prefix}</span>
                <span>${item.text}</span>
            </div>
        `
    })
    .join("")

  return `<div class="note-list">${items}</div>`
}

function renderNoteImages(images) {
  if (!images || images.length === 0)  return ""

  const imageElements = images
    .slice(0, 3)
    .map((image) => `<img src="${image}" alt="Note image" class="note-image">`)
    .join("")

  return `<div class="note-images">${imageElements}</div>`
}

// Share note from list
function shareNoteFromList(noteId) {
  // Check if user is logged in
  if (window.authFunctions && window.authFunctions.getCurrentUser() && !window.authFunctions.isUserGuest()) {
    // Redirect to shared page with share modal
    localStorage.setItem('shareNoteId', noteId)
    window.location.href = 'shared.html'
  } else {
    showToast('Please sign in to share notes')
  }
}

// Update the openNote function to include animation
function openNote(noteId) {
  const note = notes.find((n) => n.id === noteId)
  if (!note) return

  if (note.password) {
    showPasswordPrompt(note)
  } else {
    editNote(note)
  }
}

function editNote(note) {
  currentNote = note

  // Populate editor
  const titleInput = document.getElementById("titleInput")
  const contentTextarea = document.getElementById("contentTextarea")
  
  if (titleInput) titleInput.value = note.title || ""
  if (contentTextarea) contentTextarea.value = note.content || ""

  // Update date info
  const dateInfo = document.getElementById("dateInfo")
  if (dateInfo) {
    const createdDate = formatDate(note.createdAt)
    const updatedDate = note.updatedAt ? formatDate(note.updatedAt) : null
    dateInfo.textContent = updatedDate ? `${t("updated")}: ${updatedDate}` : `${t("created")}: ${createdDate}`
  }

  // Update categories
  renderCategoryChips(note.categories || ["all"])

  // Update list
  if (note.list && note.list.items && note.list.items.length > 0) {
    currentListType = note.list.type
    renderList(note.list)
    const listSection = document.getElementById("listSection")
    if (listSection) listSection.classList.remove("hidden")
  } else {
    const listSection = document.getElementById("listSection")
    if (listSection) listSection.classList.add("hidden")
    currentListType = ""
  }

  // Update images
  if (note.images && note.images.length > 0) {
    renderImages(note.images)
    const imagesSection = document.getElementById("imagesSection")
    if (imagesSection) imagesSection.classList.remove("hidden")
  } else {
    const imagesSection = document.getElementById("imagesSection")
    if (imagesSection) imagesSection.classList.add("hidden")
  }

  // Update password button
  const passwordIcon = document.getElementById("passwordIcon")
  if (passwordIcon) {
    passwordIcon.className = note.password ? "fas fa-lock" : "fas fa-unlock"
  }

  showPage("editorPage")
}

function createNewNote() {
  currentNote = {
    id: generateId(),
    title: "",
    content: "",
    categories: ["all"],
    images: [],
    list: { type: "", items: [] },
    password: "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  // Clear editor
  const titleInput = document.getElementById("titleInput")
  const contentTextarea = document.getElementById("contentTextarea")
  const dateInfo = document.getElementById("dateInfo")
  
  if (titleInput) titleInput.value = ""
  if (contentTextarea) contentTextarea.value = ""
  if (dateInfo) dateInfo.textContent = ""

  // Reset categories
  renderCategoryChips(["all"])

  // Hide sections
  const listSection = document.getElementById("listSection")
  const imagesSection = document.getElementById("imagesSection")
  if (listSection) listSection.classList.add("hidden")
  if (imagesSection) imagesSection.classList.add("hidden")

  // Reset password button
  const passwordIcon = document.getElementById("passwordIcon")
  if (passwordIcon) {
    passwordIcon.className = "fas fa-unlock"
  }

  currentListType = ""

  showPage("editorPage")
}

function saveCurrentNote() {
  if (!currentNote) return

  const titleInput = document.getElementById("titleInput")
  const contentTextarea = document.getElementById("contentTextarea")
  
  const title = titleInput ? titleInput.value.trim() : ""
  const content = contentTextarea ? contentTextarea.value.trim() : ""

  // Don't save empty notes
  if (
    !title &&
    !content &&
    (!currentNote.images || currentNote.images.length === 0) &&
    (!currentNote.list || !currentNote.list.items || currentNote.list.items.length === 0)
  ) {
    return
  }

  currentNote.title = title
  currentNote.content = content
  currentNote.updatedAt = Date.now()

  // Update or add note
  const existingIndex = notes.findIndex((n) => n.id === currentNote.id)
  if (existingIndex >= 0) {
    notes[existingIndex] = currentNote
  } else {
    notes.unshift(currentNote)
  }

  saveData()
  renderNotes()
}

// Update the deleteNote function to include animation
function deleteNote(noteId) {
  const note = notes.find((n) => n.id === noteId)
  if (!note) return

  if (note.password) {
    showDeletePasswordPrompt(note)
  } else {
    showDeleteConfirmation(noteId)
  }
}

function showDeleteConfirmation(noteId) {
  const modal = document.getElementById("deleteModal")
  const confirmBtn = document.getElementById("confirmDeleteBtn")

  if (!modal || !confirmBtn) return

  // Remove existing event listeners
  confirmBtn.replaceWith(confirmBtn.cloneNode(true))
  const newConfirmBtn = document.getElementById("confirmDeleteBtn")

  newConfirmBtn.addEventListener("click", () => {
    notes = notes.filter((n) => n.id !== noteId)
    saveData()
    renderNotes()
    closeModal("deleteModal")
    showToast(t("noteDeleted"))

    // If we're editing this note, go back to notes page
    if (currentNote && currentNote.id === noteId) {
      showPage("notesPage")
    }
  })

  modal.classList.add("open")
}

function showDeletePasswordPrompt(note) {
  const modal = document.getElementById("deleteModal")
  const passwordContainer = document.getElementById("deletePasswordContainer")
  const passwordInput = document.getElementById("deletePasswordInput")
  const confirmBtn = document.getElementById("confirmDeleteBtn")

  if (!modal || !passwordContainer || !passwordInput || !confirmBtn) return

  passwordContainer.classList.remove("hidden")
  passwordInput.value = ""

  // Remove existing event listeners
  confirmBtn.replaceWith(confirmBtn.cloneNode(true))
  const newConfirmBtn = document.getElementById("confirmDeleteBtn")

  newConfirmBtn.addEventListener("click", async () => {
    const enteredPassword = passwordInput.value
    const hashedPassword = await hashPassword(enteredPassword)

    if (hashedPassword === note.password) {
      notes = notes.filter((n) => n.id !== note.id)
      saveData()
      renderNotes()
      closeModal("deleteModal")
      showToast(t("noteDeleted"))

      // If we're editing this note, go back to notes page
      if (currentNote && currentNote.id === note.id) {
        showPage("notesPage")
      }
    } else {
      showToast(t("wrongPassword"))
    }
  })

  modal.classList.add("open")
}

function showPasswordPrompt(note) {
  const modal = document.getElementById("passwordModal")
  const passwordInput = document.getElementById("passwordInput")
  const saveBtn = document.getElementById("savePasswordBtn")
  const removeBtn = document.getElementById("removePasswordBtn")

  if (!modal || !passwordInput || !saveBtn || !removeBtn) return

  // Change modal title
  modal.querySelector(".modal-header h3").textContent = "ENTER PASSWORD"
  passwordInput.value = ""
  passwordInput.type = "password"

  // Hide remove button
  removeBtn.style.display = "none"

  // Remove existing event listeners
  saveBtn.replaceWith(saveBtn.cloneNode(true))
  removeBtn.replaceWith(removeBtn.cloneNode(true))

  const newSaveBtn = document.getElementById("savePasswordBtn")
  const newRemoveBtn = document.getElementById("removePasswordBtn")

  newSaveBtn.addEventListener("click", async () => {
    const enteredPassword = passwordInput.value
    const hashedPassword = await hashPassword(enteredPassword)

    if (hashedPassword === note.password) {
      closeModal("passwordModal")
      editNote(note)
    } else {
      showToast(t("wrongPassword"))
    }
  })

  modal.classList.add("open")
  passwordInput.focus()
}

// Categories management
function renderCategories() {
  const filterChips = document.getElementById("filterChips")
  const categoriesList = document.getElementById("categoriesList")

  // Render filter chips
  if (filterChips) {
    filterChips.innerHTML = categories
      .map(
        (category) =>
          `<button class="chip ${currentFilter === category.id ? "active" : ""}" 
                   data-filter="${category.id}" onclick="setFilter('${category.id}')">
              ${category.name}
           </button>`,
      )
      .join("")
  }

  // Render categories list
  if (categoriesList) {
    const userCategories = categories.filter((c) => c.id !== "all")

    if (userCategories.length === 0) {
      categoriesList.innerHTML = `
              <div class="empty-state">
                  <i class="fas fa-folder"></i>
                  <p>${t("noCategories")}</p>
              </div>
          `
    } else {
      categoriesList.innerHTML = userCategories
        .map(
          (category) =>
            `<div class="category-item">
                  <span class="category-name">${category.name}</span>
                  <button class="category-delete" onclick="deleteCategoryItem('${category.id}')" title="Delete category">
                      <i class="fas fa-times"></i>
                  </button>
               </div>`,
        )
        .join("")
    }
  }
}

function renderCategoryChips(selectedCategories = []) {
  const container = document.getElementById("categoryChips")
  if (!container) return

  const userCategories = categories.filter((c) => c.id !== "all")
  const selectedUserCategories = selectedCategories.filter((id) => id !== "all")

  const chips = selectedUserCategories
    .map((categoryId) => {
      const category = categories.find((c) => c.id === categoryId)
      if (!category) return ""

      return `
            <button class="chip active" onclick="removeCategoryFromNote('${categoryId}')">
                ${category.name}
                <i class="fas fa-times" style="margin-left: 8px; font-size: 10px;"></i>
            </button>
        `
    })
    .join("")

  container.innerHTML =
    chips +
    `
        <button class="chip outline" id="addCategoryBtn" onclick="showCategoryModal()">
            <i class="fas fa-plus"></i>
            ADD
        </button>
    `
}

function setFilter(filterId) {
  currentFilter = filterId
  console.log("setFilter called with filterId:", filterId)
  renderCategories()
  renderNotes()
  // Also update the active state of category chips in the editor if open
  if (currentNote) {
    renderCategoryChips(currentNote.categories)
  }
  // Reset currentNote to null when filter changes to avoid stale note display
  currentNote = null
}

function addCategory() {
  const input = document.getElementById("categoryInput")
  if (!input) return

  const name = input.value.trim()

  if (!name) return

  // Check if category already exists
  if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
    showToast("Category already exists")
    return
  }

  const newCategory = {
    id: generateId(),
    name: name,
  }

  categories.push(newCategory)
  saveData()
  renderCategories()
  input.value = ""
  showToast(t("categoryAdded"))

  // If current filter is 'all', refresh notes to show new category notes
  if (currentFilter === "all") {
    renderNotes()
  }
}

function deleteCategoryItem(categoryId) {
  // Remove category from all notes
  notes.forEach((note) => {
    note.categories = note.categories.filter((id) => id !== categoryId)
    if (note.categories.length === 0) {
      note.categories = ["all"]
    }
  })

  // Remove category
  categories = categories.filter((c) => c.id !== categoryId)

  // Reset filter if deleted category was selected
  if (currentFilter === categoryId) {
    currentFilter = "all"
  }

  saveData()
  renderCategories()
  renderNotes()
  showToast(t("categoryDeleted"))
}

function showCategoryModal() {
  const modal = document.getElementById("categoryModal")
  const modalList = document.getElementById("modalCategoriesList")

  if (!modal || !modalList) return

  const userCategories = categories.filter((c) => c.id !== "all")
  const selectedCategories = currentNote ? currentNote.categories : []

  modalList.innerHTML = userCategories
    .map(
      (category) =>
        `<div class="modal-category-item" onclick="toggleCategorySelection('${category.id}')">
            <span>${category.name}</span>
            <input type="checkbox" class="category-checkbox" 
                   ${selectedCategories.includes(category.id) ? "checked" : ""} 
                   onchange="toggleCategorySelection('${category.id}')">
         </div>`,
    )
    .join("")

  modal.classList.add("open")
}

function toggleCategorySelection(categoryId) {
  if (!currentNote) return

  if (currentNote.categories.includes(categoryId)) {
    currentNote.categories = currentNote.categories.filter((id) => id !== categoryId)
  } else {
    currentNote.categories.push(categoryId)
  }

  // Ensure at least 'all' category is selected
  if (currentNote.categories.length === 0) {
    currentNote.categories = ["all"]
  }

  renderCategoryChips(currentNote.categories)
  saveCurrentNote()
}

function removeCategoryFromNote(categoryId) {
  if (!currentNote) return

  currentNote.categories = currentNote.categories.filter((id) => id !== categoryId)

  // Ensure at least 'all' category is selected
  if (currentNote.categories.length === 0) {
    currentNote.categories = ["all"]
  }

  renderCategoryChips(currentNote.categories)
  saveCurrentNote()
}

// List management
function renderList(list) {
  const container = document.getElementById("listItems")
  const addBtn = document.getElementById("addListItemBtn")

  if (!container) return

  if (!list || !list.items) {
    container.innerHTML = ""
    return
  }

  container.innerHTML = list.items
    .map((item, index) => {
      let prefix = ""
      const inputType = "text"
      const extraAttributes = ""

      if (list.type === "numbered") {
        prefix = `<span style="min-width: 20px;">${index + 1}.</span>`
      } else if (list.type === "bulleted") {
        prefix = `<span style="min-width: 20px;">•</span>`
      } else if (list.type === "checklist") {
        prefix = `<input type="checkbox" class="list-item-checkbox" 
                            ${item.checked ? "checked" : ""} 
                            onchange="toggleListItem('${item.id}')">`
      }

      return `
            <div class="list-item">
                <i class="fas fa-grip-vertical list-item-drag"></i>
                ${prefix}
                <input type="text" class="list-item-input" 
                       value="${item.text}" 
                       onchange="updateListItem('${item.id}', this.value)"
                       placeholder="...">
                <button class="list-item-delete" onclick="deleteListItem('${item.id}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `
    })
    .join("")

  if (addBtn) {
    addBtn.textContent = t("addItem")
  }
}

// Update the addListItem function to prevent automatic scrolling
function addListItem() {
  if (!currentNote || !currentListType) return

  const newItem = {
    id: generateId(),
    text: "",
    checked: false,
  }

  if (!currentNote.list) {
    currentNote.list = { type: currentListType, items: [] }
  }

  currentNote.list.items.push(newItem)
  renderList(currentNote.list)
  saveCurrentNote()

  // Focus on the new input with animation but prevent scrolling
  setTimeout(() => {
    const inputs = document.querySelectorAll(".list-item-input")
    const lastInput = inputs[inputs.length - 1]
    if (lastInput) {
      // Save current scroll position
      const scrollPos = window.scrollY

      // Focus and animate
      lastInput.focus()
      lastInput.parentElement.style.animation = "addItem 0.3s ease forwards"

      // Restore scroll position to prevent automatic scrolling
      window.scrollTo(0, scrollPos)
    }
  }, 100)
}

function updateListItem(itemId, text) {
  if (!currentNote || !currentNote.list) return

  const item = currentNote.list.items.find((i) => i.id === itemId)
  if (item) {
    item.text = text
    saveCurrentNote()
  }
}

function toggleListItem(itemId) {
  if (!currentNote || !currentNote.list) return

  const item = currentNote.list.items.find((i) => i.id === itemId)
  if (item) {
    item.checked = !item.checked
    saveCurrentNote()
  }
}

// Update the deleteListItem function to include animation
function deleteListItem(itemId) {
  if (!currentNote || !currentNote.list) return

  // Find the DOM element for animation
  const listItemElement = document.querySelector(`.list-item input[onchange*="${itemId}"]`)?.parentElement

  if (listItemElement) {
    // Apply remove animation
    listItemElement.style.animation = "removeItem 0.2s ease forwards"

    // Wait for animation to complete before removing from DOM
    setTimeout(() => {
      currentNote.list.items = currentNote.list.items.filter((i) => i.id !== itemId)

      if (currentNote.list.items.length === 0) {
        currentNote.list = { type: "", items: [] }
        const listSection = document.getElementById("listSection")
        if (listSection) listSection.classList.add("hidden")
        currentListType = ""
      }

      renderList(currentNote.list)
      saveCurrentNote()
    }, 200)
  } else {
    // Fallback if element not found
    currentNote.list.items = currentNote.list.items.filter((i) => i.id !== itemId)

    if (currentNote.list.items.length === 0) {
      currentNote.list = { type: "", items: [] }
      const listSection = document.getElementById("listSection")
      if (listSection) listSection.classList.add("hidden")
      currentListType = ""
    }

    renderList(currentNote.list)
    saveCurrentNote()
  }
}

function showListTypeModal() {
  const modal = document.getElementById("listTypeModal")
  if (modal) {
    modal.classList.add("open")
  }
}

function selectListType(type) {
  currentListType = type

  if (!currentNote.list) {
    currentNote.list = { type: type, items: [] }
  } else {
    currentNote.list.type = type
  }

  // Add first item if list is empty
  if (currentNote.list.items.length === 0) {
    addListItem()
  }

  const listSection = document.getElementById("listSection")
  if (listSection) listSection.classList.remove("hidden")
  renderList(currentNote.list)
  closeModal("listTypeModal")
  saveCurrentNote()
}

// Image management
function renderImages(images) {
  const container = document.getElementById("imageGrid")
  if (!container) return

  container.innerHTML = images
    .map(
      (image, index) =>
        `<div class="image-item">
            <img src="${image}" alt="Note image" onclick="viewImage('${image}')">
            <button class="image-delete" onclick="deleteImage(${index})">
                <i class="fas fa-times"></i>
            </button>
         </div>`,
    )
    .join("")
}

function handleImageUpload(files) {
  if (!currentNote) return

  Array.from(files).forEach((file) => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (!currentNote.images) {
          currentNote.images = []
        }
        currentNote.images.push(e.target.result)
        renderImages(currentNote.images)
        const imagesSection = document.getElementById("imagesSection")
        if (imagesSection) imagesSection.classList.remove("hidden")
        saveCurrentNote()
      }
      reader.readAsDataURL(file)
    }
  })
}

function deleteImage(index) {
  if (!currentNote || !currentNote.images) return

  currentNote.images.splice(index, 1)

  if (currentNote.images.length === 0) {
    const imagesSection = document.getElementById("imagesSection")
    if (imagesSection) imagesSection.classList.add("hidden")
  }

  renderImages(currentNote.images)
  saveCurrentNote()
}

function viewImage(imageSrc) {
  // Create a simple image viewer
  const viewer = document.createElement("div")
  viewer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 3000;
        cursor: pointer;
    `

  const img = document.createElement("img")
  img.src = imageSrc
  img.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        object-fit: contain;
    `

  viewer.appendChild(img)
  viewer.onclick = () => document.body.removeChild(viewer)
  document.body.appendChild(viewer)
}

// Password management
function showPasswordModal() {
  const modal = document.getElementById("passwordModal")
  const passwordInput = document.getElementById("passwordInput")
  const saveBtn = document.getElementById("savePasswordBtn")
  const removeBtn = document.getElementById("removePasswordBtn")

  if (!modal || !passwordInput || !saveBtn || !removeBtn) return

  // Reset modal
  modal.querySelector(".modal-header h3").textContent =
    currentNote && currentNote.password ? "UPDATE PASSWORD" : t("addPassword")
  passwordInput.value = ""
  passwordInput.type = "password"

  // Show/hide remove button
  removeBtn.style.display = currentNote && currentNote.password ? "inline-block" : "none"
  saveBtn.textContent = t("save")

  // Remove existing event listeners
  saveBtn.replaceWith(saveBtn.cloneNode(true))
  removeBtn.replaceWith(removeBtn.cloneNode(true))

  const newSaveBtn = document.getElementById("savePasswordBtn")
  const newRemoveBtn = document.getElementById("removePasswordBtn")

  newSaveBtn.addEventListener("click", async () => {
    const password = passwordInput.value

    if (password.length < 4) {
      showToast("Password must be at least 4 characters")
      return
    }

    const hashedPassword = await hashPassword(password)
    currentNote.password = hashedPassword

    // Update password icon
    const passwordIcon = document.getElementById("passwordIcon")
    if (passwordIcon) {
      passwordIcon.className = "fas fa-lock"
    }

    closeModal("passwordModal")
    saveCurrentNote()
    showToast(t("passwordSet"))
  })

  newRemoveBtn.addEventListener("click", () => {
    currentNote.password = ""

    // Update password icon
    const passwordIcon = document.getElementById("passwordIcon")
    if (passwordIcon) {
      passwordIcon.className = "fas fa-unlock"
    }

    closeModal("passwordModal")
    saveCurrentNote()
    showToast(t("passwordRemoved"))
  })

  modal.classList.add("open")
  passwordInput.focus()
}

// Modal management
function closeModal(modalId) {
  const modal = document.getElementById(modalId)
  if (modal) {
    modal.classList.remove("open")
  }
}

// Auto-save functionality
function setupAutoSave() {
  const titleInput = document.getElementById("titleInput")
  const contentTextarea = document.getElementById("contentTextarea")

  if (!titleInput || !contentTextarea) return

  function triggerAutoSave() {
    clearTimeout(autoSaveTimeout)
    autoSaveTimeout = setTimeout(() => {
      saveCurrentNote()
    }, 500)
  }

  titleInput.addEventListener("input", triggerAutoSave)
  contentTextarea.addEventListener("input", triggerAutoSave)
}

// User management functions
// Update the showNameModal function
function showNameModal() {
  const modal = document.getElementById("nameModal")
  const nameInput = document.getElementById("newName")

  if (!modal || !nameInput) return

  if (window.authFunctions && window.authFunctions.getCurrentUser()) {
    const user = window.authFunctions.getCurrentUser()
    nameInput.value = user.displayName || user.email.split("@")[0] || ""
  }

  modal.classList.add("open")
  nameInput.focus()
}

// Update the logoutUser function
function logoutUser() {
  if (window.authFunctions) {
    window.authFunctions.signOutUser()
  }
}

// Update settings page based on auth state
function updateSettingsPage() {
  const userSettings = document.getElementById("userSettings")

  if (!userSettings) return

  if (window.authFunctions && window.authFunctions.getCurrentUser() && !window.authFunctions.isUserGuest()) {
    userSettings.style.display = "block"
  } else {
    userSettings.style.display = "none"
  }
}

// Call this when showing settings page
function showSettingsPage() {
  showPage("settingsPage")
  updateSettingsPage()
}

/* Event listeners */
function setupEventListeners() {
  // Back button behavior
  const backBtn = document.getElementById("backBtn")
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      if (currentPage === "editor") {
        showPage("notesPage")
      } else {
        showPage("notesPage")
      }
    })
  }

  // Settings button behavior
  const settingsBtn = document.getElementById("settingsBtn")
  if (settingsBtn) {
    settingsBtn.addEventListener("click", () => {
      showSettingsPage()
    })
  }

  // Category button behavior
  const categoryBtn = document.getElementById("categoryBtn")
  if (categoryBtn) {
    categoryBtn.addEventListener("click", () => {
      showPage("categoriesPage")
    })
  }

  // Navigation items
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      const href = item.getAttribute("href")
      if (href && href !== "#" && !href.startsWith("#")) {
        e.preventDefault()
        const sidebar = document.getElementById("sidebar")
        const sidebarOverlay = document.getElementById("sidebarOverlay")
        if (sidebar) sidebar.classList.remove("open")
        if (sidebarOverlay) sidebarOverlay.classList.remove("open")
        setTimeout(() => {
          window.location.href = href
        }, 300)
        return
      }
      e.preventDefault()
      const page = item.getAttribute("data-page")
      showPage(page + "Page")
      const sidebar = document.getElementById("sidebar")
      const sidebarOverlay = document.getElementById("sidebarOverlay")
      if (sidebar) sidebar.classList.remove("open")
      if (sidebarOverlay) sidebarOverlay.classList.remove("open")
      e.stopPropagation()
    })
  })

  // Add note button
  const addNoteBtn = document.getElementById("addNoteBtn")
  if (addNoteBtn) {
    addNoteBtn.addEventListener("click", createNewNote)
  }

  // Categories
  const addCategoryFormBtn = document.getElementById("addCategoryFormBtn")
  if (addCategoryFormBtn) {
    addCategoryFormBtn.addEventListener("click", addCategory)
  }

  const categoryInput = document.getElementById("categoryInput")
  if (categoryInput) {
    categoryInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        addCategory()
      }
    })
  }

  // Editor toolbar
  const imageBtn = document.getElementById("imageBtn")
  if (imageBtn) {
    imageBtn.addEventListener("click", () => {
      const imageInput = document.getElementById("imageInput")
      if (imageInput) imageInput.click()
    })
  }

  const imageInput = document.getElementById("imageInput")
  if (imageInput) {
    imageInput.addEventListener("change", (e) => {
      handleImageUpload(e.target.files)
    })
  }

  const listBtn = document.getElementById("listBtn")
  if (listBtn) {
    listBtn.addEventListener("click", showListTypeModal)
  }

  const passwordBtn = document.getElementById("passwordBtn")
  if (passwordBtn) {
    passwordBtn.addEventListener("click", showPasswordModal)
  }

  const addListItemBtn = document.getElementById("addListItemBtn")
  if (addListItemBtn) {
    addListItemBtn.addEventListener("click", addListItem)
  }

  // List type selection
  document.querySelectorAll(".list-type-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const type = btn.getAttribute("data-type")
      selectListType(type)
    })
  })

  // Settings
  const themeSelect = document.getElementById("themeSelect")
  if (themeSelect) {
    themeSelect.addEventListener("change", (e) => {
      applyTheme(e.target.value)
    })
  }

  const languageSelect = document.getElementById("languageSelect")
  if (languageSelect) {
    languageSelect.addEventListener("change", (e) => {
      currentLanguage = e.target.value
      updateLanguage()
      renderCategories()
      renderNotes()
    })
  }

  // Name change modal
  const nameModalClose = document.getElementById("nameModalClose")
  if (nameModalClose) {
    nameModalClose.addEventListener("click", () => {
      closeModal("nameModal")
    })
  }

  const cancelNameBtn = document.getElementById("cancelNameBtn")
  if (cancelNameBtn) {
    cancelNameBtn.addEventListener("click", () => {
      closeModal("nameModal")
    })
  }

  const saveNameBtn = document.getElementById("saveNameBtn")
  if (saveNameBtn) {
    saveNameBtn.addEventListener("click", async () => {
      const newNameInput = document.getElementById("newName")
      if (!newNameInput) return

      const newName = newNameInput.value.trim()
      if (!newName) {
        showToast("Please enter a name")
        return
      }

      if (window.authFunctions) {
        await window.authFunctions.updateUserName(newName)
        closeModal("nameModal")
      }
    })
  }

  // Password toggle
  const passwordToggle = document.getElementById("passwordToggle")
  if (passwordToggle) {
    passwordToggle.addEventListener("click", () => {
      const input = document.getElementById("passwordInput")
      const icon = passwordToggle.querySelector("i")

      if (!input || !icon) return

      if (input.type === "password") {
        input.type = "text"
        icon.className = "fas fa-eye-slash"
      } else {
        input.type = "password"
        icon.className = "fas fa-eye"
      }
    })
  }

  // Modal close buttons
  document.querySelectorAll(".modal-close").forEach((btn) => {
    btn.addEventListener("click", () => {
      const modal = btn.closest(".modal")
      if (modal) {
        modal.classList.remove("open")
      }
    })
  })

  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("open")
      }
    })
  })

  // Cancel buttons
  const cancelDeleteBtn = document.getElementById("cancelDeleteBtn")
  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener("click", () => {
      closeModal("deleteModal")
    })
  }

  const categoryModalClose = document.getElementById("categoryModalClose")
  if (categoryModalClose) {
    categoryModalClose.addEventListener("click", () => {
      closeModal("categoryModal")
    })
  }

  const listTypeModalClose = document.getElementById("listTypeModalClose")
  if (listTypeModalClose) {
    listTypeModalClose.addEventListener("click", () => {
      closeModal("listTypeModal")
    })
  }

  const passwordModalClose = document.getElementById("passwordModalClose")
  if (passwordModalClose) {
    passwordModalClose.addEventListener("click", () => {
      closeModal("passwordModal")
    })
  }

  const deleteModalClose = document.getElementById("deleteModalClose")
  if (deleteModalClose) {
    deleteModalClose.addEventListener("click", () => {
      closeModal("deleteModal")
    })
  }

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    // Ctrl/Cmd + N for new note
    if ((e.ctrlKey || e.metaKey) && e.key === "n") {
      e.preventDefault()
      createNewNote()
    }

    // Ctrl/Cmd + F for search
    if ((e.ctrlKey || e.metaKey) && e.key === "f") {
      e.preventDefault()
      if (currentPage === "notes") {
        openSearch()
      }
    }

    // Escape to close modals or search
    if (e.key === "Escape") {
      if (isSearchActive) {
        closeSearch()
      } else {
        document.querySelectorAll(".modal.open").forEach((modal) => {
          modal.classList.remove("open")
        })
      }
    }
  })

  // Setup auto-save
  setupAutoSave()

  // Initialize search
  initSearch()
}

// Update sign-in button based on auth state
// Update the updateSignInButton function
function updateSignInButton() {
  const signInBtn = document.getElementById("signInBtn")
  if (!signInBtn) return

  if (window.authFunctions && (window.authFunctions.getCurrentUser() || window.authFunctions.isUserGuest())) {
    signInBtn.style.display = "none"
  } else {
    signInBtn.style.display = "block"
  }
}

// Initialize app
// Update the init function to wait for Firebase
function init() {
  initTheme()
  initLanguage()
  renderCategories()
  renderNotes()
  setupEventListeners()

  // Show notes page by default
  showPage("notesPage")

  // Listen for system theme changes
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    const currentTheme = localStorage.getItem("theme") || "system"
    if (currentTheme === "system") {
      applyTheme("system")
    }
  })

  // Initialize auth
  if (window.authFunctions) {
    window.authFunctions.initAuth()
    // Update sign-in button after auth initialization
    setTimeout(updateSignInButton, 1000)
  }

  // Load search engine
  if (window.NotesSearch) {
    notesSearch = new window.NotesSearch()
    notesSearch.buildSearchIndex(notes)
  }
}

// Start the app when DOM is loaded
document.addEventListener("DOMContentLoaded", init)

// Service Worker for PWA (optional)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("SW registered: ", registration)
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError)
      })
  })
}

// Make functions globally available
window.editNote = editNote
window.openNote = openNote
window.deleteNote = deleteNote
window.setFilter = setFilter
window.addCategory = addCategory
window.deleteCategoryItem = deleteCategoryItem
window.showCategoryModal = showCategoryModal
window.toggleCategorySelection = toggleCategorySelection
window.removeCategoryFromNote = removeCategoryFromNote
window.addListItem = addListItem
window.updateListItem = updateListItem
window.toggleListItem = toggleListItem
window.deleteListItem = deleteListItem
window.selectListType = selectListType
window.deleteImage = deleteImage
window.viewImage = viewImage
window.showPasswordModal = showPasswordModal
window.closeModal = closeModal
window.showNameModal = showNameModal
window.logoutUser = logoutUser
window.shareNoteFromList = shareNoteFromList
window.selectSuggestion = selectSuggestion