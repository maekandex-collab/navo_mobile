const React = require('react');
const { View, Text, StyleSheet } = require('react-native');

function Pdf({ style, ..._rest }) {
  return React.createElement(
    View,
    { style: [styles.box, style] },
    React.createElement(
      Text,
      { style: styles.text },
      'PDF preview is not available in Expo Go. Use a development build for full PDF support.'
    )
  );
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f3f4f6',
  },
  text: {
    textAlign: 'center',
    color: '#374151',
    fontSize: 14,
  },
});

module.exports = Pdf;
module.exports.default = Pdf;
