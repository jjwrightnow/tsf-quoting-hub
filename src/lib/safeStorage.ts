export const safeStorage = {
  getItem(key: string) {
    if (typeof window === 'undefined') return null;

    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  setItem(key: string, value: string) {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Ignore storage write failures so the UI can keep rendering.
    }
  },

  removeItem(key: string) {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore storage removal failures so the UI can keep rendering.
    }
  },
};

export const safePersistStorage = {
  getItem(name: string) {
    const raw = safeStorage.getItem(name);
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch {
      safeStorage.removeItem(name);
      return null;
    }
  },

  setItem(name: string, value: unknown) {
    safeStorage.setItem(name, JSON.stringify(value));
  },

  removeItem(name: string) {
    safeStorage.removeItem(name);
  },
};