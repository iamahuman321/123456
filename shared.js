// Shared notes page JavaScript
let currentUser = null
let sharedNotes = []
let pendingInvites = []
let activeTab = 'shared-with-me'
let searchQuery = ''
let currentEditingNote = null
let realtimeListeners = new Map()

// Wait for Firebase to be ready
function waitForFirebase() {
    return new Promise((resolve) => {
        const checkFirebase = () => {
            if (window.auth && window.database) {
                resolve()
            } else {
                setTimeout(checkFirebase, 100)
            }
        }
        checkFirebase()
    })
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

// Search functionality
function initSearch() {
    const searchBtn = document.getElementById('searchBtn')
    const searchContainer = document.getElementById('searchContainer')
    const searchInput = document.getElementById('searchInput')
    const searchClear = document.getElementById('searchClear')

    searchBtn.addEventListener('click', () => {
        searchContainer.classList.toggle('active')
        if (searchContainer.classList.contains('active')) {
            searchInput.focus()
        } else {
            searchInput.value = ''
            searchQuery = ''
            renderCurrentTab()
        }
    })

    searchClear.addEventListener('click', () => {
        searchInput.value = ''
        searchQuery = ''
        renderCurrentTab()
    })

    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase()
        renderCurrentTab()
    })

    // Close search on escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchContainer.classList.contains('active')) {
            searchContainer.classList.remove('active')
            searchInput.value = ''
            searchQuery = ''
            renderCurrentTab()
        }
    })
}

// Tab functionality
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn')
    const tabContents = document.querySelectorAll('.tab-content')

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab')
            
            // Update active tab button
            tabBtns.forEach(b => b.classList.remove('active'))
            btn.classList.add('active')

            // Update active tab content
            tabContents.forEach(content => content.classList.remove('active'))
            document.getElementById(tabId).classList.add('active')

            activeTab = tabId
            renderCurrentTab()
        })
    })
}

// Load shared notes data
async function loadSharedData() {
    if (!currentUser) return

    try {
        // Load notes shared with me
        const sharedWithMeRef = window.database.ref(`sharedNotes/${currentUser.uid}`)
        sharedWithMeRef.on('value', (snapshot) => {
            const data = snapshot.val() || {}
            sharedNotes = Object.values(data)
            if (activeTab === 'shared-with-me') renderCurrentTab()
        })

        // Load pending invites
        const pendingRef = window.database.ref(`pendingInvites/${currentUser.uid}`)
        pendingRef.on('value', (snapshot) => {
            const data = snapshot.val() || {}
            pendingInvites = Object.values(data)
            if (activeTab === 'pending') renderCurrentTab()
        })

    } catch (error) {
        console.error('Error loading shared data:', error)
        showToast('Error loading shared notes')
    }
}

// Render current tab content
function renderCurrentTab() {
    switch (activeTab) {
        case 'shared-with-me':
            renderSharedWithMe()
            break
        case 'shared-by-me':
            renderSharedByMe()
            break
        case 'pending':
            renderPendingInvites()
            break
    }
}

// Render notes shared with me
function renderSharedWithMe() {
    const container = document.getElementById('sharedWithMeGrid')
    
    let filteredNotes = sharedNotes
    if (searchQuery) {
        filteredNotes = sharedNotes.filter(note => 
            note.title?.toLowerCase().includes(searchQuery) ||
            note.content?.toLowerCase().includes(searchQuery) ||
            note.ownerName?.toLowerCase().includes(searchQuery)
        )
    }

    if (filteredNotes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-share-alt"></i>
                <p>${searchQuery ? 'No matching shared notes found' : 'No notes shared with you yet'}</p>
            </div>
        `
        return
    }

    container.innerHTML = filteredNotes.map(note => `
        <div class="shared-note-card" onclick="viewSharedNote('${note.id}')">
            <div class="note-header">
                <h3 class="note-title">${note.title || 'Untitled'}</h3>
                <div class="note-permissions">
                    <i class="fas fa-${note.permission === 'edit' ? 'edit' : 'eye'}"></i>
                </div>
            </div>
            <div class="note-content">${note.content ? note.content.substring(0, 150) + '...' : ''}</div>
            <div class="note-meta">
                <div class="note-owner">
                    <i class="fas fa-user"></i>
                    <span>${note.ownerName}</span>
                </div>
                <div class="note-date">${formatDate(note.sharedAt)}</div>
            </div>
            <div class="note-actions">
                <button class="action-btn" onclick="event.stopPropagation(); viewSharedNote('${note.id}')" title="View">
                    <i class="fas fa-eye"></i>
                </button>
                ${note.permission === 'edit' ? `
                    <button class="action-btn" onclick="event.stopPropagation(); editSharedNote('${note.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                ` : ''}
                <button class="action-btn" onclick="event.stopPropagation(); shareNote('${note.id}')" title="Share">
                    <i class="fas fa-share"></i>
                </button>
            </div>
        </div>
    `).join('')
}

// Render notes shared by me
async function renderSharedByMe() {
    const container = document.getElementById('sharedByMeGrid')
    
    try {
        // Get notes I've shared
        const myNotesRef = window.database.ref(`users/${currentUser.uid}/notes`)
        const snapshot = await myNotesRef.once('value')
        const myNotes = snapshot.val() || {}
        
        const sharedByMe = Object.values(myNotes).filter(note => note.sharedWith && Object.keys(note.sharedWith).length > 0)
        
        let filteredNotes = sharedByMe
        if (searchQuery) {
            filteredNotes = sharedByMe.filter(note => 
                note.title?.toLowerCase().includes(searchQuery) ||
                note.content?.toLowerCase().includes(searchQuery)
            )
        }

        if (filteredNotes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-share"></i>
                    <p>${searchQuery ? 'No matching shared notes found' : 'You haven\'t shared any notes yet'}</p>
                </div>
            `
            return
        }

        container.innerHTML = filteredNotes.map(note => {
            const sharedWithCount = Object.keys(note.sharedWith || {}).length
            const sharedWithList = Object.values(note.sharedWith || {}).map(share => share.username).join(', ')
            
            return `
                <div class="shared-note-card">
                    <div class="note-header">
                        <h3 class="note-title">${note.title || 'Untitled'}</h3>
                        <div class="shared-count">
                            <i class="fas fa-users"></i>
                            <span>${sharedWithCount}</span>
                        </div>
                    </div>
                    <div class="note-content">${note.content ? note.content.substring(0, 150) + '...' : ''}</div>
                    <div class="shared-with">
                        <small>Shared with: ${sharedWithList}</small>
                    </div>
                    <div class="note-actions">
                        <button class="action-btn" onclick="editNote('${note.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn" onclick="shareNote('${note.id}')" title="Share More">
                            <i class="fas fa-share"></i>
                        </button>
                        <button class="action-btn" onclick="manageSharing('${note.id}')" title="Manage Sharing">
                            <i class="fas fa-cog"></i>
                        </button>
                    </div>
                </div>
            `
        }).join('')

    } catch (error) {
        console.error('Error loading shared by me:', error)
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error loading shared notes</p>
            </div>
        `
    }
}

// Render pending invites
function renderPendingInvites() {
    const container = document.getElementById('pendingInvites')
    
    let filteredInvites = pendingInvites
    if (searchQuery) {
        filteredInvites = pendingInvites.filter(invite => 
            invite.noteTitle?.toLowerCase().includes(searchQuery) ||
            invite.fromUsername?.toLowerCase().includes(searchQuery) ||
            invite.message?.toLowerCase().includes(searchQuery)
        )
    }

    if (filteredInvites.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clock"></i>
                <p>${searchQuery ? 'No matching invites found' : 'No pending invites'}</p>
            </div>
        `
        return
    }

    container.innerHTML = filteredInvites.map(invite => `
        <div class="invite-card">
            <div class="invite-header">
                <div class="invite-info">
                    <h4>${invite.noteTitle || 'Untitled Note'}</h4>
                    <p>From: <strong>${invite.fromUsername}</strong></p>
                </div>
                <div class="invite-permission">
                    <i class="fas fa-${invite.permission === 'edit' ? 'edit' : 'eye'}"></i>
                    <span>${invite.permission === 'edit' ? 'Can Edit' : 'View Only'}</span>
                </div>
            </div>
            ${invite.message ? `<div class="invite-message">"${invite.message}"</div>` : ''}
            <div class="invite-date">Received: ${formatDate(invite.sentAt)}</div>
            <div class="invite-actions">
                <button class="btn btn-primary" onclick="acceptInvite('${invite.id}')">
                    <i class="fas fa-check"></i>
                    Accept
                </button>
                <button class="btn btn-secondary" onclick="declineInvite('${invite.id}')">
                    <i class="fas fa-times"></i>
                    Decline
                </button>
            </div>
        </div>
    `).join('')
}

// Share note functionality
async function shareNote(noteId) {
    const modal = document.getElementById('shareModal')
    const usernameInput = document.getElementById('shareUsername')
    const userSuggestions = document.getElementById('userSuggestions')
    
    modal.classList.add('open')
    usernameInput.focus()
    
    // Setup user search
    let searchTimeout
    usernameInput.addEventListener('input', async (e) => {
        clearTimeout(searchTimeout)
        const query = e.target.value.trim()
        
        if (query.length < 2) {
            userSuggestions.innerHTML = ''
            return
        }
        
        searchTimeout = setTimeout(async () => {
            try {
                const usersRef = window.database.ref('users')
                const snapshot = await usersRef.orderByChild('username').startAt(query).endAt(query + '\uf8ff').limitToFirst(5).once('value')
                const users = snapshot.val() || {}
                
                const suggestions = Object.values(users)
                    .filter(user => user.uid !== currentUser.uid)
                    .map(user => `
                        <div class="user-suggestion" onclick="selectUser('${user.username}', '${user.email}')">
                            <div class="user-info">
                                <strong>${user.username}</strong>
                                <small>${user.email}</small>
                            </div>
                        </div>
                    `).join('')
                
                userSuggestions.innerHTML = suggestions
            } catch (error) {
                console.error('Error searching users:', error)
            }
        }, 300)
    })
    
    // Setup send invite
    document.getElementById('sendShareBtn').onclick = () => sendShareInvite(noteId)
}

function selectUser(username, email) {
    document.getElementById('shareUsername').value = username
    document.getElementById('userSuggestions').innerHTML = ''
}

async function sendShareInvite(noteId) {
    const usernameOrEmail = document.getElementById('shareUsername').value.trim()
    const permission = document.querySelector('input[name="permission"]:checked').value
    const message = document.getElementById('shareMessage').value.trim()
    
    if (!usernameOrEmail) {
        showToast('Please enter a username or email')
        return
    }
    
    try {
        // Find user by username or email
        const usersRef = window.database.ref('users')
        let targetUser = null
        
        // Search by username first
        const usernameSnapshot = await usersRef.orderByChild('username').equalTo(usernameOrEmail).once('value')
        if (usernameSnapshot.exists()) {
            targetUser = Object.values(usernameSnapshot.val())[0]
        } else {
            // Search by email
            const emailSnapshot = await usersRef.orderByChild('email').equalTo(usernameOrEmail).once('value')
            if (emailSnapshot.exists()) {
                targetUser = Object.values(emailSnapshot.val())[0]
            }
        }
        
        if (!targetUser) {
            showToast('User not found')
            return
        }
        
        if (targetUser.uid === currentUser.uid) {
            showToast('You cannot share with yourself')
            return
        }
        
        // Get the note
        const noteRef = window.database.ref(`users/${currentUser.uid}/notes/${noteId}`)
        const noteSnapshot = await noteRef.once('value')
        const note = noteSnapshot.val()
        
        if (!note) {
            showToast('Note not found')
            return
        }
        
        // Create invite
        const inviteId = window.database.ref().child('pendingInvites').push().key
        const invite = {
            id: inviteId,
            noteId: noteId,
            noteTitle: note.title,
            fromUserId: currentUser.uid,
            fromUsername: currentUser.displayName || currentUser.email.split('@')[0],
            toUserId: targetUser.uid,
            permission: permission,
            message: message,
            sentAt: Date.now()
        }
        
        // Save invite
        await window.database.ref(`pendingInvites/${targetUser.uid}/${inviteId}`).set(invite)
        
        // Close modal and show success
        document.getElementById('shareModal').classList.remove('open')
        showToast('Invite sent successfully!')
        
        // Clear form
        document.getElementById('shareUsername').value = ''
        document.getElementById('shareMessage').value = ''
        document.querySelector('input[name="permission"][value="view"]').checked = true
        
    } catch (error) {
        console.error('Error sending invite:', error)
        showToast('Error sending invite')
    }
}

// Accept/decline invites
async function acceptInvite(inviteId) {
    try {
        const inviteRef = window.database.ref(`pendingInvites/${currentUser.uid}/${inviteId}`)
        const snapshot = await inviteRef.once('value')
        const invite = snapshot.val()
        
        if (!invite) {
            showToast('Invite not found')
            return
        }
        
        // Get the original note
        const noteRef = window.database.ref(`users/${invite.fromUserId}/notes/${invite.noteId}`)
        const noteSnapshot = await noteRef.once('value')
        const originalNote = noteSnapshot.val()
        
        if (!originalNote) {
            showToast('Original note no longer exists')
            await inviteRef.remove()
            return
        }
        
        // Create shared note entry
        const sharedNote = {
            id: invite.noteId,
            title: originalNote.title,
            content: originalNote.content,
            ownerId: invite.fromUserId,
            ownerName: invite.fromUsername,
            permission: invite.permission,
            sharedAt: Date.now(),
            originalNoteRef: `users/${invite.fromUserId}/notes/${invite.noteId}`
        }
        
        // Save to shared notes
        await window.database.ref(`sharedNotes/${currentUser.uid}/${invite.noteId}`).set(sharedNote)
        
        // Update original note's shared list
        await window.database.ref(`users/${invite.fromUserId}/notes/${invite.noteId}/sharedWith/${currentUser.uid}`).set({
            userId: currentUser.uid,
            username: currentUser.displayName || currentUser.email.split('@')[0],
            permission: invite.permission,
            acceptedAt: Date.now()
        })
        
        // Remove invite
        await inviteRef.remove()
        
        showToast('Invite accepted!')
        renderCurrentTab()
        
    } catch (error) {
        console.error('Error accepting invite:', error)
        showToast('Error accepting invite')
    }
}

async function declineInvite(inviteId) {
    try {
        await window.database.ref(`pendingInvites/${currentUser.uid}/${inviteId}`).remove()
        showToast('Invite declined')
        renderCurrentTab()
    } catch (error) {
        console.error('Error declining invite:', error)
        showToast('Error declining invite')
    }
}

// View shared note
async function viewSharedNote(noteId) {
    try {
        const sharedNote = sharedNotes.find(note => note.id === noteId)
        if (!sharedNote) return
        
        // Get latest note content
        const noteRef = window.database.ref(sharedNote.originalNoteRef)
        const snapshot = await noteRef.once('value')
        const note = snapshot.val()
        
        if (!note) {
            showToast('Note no longer exists')
            return
        }
        
        // Show note viewer
        const modal = document.getElementById('noteViewerModal')
        document.getElementById('viewerNoteTitle').textContent = note.title || 'Untitled'
        document.getElementById('viewerNoteOwner').textContent = `Shared by ${sharedNote.ownerName}`
        document.getElementById('viewerNoteDate').textContent = formatDate(note.updatedAt || note.createdAt)
        document.getElementById('noteViewerContent').innerHTML = `
            <div class="note-content-display">
                ${note.content ? note.content.replace(/\n/g, '<br>') : '<em>No content</em>'}
            </div>
        `
        
        // Setup edit button
        const editBtn = document.getElementById('viewerEditBtn')
        if (sharedNote.permission === 'edit') {
            editBtn.style.display = 'block'
            editBtn.onclick = () => {
                modal.classList.remove('open')
                editSharedNote(noteId)
            }
        } else {
            editBtn.style.display = 'none'
        }
        
        modal.classList.add('open')
        
    } catch (error) {
        console.error('Error viewing note:', error)
        showToast('Error loading note')
    }
}

// Real-time collaborative editing
async function editSharedNote(noteId) {
    const sharedNote = sharedNotes.find(note => note.id === noteId)
    if (!sharedNote || sharedNote.permission !== 'edit') {
        showToast('You don\'t have permission to edit this note')
        return
    }
    
    currentEditingNote = sharedNote
    
    try {
        // Get latest note content
        const noteRef = window.database.ref(sharedNote.originalNoteRef)
        const snapshot = await noteRef.once('value')
        const note = snapshot.val()
        
        if (!note) {
            showToast('Note no longer exists')
            return
        }
        
        // Show real-time editor
        const modal = document.getElementById('realtimeEditorModal')
        const titleInput = document.getElementById('realtimeTitleInput')
        const contentInput = document.getElementById('realtimeContentInput')
        
        titleInput.value = note.title || ''
        contentInput.value = note.content || ''
        
        document.getElementById('editorNoteTitle').textContent = `Editing: ${note.title || 'Untitled'}`
        
        modal.classList.add('open')
        
        // Setup real-time listeners
        setupRealtimeEditing(sharedNote.originalNoteRef)
        
        // Join editing session
        await joinEditingSession(noteId)
        
    } catch (error) {
        console.error('Error opening editor:', error)
        showToast('Error opening editor')
    }
}

function setupRealtimeEditing(noteRef) {
    const titleInput = document.getElementById('realtimeTitleInput')
    const contentInput = document.getElementById('realtimeContentInput')
    const saveStatus = document.getElementById('saveStatus')
    
    let saveTimeout
    
    function showSaving() {
        saveStatus.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Saving...</span>'
    }
    
    function showSaved() {
        saveStatus.innerHTML = '<i class="fas fa-check"></i><span>Saved</span>'
    }
    
    function saveChanges() {
        showSaving()
        clearTimeout(saveTimeout)
        
        saveTimeout = setTimeout(async () => {
            try {
                await window.database.ref(noteRef).update({
                    title: titleInput.value,
                    content: contentInput.value,
                    updatedAt: Date.now()
                })
                showSaved()
            } catch (error) {
                console.error('Error saving:', error)
                saveStatus.innerHTML = '<i class="fas fa-exclamation-triangle"></i><span>Error</span>'
            }
        }, 1000)
    }
    
    // Listen for changes
    titleInput.addEventListener('input', saveChanges)
    contentInput.addEventListener('input', saveChanges)
    
    // Listen for remote changes
    const remoteRef = window.database.ref(noteRef)
    remoteRef.on('value', (snapshot) => {
        const note = snapshot.val()
        if (note && document.activeElement !== titleInput && document.activeElement !== contentInput) {
            titleInput.value = note.title || ''
            contentInput.value = note.content || ''
        }
    })
    
    // Store listener for cleanup
    realtimeListeners.set(noteRef, remoteRef)
}

async function joinEditingSession(noteId) {
    const sessionRef = window.database.ref(`editingSessions/${noteId}/${currentUser.uid}`)
    
    // Add user to session
    await sessionRef.set({
        username: currentUser.displayName || currentUser.email.split('@')[0],
        joinedAt: Date.now()
    })
    
    // Listen for other users
    const allUsersRef = window.database.ref(`editingSessions/${noteId}`)
    allUsersRef.on('value', (snapshot) => {
        const users = snapshot.val() || {}
        updateActiveUsers(users)
    })
    
    // Remove user when leaving
    sessionRef.onDisconnect().remove()
}

function updateActiveUsers(users) {
    const container = document.getElementById('activeUsers')
    const otherUsers = Object.values(users).filter(user => user.username !== (currentUser.displayName || currentUser.email.split('@')[0]))
    
    if (otherUsers.length === 0) {
        container.innerHTML = ''
        return
    }
    
    container.innerHTML = otherUsers.map(user => `
        <div class="active-user">
            <i class="fas fa-circle"></i>
            <span>${user.username}</span>
        </div>
    `).join('')
}

// Utility functions
function formatDate(timestamp) {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

// Setup username for new users
async function setupUsername() {
    if (!currentUser) return
    
    try {
        const userRef = window.database.ref(`users/${currentUser.uid}`)
        const snapshot = await userRef.once('value')
        const userData = snapshot.val()
        
        if (!userData.username) {
            // Generate username from email
            let baseUsername = currentUser.email.split('@')[0].toLowerCase()
            let username = baseUsername
            let counter = 1
            
            // Check if username exists
            while (true) {
                const usernameRef = window.database.ref('users')
                const usernameSnapshot = await usernameRef.orderByChild('username').equalTo(username).once('value')
                
                if (!usernameSnapshot.exists()) {
                    break
                }
                
                username = `${baseUsername}${counter}`
                counter++
            }
            
            // Save username
            await userRef.update({ username })
            showToast(`Username set to: ${username}`)
        }
    } catch (error) {
        console.error('Error setting up username:', error)
    }
}

// Event listeners
function setupEventListeners() {
    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal')
            modal.classList.remove('open')
            
            // Cleanup real-time listeners
            if (modal.id === 'realtimeEditorModal') {
                realtimeListeners.forEach((listener, ref) => {
                    window.database.ref(ref).off('value', listener)
                })
                realtimeListeners.clear()
                
                if (currentEditingNote) {
                    window.database.ref(`editingSessions/${currentEditingNote.id}/${currentUser.uid}`).remove()
                }
            }
        })
    })
    
    // Cancel buttons
    document.getElementById('cancelShareBtn').addEventListener('click', () => {
        document.getElementById('shareModal').classList.remove('open')
    })
    
    // Settings button
    document.getElementById('settingsBtn').addEventListener('click', () => {
        window.location.href = 'index.html'
    })
}

// Global functions for HTML onclick handlers
window.viewSharedNote = viewSharedNote
window.editSharedNote = editSharedNote
window.shareNote = shareNote
window.acceptInvite = acceptInvite
window.declineInvite = declineInvite
window.selectUser = selectUser

// Initialize page
async function init() {
    await waitForFirebase()
    
    // Check authentication
    window.auth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUser = user
            await setupUsername()
            await loadSharedData()
            renderCurrentTab()
        } else {
            // Redirect to login
            window.location.href = 'in.html'
        }
    })
    
    initSearch()
    initTabs()
    setupEventListeners()
}

document.addEventListener('DOMContentLoaded', init)