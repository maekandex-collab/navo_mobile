import { View, Text, ActivityIndicator } from 'react-native'
import React from 'react'
import { StatusBar } from 'expo-status-bar'

const NaijaShopLoad = () => {
  return (
    <View className='flex-1 bg-white items-center justify-center'>
        <ActivityIndicator size="large" color="#003366"/>
        <Text className="text-base text-blue mt-2 font-abold">Please wait</Text>
        <StatusBar backgroundColor="#ffffff" style='dark'/>
    </View>
  )
}

export default NaijaShopLoad