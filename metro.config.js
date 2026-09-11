const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

/** Expo Go does not ship custom native modules used by this app. */
const useExpoGoCompat =
  process.env.EXPO_GO_COMPAT === '1' ||
  process.env.EXPO_GO_COMPAT === 'true';

const expoGoAliases = {
  'react-native-mmkv': path.resolve(__dirname, 'compat/expo-go/mmkv.js'),
  'react-native-pdf': path.resolve(__dirname, 'compat/expo-go/pdf.js'),
  'react-native-blob-util': path.resolve(__dirname, 'compat/expo-go/blob-util.js'),
  '@stripe/stripe-react-native': path.resolve(__dirname, 'compat/expo-go/stripe.js'),
  'react-native-keychain': path.resolve(__dirname, 'compat/expo-go/keychain.js'),
  'react-native-vision-camera': path.resolve(__dirname, 'compat/expo-go/vision-camera.js'),
  'react-native-tts': path.resolve(__dirname, 'compat/expo-go/tts.js'),
  '@react-native-ml-kit/face-detection': path.resolve(
    __dirname,
    'compat/expo-go/face-detection.js'
  ),
};

if (useExpoGoCompat) {
  const previousResolveRequest = config.resolver.resolveRequest;
  config.resolver.resolveRequest = (context, moduleName, platform) => {
    const target = expoGoAliases[moduleName];
    if (target) {
      return { filePath: target, type: 'sourceFile' };
    }
    if (previousResolveRequest) {
      return previousResolveRequest(context, moduleName, platform);
    }
    return context.resolveRequest(context, moduleName, platform);
  };
  console.log('[metro] Expo Go compatibility stubs enabled');
}

module.exports = withNativeWind(config, { input: './global.css' });
