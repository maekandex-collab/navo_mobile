import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import Header from '@/components/Header'
import { StatusBar } from 'expo-status-bar'
import SpaceBetween from '@/components/SpaceBetween'
import { images } from '@/constants'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'
import AntDesign from '@expo/vector-icons/AntDesign'
import Ionicons from '@expo/vector-icons/Ionicons'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import CustomButton from '@/components/CustomButton'
import { Image } from 'react-native'

export default function VirtualPaymentScreen() {

  const [active, setActive] = useState("nigeria")

  const nigeria = () => {
    setActive("nigeria")
  }

  const uk = () => {
    setActive("uk")
  }

  return (
    <SafeAreaView className='h-full bg-white px-4 flex-1'>
      <Header title="Virtual Shipments" showGoBack={true} onpress={() => router.back()}/>

      {/* <View className='mt-5 w-full'>
        <View className='flex-row items-center w-full justify-between'>
          <CustomButton title='Nigeria' containerStyles="w-[48%]" bgColor={active === 'nigeria' ? 'bg-blue' : 'bg-blue/50'} textStyles='text-white' handlePress={nigeria}/>
          <CustomButton title='UK' containerStyles="w-[48%]"  bgColor={active === 'uk' ? 'bg-blue' : 'bg-blue/50'} textStyles='text-white' handlePress={uk}/>
        </View>
      </View> */}
      <Text className='mt-4 text-blue text-lg font-amedium'>For Nigerian Networks only</Text>
      
      {active === "nigeria" && (
        <View className='mt-2'>
          <SpaceBetween onpress={() => router.push("/(protected)/(routes)/ShipAirtime")} title='Buy Airtime' desc='Stay connected instantly.' descStyle='text-[9px]' lefticon={<FontAwesome6 name="phone-volume" color={"#FF6600"} size={18}/>}/>
          <SpaceBetween onpress={() => router.push("/(protected)/(routes)/ShipData")} title='Buy Data' desc='Fast, reliable internet on demand.' descStyle='text-[9px]' lefticon={<AntDesign name="earth" size={20} color={"#FF6600"} />}/>
          <SpaceBetween onpress={() => router.push("/(protected)/(routes)/ShipCableTV")} title='Pay Cable TV' desc='Enjoy nonstop entertainment.' descStyle='text-[9px]' lefticon={<Ionicons name="tv-sharp" size={20} color={"#FF6600"} />}/>
          <SpaceBetween onpress={() => router.push("/(protected)/(routes)/ShipUtility")} title='Pay Utility' desc='Pay bills effortlessly.' descStyle='text-[9px]' lefticon={<MaterialIcons name="electric-bolt" size={20} color={"#FF6600"} />}/>
        </View>
      )}

      {active === "uk" && (
        <View className='mt-4 flex-1 w-full items-center justify-center'>
          <View className="w-full items-center mx-auto justify-center my-6 mt-8">
            <Image source={images.comingSoon} className='size-64' resizeMode='contain'/>
          </View>
        </View>
      )}
      
      <StatusBar backgroundColor="#ffffff" style='dark'/>
    </SafeAreaView>
  )
}