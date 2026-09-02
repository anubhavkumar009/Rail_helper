// SessionStorage with TTL (default 15 minutes) to persist user activity across tab navigation
const PREFIX = 'my_rail_helper_';

export const cacheUtil = {
  get: (key, maxAgeMinutes = 15) => {
    try {
      const raw = sessionStorage.getItem(`${PREFIX}${key}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.timestamp) return null;
      
      const ageMs = Date.now() - parsed.timestamp;
      if (ageMs > maxAgeMinutes * 60 * 1000) {
        sessionStorage.removeItem(`${PREFIX}${key}`);
        return null;
      }
      return parsed.data;
    } catch (e) {
      console.warn('Cache read error:', e);
      return null;
    }
  },

  set: (key, data) => {
    try {
      sessionStorage.setItem(
        `${PREFIX}${key}`,
        JSON.stringify({
          timestamp: Date.now(),
          data,
        })
      );
    } catch (e) {
      console.warn('Cache write error:', e);
    }
  },

  remove: (key) => {
    try {
      sessionStorage.removeItem(`${PREFIX}${key}`);
    } catch (e) {
      console.warn('Cache remove error:', e);
    }
  },
};
