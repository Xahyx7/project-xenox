// Smart Book Tablet - Home Screen Logic

class SmartBookHome {
    constructor() {
        this.init();
    }

    init() {
        this.updateTime();
        this.setupEventListeners();
        this.loadSystemInfo();
        console.log('🚀 Smart Book Tablet OS Loaded');
    }

    // Update status bar time
    updateTime() {
        const updateClock = () => {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
            
            const timeElement = document.getElementById('current-time');
            if (timeElement) {
                timeElement.textContent = timeString;
            }
        };

        updateClock();
        setInterval(updateClock, 1000);
    }

    // Setup event listeners
    setupEventListeners() {
        // Handle app icon clicks with haptic feedback
        document.querySelectorAll('.app-icon').forEach(icon => {
            icon.addEventListener('click', (e) => {
                this.hapticFeedback();
                this.addClickAnimation(e.currentTarget);
            });

            // Touch feedback for mobile
            icon.addEventListener('touchstart', (e) => {
                e.currentTarget.style.transform = 'scale(0.95)';
            });

            icon.addEventListener('touchend', (e) => {
                setTimeout(() => {
                    e.currentTarget.style.transform = '';
                }, 100);
            });
        });

        // Handle keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const focusedElement = document.activeElement;
                if (focusedElement.classList.contains('app-icon')) {
                    focusedElement.click();
                }
            }
        });
    }

    // Haptic feedback simulation
    hapticFeedback() {
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }
    }

    // Add click animation
    addClickAnimation(element) {
        element.classList.add('loading');
        
        setTimeout(() => {
            element.classList.remove('loading');
        }, 300);
    }

    // Load system information
    loadSystemInfo() {
        // Simulate system info
        const batteryLevel = 100;
        const batteryElement = document.querySelector('.battery');
        if (batteryElement) {
            batteryElement.textContent = `${batteryLevel}%`;
        }

        // Check network status
        this.updateNetworkStatus();
        window.addEventListener('online', () => this.updateNetworkStatus());
        window.addEventListener('offline', () => this.updateNetworkStatus());
    }

    // Update network status
    updateNetworkStatus() {
        const wifiElement = document.querySelector('.wifi');
        if (wifiElement) {
            wifiElement.textContent = navigator.onLine ? '📶' : '📵';
        }
    }
}

// App Navigation Functions
function openApp(appName) {
    console.log(`🚀 Opening ${appName} app...`);
    
    // Add loading state
    const appIcon = event.currentTarget;
    appIcon.classList.add('loading');
    
    // Haptic feedback
    if ('vibrate' in navigator) {
        navigator.vibrate(75);
    }

    // Navigate to app with smooth transition
    setTimeout(() => {
        switch(appName) {
            case 'notes':
                window.location.href = 'apps/notes.html';
                break;
            case 'bookmart':
                window.location.href = 'apps/bookmart.html';
                break;
            case 'ai':
                openAIAssistant();
                break;
            default:
                console.log('App not found');
                appIcon.classList.remove('loading');
        }
    }, 300);
}

// Open AI Assistant (Perplexity)
function openAIAssistant() {
    try {
        // Open Perplexity AI in new tab
        const aiWindow = window.open('https://www.perplexity.ai', '_blank');
        
        if (!aiWindow) {
            // Fallback if popup blocked
            window.location.href = 'https://www.perplexity.ai';
        }
        
        // Remove loading state
        setTimeout(() => {
            document.querySelector('.app-icon.loading')?.classList.remove('loading');
        }, 500);
        
        console.log('🤖 AI Assistant opened');
    } catch (error) {
        console.error('Failed to open AI Assistant:', error);
        alert('Unable to open AI Assistant. Please check your internet connection.');
        document.querySelector('.app-icon.loading')?.classList.remove('loading');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const homeScreen = new SmartBookHome();
    
    // Handle orientation changes
    window.addEventListener('orientationchange', () => {
        console.log('📱 Orientation changed');
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        console.log(`📐 Window resized: ${window.innerWidth}x${window.innerHeight}`);
    });
});

// Export for use in other modules
window.SmartBookOS = {
    openApp,
    openAIAssistant
};
