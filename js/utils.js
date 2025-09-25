// Smart Book Tablet - Shared Utilities

class SmartBookUtils {
    constructor() {
        this.storagePrefix = 'smartbook_';
        this.version = '1.0.0';
    }

    // Local Storage Management
    storage = {
        set: (key, value) => {
            try {
                const data = {
                    value: value,
                    timestamp: Date.now(),
                    version: this.version
                };
                localStorage.setItem(this.storagePrefix + key, JSON.stringify(data));
                return true;
            } catch (error) {
                console.error('Storage set error:', error);
                return false;
            }
        },

        get: (key, defaultValue = null) => {
            try {
                const item = localStorage.getItem(this.storagePrefix + key);
                if (!item) return defaultValue;
                
                const data = JSON.parse(item);
                return data.value !== undefined ? data.value : defaultValue;
            } catch (error) {
                console.error('Storage get error:', error);
                return defaultValue;
            }
        },

        remove: (key) => {
            try {
                localStorage.removeItem(this.storagePrefix + key);
                return true;
            } catch (error) {
                console.error('Storage remove error:', error);
                return false;
            }
        },

        clear: () => {
            try {
                Object.keys(localStorage)
                    .filter(key => key.startsWith(this.storagePrefix))
                    .forEach(key => localStorage.removeItem(key));
                return true;
            } catch (error) {
                console.error('Storage clear error:', error);
                return false;
            }
        }
    };

    // Performance Utilities
    performance = {
        // Debounce function
        debounce: (func, wait, immediate = false) => {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    timeout = null;
                    if (!immediate) func(...args);
                };
                const callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func(...args);
            };
        },

        // Throttle function
        throttle: (func, limit) => {
            let inThrottle;
            return function(...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        }
    };

    // Device Detection
    device = {
        isMobile: () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        isTablet: () => /iPad|Android|webOS|IEMobile/i.test(navigator.userAgent) && window.innerWidth >= 768,
        isDesktop: () => !this.device.isMobile(),
        isTouch: () => 'ontouchstart' in window || navigator.maxTouchPoints > 0
    };

    // Haptic feedback
    haptic = {
        light: () => {
            if ('vibrate' in navigator) {
                navigator.vibrate(25);
            }
        },
        
        medium: () => {
            if ('vibrate' in navigator) {
                navigator.vibrate(50);
            }
        },
        
        heavy: () => {
            if ('vibrate' in navigator) {
                navigator.vibrate(100);
            }
        }
    };
}

// Create global instance
window.SmartBookUtils = new SmartBookUtils();
window.storage = window.SmartBookUtils.storage;
window.device = window.SmartBookUtils.device;
window.haptic = window.SmartBookUtils.haptic;

console.log('🔧 Smart Book Utils loaded');
