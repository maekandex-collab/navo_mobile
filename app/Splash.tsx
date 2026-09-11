import { StyleSheet, Image, Text, View, ImageBackground } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { router } from 'expo-router';
import { images} from "../constants"
import React from 'react';
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';

export default function Splash() {

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(onboarding)')
    },3000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <ImageBackground source={images.splash} resizeMode="cover" style={styles.image}>
          <View className="flex-row justify-center items-center">
            <Text className='text-orange font-ablack' style={{fontSize: 40}}>Navo</Text>
            <Text className="text-white font-ablack" style={{ fontSize: 35, transform: [{ translateY: -10 }] }}>+</Text>
          </View>
        </ImageBackground>
      </SafeAreaView>
      <StatusBar style='light'/>
    </SafeAreaProvider>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    flex: 1,
    justifyContent: 'center',
  }
});
