// Smart Book Tablet - Book Mart Logic - COMPLETELY FIXED
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
                description: 'Comprehensive science textbook covering Physics, Chemistry, and Biology.'
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
                description: 'Complete mathematics curriculum covering algebra, geometry, and trigonometry.'
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
                description: 'Integrated social science covering History, Geography, and Economics.'
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
                description: 'English literature with prose, poetry, and drama.'
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
                description: 'Hindi literature collection with stories and poems.'
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
                description: 'Geography textbook focusing on resources and development.'
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
                description: 'Modern Indian history and independence movement.'
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
                description: 'Introduction to economics and development.'
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
                description: 'Civics textbook exploring democracy and politics.'
            }
        ];

        localStorage.setItem('smartbook_books', JSON.stringify(this.books));
    }

    loadRecentlyViewed() {
        const saved = localStorage.getItem('smartbook_recentbooks');
        if (saved) {
            this.recentlyViewed = JSON.parse(saved);
        }
    }

    saveRecentlyViewed() {
        localStorage.setItem('smartbook_recentbooks', JSON.stringify(this.recentlyViewed));
    }

    addToRecentlyViewed(book) {
        this.recentlyViewed = this.recentlyViewed.filter(b => b.id !== book.id);
        this.recentlyViewed.unshift(book);
        
        if (this.recentlyViewed.length > 5) {
            this.recentlyViewed = this.recentlyViewed.slice(0, 5);
        }
        
        this.saveRecentlyViewed();
        this.updateRecentlyViewed();
    }

    getFilteredBooks() {
        let filtered = this.books;

        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(book => book.category === this.currentCategory);
        }

        if (this.searchQuery.trim()) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(book => 
                book.title.toLowerCase().includes(query) ||
                book.subject.toLowerCase().includes(query)
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
        if (loadingState) loadingState.style.display = 'flex';
        booksGrid.style.display = 'none';
        if (emptyState) emptyState.style.display = 'none';

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

        // Simulate loading
        setTimeout(() => {
            const filteredBooks = this.getFilteredBooks();
            
            if (loadingState) loadingState.style.display = 'none';

            if (filteredBooks.length === 0) {
                if (emptyState) emptyState.style.display = 'flex';
                booksGrid.style.display = 'none';
                return;
            }

            booksGrid.className = `books-grid ${this.currentView}-view`;
            booksGrid.style.display = 'grid';
            if (emptyState) emptyState.style.display = 'none';

            let html = '';
            filteredBooks.forEach(book => {
                html += `
                    <div class="book-card" onclick="showBookDetail('${book.id}')">
                        <img src="${book.cover}" alt="${book.title}" class="book-cover" loading="lazy" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI2NyIgdmlld0JveD0iMCAwIDIwMCAyNjciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjY3IiBmaWxsPSIjNDI0MjQyIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTMzIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0Ij5Cb29rIENvdmVyPC90ZXh0Pgo8L3N2Zz4K'">
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
        }, 300);
    }

    updateRecentlyViewed() {
        const recentlyViewed = document.getElementById('recentlyViewed');
        const recentBooksList = document.getElementById('recentBooksList');
        
        if (!recentlyViewed || !recentBooksList) return;

        if (this.recentlyViewed.length === 0) {
            recentlyViewed.style.display = 'none';
            return;
        }

        recentlyViewed.style.display = 'block';
        
        let html = '';
        this.recentlyViewed.forEach(book => {
            html += `
                <div class="recent-book-item" onclick="showBookDetail('${book.id}')">
                    <img src="${book.cover}" alt="${book.title}" class="recent-book-cover" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjE2MCIgdmlld0JveD0iMCAwIDEyMCAxNjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTYwIiBmaWxsPSIjNDI0MjQyIi8+Cjx0ZXh0IHg9IjYwIiB5PSI4MCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCI+Qm9vazwvdGV4dD4KPC9zdmc+Cg=='">
                    <div class="recent-book-title">${book.title}</div>
                </div>
            `;
        });

        recentBooksList.innerHTML = html;
    }

    setupEventListeners() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.trim();
                
                const clearBtn = document.getElementById('clearSearchBtn');
                if (clearBtn) {
                    clearBtn.style.display = this.searchQuery.length > 0 ? 'block' : 'none';
                }
                
                this.renderBooks();
            });
        }

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                closeBookModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeBookModal();
                const searchContainer = document.getElementById('searchContainer');
                if (searchContainer && searchContainer.classList.contains('show')) {
                    toggleSearch();
                }
            }
        });
    }
}

let bookMart;

// FIXED GLOBAL FUNCTIONS
function goHome() {
    window.location.href = '../index.html';
}

function toggleSearch() {
    const searchContainer = document.getElementById('searchContainer');
    const searchInput = document.getElementById('searchInput');
    
    if (searchContainer) {
        if (searchContainer.classList.contains('show')) {
            searchContainer.classList.remove('show');
        } else {
            searchContainer.classList.add('show');
            if (searchInput) {
                setTimeout(() => searchInput.focus(), 300);
            }
        }
    }
}

function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearSearchBtn');
    
    if (searchInput) searchInput.value = '';
    if (clearBtn) clearBtn.style.display = 'none';
    
    bookMart.searchQuery = '';
    bookMart.renderBooks();
}

function selectCategory(category) {
    bookMart.currentCategory = category;
    
    document.querySelectorAll('.category-card').forEach(card => {
        card.classList.remove('active');
    });
    
    const categoryCard = document.querySelector(`[data-category="${category}"]`);
    if (categoryCard) categoryCard.classList.add('active');
    
    bookMart.renderBooks();
    console.log('Selected category:', category);
}

function setView(view) {
    bookMart.currentView = view;
    
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const viewBtn = document.querySelector(`[data-view="${view}"]`);
    if (viewBtn) viewBtn.classList.add('active');
    
    bookMart.renderBooks();
}

function showBookDetail(bookId) {
    const book = bookMart.books.find(b => b.id === bookId);
    if (!book) return;
    
    bookMart.selectedBook = book;
    bookMart.addToRecentlyViewed(book);
    
    // Populate modal
    const elements = {
        modalBookCover: document.getElementById('modalBookCover'),
        modalBookTitle: document.getElementById('modalBookTitle'),
        modalBookSubject: document.getElementById('modalBookSubject'),
        modalBookLanguage: document.getElementById('modalBookLanguage'),
        modalBookPages: document.getElementById('modalBookPages'),
        modalBookDescription: document.getElementById('modalBookDescription')
    };

    if (elements.modalBookCover) elements.modalBookCover.src = book.cover;
    if (elements.modalBookTitle) elements.modalBookTitle.textContent = book.title;
    if (elements.modalBookSubject) elements.modalBookSubject.textContent = book.subject;
    if (elements.modalBookLanguage) elements.modalBookLanguage.textContent = book.language.charAt(0).toUpperCase() + book.language.slice(1);
    if (elements.modalBookPages) elements.modalBookPages.textContent = book.pages + ' pages';
    if (elements.modalBookDescription) elements.modalBookDescription.textContent = book.description;
    
    // Show modal
    const modal = document.getElementById('bookModal');
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
    
    console.log('📖 Opened book:', book.title);
}

function closeBookModal() {
    const modal = document.getElementById('bookModal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
    bookMart.selectedBook = null;
}

function readBook() {
    if (!bookMart.selectedBook) return;
    
    try {
        const pdfUrl = bookMart.selectedBook.pdf;
        const pdfWindow = window.open(pdfUrl, '_blank');
        
        if (!pdfWindow) {
            window.location.href = pdfUrl;
        }
        
        console.log('📚 Reading:', bookMart.selectedBook.title);
        alert('Opening book...');
        
        setTimeout(() => closeBookModal(), 500);
        
    } catch (error) {
        console.error('Failed to open book:', error);
        alert('Failed to open book. Please try again.');
    }
}

function downloadBook() {
    if (!bookMart.selectedBook) return;
    
    try {
        const link = document.createElement('a');
        link.href = bookMart.selectedBook.pdf;
        link.download = `${bookMart.selectedBook.title}.pdf`;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('💾 Downloading:', bookMart.selectedBook.title);
        alert('Download started!');
        
    } catch (error) {
        console.error('Failed to download book:', error);
        alert('Download failed. Please try again.');
    }
}

function showCart() {
    alert('Cart feature coming soon!');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    bookMart = new BookMart();
    console.log('📚 Book Mart ready');
});
