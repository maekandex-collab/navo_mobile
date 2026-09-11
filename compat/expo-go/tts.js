const Tts = {
  speak: async () => {},
  stop: async () => {},
  setDefaultLanguage: async () => {},
  setDefaultRate: async () => {},
  setDefaultPitch: async () => {},
  addEventListener: () => ({ remove: () => {} }),
  removeEventListener: () => {},
  removeAllListeners: () => {},
  voices: async () => [],
};

module.exports = Tts;
module.exports.default = Tts;
