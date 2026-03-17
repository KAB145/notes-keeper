let notes = []
let editingNoteId = null

/* ---------------- LOAD / SAVE ---------------- */

function loadNotes() {
  const savedNotes = localStorage.getItem('quickNotes')
  return savedNotes ? JSON.parse(savedNotes) : []
}

function saveNotes() {
  localStorage.setItem('quickNotes', JSON.stringify(notes))
}

/* ---------------- UTIL ---------------- */

function generateId() {
  return Date.now().toString()
}

function escapeHTML(str) {
  return str.replace(/[&<>"']/g, function (match) {
    const escape = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return escape[match];
  });
}

/* ---------------- ADD / EDIT ---------------- */

function saveNote(event) {
  event.preventDefault()

  const title = document.getElementById('noteTitle').value.trim()
  const content = document.getElementById('noteContent').value.trim()

  // Prevent empty note
  if (!title && !content) {
    alert("Note cannot be empty!")
    return
  }

  if (editingNoteId) {
    // Edit existing
    const noteIndex = notes.findIndex(note => note.id === editingNoteId)

    notes[noteIndex] = {
      ...notes[noteIndex],
      title,
      content
    }

  } else {
    // Add new
    notes.unshift({
      id: generateId(),
      title,
      content,
      date: new Date().toLocaleString()
    })
  }

  closeNoteDialog()
  saveNotes()
  renderNotes()
}

/* ---------------- DELETE ---------------- */

function deleteNote(noteId) {

  const confirmDelete = confirm("Are you sure you want to delete this note?")
  if (!confirmDelete) return

  notes = notes.filter(note => note.id != noteId)

  saveNotes()
  renderNotes()
}

/* ---------------- RENDER ---------------- */

function renderNotes() {
  const notesContainer = document.getElementById('notesContainer')

  if (notes.length === 0) {
    notesContainer.innerHTML = `
      <div class="empty-state">
        <h2>No notes yet</h2>
        <p>Create your first note to get started!</p>
        <button class="add-note-btn" onclick="openNoteDialog()">+ Add Your First Note</button>
      </div>
    `
    return
  }

  notesContainer.innerHTML = notes.map(note => `
    <div class="note-card">

      <div class="note-actions">
        <button class="edit-btn" onclick="openNoteDialog('${note.id}')" title="Edit Note">✏️</button>
        <button class="delete-btn" onclick="deleteNote('${note.id}')" title="Delete Note">🗑</button>
      </div>

      <h3 class="note-title">${escapeHTML(note.title)}</h3>
      <p class="note-content">${escapeHTML(note.content)}</p>
      <p class="note-date">${note.date || ''}</p>

    </div>
  `).join('')
}

/* ---------------- DIALOG ---------------- */

function openNoteDialog(noteId = null) {
  const dialog = document.getElementById('noteDialog')
  const titleInput = document.getElementById('noteTitle')
  const contentInput = document.getElementById('noteContent')

  if (noteId) {
    const noteToEdit = notes.find(note => note.id === noteId)

    editingNoteId = noteId
    document.getElementById('dialogTitle').textContent = 'Edit Note'

    titleInput.value = noteToEdit.title
    contentInput.value = noteToEdit.content
  } else {
    editingNoteId = null
    document.getElementById('dialogTitle').textContent = 'Add New Note'

    titleInput.value = ''
    contentInput.value = ''
  }

  dialog.showModal()

  // smooth focus
  setTimeout(() => titleInput.focus(), 100)
}

function closeNoteDialog() {
  document.getElementById('noteDialog').close()
}

/* ---------------- THEME ---------------- */

function toggleTheme() {
  const isDark = document.body.classList.toggle('dark-theme')

  localStorage.setItem('theme', isDark ? 'dark' : 'light')

  document.getElementById('themeToggleBtn').textContent = isDark ? '☀️' : '🌙'
}

function applyStoredTheme() {
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-theme')
    document.getElementById('themeToggleBtn').textContent = '☀️'
  }
}

/* ---------------- INIT ---------------- */

document.addEventListener('DOMContentLoaded', function () {

  applyStoredTheme()

  notes = loadNotes()

  renderNotes()

  document.getElementById('noteForm').addEventListener('submit', saveNote)
  document.getElementById('themeToggleBtn').addEventListener('click', toggleTheme)

  // Close dialog when clicking outside
  document.getElementById('noteDialog').addEventListener('click', function (event) {
    if (event.target === this) {
      closeNoteDialog()
    }
  })

  // Keyboard shortcut (Ctrl + N)
  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.key === 'n') {
      e.preventDefault()
      openNoteDialog()
    }
  })
})