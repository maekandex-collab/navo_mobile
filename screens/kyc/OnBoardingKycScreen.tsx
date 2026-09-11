import { View, Text, TouchableOpacity } from 'react-native'
import React, { useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomButton from '@/components/CustomButton';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OnboardingKycScreen = () => {

  const insets = useSafeAreaInsets();
  const statusBarTop = insets.top + 20;
  const statusBarBottom = insets.bottom + 30;

  useEffect(() => {
    const handleFirstTime = async () => {
      const notFirstTime = await AsyncStorage.getItem('notFirstTime');

      if(!notFirstTime){
        await AsyncStorage.setItem("notFirstTime", "true");
      }

    };

    handleFirstTime()
  }, [])

  const goBack = () => {
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace("/(protected)/(tabs)/home")
    }
  }

  return (
    <LinearGradient colors={['#FFFFFF', '#FFC198']} start={{ x: 0, y: 0.1 }} end={{ x: 0, y: 1 }} style={{ flex: 1 }} className='items-center justify-center'>
      <View className='w-full flex-1 px-4 justify-between' style={{ marginTop: statusBarTop, marginBottom: statusBarBottom }}>
        <View className='mt-10 mb-2'>
          <View className='w-full'>
            <View className='items-center justify-center w-full'>
              <MaterialIcons name="verified" size={60} color="#003366" />
              <Text className={`font-ablack text-xl text-center text-blue`}>KYC VERIFICATION</Text>
              <Text className={`font-abold text-center text-blue mt-3`}>To ensure the safety and compliance of all users on our platform, we require a brief KYC (Know Your Customer) process. This helps us verify your identity, protect against fraud, and meet regulatory standards.</Text>
            </View>
          </View>
        </View>

        <View>
            <CustomButton title="Begin KYC Verification" containerStyles='w-full my-2' textStyles='text-white' handlePress={() => router.push("/(protected)/(routes)/Kyc")}/>
            <TouchableOpacity activeOpacity={0.7} className='w-full' onPress={goBack}>
              <Text className={`font-abold text-xl text-center text-blue my-2`}>I'll do this later</Text>
            </TouchableOpacity>
        </View>
      </View>
      <StatusBar style="dark" backgroundColor='#ffffff'/>
    </LinearGradient>
  )
}

export default OnboardingKycScreen