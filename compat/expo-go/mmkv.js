/**
 * Expo Go–safe MMKV stand-in (sync memory + AsyncStorage persist).
 * Used when EXPO_GO_COMPAT=1 so cart storage does not require TurboModules.
 */
const AsyncStorage = require('@react-native-async-storage/async-storage').default;

const PREFIX = '@navo_mmkv:';
const memory = new Map();
let hydrated = false;
let hydratePromise = null;

function hydrate() {
  if (hydrated) return Promise.resolve();
  if (hydratePromise) return hydratePromise;
  hydratePromise = AsyncStorage.getAllKeys()
    .then((keys) => {
      const ours = keys.filter((k) => k.startsWith(PREFIX));
      if (!ours.length) return [];
      return AsyncStorage.multiGet(ours);
    })
    .then((pairs) => {
      for (const [key, value] of pairs || []) {
        memory.set(key.slice(PREFIX.length), value);
      }
      hydrated = true;
    })
    .catch(() => {
      hydrated = true;
    });
  return hydratePromise;
}

hydrate();

class MMKV {
  constructor(_options) {}

  getString(key) {
    const v = memory.get(key);
    return v == null ? undefined : v;
  }

  set(key, value) {
    const str = typeof value === 'string' ? value : String(value);
    memory.set(key, str);
    AsyncStorage.setItem(PREFIX + key, str).catch(() => {});
  }

  delete(key) {
    memory.delete(key);
    AsyncStorage.removeItem(PREFIX + key).catch(() => {});
  }

  clearAll() {
    const keys = [...memory.keys()];
    memory.clear();
    AsyncStorage.multiRemove(keys.map((k) => PREFIX + k)).catch(() => {});
  }

  contains(key) {
    return memory.has(key);
  }

  getNumber(key) {
    const v = this.getString(key);
    if (v == null) return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  }

  getBoolean(key) {
    const v = this.getString(key);
    if (v == null) return undefined;
    return v === 'true';
  }
}

module.exports = { MMKV, createMMKV: (opts) => new MMKV(opts) };
