/**
 * BEHAGYM PRO - Safe Storage Utility
 * Provides a wrapper for localStorage with in-memory fallback
 * to prevent SecurityError if browser blocks site data.
 */

class MemoryStorage {
    constructor() {
        this.data = new Map();
    }

    getItem(key) {
        return this.data.get(key) || null;
    }

    setItem(key, value) {
        this.data.set(key, value);
    }

    removeItem(key) {
        this.data.delete(key);
    }

    clear() {
        this.data.clear();
    }
}

let storage;

try {
    // Test if localStorage is available and accessible
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    storage = window.localStorage;
    console.log('[Storage] LocalStorage is available.');
} catch (e) {
    console.warn('[Storage] LocalStorage is blocked or inaccessible. Falling back to memory storage. Sessions will not persist on refresh.', e);
    storage = new MemoryStorage();
}

export default {
    getItem: (key) => storage.getItem(key),
    setItem: (key, value) => storage.setItem(key, value),
    removeItem: (key) => storage.removeItem(key),
    clear: () => storage.clear()
};
