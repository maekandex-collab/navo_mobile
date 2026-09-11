import { View, Text } from 'react-native'
import React from 'react'
import Header from '@/components/Header'
import { StatusBar } from 'expo-status-bar'
import SpaceBetween from '@/components/SpaceBetween'
import { images } from '@/constants'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'

export default function OrdersScreen() {
  return (
    <SafeAreaView className='h-full bg-white px-4'>
      <Header title="Orders" showGoBack onpress={() => router.back()}/>
      
      <View className='mt-4'>
        <SpaceBetween title="Fooding" desc="View your fooding orders" onpress={() => router.push("/(protected)/(routes)/FoodingOrders")} lefticon={<MaterialCommunityIcons name="shopping" size={24} color={"#FF6600"} />}/>
        <SpaceBetween title="Shop With Link" desc="View your shop with link orders" onpress={() => router.push("/(protected)/(routes)/ShopWithLinkOrders")} lefticon={<MaterialCommunityIcons name="shopping" size={24} color={"#FF6600"} />}/>
        <SpaceBetween title="Amazon" desc="View your amazon orders" onpress={() => router.push("/(protected)/(routes)/AmazonOrders")} lefticon={<MaterialCommunityIcons name="shopping" size={24} color={"#FF6600"} />}/>
        <SpaceBetween title="Naija Shop" desc="View your naija shop orders" onpress={() => router.push("/(protected)/(routes)/NaijaShopOrders")} lefticon={<MaterialCommunityIcons name="shopping" size={24} color={"#FF6600"} />}/>
      </View>
      <StatusBar backgroundColor="#ffffff" style='dark'/>
    </SafeAreaView>
  )
}