// Smart Book Tablet - Book Mart Logic
// NCERT Book Marketplace

class BookMart {
    constructor() {
        this.books = [];
        this.currentCategory = 'all';
        this.currentView = 'grid';
        this.searchQuery = '';
        this.recentlyViewed = [];
        this.selectedBook = null;
        
        this.init();
    }

    init() {
        this.loadBooks();
        this.loadRecentlyViewed();
        this.setupEventListeners();
        this.renderBooks();
        this.updateRecentlyViewed();
        
        console.log('📚 Book Mart initialized');
    }

    loadBooks() {
        // NCERT Class 10 Books Data
        this.books = [
            {
                id: 'science10',
                title: 'Science - Light, Life Processes',
                subject: 'Science',
                category: 'science',
                class: '10th',
                language: 'english',
                pages: '312',
                cover: '../assets/book-covers/science10.jpg',
                pdf: '../books/science10.pdf',
                description: 'Comprehensive science textbook covering Physics, Chemistry, and Biology topics including Light, Life Processes, and Natural Resource Management.',
                features: ['Updated 2024 curriculum', 'Practical experiments', 'Colorful diagrams', 'Chapter-wise exercises']
            },
            {
                id: 'math10',
                title: 'Mathematics',
                subject: 'Mathematics',
                category: 'math',
                class: '10th',
                language: 'english',
                pages: '280',
                cover: '../assets/book-covers/math10.jpg',
                pdf: '../books/math10.pdf',
                description: 'Complete mathematics curriculum covering Real Numbers, Polynomials, Linear Equations, Coordinate Geometry, and Trigonometry.',
                features: ['Step-by-step solutions', 'Practice exercises', 'Mathematical proofs', 'Real-world applications']
            },
            {
                id: 'social10',
                title: 'Social Science',
                subject: 'Social Studies',
                category: 'social',
                class: '10th',
                language: 'english',
                pages: '456',
                cover: '../assets/book-covers/social10.jpg',
                pdf: '../books/social10.pdf',
                description: 'Integrated social science covering History, Geography, Political Science, and Economics in one comprehensive volume.',
                features: ['Maps and illustrations', 'Case studies', 'Current affairs', 'Activity-based learning']
            },
            {
                id: 'english10',
                title: 'First Flight - English Literature',
                subject: 'English',
                category: 'languages',
                class: '10th',
                language: 'english',
                pages: '198',
                cover: '../assets/book-covers/english10.jpg',
                pdf: '../books/english10.pdf',
                description: 'English literature textbook featuring prose, poetry, and drama from renowned authors to develop language skills.',
                features: ['Classic literature', 'Grammar exercises', 'Writing skills', 'Comprehension passages']
            },
            {
                id: 'hindi10',
                title: 'Sparsh - Hindi Literature',
                subject: 'Hindi',
                category: 'languages',
                class: '10th',
                language: 'hindi',
                pages: '224',
                cover: '../assets/book-covers/hindi10.jpg',
                pdf: '../books/hindi10.pdf',
                description: 'Hindi literature collection featuring stories, poems, and essays from celebrated Hindi writers.',
                features: ['Classical Hindi literature', 'Modern stories', 'Poetry appreciation', 'Cultural values']
            },
            {
                id: 'geography10',
                title: 'Contemporary India II - Geography',
                subject: 'Geography',
                category: 'social',
                class: '10th',
                language: 'english',
                pages: '176',
                cover: '../assets/book-covers/geography10.jpg',
                pdf: '../books/geography10.pdf',
                description: 'Geography textbook focusing on resources, agriculture, water resources, and sustainable development.',
                features: ['Detailed maps', 'Satellite imagery', 'Environmental awareness', 'Resource management']
            },
            {
                id: 'history10',
                title: 'India and Contemporary World II',
                subject: 'History',
                category: 'social',
                class: '10th',
                language: 'english',
                pages: '234',
                cover: '../assets/book-covers/history10.jpg',
                pdf: '../books/history10.pdf',
                description: 'Modern Indian history covering nationalism, independence movement, and post-independence developments.',
                features: ['Historical photographs', 'Timeline charts', 'Primary sources', 'Cultural heritage']
            },
            {
                id: 'economics10',
                title: 'Understanding Economic Development',
                subject: 'Economics',
                category: 'social',
                class: '10th',
                language: 'english',
                pages: '168',
                cover: '../assets/book-covers/economics10.jpg',
                pdf: '../books/economics10.pdf',
                description: 'Introduction to economics covering development, sectors of economy, money, credit, and globalization.',
                features: ['Real-world examples', 'Statistical data', 'Economic indicators', 'Policy analysis']
            },
            {
                id: 'politics10',
                title: 'Democratic Politics II',
                subject: 'Political Science',
                category: 'social',
                class: '10th',
                language: 'english',
                pages: '142',
                cover: '../assets/book-covers/politics10.jpg',
                pdf: '../books/politics10.pdf',
                description: 'Civics textbook exploring democracy, federalism, gender, religion, and challenges to democracy.',
                features: ['Constitutional principles', 'Democratic processes', 'Case studies', 'Current politics']
            }
        ];

        // Save to storage
        storage.set('books', this.books);
    }

    loadRecentlyViewed() {
        this.recentlyViewed = storage.get('recentlyViewed', []);
    }

    saveRecentlyViewed() {
        storage.set('recentlyViewed', this.recentlyViewed);
    }

    addToRecentlyViewed(book) {
        // Remove if already exists
        this.recentlyViewed = this.recentlyViewed.filter(b => b.id !== book.id);
        
        // Add to beginning
        this.recentlyViewed.unshift(book);
        
        // Keep only last 5
        if (this.recentlyViewed.length > 5) {
            this.recentlyViewed = this.recentlyViewed.slice(0, 5);
        }
        
        this.saveRecentlyViewed();
        this.updateRecentlyViewed();
    }

    getFilteredBooks() {
        let filtered = this.books;

        // Filter by category
        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(book => book.category === this.currentCategory);
        }

        // Filter by search query
        if (this.searchQuery.trim()) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(book => 
                book.title.toLowerCase().includes(query) ||
                book.subject.toLowerCase().includes(query) ||
                book.description.toLowerCase().includes(query)
            );
        }

        return filtered;
    }

    renderBooks() {
        const booksGrid = document.getElementById('booksGrid');
        const loadingState = document.getElementById('loadingState');
        const emptyState = document.getElementById('emptyState');
        const sectionTitle = document.getElementById('sectionTitle');
        
        if (!booksGrid) return;

        // Show loading
        loadingState.classList.add('show');
        booksGrid.style.display = 'none';
        emptyState.classList.remove('show');

        // Update section title
        const categoryNames = {
            'all': 'All Books',
            'science': 'Science Books',
            'math': 'Mathematics Books', 
            'social': 'Social Studies Books',
            'languages': 'Language Books'
        };
        
        if (sectionTitle) {
            sectionTitle.textContent = this.searchQuery ? 
                `Search Results for "${this.searchQuery}"` : 
                categoryNames[this.currentCategory];
        }

        // Simulate loading delay
        setTimeout(() => {
            const filteredBooks = this.getFilteredBooks();
            
            loadingState.classList.remove('show');

            if (filteredBooks.length === 0) {
                emptyState.classList.add('show');
                booksGrid.style.display = 'none';
                return;
            }

            // Set view class
            booksGrid.className = `books-grid ${this.currentView}-view`;
            booksGrid.style.display = 'grid';
            emptyState.classList.remove('show');

            // Render books
            let html = '';
            filteredBooks.forEach(book => {
                html += `
                    <div class="book-card" onclick="showBookDetail('${book.id}')" data-book-id="${book.id}">
                        <img src="${book.cover}" alt="${book.title}" class="book-cover" loading="lazy">
                        <div class="book-info">
                            <h3 class="book-title">${book.title}</h3>
                            <p class="book-subject">${book.subject}</p>
                            <div class="book-meta">
                                <span class="book-class">Class ${book.class}</span>
                                <span class="book-language">${book.language}</span>
                            </div>
                        </div>
                    </div>
                `;
            });

            booksGrid.innerHTML = html;
            
            // Add animation
            document.querySelectorAll('.book-card').forEach((card, index) => {
                card.style.animationDelay = `${index * 0.1}s`;
            });

        }, 800);
    }

    updateRecentlyViewed() {
        const recentlyViewed = document.getElementById('recentlyViewed');
        const recentBooksList = document.getElementById('recentBooksList');
        
        if (!recentlyViewed || !recentBooksList) return;

        if (this.recentlyViewed.length === 0) {
            recentlyViewed.classList.remove('show');
            return;
        }

        recentlyViewed.classList.add('show');
        
        let html = '';
        this.recentlyViewed.forEach(book => {
            html += `
                <div class="recent-book-item" onclick="showBookDetail('${book.id}')">
                    <img src="${book.cover}" alt="${book.title}" class="recent-book-cover">
                    <div class="recent-book-title">${book.title}</div>
                </div>
            `;
        });

        recentBooksList.innerHTML = html;
    }

    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', SmartBookUtils.performance.debounce((e) => {
                this.handleSearch(e.target.value);
            }, 300));
        }

        // Modal close on backdrop click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                closeBookModal();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeBookModal();
                if (document.getElementById('searchContainer').classList.contains('show')) {
                    toggleSearch();
                }
            }
            
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'f':
                        e.preventDefault();
                        toggleSearch();
                        break;
                }
            }
        });
    }

    handleSearch(query) {
        this.searchQuery = query.trim();
        
        const clearBtn = document.getElementById('clearSearchBtn');
        if (clearBtn) {
            clearBtn.classList.toggle('show', this.searchQuery.length > 0);
        }
        
        this.renderBooks();
        haptic.light();
    }
}

// Global Functions (called from HTML)
let bookMart;

function goHome() {
    haptic.medium();
    window.location.href = '../index.html';
}

function toggleSearch() {
    haptic.light();
    const searchContainer = document.getElementById('searchContainer');
    const searchInput = document.getElementById('searchInput');
    
    if (searchContainer.classList.contains('show')) {
        searchContainer.classList.remove('show');
    } else {
        searchContainer.classList.add('show');
        setTimeout(() => {
            if (searchInput) searchInput.focus();
        }, 300);
    }
}

function clearSearch() {
    haptic.light();
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearSearchBtn');
    
    if (searchInput) searchInput.value = '';
    if (clearBtn) clearBtn.classList.remove('show');
    
    bookMart.searchQuery = '';
    bookMart.renderBooks();
}

function handleSearch(value) {
    bookMart.handleSearch(value);
}

function selectCategory(category) {
    haptic.medium();
    bookMart.currentCategory = category;
    
    // Update UI
    document.querySelectorAll('.category-card').forEach(card => {
        card.classList.remove('active');
    });
    document.querySelector(`[data-category="${category}"]`).classList.add('active');
    
    bookMart.renderBooks();
}

function setView(view) {
    haptic.light();
    bookMart.currentView = view;
    
    // Update UI
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-view="${view}"]`).classList.add('active');
    
    bookMart.renderBooks();
}

function showBookDetail(bookId) {
    haptic.medium();
    
    const book = bookMart.books.find(b => b.id === bookId);
    if (!book) return;
    
    bookMart.selectedBook = book;
    bookMart.addToRecentlyViewed(book);
    
    // Populate modal
    document.getElementById('modalBookCover').src = book.cover;
    document.getElementById('modalBookTitle').textContent = book.title;
    document.getElementById('modalBookSubject').textContent = book.subject;
    document.getElementById('modalBookLanguage').textContent = book.language.charAt(0).toUpperCase() + book.language.slice(1);
    document.getElementById('modalBookPages').textContent = book.pages + ' pages';
    document.getElementById('modalBookDescription').textContent = book.description;
    
    // Show modal
    const modal = document.getElementById('bookModal');
    modal.classList.add('show');
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    console.log(`📖 Opened book: ${book.title}`);
}

function closeBookModal() {
    haptic.light();
    const modal = document.getElementById('bookModal');
    modal.classList.remove('show');
    
    // Restore body scroll
    document.body.style.overflow = 'auto';
    
    bookMart.selectedBook = null;
}

function readBook() {
    if (!bookMart.selectedBook) return;
    
    haptic.heavy();
    
    try {
        // Open PDF in new tab
        const pdfUrl = bookMart.selectedBook.pdf;
        const pdfWindow = window.open(pdfUrl, '_blank');
        
        if (!pdfWindow) {
            // Fallback if popup blocked
            window.location.href = pdfUrl;
        }
        
        console.log(`📚 Reading: ${bookMart.selectedBook.title}`);
        SmartBookUtils.ui.toast('Opening book...', 'success');
        
        // Close modal after opening
        setTimeout(() => {
            closeBookModal();
        }, 500);
        
    } catch (error) {
        console.error('Failed to open book:', error);
        SmartBookUtils.ui.toast('Failed to open book. Please try again.', 'error');
    }
}

function downloadBook() {
    if (!bookMart.selectedBook) return;
    
    haptic.heavy();
    
    try {
        // Create download link
        const link = document.createElement('a');
        link.href = bookMart.selectedBook.pdf;
        link.download = `${bookMart.selectedBook.title}.pdf`;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log(`💾 Downloading: ${bookMart.selectedBook.title}`);
        SmartBookUtils.ui.toast('Download started!', 'success');
        
    } catch (error) {
        console.error('Failed to download book:', error);
        SmartBookUtils.ui.toast('Download failed. Please try again.', 'error');
    }
}

function showCart() {
    haptic.light();
    SmartBookUtils.ui.toast('Cart feature coming soon!', 'info');
}

// Initialize Book Mart
document.addEventListener('DOMContentLoaded', () => {
    bookMart = new BookMart();
    console.log('📚 Book Mart ready');
});

// Handle page visibility for auto-pause/resume
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('📚 Book Mart paused');
    } else {
        console.log('📚 Book Mart resumed');
    }
});
