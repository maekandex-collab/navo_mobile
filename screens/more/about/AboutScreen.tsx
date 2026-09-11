import { View, Text } from 'react-native'
import React from 'react'
import Header from '@/components/Header'
import { StatusBar } from 'expo-status-bar'
import SpaceBetween from '@/components/SpaceBetween'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AntDesign from '@expo/vector-icons/AntDesign';

export default function AboutScreen() {
  return (
    <SafeAreaView className='h-full bg-white px-4'>
      <Header title="About Navo" showGoBack={true} onpress={() => router.back()}/>
      
      <View className='mt-4'>
        <SpaceBetween onpress={() => router.push("/(protected)/(routes)/TermsOfUse")} title='Terms of Use' desc='Understand our services’ guidelines and rules.' descStyle='text-[9px]' lefticon={<FontAwesome6 name="file-pen" color={"#FF6600"} size={18}/>}/>
        <SpaceBetween onpress={() => router.push("/(protected)/(routes)/PrivacyPolicy")} title='Privacy Policy' desc='Learn how we protect your data.' descStyle='text-[9px]' lefticon={<MaterialIcons name="privacy-tip" size={24} color={"#FF6600"} />}/>
        <SpaceBetween onpress={() => router.push("/(protected)/(routes)/FAQs")} title='FAQs' desc='Find answers to common questions.' descStyle='text-[9px]' lefticon={<FontAwesome name="question-circle" size={24} color={"#FF6600"} />}/>
        <SpaceBetween onpress={() => router.push("/(protected)/(routes)/VisitOurWebsite")} title='Visit Our Website' desc='Explore our services and stay updated.' descStyle='text-[9px]' lefticon={<AntDesign name="earth" size={22} color={"#FF6600"} />}/>
        <SpaceBetween onpress={() => router.push("/(protected)/(routes)/JoinOurCommunity")} title='Join Our Community' desc='Connect with like-minded professionals.' descStyle='text-[9px]' lefticon={<FontAwesome name="users" size={20} color={"#FF6600"} />}/>
      </View>
      <StatusBar backgroundColor="#ffffff" style='dark'/>
    </SafeAreaView>
  )
}