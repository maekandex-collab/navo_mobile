import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import Animated, { FadeInRight } from 'react-native-reanimated';

export default function SmallTextCustomToast({ message, image, onClose }: { message: string; image: ImageSourcePropType; onClose: () => void }) {
  return (
    <Animated.View entering={FadeInRight.duration(100).delay(100).springify()} style={styles.container}>
      <View style={styles.content}>
        <Image
          source={image} // add your icon here
          style={styles.icon}
        />
        <Text style={styles.text}>{message}</Text>
      </View>
      <TouchableOpacity onPress={onClose}>
        <AntDesign name="closecircleo" size={24} color="#003366" />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 50,
    marginTop: "30%",
    backgroundColor: '#FFE1CC', // soft peach
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 17,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: "center",
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
    left:12,
    right: 12,
    gap:15
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10
  },
  icon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  text: {
    color: '#003366',
    fontSize: 18,
    fontWeight: '600',
    flexShrink: 1,
  }
});
