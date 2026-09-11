import React from 'react';
import { Modal, View, ActivityIndicator } from 'react-native';

const LoadingModalLogin = ({ visible }: {visible: boolean}) => (
  <Modal
    animationType="fade"
    transparent={true}
    visible={visible}
    onRequestClose={() => {}} // prevents back button dismiss on Android
    hardwareAccelerated={true}
    statusBarTranslucent={true}>
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
    }}>
      <ActivityIndicator size="large" color="#FF6600" />
    </View>
  </Modal>
);

export default LoadingModalLogin
