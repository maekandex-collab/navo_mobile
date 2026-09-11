const SecureStore = require('expo-secure-store');

const SERVICE = 'navo.expo.go.keychain';

async function setGenericPassword(username, password, options = {}) {
  const service = options.service || SERVICE;
  await SecureStore.setItemAsync(
    service,
    JSON.stringify({ username, password }),
    options.accessible
      ? { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK }
      : undefined
  );
  return true;
}

async function getGenericPassword(options = {}) {
  const service = options.service || SERVICE;
  const raw = await SecureStore.getItemAsync(service);
  if (!raw) return false;
  try {
    const parsed = JSON.parse(raw);
    return { username: parsed.username, password: parsed.password, service, storage: 'keychain' };
  } catch {
    return false;
  }
}

async function resetGenericPassword(options = {}) {
  const service = options.service || SERVICE;
  await SecureStore.deleteItemAsync(service);
  return true;
}

module.exports = {
  setGenericPassword,
  getGenericPassword,
  resetGenericPassword,
  ACCESSIBLE: {
    WHEN_UNLOCKED: 'AccessibleWhenUnlocked',
    AFTER_FIRST_UNLOCK: 'AccessibleAfterFirstUnlock',
    ALWAYS: 'AccessibleAlways',
    WHEN_PASSCODE_SET_THIS_DEVICE_ONLY: 'AccessibleWhenPasscodeSetThisDeviceOnly',
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'AccessibleWhenUnlockedThisDeviceOnly',
    AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 'AccessibleAfterFirstUnlockThisDeviceOnly',
  },
};
