/**
 * Storage Management Utility
 * 
 * Handles localStorage operations with quota error handling and automatic cleanup
 */

class StorageManager {
    constructor() {
        this.STORAGE_KEYS = {
            TOKEN: 'token',
            USER: 'user',
            THEME: 'theme',
            DAILY_WORD: 'daily_word_data_v2',
            DAILY_WORD_DATE: 'daily_word_date_v2',
            DASHBOARD_SENTENCE: 'dashboard_sentence',
            ACTIVE_INTERVIEW: 'activeInterviewSession',
        };

        // Keys that should never be cleared
        this.PROTECTED_KEYS = [
            this.STORAGE_KEYS.TOKEN,
            this.STORAGE_KEYS.USER,
            this.STORAGE_KEYS.THEME
        ];

        // Initialize quota monitoring
        this.checkStorageHealth();
    }

    /**
     * Safe localStorage.setItem with quota error handling
     */
    setItem(key, value) {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch (error) {
            if (this.isQuotaExceededError(error)) {
                console.warn('[StorageManager] Quota exceeded, attempting cleanup...');

                // Try to free up space
                this.cleanupOldData();

                // Retry once after cleanup
                try {
                    localStorage.setItem(key, value);
                    console.log('[StorageManager] Successfully saved after cleanup');
                    return true;
                } catch (retryError) {
                    console.error('[StorageManager] Still unable to save after cleanup', retryError);
                    this.handleQuotaError();
                    return false;
                }
            } else {
                console.error('[StorageManager] Storage error:', error);
                return false;
            }
        }
    }

    /**
     * Safe localStorage.getItem with error handling
     */
    getItem(key) {
        try {
            return localStorage.getItem(key);
        } catch (error) {
            console.error('[StorageManager] Error reading from storage:', error);
            return null;
        }
    }

    /**
     * Safe localStorage.removeItem
     */
    removeItem(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('[StorageManager] Error removing from storage:', error);
            return false;
        }
    }

    /**
     * Check if error is a quota exceeded error
     */
    isQuotaExceededError(error) {
        return (
            error instanceof DOMException &&
            (
                // Chrome
                error.code === 22 ||
                error.code === 1014 ||
                // Firefox
                error.name === 'QuotaExceededError' ||
                // Chrome
                error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
                // Check message for FILE_ERROR_NO_SPACE
                error.message?.includes('quota') ||
                error.message?.includes('NO_SPACE')
            )
        );
    }

    /**
     * Cleanup old/stale data to free up space
     */
    cleanupOldData() {
        console.log('[StorageManager] Starting cleanup...');

        // 1. Remove old daily word cache if it's not from today
        const today = new Date().toDateString();
        const cachedDate = this.getItem(this.STORAGE_KEYS.DAILY_WORD_DATE);

        if (cachedDate && cachedDate !== today) {
            console.log('[StorageManager] Removing stale daily word cache');
            this.removeItem(this.STORAGE_KEYS.DAILY_WORD);
            this.removeItem(this.STORAGE_KEYS.DAILY_WORD_DATE);
        }

        // 2. Remove dashboard sentence cache (can be refreshed)
        if (this.getItem(this.STORAGE_KEYS.DASHBOARD_SENTENCE)) {
            console.log('[StorageManager] Removing dashboard sentence cache');
            this.removeItem(this.STORAGE_KEYS.DASHBOARD_SENTENCE);
        }

        // 3. Remove any orphaned keys (keys not in our STORAGE_KEYS)
        const knownKeys = Object.values(this.STORAGE_KEYS);
        const allKeys = Object.keys(localStorage);

        allKeys.forEach(key => {
            if (!knownKeys.includes(key) && !this.PROTECTED_KEYS.includes(key)) {
                console.log(`[StorageManager] Removing unknown key: ${key}`);
                this.removeItem(key);
            }
        });

        console.log('[StorageManager] Cleanup complete');
    }

    /**
     * Check storage health and usage
     */
    async checkStorageHealth() {
        try {
            if ('storage' in navigator && 'estimate' in navigator.storage) {
                const estimate = await navigator.storage.estimate();
                const percentUsed = ((estimate.usage / estimate.quota) * 100).toFixed(2);

                console.log(`[StorageManager] Storage usage: ${this.formatBytes(estimate.usage)} / ${this.formatBytes(estimate.quota)} (${percentUsed}%)`);

                // Warn if approaching quota
                if (percentUsed > 80) {
                    console.warn('[StorageManager] Warning: Using over 80% of storage quota');
                    this.cleanupOldData();
                }

                return {
                    usage: estimate.usage,
                    quota: estimate.quota,
                    percentUsed: parseFloat(percentUsed)
                };
            }
        } catch (error) {
            console.error('[StorageManager] Error checking storage health:', error);
        }
        return null;
    }

    /**
     * Handle quota error by showing user a helpful message
     */
    handleQuotaError() {
        console.error('[StorageManager] CRITICAL: Storage quota exceeded and cleanup failed');

        // Show user-friendly alert
        const message = `⚠️ Browser storage is full!\n\n` +
            `To fix this:\n` +
            `1. Clear browser cache and data for this site\n` +
            `2. Or press F12 → Application → Storage → Clear site data\n` +
            `3. Then refresh the page\n\n` +
            `Your account data is safe on the server.`;

        if (typeof window !== 'undefined' && window.confirm) {
            const shouldClear = window.confirm(
                message + '\n\nWould you like to clear local cache now? (Your login will be preserved)'
            );

            if (shouldClear) {
                this.emergencyClearCache();
            }
        } else {
            alert(message);
        }
    }

    /**
     * Emergency cache clear (preserves auth)
     */
    emergencyClearCache() {
        try {
            // Save protected keys
            const protectedData = {};
            this.PROTECTED_KEYS.forEach(key => {
                const value = this.getItem(key);
                if (value) protectedData[key] = value;
            });

            // Clear everything
            localStorage.clear();

            // Restore protected keys
            Object.entries(protectedData).forEach(([key, value]) => {
                localStorage.setItem(key, value);
            });

            console.log('[StorageManager] Emergency cache cleared successfully');
            alert('✅ Cache cleared! Please refresh the page.');
            window.location.reload();
        } catch (error) {
            console.error('[StorageManager] Emergency clear failed:', error);
            alert('Please manually clear browser cache: Settings → Privacy → Clear browsing data');
        }
    }

    /**
     * Format bytes to readable format
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * Get current localStorage size
     */
    getLocalStorageSize() {
        let total = 0;
        for (const key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        return total;
    }

    /**
     * Get storage report
     */
    getStorageReport() {
        const items = {};
        let total = 0;

        for (const key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                const size = localStorage[key].length + key.length;
                items[key] = this.formatBytes(size);
                total += size;
            }
        }

        return {
            items,
            total: this.formatBytes(total),
            totalBytes: total
        };
    }
}

// Create singleton instance
const storageManager = new StorageManager();

export default storageManager;
