// Smart Book Tablet - Notes App Logic
// Complete Apple Notes clone functionality

class NotesApp {
    constructor() {
        this.currentSubject = 'all';
        this.currentNote = null;
        this.subjects = [];
        this.notes = [];
        this.isDrawingMode = false;
        this.drawingTool = 'pen';
        this.drawingColor = '#000000';
        this.brushSize = 3;
        this.canvas = null;
        this.ctx = null;
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.undoStack = [];
        this.redoStack = [];
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupCanvas();
        this.setupEventListeners();
        this.renderSubjects();
        this.renderNotes();
        this.showEmptyEditor();
        
        console.log('📝 Notes App initialized');
    }

    // Data Management
    loadData() {
        this.subjects = storage.get('subjects', ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History']);
        this.notes = storage.get('notes', []);
        
        // Create sample notes if none exist
        if (this.notes.length === 0) {
            this.createSampleNotes();
        }
    }

    saveData() {
        storage.set('subjects', this.subjects);
        storage.set('notes', this.notes);
    }

    createSampleNotes() {
        const sampleNotes = [
            {
                id: Date.now(),
                title: 'Welcome to Smart Book',
                content: 'This is your first note! Start writing your thoughts here.',
                subject: 'Mathematics',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                drawing: null
            }
        ];
        
        this.notes = sampleNotes;
        this.saveData();
    }

    // Subject Management
    renderSubjects() {
        const subjectsList = document.getElementById('subjectsList');
        if (!subjectsList) return;

        const allNotesCount = this.notes.length;
        
        let html = `
            <div class="subject-item ${this.currentSubject === 'all' ? 'active' : ''}" onclick="selectSubject('all')">
                <span class="subject-name">All Notes</span>
                <span class="notes-count">${allNotesCount}</span>
            </div>
        `;

        this.subjects.forEach(subject => {
            const notesCount = this.notes.filter(note => note.subject === subject).length;
            html += `
                <div class="subject-item ${this.currentSubject === subject ? 'active' : ''}" onclick="selectSubject('${subject}')">
                    <span class="subject-name">${subject}</span>
                    <span class="notes-count">${notesCount}</span>
                </div>
            `;
        });

        subjectsList.innerHTML = html;
    }

    // Notes Management
    renderNotes() {
        const notesGrid = document.getElementById('notesGrid');
        const emptyState = document.getElementById('emptyState');
        const currentSubjectEl = document.getElementById('currentSubject');
        
        if (!notesGrid || !emptyState) return;

        // Update current subject title
        if (currentSubjectEl) {
            currentSubjectEl.textContent = this.currentSubject === 'all' ? 'All Notes' : this.currentSubject;
        }

        // Filter notes by subject
        let filteredNotes = this.currentSubject === 'all' 
            ? this.notes 
            : this.notes.filter(note => note.subject === this.currentSubject);

        // Sort by updated date
        filteredNotes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        if (filteredNotes.length === 0) {
            notesGrid.style.display = 'none';
            emptyState.style.display = 'flex';
            return;
        }

        notesGrid.style.display = 'block';
        emptyState.style.display = 'none';

        let html = '';
        filteredNotes.forEach(note => {
            const preview = this.getTextPreview(note.content);
            const dateStr = this.formatDate(note.updatedAt);
            
            html += `
                <div class="note-card ${this.currentNote && this.currentNote.id === note.id ? 'active' : ''}" 
                     onclick="selectNote('${note.id}')">
                    <div class="note-title">${note.title || 'Untitled'}</div>
                    <div class="note-preview">${preview}</div>
                    <div class="note-meta">
                        <span>${note.subject}</span>
                        <span>${dateStr}</span>
                    </div>
                </div>
            `;
        });

        notesGrid.innerHTML = html;
    }

    getTextPreview(content) {
        if (!content) return 'No additional text';
        
        // Remove HTML tags and get first 100 characters
        const textContent = content.replace(/<[^>]*>/g, '').trim();
        return textContent.length > 100 ? textContent.substring(0, 100) + '...' : textContent;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Today';
        if (diffDays === 2) return 'Yesterday';
        if (diffDays <= 7) return `${diffDays - 1} days ago`;
        
        return date.toLocaleDateString();
    }

    // Editor Management
    showEditor() {
        document.getElementById('editorEmpty').style.display = 'none';
        document.getElementById('textEditor').style.display = 'flex';
    }

    showEmptyEditor() {
        document.getElementById('editorEmpty').style.display = 'flex';
        document.getElementById('textEditor').style.display = 'none';
        document.getElementById('drawingContainer').style.display = 'none';
    }

    loadNoteIntoEditor(note) {
        if (!note) return;

        this.showEditor();
        
        const titleInput = document.getElementById('noteTitle');
        const contentEditor = document.getElementById('editorContent');
        
        if (titleInput) titleInput.value = note.title || '';
        if (contentEditor) contentEditor.innerHTML = note.content || '';

        // Load drawing if exists
        if (note.drawing && this.ctx) {
            const img = new Image();
            img.onload = () => {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.drawImage(img, 0, 0);
            };
            img.src = note.drawing;
        }
    }

    saveCurrentNote() {
        if (!this.currentNote) return;

        const titleInput = document.getElementById('noteTitle');
        const contentEditor = document.getElementById('editorContent');
        
        if (titleInput) this.currentNote.title = titleInput.value;
        if (contentEditor) this.currentNote.content = contentEditor.innerHTML;
        
        // Save drawing
        if (this.canvas) {
            this.currentNote.drawing = this.canvas.toDataURL();
        }
        
        this.currentNote.updatedAt = new Date().toISOString();
        
        // Update in notes array
        const index = this.notes.findIndex(n => n.id === this.currentNote.id);
        if (index !== -1) {
            this.notes[index] = { ...this.currentNote };
        }
        
        this.saveData();
        this.renderNotes();
        
        // Auto-save feedback
        haptic.light();
    }

    // Canvas Drawing Setup
    setupCanvas() {
        this.canvas = document.getElementById('drawingCanvas');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Drawing event listeners
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());

        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startDrawing(e.touches[0]);
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.draw(e.touches[0]);
        });
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.stopDrawing();
        });
    }

    resizeCanvas() {
        if (!this.canvas) return;
        
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * window.devicePixelRatio;
        this.canvas.height = rect.height * window.devicePixelRatio;
        
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        // Restore drawing settings
        this.updateDrawingSettings();
    }

    updateDrawingSettings() {
        if (!this.ctx) return;

        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.strokeStyle = this.drawingColor;
        this.ctx.lineWidth = this.brushSize;

        if (this.drawingTool === 'highlighter') {
            this.ctx.globalCompositeOperation = 'multiply';
            this.ctx.globalAlpha = 0.3;
        } else if (this.drawingTool === 'eraser') {
            this.ctx.globalCompositeOperation = 'destination-out';
            this.ctx.globalAlpha = 1;
        } else {
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.globalAlpha = 1;
        }
    }

    startDrawing(e) {
        if (!this.ctx) return;
        
        this.isDrawing = true;
        this.saveUndoState();
        
        const rect = this.canvas.getBoundingClientRect();
        this.lastX = (e.clientX - rect.left) * window.devicePixelRatio;
        this.lastY = (e.clientY - rect.top) * window.devicePixelRatio;
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
    }

    draw(e) {
        if (!this.isDrawing || !this.ctx) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const currentX = (e.clientX - rect.left) * window.devicePixelRatio;
        const currentY = (e.clientY - rect.top) * window.devicePixelRatio;
        
        this.ctx.lineTo(currentX, currentY);
        this.ctx.stroke();
        
        this.lastX = currentX;
        this.lastY = currentY;
    }

    stopDrawing() {
        if (!this.isDrawing) return;
        
        this.isDrawing = false;
        this.ctx.beginPath();
        
        // Auto-save after drawing
        setTimeout(() => {
            if (this.currentNote) {
                this.saveCurrentNote();
            }
        }, 500);
    }

    saveUndoState() {
        if (!this.canvas) return;
        
        this.undoStack.push(this.canvas.toDataURL());
        if (this.undoStack.length > 50) {
            this.undoStack.shift();
        }
        this.redoStack = [];
    }

    // Event Listeners
    setupEventListeners() {
        // Auto-save on text changes
        const titleInput = document.getElementById('noteTitle');
        const contentEditor = document.getElementById('editorContent');
        
        if (titleInput) {
            titleInput.addEventListener('input', SmartBookUtils.performance.debounce(() => {
                if (this.currentNote) {
                    this.saveCurrentNote();
                }
            }, 1000));
        }

        if (contentEditor) {
            contentEditor.addEventListener('input', SmartBookUtils.performance.debounce(() => {
                if (this.currentNote) {
                    this.saveCurrentNote();
                }
            }, 1000));

            // Handle paste events
            contentEditor.addEventListener('paste', (e) => {
                e.preventDefault();
                const text = e.clipboardData.getData('text/plain');
                document.execCommand('insertText', false, text);
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 's':
                        e.preventDefault();
                        if (this.currentNote) {
                            this.saveCurrentNote();
                            SmartBookUtils.ui.toast('Note saved!', 'success');
                        }
                        break;
                    case 'n':
                        e.preventDefault();
                        createNewNote();
                        break;
                    case 'z':
                        if (!e.shiftKey) {
                            e.preventDefault();
                            undoDrawing();
                        } else {
                            e.preventDefault();
                            redoDrawing();
                        }
                        break;
                }
            }
        });
    }
}

// Global Functions (called from HTML)
let notesApp;

function goHome() {
    haptic.medium();
    window.location.href = '../index.html';
}

function selectSubject(subject) {
    haptic.light();
    notesApp.currentSubject = subject;
    notesApp.renderSubjects();
    notesApp.renderNotes();
    notesApp.showEmptyEditor();
    notesApp.currentNote = null;
}

function selectNote(noteId) {
    haptic.light();
    const note = notesApp.notes.find(n => n.id == noteId);
    if (note) {
        notesApp.currentNote = note;
        notesApp.loadNoteIntoEditor(note);
        notesApp.renderNotes();
    }
}

function createNewNote() {
    haptic.medium();
    
    const newNote = {
        id: Date.now(),
        title: '',
        content: '',
        subject: notesApp.currentSubject === 'all' ? 'General' : notesApp.currentSubject,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        drawing: null
    };
    
    notesApp.notes.unshift(newNote);
    notesApp.currentNote = newNote;
    notesApp.saveData();
    notesApp.renderNotes();
    notesApp.loadNoteIntoEditor(newNote);
    
    // Focus on title
    setTimeout(() => {
        const titleInput = document.getElementById('noteTitle');
        if (titleInput) titleInput.focus();
    }, 100);
}

function showAddSubjectModal() {
    haptic.light();
    const modal = document.getElementById('addSubjectModal');
    if (modal) {
        modal.classList.add('show');
        const input = document.getElementById('subjectNameInput');
        if (input) {
            input.value = '';
            setTimeout(() => input.focus(), 100);
        }
    }
}

function hideAddSubjectModal() {
    const modal = document.getElementById('addSubjectModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

function addSubject() {
    const input = document.getElementById('subjectNameInput');
    const subjectName = input.value.trim();
    
    if (subjectName && !notesApp.subjects.includes(subjectName)) {
        notesApp.subjects.push(subjectName);
        notesApp.saveData();
        notesApp.renderSubjects();
        hideAddSubjectModal();
        haptic.medium();
        SmartBookUtils.ui.toast('Subject added!', 'success');
    }
}

// Text Formatting Functions
function formatText(command) {
    haptic.light();
    
    const editor = document.getElementById('editorContent');
    if (!editor) return;
    
    editor.focus();
    
    switch(command) {
        case 'bold':
            document.execCommand('bold');
            break;
        case 'italic':
            document.execCommand('italic');
            break;
        case 'underline':
            document.execCommand('underline');
            break;
        case 'heading1':
            document.execCommand('formatBlock', false, 'h1');
            break;
        case 'heading2':
            document.execCommand('formatBlock', false, 'h2');
            break;
        case 'heading3':
            document.execCommand('formatBlock', false, 'h3');
            break;
        case 'bulletList':
            document.execCommand('insertUnorderedList');
            break;
        case 'numberList':
            document.execCommand('insertOrderedList');
            break;
        case 'checklist':
            // Simple checklist implementation
            const selection = window.getSelection();
            const range = selection.getRangeAt(0);
            const checkbox = document.createElement('span');
            checkbox.innerHTML = '☐ ';
            checkbox.style.cursor = 'pointer';
            checkbox.onclick = function() {
                this.innerHTML = this.innerHTML === '☐ ' ? '☑ ' : '☐ ';
            };
            range.insertNode(checkbox);
            break;
    }
    
    // Auto-save after formatting
    setTimeout(() => {
        if (notesApp.currentNote) {
            notesApp.saveCurrentNote();
        }
    }, 100);
}

// Drawing Functions
function toggleDrawingMode() {
    haptic.medium();
    
    notesApp.isDrawingMode = !notesApp.isDrawingMode;
    
    const textEditor = document.getElementById('textEditor');
    const drawingContainer = document.getElementById('drawingContainer');
    const drawModeBtn = document.getElementById('drawModeBtn');
    
    if (notesApp.isDrawingMode) {
        textEditor.style.display = 'none';
        drawingContainer.classList.add('active');
        drawModeBtn.style.background = 'var(--ios-blue)';
        drawModeBtn.style.color = 'white';
    } else {
        textEditor.style.display = 'flex';
        drawingContainer.classList.remove('active');
        drawModeBtn.style.background = '';
        drawModeBtn.style.color = '';
    }
}

function selectTool(tool) {
    haptic.light();
    
    notesApp.drawingTool = tool;
    notesApp.updateDrawingSettings();
    
    // Update UI
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tool="${tool}"]`).classList.add('active');
}

function selectColor(color) {
    haptic.light();
    
    notesApp.drawingColor = color;
    notesApp.updateDrawingSettings();
    
    // Update UI
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('active');
    });
    document.querySelector(`[data-color="${color}"]`).classList.add('active');
}

function updateBrushSize(size) {
    notesApp.brushSize = parseInt(size);
    notesApp.updateDrawingSettings();
    
    const sizeLabel = document.getElementById('sizeLabel');
    if (sizeLabel) {
        sizeLabel.textContent = size + 'px';
    }
}

function undoDrawing() {
    if (notesApp.undoStack.length === 0) return;
    
    haptic.light();
    notesApp.redoStack.push(notesApp.canvas.toDataURL());
    
    const lastState = notesApp.undoStack.pop();
    const img = new Image();
    img.onload = () => {
        notesApp.ctx.clearRect(0, 0, notesApp.canvas.width, notesApp.canvas.height);
        notesApp.ctx.drawImage(img, 0, 0);
    };
    img.src = lastState;
}

function redoDrawing() {
    if (notesApp.redoStack.length === 0) return;
    
    haptic.light();
    notesApp.undoStack.push(notesApp.canvas.toDataURL());
    
    const nextState = notesApp.redoStack.pop();
    const img = new Image();
    img.onload = () => {
        notesApp.ctx.clearRect(0, 0, notesApp.canvas.width, notesApp.canvas.height);
        notesApp.ctx.drawImage(img, 0, 0);
    };
    img.src = nextState;
}

function clearCanvas() {
    if (!notesApp.ctx) return;
    
    haptic.heavy();
    notesApp.saveUndoState();
    notesApp.ctx.clearRect(0, 0, notesApp.canvas.width, notesApp.canvas.height);
    
    // Auto-save
    setTimeout(() => {
        if (notesApp.currentNote) {
            notesApp.saveCurrentNote();
        }
    }, 100);
}

function toggleSearch() {
    // TODO: Implement search functionality
    haptic.light();
    SmartBookUtils.ui.toast('Search feature coming soon!', 'info');
}

function toggleMenu() {
    // TODO: Implement menu functionality  
    haptic.light();
    SmartBookUtils.ui.toast('Menu feature coming soon!', 'info');
}

// Initialize Notes App
document.addEventListener('DOMContentLoaded', () => {
    notesApp = new NotesApp();
    console.log('📝 Notes App ready');
});

// Handle modal clicks
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        hideAddSubjectModal();
    }
});

// Handle Enter key in subject input
document.addEventListener('keydown', (e) => {
    if (e.target.id === 'subjectNameInput' && e.key === 'Enter') {
        addSubject();
    }
});
