const React = require('react');
const { View, Text, StyleSheet } = require('react-native');

function Camera({ style, children, ..._rest }) {
  return React.createElement(
    View,
    { style: [styles.box, style] },
    React.createElement(
      Text,
      { style: styles.text },
      'Camera (vision-camera) is not available in Expo Go.'
    ),
    children
  );
}

function useCameraDevice() {
  return null;
}

function useCameraPermission() {
  return {
    hasPermission: false,
    requestPermission: async () => false,
  };
}

function useFrameProcessor() {
  return null;
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
  },
  text: { color: '#f9fafb', textAlign: 'center', padding: 16 },
});

module.exports = {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useFrameProcessor,
  useCameraFormat: () => null,
  useMicrophonePermission: () => ({ hasPermission: false, requestPermission: async () => false }),
};
