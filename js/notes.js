// Smart Book Tablet - Notes App Logic - COMPLETELY FIXED
class NotesApp {
    constructor() {
        this.currentSubject = 'all';
        this.currentNote = null;
        this.subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History'];
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

    loadData() {
        // Load from localStorage properly
        const savedSubjects = localStorage.getItem('smartbook_subjects');
        const savedNotes = localStorage.getItem('smartbook_notes');
        
        if (savedSubjects) {
            this.subjects = JSON.parse(savedSubjects);
        }
        
        if (savedNotes) {
            this.notes = JSON.parse(savedNotes);
        }
        
        if (this.notes.length === 0) {
            this.createSampleNote();
        }
    }

    saveData() {
        localStorage.setItem('smartbook_subjects', JSON.stringify(this.subjects));
        localStorage.setItem('smartbook_notes', JSON.stringify(this.notes));
        console.log('💾 Data saved successfully');
    }

    createSampleNote() {
        const sampleNote = {
            id: 'sample_' + Date.now(),
            title: 'Welcome to Smart Book',
            content: 'This is your first note! You can write here and draw too.',
            subject: 'Mathematics',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            drawing: null
        };
        
        this.notes.push(sampleNote);
        this.saveData();
    }

    renderSubjects() {
        const subjectsList = document.getElementById('subjectsList');
        if (!subjectsList) return;

        let html = `
            <div class="subject-item ${this.currentSubject === 'all' ? 'active' : ''}" onclick="selectSubject('all')">
                <span class="subject-name">All Notes</span>
                <span class="notes-count">${this.notes.length}</span>
            </div>
        `;

        this.subjects.forEach(subject => {
            const count = this.notes.filter(note => note.subject === subject).length;
            html += `
                <div class="subject-item ${this.currentSubject === subject ? 'active' : ''}" onclick="selectSubject('${subject}')">
                    <span class="subject-name">${subject}</span>
                    <span class="notes-count">${count}</span>
                </div>
            `;
        });

        subjectsList.innerHTML = html;
    }

    renderNotes() {
        const notesGrid = document.getElementById('notesGrid');
        const emptyState = document.getElementById('emptyState');
        const currentSubjectEl = document.getElementById('currentSubject');
        
        if (!notesGrid) return;

        if (currentSubjectEl) {
            currentSubjectEl.textContent = this.currentSubject === 'all' ? 'All Notes' : this.currentSubject;
        }

        let filteredNotes = this.currentSubject === 'all' 
            ? this.notes 
            : this.notes.filter(note => note.subject === this.currentSubject);

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
            const preview = note.content.replace(/<[^>]*>/g, '').substring(0, 100) + '...';
            const date = new Date(note.updatedAt).toLocaleDateString();
            
            html += `
                <div class="note-card ${this.currentNote && this.currentNote.id === note.id ? 'active' : ''}" 
                     onclick="selectNote('${note.id}')">
                    <div class="note-title">${note.title || 'Untitled'}</div>
                    <div class="note-preview">${preview}</div>
                    <div class="note-meta">
                        <span>${note.subject}</span>
                        <span>${date}</span>
                    </div>
                </div>
            `;
        });

        notesGrid.innerHTML = html;
    }

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

        if (note.drawing && this.ctx) {
            const img = new Image();
            img.onload = () => {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.drawImage(img, 0, 0);
            };
            img.src = note.drawing;
        } else if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    saveCurrentNote() {
        if (!this.currentNote) return;

        const titleInput = document.getElementById('noteTitle');
        const contentEditor = document.getElementById('editorContent');
        
        if (titleInput) this.currentNote.title = titleInput.value;
        if (contentEditor) this.currentNote.content = contentEditor.innerHTML;
        
        if (this.canvas) {
            this.currentNote.drawing = this.canvas.toDataURL();
        }
        
        this.currentNote.updatedAt = new Date().toISOString();
        
        const index = this.notes.findIndex(n => n.id === this.currentNote.id);
        if (index !== -1) {
            this.notes[index] = { ...this.currentNote };
        }
        
        this.saveData();
        this.renderNotes();
        console.log('💾 Note saved:', this.currentNote.title);
    }

    setupCanvas() {
        this.canvas = document.getElementById('drawingCanvas');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        
        // Touch events
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this.startDrawing({
                clientX: touch.clientX,
                clientY: touch.clientY
            });
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.draw({
                clientX: touch.clientX,
                clientY: touch.clientY
            });
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.stopDrawing();
        });
    }

    resizeCanvas() {
        if (!this.canvas) return;
        
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
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
            this.ctx.globalAlpha = 0.4;
            this.ctx.lineWidth = this.brushSize * 3;
        } else if (this.drawingTool === 'eraser') {
            this.ctx.globalCompositeOperation = 'destination-out';
            this.ctx.globalAlpha = 1;
            this.ctx.lineWidth = this.brushSize * 2;
        } else {
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.globalAlpha = 1;
        }
    }

    startDrawing(e) {
        if (!this.ctx) return;
        
        this.isDrawing = true;
        this.undoStack.push(this.canvas.toDataURL());
        
        const rect = this.canvas.getBoundingClientRect();
        this.lastX = e.clientX - rect.left;
        this.lastY = e.clientY - rect.top;
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
    }

    draw(e) {
        if (!this.isDrawing || !this.ctx) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        
        this.ctx.lineTo(currentX, currentY);
        this.ctx.stroke();
        
        this.lastX = currentX;
        this.lastY = currentY;
    }

    stopDrawing() {
        if (!this.isDrawing) return;
        this.isDrawing = false;
        this.ctx.beginPath();
        
        setTimeout(() => {
            if (this.currentNote) {
                this.saveCurrentNote();
            }
        }, 500);
    }

    setupEventListeners() {
        const titleInput = document.getElementById('noteTitle');
        const contentEditor = document.getElementById('editorContent');
        
        if (titleInput) {
            titleInput.addEventListener('input', () => {
                if (this.currentNote) {
                    setTimeout(() => this.saveCurrentNote(), 1000);
                }
            });
        }

        if (contentEditor) {
            contentEditor.addEventListener('input', () => {
                if (this.currentNote) {
                    setTimeout(() => this.saveCurrentNote(), 1000);
                }
            });
        }

        window.addEventListener('resize', () => this.resizeCanvas());
    }
}

let notesApp;

// FIXED GLOBAL FUNCTIONS
function goHome() {
    window.location.href = '../index.html';
}

function selectSubject(subject) {
    notesApp.currentSubject = subject;
    notesApp.renderSubjects();
    notesApp.renderNotes();
    notesApp.showEmptyEditor();
    notesApp.currentNote = null;
    console.log('Selected subject:', subject);
}

function selectNote(noteId) {
    const note = notesApp.notes.find(n => n.id === noteId);
    if (note) {
        notesApp.currentNote = note;
        notesApp.loadNoteIntoEditor(note);
        notesApp.renderNotes();
        console.log('Opened note:', note.title);
    }
}

function createNewNote() {
    const currentSubject = notesApp.currentSubject === 'all' ? 'General' : notesApp.currentSubject;
    
    const newNote = {
        id: 'note_' + Date.now(),
        title: 'New Note',
        content: '',
        subject: currentSubject,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        drawing: null
    };
    
    notesApp.notes.unshift(newNote);
    notesApp.currentNote = newNote;
    notesApp.saveData();
    notesApp.renderNotes();
    notesApp.loadNoteIntoEditor(newNote);
    
    setTimeout(() => {
        const titleInput = document.getElementById('noteTitle');
        if (titleInput) {
            titleInput.focus();
            titleInput.select();
        }
    }, 100);
    
    console.log('Created new note');
}

function showAddSubjectModal() {
    const modal = document.getElementById('addSubjectModal');
    if (modal) {
        modal.style.display = 'flex';
        const input = document.getElementById('subjectNameInput');
        if (input) {
            input.value = '';
            input.focus();
        }
    }
}

function hideAddSubjectModal() {
    const modal = document.getElementById('addSubjectModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function addSubject() {
    const input = document.getElementById('subjectNameInput');
    const subjectName = input ? input.value.trim() : '';
    
    if (subjectName && !notesApp.subjects.includes(subjectName)) {
        notesApp.subjects.push(subjectName);
        notesApp.saveData();
        notesApp.renderSubjects();
        hideAddSubjectModal();
        console.log('Added subject:', subjectName);
        alert('Subject added successfully!');
    } else if (notesApp.subjects.includes(subjectName)) {
        alert('Subject already exists!');
    } else {
        alert('Please enter a subject name!');
    }
}

function formatText(command) {
    const editor = document.getElementById('editorContent');
    if (!editor) return;
    
    editor.focus();
    document.execCommand(command);
    
    setTimeout(() => {
        if (notesApp.currentNote) {
            notesApp.saveCurrentNote();
        }
    }, 100);
}

function toggleDrawingMode() {
    notesApp.isDrawingMode = !notesApp.isDrawingMode;
    
    const textEditor = document.getElementById('textEditor');
    const drawingContainer = document.getElementById('drawingContainer');
    const drawModeBtn = document.getElementById('drawModeBtn');
    
    if (notesApp.isDrawingMode) {
        textEditor.style.display = 'none';
        drawingContainer.style.display = 'flex';
        if (drawModeBtn) {
            drawModeBtn.style.background = '#007AFF';
            drawModeBtn.style.color = 'white';
        }
        setTimeout(() => notesApp.resizeCanvas(), 100);
    } else {
        textEditor.style.display = 'flex';
        drawingContainer.style.display = 'none';
        if (drawModeBtn) {
            drawModeBtn.style.background = '';
            drawModeBtn.style.color = '';
        }
    }
}

function selectTool(tool) {
    notesApp.drawingTool = tool;
    notesApp.updateDrawingSettings();
    
    document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
    const toolBtn = document.querySelector(`[data-tool="${tool}"]`);
    if (toolBtn) toolBtn.classList.add('active');
}

function selectColor(color) {
    notesApp.drawingColor = color;
    notesApp.updateDrawingSettings();
    
    document.querySelectorAll('.color-option').forEach(option => option.classList.remove('active'));
    const colorOption = document.querySelector(`[data-color="${color}"]`);
    if (colorOption) colorOption.classList.add('active');
}

function updateBrushSize(size) {
    notesApp.brushSize = parseInt(size);
    notesApp.updateDrawingSettings();
    
    const sizeLabel = document.getElementById('sizeLabel');
    if (sizeLabel) sizeLabel.textContent = size + 'px';
}

function undoDrawing() {
    if (notesApp.undoStack.length === 0) return;
    
    const lastState = notesApp.undoStack.pop();
    const img = new Image();
    img.onload = () => {
        notesApp.ctx.clearRect(0, 0, notesApp.canvas.width, notesApp.canvas.height);
        notesApp.ctx.drawImage(img, 0, 0);
    };
    img.src = lastState;
}

function clearCanvas() {
    if (!notesApp.ctx) return;
    
    notesApp.undoStack.push(notesApp.canvas.toDataURL());
    notesApp.ctx.clearRect(0, 0, notesApp.canvas.width, notesApp.canvas.height);
    
    setTimeout(() => {
        if (notesApp.currentNote) {
            notesApp.saveCurrentNote();
        }
    }, 100);
}

function toggleSearch() {
    alert('Search feature coming soon!');
}

function toggleMenu() {
    alert('Menu feature coming soon!');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    notesApp = new NotesApp();
    console.log('📝 Notes App ready');
});

// Modal handling
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        hideAddSubjectModal();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.target.id === 'subjectNameInput' && e.key === 'Enter') {
        addSubject();
    }
});
