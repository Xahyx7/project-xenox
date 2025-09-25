// Smart Book Tablet - Notes App Logic - FINAL FIXED VERSION
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
        console.log('🚀 Initializing Notes App...');
        this.loadData();
        this.setupCanvas();
        this.setupEventListeners();  
        this.renderSubjects();
        this.renderNotes();
        this.showEmptyEditor();
        console.log('✅ Notes App initialized successfully');
    }

    loadData() {
        try {
            const savedSubjects = localStorage.getItem('smartbook_subjects');
            const savedNotes = localStorage.getItem('smartbook_notes');
            
            if (savedSubjects) {
                this.subjects = JSON.parse(savedSubjects);
                console.log('📁 Loaded subjects:', this.subjects);
            }
            
            if (savedNotes) {
                this.notes = JSON.parse(savedNotes);
                console.log('📝 Loaded notes:', this.notes.length, 'notes');
            }
            
            if (this.notes.length === 0) {
                this.createSampleNote();
            }
        } catch (error) {
            console.error('❌ Error loading data:', error);
            this.subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History'];
            this.notes = [];
            this.createSampleNote();
        }
    }

    saveData() {
        try {
            localStorage.setItem('smartbook_subjects', JSON.stringify(this.subjects));
            localStorage.setItem('smartbook_notes', JSON.stringify(this.notes));
            console.log('💾 Data saved successfully');
        } catch (error) {
            console.error('❌ Error saving data:', error);
        }
    }

    createSampleNote() {
        const sampleNote = {
            id: 'sample_' + Date.now(),
            title: 'Welcome to Smart Book',
            content: 'This is your first note! You can write here and draw too. Try the drawing mode!',
            subject: 'Mathematics',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            drawing: null
        };
        
        this.notes.push(sampleNote);
        this.saveData();
        console.log('📝 Created sample note');
    }

    renderSubjects() {
        const subjectsList = document.getElementById('subjectsList');
        if (!subjectsList) {
            console.error('❌ subjectsList element not found');
            return;
        }

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
        console.log('📁 Subjects rendered');
    }

    renderNotes() {
        const notesGrid = document.getElementById('notesGrid');
        const emptyState = document.getElementById('emptyState');
        const currentSubjectEl = document.getElementById('currentSubject');
        
        if (!notesGrid) {
            console.error('❌ notesGrid element not found');
            return;
        }

        if (currentSubjectEl) {
            currentSubjectEl.textContent = this.currentSubject === 'all' ? 'All Notes' : this.currentSubject;
        }

        let filteredNotes = this.currentSubject === 'all' 
            ? this.notes 
            : this.notes.filter(note => note.subject === this.currentSubject);

        filteredNotes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        if (filteredNotes.length === 0) {
            notesGrid.style.display = 'none';
            if (emptyState) emptyState.style.display = 'flex';
            return;
        }

        notesGrid.style.display = 'block';
        if (emptyState) emptyState.style.display = 'none';

        let html = '';
        filteredNotes.forEach(note => {
            const preview = note.content.replace(/<[^>]*>/g, '').substring(0, 100);
            const date = new Date(note.updatedAt).toLocaleDateString();
            
            html += `
                <div class="note-card ${this.currentNote && this.currentNote.id === note.id ? 'active' : ''}" 
                     onclick="selectNote('${note.id}')">
                    <div class="note-title">${note.title || 'Untitled'}</div>
                    <div class="note-preview">${preview}${preview.length >= 100 ? '...' : ''}</div>
                    <div class="note-meta">
                        <span>${note.subject}</span>
                        <span>${date}</span>
                    </div>
                </div>
            `;
        });

        notesGrid.innerHTML = html;
        console.log('📝 Notes rendered:', filteredNotes.length, 'notes');
    }

    showEditor() {
        const editorEmpty = document.getElementById('editorEmpty');
        const textEditor = document.getElementById('textEditor');
        
        if (editorEmpty) editorEmpty.style.display = 'none';
        if (textEditor) textEditor.style.display = 'flex';
    }

    showEmptyEditor() {
        const editorEmpty = document.getElementById('editorEmpty');
        const textEditor = document.getElementById('textEditor');
        const drawingContainer = document.getElementById('drawingContainer');
        
        if (editorEmpty) editorEmpty.style.display = 'flex';
        if (textEditor) textEditor.style.display = 'none';
        if (drawingContainer) drawingContainer.style.display = 'none';
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
        
        console.log('📖 Note loaded into editor:', note.title);
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
        if (!this.canvas) {
            console.log('⚠️ Drawing canvas not found');
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        console.log('🎨 Setting up canvas events...');

        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => {
            console.log('🖱️ Mouse down');
            this.startDrawing(e);
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isDrawing) {
                this.draw(e);
            }
        });
        
        this.canvas.addEventListener('mouseup', () => {
            console.log('🖱️ Mouse up');
            this.stopDrawing();
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            this.stopDrawing();
        });
        
        // Touch events for mobile/stylus
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            console.log('👆 Touch start');
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this.startDrawing({
                clientX: touch.clientX,
                clientY: touch.clientY
            });
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.isDrawing) {
                const touch = e.touches[0];
                this.draw({
                    clientX: touch.clientX,
                    clientY: touch.clientY
                });
            }
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            console.log('👆 Touch end');
            this.stopDrawing();
        });

        console.log('✅ Canvas setup complete');
    }

    resizeCanvas() {
        if (!this.canvas) return;
        
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.updateDrawingSettings();
        console.log('📐 Canvas resized:', rect.width, 'x', rect.height);
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
        
        console.log('🎨 Drawing settings updated:', this.drawingTool, this.drawingColor, this.brushSize + 'px');
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
        
        console.log('✏️ Started drawing at:', this.lastX, this.lastY);
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
        
        console.log('✅ Stopped drawing');
        
        // Auto-save after drawing
        setTimeout(() => {
            if (this.currentNote) {
                this.saveCurrentNote();
            }
        }, 500);
    }

    setupEventListeners() {
        console.log('🎧 Setting up event listeners...');
        
        const titleInput = document.getElementById('noteTitle');
        const contentEditor = document.getElementById('editorContent');
        
        if (titleInput) {
            titleInput.addEventListener('input', () => {
                if (this.currentNote) {
                    setTimeout(() => this.saveCurrentNote(), 1000);
                }
            });
            console.log('✅ Title input listener added');
        }

        if (contentEditor) {
            contentEditor.addEventListener('input', () => {
                if (this.currentNote) {
                    setTimeout(() => this.saveCurrentNote(), 1000);
                }
            });
            console.log('✅ Content editor listener added');
        }

        window.addEventListener('resize', () => this.resizeCanvas());
        console.log('✅ All event listeners setup complete');
    }
}

let notesApp;

// GLOBAL FUNCTIONS - COMPLETELY FIXED
function goHome() {
    console.log('🏠 Going home...');
    window.location.href = '../index.html';
}

function selectSubject(subject) {
    console.log('📁 Selecting subject:', subject);
    notesApp.currentSubject = subject;
    notesApp.renderSubjects();
    notesApp.renderNotes();
    notesApp.showEmptyEditor();
    notesApp.currentNote = null;
}

function selectNote(noteId) {
    console.log('📝 Selecting note:', noteId);
    const note = notesApp.notes.find(n => n.id === noteId);
    if (note) {
        notesApp.currentNote = note;
        notesApp.loadNoteIntoEditor(note);
        notesApp.renderNotes();
    }
}

function createNewNote() {
    console.log('➕ Creating new note...');
    
    const currentSubject = notesApp.currentSubject === 'all' ? 'General' : notesApp.currentSubject;
    
    const newNote = {
        id: 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
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
    
    console.log('✅ New note created:', newNote.id);
}

function showAddSubjectModal() {
    console.log('➕ Showing add subject modal...');
    const modal = document.getElementById('addSubjectModal');
    if (modal) {
        modal.classList.add('show');
        const input = document.getElementById('subjectNameInput');
        if (input) {
            input.value = '';
            setTimeout(() => input.focus(), 100);
        }
        console.log('✅ Modal shown');
    } else {
        console.error('❌ Modal not found');
    }
}

function hideAddSubjectModal() {
    console.log('❌ Hiding add subject modal...');
    const modal = document.getElementById('addSubjectModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

function addSubject() {
    console.log('➕ Adding subject...');
    const input = document.getElementById('subjectNameInput');
    const subjectName = input ? input.value.trim() : '';
    
    console.log('Subject name entered:', subjectName);
    
    if (subjectName && !notesApp.subjects.includes(subjectName)) {
        notesApp.subjects.push(subjectName);
        notesApp.saveData();
        notesApp.renderSubjects();
        hideAddSubjectModal();
        console.log('✅ Subject added:', subjectName);
        alert('Subject "' + subjectName + '" added successfully!');
    } else if (notesApp.subjects.includes(subjectName)) {
        alert('Subject already exists!');
        console.log('⚠️ Subject already exists');
    } else {
        alert('Please enter a subject name!');
        console.log('⚠️ Empty subject name');
    }
}

function formatText(command) {
    console.log('📝 Formatting text:', command);
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
    console.log('🎨 Toggling drawing mode...');
    notesApp.isDrawingMode = !notesApp.isDrawingMode;
    
    const textEditor = document.getElementById('textEditor');
    const drawingContainer = document.getElementById('drawingContainer');
    const drawModeBtn = document.getElementById('drawModeBtn');
    
    if (notesApp.isDrawingMode) {
        if (textEditor) textEditor.style.display = 'none';
        if (drawingContainer) drawingContainer.style.display = 'flex';
        if (drawModeBtn) {
            drawModeBtn.style.background = '#007AFF';
            drawModeBtn.style.color = 'white';
        }
        setTimeout(() => {
            notesApp.resizeCanvas();
        }, 100);
        console.log('✅ Drawing mode ON');
    } else {
        if (textEditor) textEditor.style.display = 'flex';
        if (drawingContainer) drawingContainer.style.display = 'none';
        if (drawModeBtn) {
            drawModeBtn.style.background = '';
            drawModeBtn.style.color = '';
        }
        console.log('✅ Drawing mode OFF');
    }
}

function selectTool(tool) {
    console.log('🛠️ Selecting tool:', tool);
    notesApp.drawingTool = tool;
    notesApp.updateDrawingSettings();
    
    document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
    const toolBtn = document.querySelector(`[data-tool="${tool}"]`);
    if (toolBtn) toolBtn.classList.add('active');
}

function selectColor(color) {
    console.log('🎨 Selecting color:', color);
    notesApp.drawingColor = color;
    notesApp.updateDrawingSettings();
    
    document.querySelectorAll('.color-option').forEach(option => option.classList.remove('active'));
    const colorOption = document.querySelector(`[data-color="${color}"]`);
    if (colorOption) colorOption.classList.add('active');
}

function updateBrushSize(size) {
    console.log('📏 Updating brush size:', size);
    notesApp.brushSize = parseInt(size);
    notesApp.updateDrawingSettings();
    
    const sizeLabel = document.getElementById('sizeLabel');
    if (sizeLabel) sizeLabel.textContent = size + 'px';
}

function undoDrawing() {
    console.log('↶ Undoing drawing...');
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
    console.log('🗑️ Clearing canvas...');
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

// INITIALIZE - COMPLETELY FIXED
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM loaded, initializing Notes App...');
    notesApp = new NotesApp();
    
    // Test all buttons
    setTimeout(() => {
        console.log('🧪 Testing elements...');
        console.log('New Note Button:', document.querySelector('.new-note-btn') ? '✅' : '❌');
        console.log('Add Subject Button:', document.querySelector('.add-subject-btn') ? '✅' : '❌');
        console.log('Modal:', document.getElementById('addSubjectModal') ? '✅' : '❌');
        console.log('Canvas:', document.getElementById('drawingCanvas') ? '✅' : '❌');
    }, 1000);
});

// MODAL HANDLING - COMPLETELY FIXED
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        hideAddSubjectModal();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.target.id === 'subjectNameInput' && e.key === 'Enter') {
        e.preventDefault();
        addSubject();
    }
    
    if (e.key === 'Escape') {
        hideAddSubjectModal();
    }
});

console.log('📝 Notes app script loaded');
