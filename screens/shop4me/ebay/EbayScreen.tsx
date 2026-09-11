import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Header from '@/components/Header'
import { Image } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { images } from '@/constants'
import { router } from 'expo-router'

const EbayScreen = () => {
  return (
    <SafeAreaView className='h-full bg-white px-4'>
        <Header title="Ebay" showGoBack={true} onpress={() => router.back()}/>

        <View className='flex-1 w-full items-center justify-center'>
            <View className="w-full items-center mx-auto justify-center">
            <Image source={images.comingSoon} className='size-64' resizeMode='contain'/>
            </View>
        </View>

        <StatusBar backgroundColor="#ffffff" style='dark'/>
    </SafeAreaView>
  )
}

export default EbayScreen