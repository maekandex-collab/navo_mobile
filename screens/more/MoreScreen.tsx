import { View, Text, Image, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Dimensions } from 'react-native'
import { StatusBar } from 'expo-status-bar';
import WhiteButton from '@/components/WhiteButton';
import { images } from '@/constants';
import SpaceBetween from '@/components/SpaceBetween';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Fontisto from '@expo/vector-icons/Fontisto';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { router } from 'expo-router';
import * as SecureStore from "expo-secure-store";
import { axiosClient } from '@/globalApi';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from 'expo-constants';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from "@/redux/AuthSlice";
import { RootState } from '@/redux/store';
import { clearProfile } from '@/redux/ProfileSlice';
import { Image as ExpoImage } from 'expo-image';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const height = Dimensions.get('window').height;

export default function MoreScreen() {

  const blurhash = 'L~I64noffQfQfQfQfQfQfQfQfQfQ';
    
  const { top } = useSafeAreaInsets()
  const { userProfile } = useSelector((state: RootState) => state.profile)
  const [logoutToken, setLogoutToken] = useState<any>("")
  const dispatch = useDispatch();

    useEffect(() => {
      const handleToken = async () => {
        const token = await SecureStore.getItemAsync("accessToken")
        setLogoutToken(token);
      };
  
      handleToken()
    }, [])

  const logoutUser = async () => {

    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");
    await AsyncStorage.removeItem('userProfile');
    
    dispatch(logout());
    dispatch(clearProfile());

    router.replace("/(onboarding)/SignIn");

    axiosClient.post("/auth/logout", {}, {
      headers: {
        Authorization: `Bearer ${logoutToken}`,
      }
    })
      
  }

  return (
    <View className="h-full bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          <View  style={{ paddingTop: top }} className={`w-full ${height >= 640 ? "h-52" : "h-44"} bg-blue px-4 relative`}>
            <View className='flex-row items-center justify-end mt-4 pb-4'>
              <WhiteButton title='Sign Out' handlePress={logoutUser} containerStyles='bg-[#EB3D405C] border-[#EB3D405C]' loadingColor="#ef4444" loadingText='Logging Out' textStyles='text-red-500'/>
            </View>
            <View className='flex-row gap-4 items-start absolute -bottom-10 left-4'>
              <View className='size-[100px] rounded-full border border-gray-100 z-10 bg-blue'>
                {userProfile?.profilePicture ? (
                  <ExpoImage source={{ uri: `${process.env.EXPO_PUBLIC_IMAGE_URI}${userProfile?.profilePicture}` }} placeholder={{ blurhash }} cachePolicy="disk" contentFit="cover" style={{ width: "100%", height: "100%", borderRadius: 50 }}/>
                ) : (
                  <Image source={images.user} resizeMode='cover' className='w-full h-full rounded-full overflow-hidden'/>
                )}
              </View>
              <View className='flex-1'>
                <View className='flex-row items-center gap-1 pr-4'>
                  <Text className="text-sm text-white font-amedium" numberOfLines={1}>{userProfile.accountName}</Text>
                  {userProfile.kycVerified && <MaterialIcons name="verified" size={16} color="#FF6600" />}
                </View>
                <Text className="text-sm text-white font-alight" numberOfLines={1}>{userProfile.email}</Text>
              </View>
            </View>
          </View>
        </View>

        <View className='pt-12 pb-7 px-4'>
          <SpaceBetween onpress={() => router.push("/(protected)/(routes)/UserProfile")} title='User Profile' desc='Manage your personal details and preferences.' descStyle='text-[9px]' lefticon={<FontAwesome name="user" color={"#FF6600"} size={24}/>}/>
          <SpaceBetween onpress={() => router.push("/(protected)/(routes)/Wallet")} title='Wallet' desc='Store, manage, and spend with ease.' descStyle='text-[9px]' lefticon={<Ionicons name="wallet" size={24} color={"#FF6600"} />}/>
          <SpaceBetween onpress={() => router.push("/(protected)/(routes)/Fx")} title='FX Payment' desc='Real-time conversion exchange rate and fees.' descStyle='text-[9px]' lefticon={<FontAwesome6 name="arrows-rotate" size={22} color="#FF6600" />}/>
          <SpaceBetween onpress={() => router.push("/(protected)/(routes)/VirtualPayments")} title='Bill Payment' desc='Secure and seamless online transactions.' descStyle='text-[9px]' lefticon={<MaterialIcons name="wallet" size={24} color={"#FF6600"} />}/>
          <SpaceBetween onpress={() => router.push("/(protected)/(routes)/Orders")} title='Orders' desc='Check your orders and its status.' descStyle='text-[9px]' lefticon={<MaterialCommunityIcons name="shopping" size={24} color={"#FF6600"} />}/>
          <SpaceBetween onpress={() => {userProfile?.kycVerified ? router.push("/(protected)/(routes)/UserVerified") : router.push("/(protected)/(routes)/OnboardingKyc")}} title='KYC Verification' desc='Verify your identity.' descStyle='text-[9px]' lefticon={<FontAwesome5 name="user-check" size={16} color="#FF6600" />}/>
          <SpaceBetween onpress={() => router.push("/(protected)/(routes)/Security")} title='Security' desc='Protect your account with security features.' descStyle='text-[9px]' lefticon={<Fontisto name="locked" size={22} color={"#FF6600"} />}/>
          <SpaceBetween onpress={() => router.push("/(protected)/(routes)/Refer")} title='Refer and Earn' desc='Invite friends, earn rewards!' descStyle='text-[9px]' lefticon={<FontAwesome6 name="gift" size={20} color={"#FF6600"} />}/>
          <SpaceBetween onpress={() => router.push("/(protected)/(routes)/About")} title='About Navo' desc='Get help and find answers to your questions.' descStyle='text-[9px]' lefticon={<Entypo name="info" size={23} color={"#FF6600"} />}/>
          <SpaceBetween onpress={() => router.push("/(protected)/(routes)/Support")} title='Support' desc='Get help and find answers to your questions.' descStyle='text-[9px]' lefticon={<FontAwesome5 name="headphones" size={23} color={"#FF6600"} />}/>

          <Text className="text-lg text-gray-300 font-amedium mt-5">V {Constants.expoConfig?.version ?? '1.0.0'}</Text>
        </View>
      </ScrollView>

      <StatusBar backgroundColor="#003366" style='light'/>
    </View>
  )
}