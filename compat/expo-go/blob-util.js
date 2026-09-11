const noop = async () => null;

const ReactNativeBlobUtil = {
  fs: {
    dirs: { DocumentDir: '', CacheDir: '' },
    writeFile: noop,
    readFile: noop,
    unlink: noop,
    exists: async () => false,
    mkdir: noop,
  },
  config: () => ReactNativeBlobUtil,
  fetch: async () => ({ path: () => '', data: '' }),
  wrap: (path) => path,
};

module.exports = ReactNativeBlobUtil;
module.exports.default = ReactNativeBlobUtil;
