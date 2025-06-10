// Notes App JavaScript
let notes = JSON.parse(localStorage.getItem("notes")) || []
let categories = JSON.parse(localStorage.getItem("categories")) || [{ id: "all", name: "All" }]
let currentNote = null
let currentPage = "notes"
let currentFilter = "all"
let searchQuery = ""
let notesSearch = null

// Initialize search functionality
document.addEventListener("DOMContentLoaded", () => {
  if (window.NotesSearch) {
    notesSearch = new window.NotesSearch()
  }
})

// Translations
const translations = {
  en: {
    notes: "NOTES",
    categories: "CATEGORIES",
    settings: "SETTINGS",
    addNote: "ADD NOTE",
    newNote: "New Note",
    untitled: "Untitled",
    noNotes: "You don't have any notes yet",
    noCategories: "You don't have any categories yet",
    noteDeleted: "Note deleted",
    noteSaved: "Note saved",
    categoryAdded: "Category added",
    categoryDeleted: "Category deleted",
    passwordSet: "Password set",
    passwordRemoved: "Password removed",
    incorrectPassword: "Incorrect password",
    imageAdded: "Image added",
    listAdded: "List added",
    searchNotes: "Search notes...",
    today: "Today",
    yesterday: "Yesterday",
    thisWeek: "This week",
    thisMonth: "This month",
    older: "Older",
  },
  es: {
    notes: "NOTAS",
    categories: "CATEGORÍAS",
    settings: "CONFIGURACIÓN",
    addNote: "AÑADIR NOTA",
    newNote: "Nueva Nota",
    untitled: "Sin título",
    noNotes: "Aún no tienes notas",
    noCategories: "Aún no tienes categorías",
    noteDeleted: "Nota eliminada",
    noteSaved: "Nota guardada",
    categoryAdded: "Categoría añadida",
    categoryDeleted: "Categoría eliminada",
    passwordSet: "Contraseña establecida",
    passwordRemoved: "Contraseña eliminada",
    incorrectPassword: "Contraseña incorrecta",
    imageAdded: "Imagen añadida",
    listAdded: "Lista añadida",
    searchNotes: "Buscar notas...",
    today: "Hoy",
    yesterday: "Ayer",
    thisWeek: "Esta semana",
    thisMonth: "Este mes",
    older: "Más antiguo",
  },
  fr: {
    notes: "NOTES",
    categories: "CATÉGORIES",
    settings: "PARAMÈTRES",
    addNote: "AJOUTER NOTE",
    newNote: "Nouvelle Note",
    untitled: "Sans titre",
    noNotes: "Vous n'avez pas encore de notes",
    noCategories: "Vous n'avez pas encore de catégories",
    noteDeleted: "Note supprimée",
    noteSaved: "Note sauvegardée",
    categoryAdded: "Catégorie ajoutée",
    categoryDeleted: "Catégorie supprimée",
    passwordSet: "Mot de passe défini",
    passwordRemoved: "Mot de passe supprimé",
    incorrectPassword: "Mot de passe incorrect",
    imageAdded: "Image ajoutée",
    listAdded: "Liste ajoutée",
    searchNotes: "Rechercher des notes...",
    today: "Aujourd'hui",
    yesterday: "Hier",
    thisWeek: "Cette semaine",
    thisMonth: "Ce mois",
    older: "Plus ancien",
  },
  de: {
    notes: "NOTIZEN",
    categories: "KATEGORIEN",
    settings: "EINSTELLUNGEN",
    addNote: "NOTIZ HINZUFÜGEN",
    newNote: "Neue Notiz",
    untitled: "Unbenannt",
    noNotes: "Sie haben noch keine Notizen",
    noCategories: "Sie haben noch keine Kategorien",
    noteDeleted: "Notiz gelöscht",
    noteSaved: "Notiz gespeichert",
    categoryAdded: "Kategorie hinzugefügt",
    categoryDeleted: "Kategorie gelöscht",
    passwordSet: "Passwort gesetzt",
    passwordRemoved: "Passwort entfernt",
    incorrectPassword: "Falsches Passwort",
    imageAdded: "Bild hinzugefügt",
    listAdded: "Liste hinzugefügt",
    searchNotes: "Notizen suchen...",
    today: "Heute",
    yesterday: "Gestern",
    thisWeek: "Diese Woche",
    thisMonth: "Diesen Monat",
    older: "Älter",
  },
}

let currentLanguage = localStorage.getItem("language") || "en"

function t(key) {
  return translations[currentLanguage]?.[key] || translations.en[key] || key
}

// Theme management
function initTheme() {
  const savedTheme = localStorage.getItem("theme") || "system"
  applyTheme(savedTheme)
  
  const themeSelect = document.getElementById("themeSelect")
  if (themeSelect) {
    themeSelect.value = savedTheme
    themeSelect.addEventListener("change", (e) => {
      const theme = e.target.value
      localStorage.setItem("theme", theme)
      applyTheme(theme)
    })
  }
}

function applyTheme(theme) {
  const root = document.documentElement
  
  if (theme === "system") {
    root.removeAttribute("data-theme")
  } else {
    root.setAttribute("data-theme", theme)
  }
}

// Language management
function initLanguage() {
  const languageSelect = document.getElementById("languageSelect")
  if (languageSelect) {
    languageSelect.value = currentLanguage
    languageSelect.addEventListener("change", (e) => {
      currentLanguage = e.target.value
      localStorage.setItem("language", currentLanguage)
      updateLanguage()
    })
  }
  updateLanguage()
}

function updateLanguage() {
  // Update static text elements
  const elements = {
    headerTitle: "notes",
    addNoteBtn: "addNote",
  }
  
  Object.entries(elements).forEach(([id, key]) => {
    const element = document.getElementById(id)
    if (element && element.tagName === "BUTTON") {
      const span = element.querySelector("span")
      if (span) {
        span.textContent = t(key)
      }
    } else if (element) {
      element.textContent = t(key)
    }
  })
  
  // Update placeholders
  const searchInput = document.getElementById("searchInput")
  if (searchInput) {
    searchInput.placeholder = t("searchNotes")
  }
  
  // Re-render dynamic content
  renderNotes()
  renderCategories()
}

// Utility functions
function generateId() {
  return Math.random().toString(36).substr(2, 9)
}

function formatDate(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) {
    return t("today")
  } else if (diffDays === 2) {
    return t("yesterday")
  } else if (diffDays <= 7) {
    return t("thisWeek")
  } else if (diffDays <= 30) {
    return t("thisMonth")
  } else {
    return t("older")
  }
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

function saveData() {
  localStorage.setItem("notes", JSON.stringify(notes))
  localStorage.setItem("categories", JSON.stringify(categories))
  
  // Save to Firebase if user is logged in
  if (window.authFunctions && window.authFunctions.saveUserData) {
    window.authFunctions.saveUserData()
  }
}

// Search functionality
function initSearch() {
  const searchBtn = document.getElementById("searchBtn")
  const searchContainer = document.getElementById("searchContainer")
  const searchInput = document.getElementById("searchInput")
  const searchClear = document.getElementById("searchClear")

  if (!searchBtn || !searchContainer || !searchInput || !searchClear) return

  searchBtn.addEventListener("click", () => {
    searchContainer.classList.toggle("active")
    if (searchContainer.classList.contains("active")) {
      searchInput.focus()
    } else {
      searchInput.value = ""
      searchQuery = ""
      renderNotes()
    }
  })

  searchClear.addEventListener("click", () => {
    searchInput.value = ""
    searchQuery = ""
    renderNotes()
  })

  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value
    if (notesSearch) {
      notesSearch.buildSearchIndex(notes)
    }
    renderNotes()
  })

  // Close search on escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && searchContainer.classList.contains("active")) {
      searchContainer.classList.remove("active")
      searchInput.value = ""
      searchQuery = ""
      renderNotes()
    }
  })
}

// Navigation
function showPage(pageId) {
  // Hide all pages
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.remove("active")
  })

  // Show selected page
  const targetPage = document.getElementById(pageId)
  if (targetPage) {
    targetPage.classList.add("active")
  }

  currentPage = pageId.replace("Page", "")

  // Update navigation
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.remove("active")
  })

  const activeNavItem = document.querySelector(`[data-page="${currentPage}"]`)
  if (activeNavItem) {
    activeNavItem.classList.add("active")
  }

  // Update header
  updateHeader()
}

function updateHeader() {
  const backBtn = document.getElementById("backBtn")
  const headerTitle = document.getElementById("headerTitle")

  if (currentPage === "notes") {
    backBtn.classList.add("hidden")
    if (headerTitle) {
      headerTitle.textContent = t("notes")
    }
  } else {
    backBtn.classList.remove("hidden")
    if (headerTitle) {
      headerTitle.textContent = t(currentPage)
    }
  }
}

// Notes management
function renderNotes() {
  const container = document.getElementById("notesContainer")
  const emptyState = document.getElementById("emptyState")

  if (!container) return

  let filteredNotes = notes

  // Apply category filter
  if (currentFilter !== "all") {
    filteredNotes = notes.filter((note) => 
      note.categories && note.categories.includes(currentFilter)
    )
  }

  // Apply search filter
  if (searchQuery && notesSearch) {
    const searchResults = notesSearch.search(searchQuery, {
      notes: filteredNotes,
      categories: categories,
    })
    filteredNotes = searchResults
  }

  if (filteredNotes.length === 0) {
    container.innerHTML = `
      <div class="empty-state" id="emptyState">
        <i class="fas fa-file-text"></i>
        <p>${searchQuery ? "No notes found" : t("noNotes")}</p>
      </div>
    `
    return
  }

  // Sort notes by updated date
  filteredNotes.sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt))

  container.innerHTML = filteredNotes
    .map((note) => {
      const hasPassword = note.password && note.password.length > 0
      const hasImages = note.images && note.images.length > 0
      const hasList = note.list && note.list.items && note.list.items.length > 0

      return `
        <div class="note-card" onclick="editNote('${note.id}')">
          <button class="note-delete" onclick="event.stopPropagation(); deleteNote('${note.id}')" title="Delete note">
            <i class="fas fa-times"></i>
          </button>
          <h3 class="note-title">
            ${note.title || t("untitled")}
            ${hasPassword ? '<i class="fas fa-lock note-lock"></i>' : ""}
          </h3>
          <p class="note-content">${note.content ? note.content.substring(0, 150) + "..." : ""}</p>
          <div class="note-date">${formatDate(note.updatedAt || note.createdAt)}</div>
          ${hasImages ? `
            <div class="note-images">
              ${note.images.slice(0, 3).map(img => `<img src="${img}" class="note-image" alt="Note image">`).join("")}
            </div>
          ` : ""}
          ${hasList ? `
            <div class="note-list">
              ${note.list.items.slice(0, 3).map(item => `
                <div class="note-list-item">
                  ${note.list.type === "checklist" ? `<i class="fas fa-${item.checked ? "check-square" : "square"}"></i>` : 
                    note.list.type === "numbered" ? `<span>${item.number}.</span>` : `<i class="fas fa-circle"></i>`}
                  <span>${item.text}</span>
                </div>
              `).join("")}
              ${note.list.items.length > 3 ? `<div class="note-list-item">... and ${note.list.items.length - 3} more</div>` : ""}
            </div>
          ` : ""}
          <div class="note-actions" style="opacity: 0; transition: opacity 0.2s;">
            <button class="action-btn" onclick="event.stopPropagation(); shareNote('${note.id}')" title="Share">
              <i class="fas fa-share"></i>
            </button>
          </div>
        </div>
      `
    })
    .join("")
}

function renderCategories() {
  const filterChips = document.getElementById("filterChips")
  if (!filterChips) return

  filterChips.innerHTML = categories
    .map((category) => {
      const isActive = currentFilter === category.id
      return `
        <button class="chip ${isActive ? "active" : ""}" data-filter="${category.id}" onclick="setFilter('${category.id}')">
          ${category.name}
        </button>
      `
    })
    .join("")
}

function setFilter(filterId) {
  currentFilter = filterId
  renderCategories()
  renderNotes()
}

function addNote() {
  const newNote = {
    id: generateId(),
    title: "",
    content: "",
    categories: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    password: "",
    images: [],
    list: null,
  }

  notes.unshift(newNote)
  saveData()
  editNote(newNote.id)
}

function editNote(noteId) {
  const note = notes.find((n) => n.id === noteId)
  if (!note) return

  // Check password if note is protected
  if (note.password && note.password.length > 0) {
    const password = prompt("Enter password to access this note:")
    if (password !== note.password) {
      showToast(t("incorrectPassword"))
      return
    }
  }

  currentNote = note
  showPage("editorPage")
  loadNoteInEditor(note)
}

function loadNoteInEditor(note) {
  const titleInput = document.getElementById("titleInput")
  const contentTextarea = document.getElementById("contentTextarea")
  const dateInfo = document.getElementById("dateInfo")
  const categoryChips = document.getElementById("categoryChips")
  const listSection = document.getElementById("listSection")
  const imagesSection = document.getElementById("imagesSection")
  const passwordIcon = document.getElementById("passwordIcon")

  if (titleInput) titleInput.value = note.title || ""
  if (contentTextarea) contentTextarea.value = note.content || ""
  
  if (dateInfo) {
    const created = new Date(note.createdAt).toLocaleDateString()
    const updated = new Date(note.updatedAt).toLocaleDateString()
    dateInfo.textContent = `Created: ${created} • Updated: ${updated}`
  }

  // Update password icon
  if (passwordIcon) {
    passwordIcon.className = note.password && note.password.length > 0 ? "fas fa-lock" : "fas fa-unlock"
  }

  // Render categories
  if (categoryChips) {
    renderNoteCategoriesInEditor(note)
  }

  // Render list
  if (listSection) {
    if (note.list && note.list.items && note.list.items.length > 0) {
      listSection.classList.remove("hidden")
      renderListInEditor(note.list)
    } else {
      listSection.classList.add("hidden")
    }
  }

  // Render images
  if (imagesSection) {
    if (note.images && note.images.length > 0) {
      imagesSection.classList.remove("hidden")
      renderImagesInEditor(note.images)
    } else {
      imagesSection.classList.add("hidden")
    }
  }
}

function renderNoteCategoriesInEditor(note) {
  const categoryChips = document.getElementById("categoryChips")
  if (!categoryChips) return

  const userCategories = categories.filter((c) => c.id !== "all")
  const noteCategories = note.categories || []

  categoryChips.innerHTML = `
    ${noteCategories
      .map((catId) => {
        const category = categories.find((c) => c.id === catId)
        return category
          ? `
          <button class="chip active" onclick="removeCategoryFromNote('${catId}')">
            ${category.name}
            <i class="fas fa-times" style="margin-left: 4px;"></i>
          </button>
        `
          : ""
      })
      .join("")}
    <button class="chip outline" id="addCategoryBtn" onclick="showCategoryModal()">
      <i class="fas fa-plus"></i>
      ADD
    </button>
  `
}

function renderListInEditor(list) {
  const listItems = document.getElementById("listItems")
  if (!listItems) return

  listItems.innerHTML = list.items
    .map((item, index) => {
      let itemContent = ""
      
      if (list.type === "checklist") {
        itemContent = `
          <input type="checkbox" class="list-item-checkbox" ${item.checked ? "checked" : ""} 
                 onchange="toggleListItem(${index})">
        `
      } else if (list.type === "numbered") {
        itemContent = `<span class="list-item-number">${index + 1}.</span>`
      } else {
        itemContent = `<i class="fas fa-circle" style="font-size: 6px; opacity: 0.5;"></i>`
      }

      return `
        <div class="list-item">
          <i class="fas fa-grip-vertical list-item-drag"></i>
          ${itemContent}
          <input type="text" class="list-item-input" value="${item.text}" 
                 onchange="updateListItem(${index}, this.value)" 
                 placeholder="List item...">
          <button class="list-item-delete" onclick="deleteListItem(${index})">
            <i class="fas fa-times"></i>
          </button>
        </div>
      `
    })
    .join("")
}

function renderImagesInEditor(images) {
  const imageGrid = document.getElementById("imageGrid")
  if (!imageGrid) return

  imageGrid.innerHTML = images
    .map((image, index) => `
      <div class="image-item">
        <img src="${image}" alt="Note image">
        <button class="image-delete" onclick="deleteImage(${index})">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `)
    .join("")
}

function saveCurrentNote() {
  if (!currentNote) return

  const titleInput = document.getElementById("titleInput")
  const contentTextarea = document.getElementById("contentTextarea")

  if (titleInput) currentNote.title = titleInput.value
  if (contentTextarea) currentNote.content = contentTextarea.value
  
  currentNote.updatedAt = Date.now()

  // Update note in array
  const noteIndex = notes.findIndex((n) => n.id === currentNote.id)
  if (noteIndex !== -1) {
    notes[noteIndex] = currentNote
  }

  saveData()
  showToast(t("noteSaved"))
}

function deleteNote(noteId) {
  const note = notes.find((n) => n.id === noteId)
  if (!note) return

  // Show delete modal
  const modal = document.getElementById("deleteModal")
  const passwordContainer = document.getElementById("deletePasswordContainer")
  const passwordInput = document.getElementById("deletePasswordInput")

  if (note.password && note.password.length > 0) {
    passwordContainer.classList.remove("hidden")
    passwordInput.value = ""
  } else {
    passwordContainer.classList.add("hidden")
  }

  modal.classList.add("open")

  // Set up confirm delete
  document.getElementById("confirmDeleteBtn").onclick = () => {
    if (note.password && note.password.length > 0) {
      if (passwordInput.value !== note.password) {
        showToast(t("incorrectPassword"))
        return
      }
    }

    notes = notes.filter((n) => n.id !== noteId)
    saveData()
    renderNotes()
    modal.classList.remove("open")
    showToast(t("noteDeleted"))

    // If we're editing this note, go back to notes
    if (currentNote && currentNote.id === noteId) {
      showPage("notesPage")
      currentNote = null
    }
  }
}

// Share note functionality
function shareNote(noteId) {
  const note = notes.find(n => n.id === noteId)
  if (!note) return

  // Check if user is logged in
  if (!window.authFunctions || !window.authFunctions.getCurrentUser()) {
    showToast("Please sign in to share notes")
    return
  }

  // For now, just copy a shareable link
  const shareUrl = `${window.location.origin}${window.location.pathname}?shared=${noteId}`
  
  if (navigator.share) {
    navigator.share({
      title: note.title || 'Shared Note',
      text: note.content ? note.content.substring(0, 100) + '...' : 'Check out this note',
      url: shareUrl
    }).catch(console.error)
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(shareUrl).then(() => {
      showToast("Share link copied to clipboard!")
    }).catch(() => {
      showToast("Could not copy link")
    })
  } else {
    // Fallback - show the link
    prompt("Copy this link to share:", shareUrl)
  }
}

// Category management
function showCategoryModal() {
  const modal = document.getElementById("categoryModal")
  const modalCategoriesList = document.getElementById("modalCategoriesList")

  if (!modal || !modalCategoriesList) return

  const userCategories = categories.filter((c) => c.id !== "all")
  const noteCategories = currentNote ? currentNote.categories || [] : []

  modalCategoriesList.innerHTML = userCategories
    .map((category) => {
      const isChecked = noteCategories.includes(category.id)
      return `
        <div class="modal-category-item">
          <label>
            <input type="checkbox" class="category-checkbox" value="${category.id}" 
                   ${isChecked ? "checked" : ""} onchange="toggleNoteCategory('${category.id}')">
            ${category.name}
          </label>
        </div>
      `
    })
    .join("")

  modal.classList.add("open")
}

function toggleNoteCategory(categoryId) {
  if (!currentNote) return

  if (!currentNote.categories) {
    currentNote.categories = []
  }

  const index = currentNote.categories.indexOf(categoryId)
  if (index === -1) {
    currentNote.categories.push(categoryId)
  } else {
    currentNote.categories.splice(index, 1)
  }

  renderNoteCategoriesInEditor(currentNote)
  saveCurrentNote()
}

function removeCategoryFromNote(categoryId) {
  if (!currentNote) return

  if (currentNote.categories) {
    currentNote.categories = currentNote.categories.filter((id) => id !== categoryId)
    renderNoteCategoriesInEditor(currentNote)
    saveCurrentNote()
  }
}

// Password management
function showPasswordModal() {
  const modal = document.getElementById("passwordModal")
  const passwordInput = document.getElementById("passwordInput")
  const removeBtn = document.getElementById("removePasswordBtn")

  if (!modal || !passwordInput || !removeBtn) return

  if (currentNote && currentNote.password) {
    passwordInput.value = currentNote.password
    removeBtn.style.display = "block"
  } else {
    passwordInput.value = ""
    removeBtn.style.display = "none"
  }

  modal.classList.add("open")
  passwordInput.focus()
}

function savePassword() {
  const passwordInput = document.getElementById("passwordInput")
  if (!passwordInput || !currentNote) return

  const password = passwordInput.value.trim()
  
  if (password.length < 4) {
    showToast("Password must be at least 4 characters")
    return
  }

  currentNote.password = password
  saveCurrentNote()
  
  const passwordIcon = document.getElementById("passwordIcon")
  if (passwordIcon) {
    passwordIcon.className = "fas fa-lock"
  }

  document.getElementById("passwordModal").classList.remove("open")
  showToast(t("passwordSet"))
}

function removePassword() {
  if (!currentNote) return

  currentNote.password = ""
  saveCurrentNote()
  
  const passwordIcon = document.getElementById("passwordIcon")
  if (passwordIcon) {
    passwordIcon.className = "fas fa-unlock"
  }

  document.getElementById("passwordModal").classList.remove("open")
  showToast(t("passwordRemoved"))
}

// Image management
function addImages() {
  const imageInput = document.getElementById("imageInput")
  if (!imageInput) return

  imageInput.click()
}

function handleImageUpload(event) {
  const files = event.target.files
  if (!files || !currentNote) return

  Array.from(files).forEach((file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (!currentNote.images) {
        currentNote.images = []
      }
      currentNote.images.push(e.target.result)
      saveCurrentNote()
      
      const imagesSection = document.getElementById("imagesSection")
      if (imagesSection) {
        imagesSection.classList.remove("hidden")
        renderImagesInEditor(currentNote.images)
      }
      
      showToast(t("imageAdded"))
    }
    reader.readAsDataURL(file)
  })

  // Clear input
  event.target.value = ""
}

function deleteImage(index) {
  if (!currentNote || !currentNote.images) return

  currentNote.images.splice(index, 1)
  saveCurrentNote()
  
  if (currentNote.images.length === 0) {
    const imagesSection = document.getElementById("imagesSection")
    if (imagesSection) {
      imagesSection.classList.add("hidden")
    }
  } else {
    renderImagesInEditor(currentNote.images)
  }
}

// List management
function showListTypeModal() {
  const modal = document.getElementById("listTypeModal")
  if (!modal) return

  modal.classList.add("open")
}

function createList(type) {
  if (!currentNote) return

  currentNote.list = {
    type: type,
    items: [{ text: "", checked: false, number: 1 }],
  }

  saveCurrentNote()
  
  const listSection = document.getElementById("listSection")
  if (listSection) {
    listSection.classList.remove("hidden")
    renderListInEditor(currentNote.list)
  }

  document.getElementById("listTypeModal").classList.remove("open")
  showToast(t("listAdded"))
}

function addListItem() {
  if (!currentNote || !currentNote.list) return

  const newItem = {
    text: "",
    checked: false,
    number: currentNote.list.items.length + 1,
  }

  currentNote.list.items.push(newItem)
  saveCurrentNote()
  renderListInEditor(currentNote.list)
}

function updateListItem(index, text) {
  if (!currentNote || !currentNote.list || !currentNote.list.items[index]) return

  currentNote.list.items[index].text = text
  saveCurrentNote()
}

function toggleListItem(index) {
  if (!currentNote || !currentNote.list || !currentNote.list.items[index]) return

  currentNote.list.items[index].checked = !currentNote.list.items[index].checked
  saveCurrentNote()
}

function deleteListItem(index) {
  if (!currentNote || !currentNote.list) return

  currentNote.list.items.splice(index, 1)
  
  // Update numbers for numbered lists
  if (currentNote.list.type === "numbered") {
    currentNote.list.items.forEach((item, i) => {
      item.number = i + 1
    })
  }

  saveCurrentNote()
  
  if (currentNote.list.items.length === 0) {
    currentNote.list = null
    const listSection = document.getElementById("listSection")
    if (listSection) {
      listSection.classList.add("hidden")
    }
  } else {
    renderListInEditor(currentNote.list)
  }
}

// Modal management
function closeModal(modalId) {
  const modal = document.getElementById(modalId)
  if (modal) {
    modal.classList.remove("open")
  }
}

// Event listeners
function setupEventListeners() {
  // Navigation
  const backBtn = document.getElementById("backBtn")
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      if (currentPage === "editor") {
        saveCurrentNote()
      }
      showPage("notesPage")
    })
  }

  const settingsBtn = document.getElementById("settingsBtn")
  if (settingsBtn) {
    settingsBtn.addEventListener("click", () => {
      showPage("settingsPage")
    })
  }

  const categoryBtn = document.getElementById("categoryBtn")
  if (categoryBtn) {
    categoryBtn.addEventListener("click", () => {
      window.location.href = "category.html"
    })
  }

  // Add note button
  const addNoteBtn = document.getElementById("addNoteBtn")
  if (addNoteBtn) {
    addNoteBtn.addEventListener("click", addNote)
  }

  // Editor auto-save
  const titleInput = document.getElementById("titleInput")
  const contentTextarea = document.getElementById("contentTextarea")

  if (titleInput) {
    titleInput.addEventListener("input", () => {
      if (currentNote) {
        currentNote.title = titleInput.value
        saveCurrentNote()
      }
    })
  }

  if (contentTextarea) {
    contentTextarea.addEventListener("input", () => {
      if (currentNote) {
        currentNote.content = contentTextarea.value
        saveCurrentNote()
      }
    })
  }

  // Toolbar buttons
  const imageBtn = document.getElementById("imageBtn")
  if (imageBtn) {
    imageBtn.addEventListener("click", addImages)
  }

  const listBtn = document.getElementById("listBtn")
  if (listBtn) {
    listBtn.addEventListener("click", showListTypeModal)
  }

  const passwordBtn = document.getElementById("passwordBtn")
  if (passwordBtn) {
    passwordBtn.addEventListener("click", showPasswordModal)
  }

  // Image input
  const imageInput = document.getElementById("imageInput")
  if (imageInput) {
    imageInput.addEventListener("change", handleImageUpload)
  }

  // Modal buttons
  const passwordModalClose = document.getElementById("passwordModalClose")
  if (passwordModalClose) {
    passwordModalClose.addEventListener("click", () => closeModal("passwordModal"))
  }

  const savePasswordBtn = document.getElementById("savePasswordBtn")
  if (savePasswordBtn) {
    savePasswordBtn.addEventListener("click", savePassword)
  }

  const removePasswordBtn = document.getElementById("removePasswordBtn")
  if (removePasswordBtn) {
    removePasswordBtn.addEventListener("click", removePassword)
  }

  const categoryModalClose = document.getElementById("categoryModalClose")
  if (categoryModalClose) {
    categoryModalClose.addEventListener("click", () => closeModal("categoryModal"))
  }

  const deleteModalClose = document.getElementById("deleteModalClose")
  if (deleteModalClose) {
    deleteModalClose.addEventListener("click", () => closeModal("deleteModal"))
  }

  const cancelDeleteBtn = document.getElementById("cancelDeleteBtn")
  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener("click", () => closeModal("deleteModal"))
  }

  const listTypeModalClose = document.getElementById("listTypeModalClose")
  if (listTypeModalClose) {
    listTypeModalClose.addEventListener("click", () => closeModal("listTypeModal"))
  }

  // List type buttons
  document.querySelectorAll(".list-type-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const type = btn.getAttribute("data-type")
      createList(type)
    })
  })

  const addListItemBtn = document.getElementById("addListItemBtn")
  if (addListItemBtn) {
    addListItemBtn.addEventListener("click", addListItem)
  }

  // Password toggle
  const passwordToggle = document.getElementById("passwordToggle")
  if (passwordToggle) {
    passwordToggle.addEventListener("click", () => {
      const passwordInput = document.getElementById("passwordInput")
      const icon = passwordToggle.querySelector("i")
      
      if (passwordInput.type === "password") {
        passwordInput.type = "text"
        icon.className = "fas fa-eye-slash"
      } else {
        passwordInput.type = "password"
        icon.className = "fas fa-eye"
      }
    })
  }

  // Close modals on outside click
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("open")
      }
    })
  })

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    // Escape to close modals
    if (e.key === "Escape") {
      document.querySelectorAll(".modal.open").forEach((modal) => {
        modal.classList.remove("open")
      })
    }
    
    // Ctrl/Cmd + S to save
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault()
      if (currentNote) {
        saveCurrentNote()
      }
    }
    
    // Ctrl/Cmd + N to add new note
    if ((e.ctrlKey || e.metaKey) && e.key === "n") {
      e.preventDefault()
      addNote()
    }
  })
}

// Initialize app
function init() {
  initTheme()
  initLanguage()
  initSearch()
  setupEventListeners()
  renderCategories()
  renderNotes()
  
  // Build search index
  if (notesSearch) {
    notesSearch.buildSearchIndex(notes)
  }
  
  // Check for shared note in URL
  const urlParams = new URLSearchParams(window.location.search)
  const sharedNoteId = urlParams.get('shared')
  if (sharedNoteId) {
    // Handle shared note
    const note = notes.find(n => n.id === sharedNoteId)
    if (note) {
      editNote(sharedNoteId)
    } else {
      showToast("Shared note not found")
    }
  }
}

// Global functions for HTML onclick handlers
window.editNote = editNote
window.deleteNote = deleteNote
window.shareNote = shareNote
window.setFilter = setFilter
window.showCategoryModal = showCategoryModal
window.toggleNoteCategory = toggleNoteCategory
window.removeCategoryFromNote = removeCategoryFromNote
window.savePassword = savePassword
window.removePassword = removePassword
window.createList = createList
window.addListItem = addListItem
window.updateListItem = updateListItem
window.toggleListItem = toggleListItem
window.deleteListItem = deleteListItem
window.deleteImage = deleteImage
window.closeModal = closeModal

// Start the app
document.addEventListener("DOMContentLoaded", init)