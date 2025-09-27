// Smart Book Tablet - Notes App Complete JavaScript
// Professional Apple-style Notes with Flyout Sidebar

class NotesApp {
    constructor() {
        this.subjects = [];
        this.notes = [];
        this.currentNote = null;
        this.currentSubject = 'all';
        this.currentMode = 'draw';
        this.currentTool = 'pen';
        this.currentColor = '#000';
        this.brushSize = 3;
        this.canvas = null;
        this.ctx = null;
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.undoStack = [];
        this.sidebarCollapsed = false;
        this.init();
    }

    init() {
        this.loadData();
        this.setupCanvas();
        this.setupEventListeners();
        this.render();
        this.checkMobile();
        console.log('✅ Professional Notes App Ready');
    }

    checkMobile() {
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            this.sidebarCollapsed = true;
            document.getElementById('sidebar').classList.add('collapsed');
            document.getElementById('toggleIcon').textContent = '›';
        }

        window.addEventListener('resize', () => {
            setTimeout(() => this.resizeCanvas(), 300);
        });
    }

    loadData() {
        this.subjects = JSON.parse(localStorage.getItem('smartbook_subjects') || '["Mathematics", "Physics", "Chemistry", "Biology", "History", "English", "Geography"]');
        this.notes = JSON.parse(localStorage.getItem('smartbook_notes') || '[]');
        
        if (this.notes.length === 0) {
            this.createSampleNotes();
        }
    }

    createSampleNotes() {
        const sampleNotes = [
            {
                id: Date.now(),
                title: 'Welcome to Smart Notes',
                content: 'This is your professional note-taking app with Apple-style design! You can write text and draw with your finger, stylus, or mouse.',
                subject: 'Mathematics',
                created: new Date().toISOString(),
                updated: new Date().toISOString(),
                drawing: null
            },
            {
                id: Date.now() + 1,
                title: 'How to Use',
                content: '• Click subjects to see notes in flyout panel\n• Switch between Text and Draw modes\n• Use different drawing tools and colors\n• Everything saves automatically!',
                subject: 'Physics',
                created: new Date().toISOString(),
                updated: new Date().toISOString(),
                drawing: null
            }
        ];
        
        this.notes = sampleNotes;
        this.saveData();
    }

    saveData() {
        localStorage.setItem('smartbook_subjects', JSON.stringify(this.subjects));
        localStorage.setItem('smartbook_notes', JSON.stringify(this.notes));
        console.log('ߒ Data saved successfully');
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
        this.canvas.addEventListener('mouseleave', () => this.stopDrawing());

        // Touch events for mobile/stylus
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.startDrawing(touch);
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.draw(touch);
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.stopDrawing();
        });

        this.updateDrawingSettings();
        console.log('ߎ Canvas ready with touch support');
    }

    resizeCanvas() {
        if (!this.canvas) return;
        
        const container = document.getElementById('canvasContainer');
        const rect = container.getBoundingClientRect();
        
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        this.updateDrawingSettings();

        // Reload current note's drawing after resize
        if (this.currentNote && this.currentNote.drawing) {
            const img = new Image();
            img.onload = () => {
                this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
            };
            img.src = this.currentNote.drawing;
        }
        
        console.log('ߓ Canvas resized:', rect.width, 'x', rect.height);
    }

    updateDrawingSettings() {
        if (!this.ctx) return;

        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = this.brushSize;

        if (this.currentTool === 'highlighter') {
            this.ctx.globalCompositeOperation = 'multiply';
            this.ctx.globalAlpha = 0.3;
            this.ctx.lineWidth = this.brushSize * 4;
        } else if (this.currentTool === 'eraser') {
            this.ctx.globalCompositeOperation = 'destination-out';
            this.ctx.globalAlpha = 1;
            this.ctx.lineWidth = this.brushSize * 3;
        } else {
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.globalAlpha = 1;
        }
    }

    startDrawing(e) {
        this.isDrawing = true;
        this.undoStack.push(this.canvas.toDataURL());
        
        const rect = this.canvas.getBoundingClientRect();
        this.lastX = e.clientX - rect.left;
        this.lastY = e.clientY - rect.top;
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        console.log('✏️ Started drawing');
    }

    draw(e) {
        if (!this.isDrawing) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
        
        this.lastX = x;
        this.lastY = y;
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
        
        console.log('✅ Stopped drawing');
    }

    setupEventListeners() {
        const titleInput = document.getElementById('titleInput');
        const textEditor = document.getElementById('textEditor');
        
        if (titleInput) {
            titleInput.addEventListener('input', () => {
                if (this.currentNote) {
                    setTimeout(() => this.saveCurrentNote(), 1000);
                }
            });
        }

        if (textEditor) {
            textEditor.addEventListener('input', () => {
                if (this.currentNote) {
                    setTimeout(() => this.saveCurrentNote(), 1000);
                }
            });
        }

        // Window resize
        window.addEventListener('resize', () => {
            setTimeout(() => this.resizeCanvas(), 300);
        });

        console.log('ߎ Event listeners ready');
    }

    // Sidebar Management
    toggleSidebar() {
        this.sidebarCollapsed = !this.sidebarCollapsed;
        const sidebar = document.getElementById('sidebar');
        const toggleIcon = document.getElementById('toggleIcon');
        
        if (this.sidebarCollapsed) {
            sidebar.classList.add('collapsed');
            toggleIcon.textContent = '›';
        } else {
            sidebar.classList.remove('collapsed');
            toggleIcon.textContent = '‹';
        }
        
        // Resize canvas after sidebar animation
        setTimeout(() => this.resizeCanvas(), 450);
        console.log('ߓ Sidebar toggled:', this.sidebarCollapsed ? 'collapsed' : 'expanded');
    }

    // Rendering
    render() {
        this.renderSubjects();
        this.renderNotes();
        this.showEmptyState();
    }

    renderSubjects() {
        const container = document.getElementById('subjectsList');
        if (!container) return;

        let html = `
            <div class="subject-item ${this.currentSubject === 'all' ? 'active' : ''}" onclick="app.selectAllNotes()">
                <span>All Notes</span>
                <span class="notes-count">${this.notes.length}</span>
            </div>
        `;

        this.subjects.forEach(subject => {
            const count = this.notes.filter(n => n.subject === subject).length;
            html += `
                <div class="subject-item" onclick="openNotesFlyout('${subject.replace(/'/g, "\\'")}')">
                    <span>${subject}</span>
                    <span class="notes-count">${count}</span>
                </div>
            `;
        });

        container.innerHTML = html;
        console.log('ߓ Subjects rendered');
    }

    renderNotes() {
        const container = document.getElementById('notesList');
        if (!container) return;

        let filtered = this.currentSubject === 'all' 
            ? this.notes 
            : this.notes.filter(n => n.subject === this.currentSubject);

        filtered.sort((a, b) => new Date(b.updated) - new Date(a.updated));

        let html = '';
        filtered.forEach(note => {
            const preview = note.content.substring(0, 80);
            const date = new Date(note.updated).toLocaleDateString();
            
            html += `
                <div class="note-item ${this.currentNote?.id === note.id ? 'active' : ''}" onclick="app.selectNote(${note.id})">
                    <div class="note-title">${note.title || 'Untitled'}</div>
                    <div class="note-preview">${preview}${preview.length >= 80 ? '...' : ''}</div>
                    <div class="note-date">${date}</div>
                </div>
            `;
        });

        container.innerHTML = html || '<div style="text-align:center;padding:20px;color:#666;">No notes in this section</div>';
        console.log('ߓ Notes rendered:', filtered.length, 'notes');
    }

    selectAllNotes() {
        this.currentSubject = 'all';
        closeNotesFlyout();
        this.render();
        console.log('ߓ Selected all notes');
    }

    selectNote(id) {
        this.currentNote = this.notes.find(n => n.id === id);
        if (this.currentNote) {
            this.loadNoteIntoEditor();
            this.showEditor();
            this.render();
            console.log('ߓ Opened note:', this.currentNote.title);
        }
    }

    loadNoteIntoEditor() {
        if (!this.currentNote) return;

        const titleInput = document.getElementById('titleInput');
        const textEditor = document.getElementById('textEditor');
        
        if (titleInput) titleInput.value = this.currentNote.title || '';
        if (textEditor) textEditor.value = this.currentNote.content || '';

        // Load drawing
        if (this.currentNote.drawing && this.ctx) {
            const img = new Image();
            img.onload = () => {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
            };
            img.src = this.currentNote.drawing;
        } else if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }

        console.log('ߓ Note loaded into editor');
    }

    saveCurrentNote() {
        if (!this.currentNote) return;

        const titleInput = document.getElementById('titleInput');
        const textEditor = document.getElementById('textEditor');
        
        if (titleInput) this.currentNote.title = titleInput.value;
        if (textEditor) this.currentNote.content = textEditor.value;
        
        if (this.canvas) {
            this.currentNote.drawing = this.canvas.toDataURL();
        }
        
        this.currentNote.updated = new Date().toISOString();
        
        const index = this.notes.findIndex(n => n.id === this.currentNote.id);
        if (index !== -1) {
            this.notes[index] = { ...this.currentNote };
        }
        
        this.saveData();
        this.renderNotes();
        console.log('ߒ Note saved:', this.currentNote.title);
    }

    createNewNote() {
        const currentSubject = this.currentSubject === 'all' ? this.subjects[0] : this.currentSubject;
        
        const newNote = {
            id: Date.now() + Math.random(),
            title: 'New Note',
            content: '',
            subject: currentSubject,
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
            drawing: null
        };
        
        this.notes.unshift(newNote);
        this.currentNote = newNote;
        this.saveData();
        this.loadNoteIntoEditor();
        this.showEditor();
        this.render();
        
        // Focus title input
        setTimeout(() => {
            const titleInput = document.getElementById('titleInput');
            if (titleInput) {
                titleInput.focus();
                titleInput.select();
            }
        }, 100);
        
        console.log('➕ New note created');
    }

    showEditor() {
        document.getElementById('emptyState').style.display = 'none';
        document.getElementById('canvasContainer').style.display = 'block';
    }

    showEmptyState() {
        if (!this.currentNote) {
            document.getElementById('emptyState').style.display = 'flex';
            document.getElementById('canvasContainer').style.display = 'none';
        }
    }

    addSubject(name) {
        if (name && name.trim() && !this.subjects.includes(name.trim())) {
            this.subjects.push(name.trim());
            this.saveData();
            this.render();
            console.log('ߓ Subject added:', name);
            return true;
        }
        return false;
    }

    setMode(mode) {
        this.currentMode = mode;
        document.getElementById('textModeBtn').classList.toggle('active', mode === 'text');
        document.getElementById('drawModeBtn').classList.toggle('active', mode === 'draw');
        document.getElementById('textEditor').style.display = mode === 'text' ? 'block' : 'none';
        console.log('ߔ Mode changed to:', mode);
    }

    setTool(tool) {
        this.currentTool = tool;
        this.updateDrawingSettings();
        
        document.querySelectorAll('[data-tool]').forEach(btn => btn.classList.remove('active'));
        const toolBtn = document.querySelector(`[data-tool="${tool}"]`);
        if (toolBtn) toolBtn.classList.add('active');
        
        console.log('ߛ️ Tool changed to:', tool);
    }

    setColor(color) {
        this.currentColor = color;
        this.updateDrawingSettings();
        
        document.querySelectorAll('[data-color]').forEach(btn => btn.classList.remove('active'));
        const colorBtn = document.querySelector(`[data-color="${color}"]`);
        if (colorBtn) colorBtn.classList.add('active');
        
        console.log('ߎ Color changed to:', color);
    }

    setBrushSize(size) {
        this.brushSize = parseInt(size);
        this.updateDrawingSettings();
        
        const sizeDisplay = document.getElementById('sizeDisplay');
        if (sizeDisplay) sizeDisplay.textContent = size + 'px';
        
        console.log('ߓ Brush size changed to:', size);
    }

    undo() {
        if (this.undoStack.length === 0) return;
        
        const lastState = this.undoStack.pop();
        const img = new Image();
        img.onload = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
        };
        img.src = lastState;
        
        console.log('↶ Undo action performed');
    }

    clear() {
        if (!this.ctx) return;
        
        this.undoStack.push(this.canvas.toDataURL());
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        setTimeout(() => {
            if (this.currentNote) {
                this.saveCurrentNote();
            }
        }, 100);
        
        console.log('ߗ️ Canvas cleared');
    }
}

// Global App Instance
let app;

// Global Functions (called from HTML)
function goHome() {
    window.location.href = '../index.html';
}

function toggleSidebar() {
    app.toggleSidebar();
}

function createNewNote() {
    app.createNewNote();
}

function showAddSubjectModal() {
    const modal = document.getElementById('addSubjectModal');
    const input = document.getElementById('subjectInput');
    
    if (modal) {
        modal.classList.add('show');
        if (input) {
            input.value = '';
            setTimeout(() => input.focus(), 100);
        }
    }
}

function hideModal() {
    const modal = document.getElementById('addSubjectModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

function addSubject() {
    const input = document.getElementById('subjectInput');
    const name = input ? input.value.trim() : '';
    
    if (app.addSubject(name)) {
        hideModal();
        alert('Subject "' + name + '" added successfully!');
    } else {
        alert('Please enter a valid subject name or check if it already exists!');
    }
}

function setMode(mode) {
    app.setMode(mode);
}

function setTool(tool) {
    app.setTool(tool);
}

function setColor(color) {
    app.setColor(color);
}

function setBrushSize(size) {
    app.setBrushSize(size);
}

function undoAction() {
    app.undo();
}

function clearCanvas() {
    if (confirm('Clear the entire canvas? This cannot be undone.')) {
        app.clear();
    }
}

// Flyout Functions
function openNotesFlyout(subject) {
    const flyout = document.getElementById('notesFlyout');
    const subjectNameEl = document.getElementById('flyoutSubjectName');
    const notesListEl = document.getElementById('flyoutNotesList');
    
    if (!flyout || !subjectNameEl || !notesListEl) return;
    
    // Filter notes by subject
    let filtered = app.notes.filter(n => n.subject === subject);
    
    // Update flyout title
    subjectNameEl.textContent = subject;
    
    // Generate notes HTML
    let html = '';
    if (filtered.length === 0) {
        html = `
            <div style="text-align: center; padding: 40px 20px; color: #888;">
                <div style="font-size: 2rem; margin-bottom: 16px;">ߓ</div>
                <p>No notes in "${subject}"</p>
                <button onclick="createNewNoteInSubject('${subject}')" style="margin-top: 16px; padding: 8px 16px; background: #007AFF; color: white; border: none; border-radius: 8px; cursor: pointer;">Create First Note</button>
            </div>
        `;
    } else {
        filtered.sort((a, b) => new Date(b.updated) - new Date(a.updated));
        filtered.forEach(note => {
            const preview = note.content.substring(0, 70);
            const date = new Date(note.updated).toLocaleDateString();
            
            html += `
                <div class="flyout-note-item" onclick="selectNoteFromFlyout(${note.id})">
                    <strong>${note.title || 'Untitled'}</strong>
                    <div>${preview}${preview.length >= 70 ? '...' : ''}</div>
                    <div style="font-size: 11px; color: #999; margin-top: 4px;">${date}</div>
                </div>
            `;
        });
    }
    
    notesListEl.innerHTML = html;
    flyout.classList.add('open');
    
    console.log('ߓ Flyout opened for subject:', subject);
}

function closeNotesFlyout() {
    const flyout = document.getElementById('notesFlyout');
    if (flyout) {
        flyout.classList.remove('open');
        console.log('❌ Flyout closed');
    }
}

function selectNoteFromFlyout(id) {
    app.selectNote(id);
    closeNotesFlyout();
}

function createNewNoteInSubject(subject) {
    // Temporarily set current subject and create note
    const originalSubject = app.currentSubject;
    app.currentSubject = subject;
    
    const newNote = {
        id: Date.now() + Math.random(),
        title: 'New Note',
        content: '',
        subject: subject,
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        drawing: null
    };
    
    app.notes.unshift(newNote);
    app.currentNote = newNote;
    app.saveData();
    app.loadNoteIntoEditor();
    app.showEditor();
    
    // Restore original subject and re-render
    app.currentSubject = originalSubject;
    app.render();
    
    closeNotesFlyout();
    
    // Focus title input
    setTimeout(() => {
        const titleInput = document.getElementById('titleInput');
        if (titleInput) {
            titleInput.focus();
            titleInput.select();
        }
    }, 100);
    
    console.log('➕ New note created in subject:', subject);
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    app = new NotesApp();
    console.log('ߚ Professional Notes App Started');
});

// Modal Event Handlers
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        hideModal();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.target.id === 'subjectInput' && e.key === 'Enter') {
        e.preventDefault();
        addSubject();
    }
    
    if (e.key === 'Escape') {
        hideModal();
        closeNotesFlyout();
    }
});

console.log('ߓ Smart Book Notes App - All scripts loaded successfully');
