import { View, Text } from 'react-native'
import React from 'react'
import Header from '@/components/Header'
import { StatusBar } from 'expo-status-bar'
import SpaceBetween from '@/components/SpaceBetween'
import { images } from '@/constants'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function ShipmentScreen() {
  return (
    <SafeAreaView className='h-full bg-white px-4'>
      <Header title="Shipments" showGoBack={false}/>
      
      <View className='mt-4'>
        <SpaceBetween title="Check in Shipments" desc="See all system shipments and details" onpress={() => router.push("/(protected)/(routes)/CheckInShipment")} image={images.shipmentoverlay}/>
        <SpaceBetween title="My Shipments" desc="Manage all your shipments all together" onpress={() => router.push("/(protected)/(routes)/MyShipments")} image={images.shipmentoverlay}/>
      </View>
      <StatusBar backgroundColor="#ffffff" style='dark'/>
    </SafeAreaView>
  )
}