import { View, Text, Image, TouchableOpacity, Pressable, Share } from 'react-native'
import React, { useEffect, useState } from 'react'
import Header from '@/components/Header'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { router } from 'expo-router'
import { images } from '@/constants'
import CustomButton from '@/components/CustomButton'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import * as Clipboard from 'expo-clipboard';
import { useToast } from 'react-native-toast-notifications'
import { axiosClient } from '@/globalApi'
import { useSelector, useDispatch } from 'react-redux'
import { setReferralInfo } from '@/redux/ReferralSlice'
import type { RootState } from '@/redux/store'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'
import AsyncStorage from '@react-native-async-storage/async-storage'
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons'

const ReferScreen = () => {

  const toast = useToast();

  const [code, setCode] = useState<string | null>('')
  const dispatch = useDispatch()
  const { refData } = useSelector((state: RootState) => state.referral)
  const { userProfile } = useSelector((state: RootState) => state.profile)
 

  const [isLoading, setIsLoading] = useState(false)
  
  useEffect(() => {
    referralData()
  }, [])

  const referralData = async () => {

    const referralKey = `referralCode_${userProfile.email}`;

    const referralCode = await AsyncStorage.getItem(referralKey);
  
    const code = referralCode != null ? referralCode : null;

    if(!code){
      setIsLoading(true)

      try {

        const result = await axiosClient.get("/referrals")

        setCode(result?.data?.referralCode)
        await AsyncStorage.setItem(referralKey, result?.data?.referralCode);
        dispatch(setReferralInfo(result?.data))
        
        console.log(result.data)

      } catch (error: any) {
        toast.show(error.response.data.message || error.response.data.error.message,{
          type: "danger",
        });
      } finally {
        setIsLoading(false)
      }
    }else{
      setCode(code)
    }
  }

  const copyCode = async () => {
    if(code){
      const copyCode = await Clipboard.setStringAsync(code);

      toast.show("Referral Code Copied", {
        type: "success",
      });
    } 
  }

  const shareLink = async () => {

    if(!code) return

    const url = "https://navoplus.com"

    const result = await Share.share(
      {
        message: `Join me on NavoPlus app 🚀\nUse my referral code: ${code}\n${url}`,
        title: 'Invite a friend to NavoPlus',
        // url: url,
      },
      {
        dialogTitle: 'Share your referral code',
      }
    );

  };

  return (
    <SafeAreaView className='h-full bg-white px-4'>
      <Header title="Refer and Earn" showGoBack={true} onpress={() => router.back()}/>

            <View className='flex-1 mt-3'>
                <View className='w-full flex-1 items-center justify-center'>
                    <Image source={images.award} className="size-40" resizeMode='contain'/>

                    <View className='my-3'>
                        <View>
                            <View className='flex-row gap-2 items-center justify-center'>
                                <Text className="text-xl text-center text-blue font-amedium">Refer & Earn</Text>
                                <View className='relative'>
                                    <Text className="text-xl text-center text-orange font-amedium">points!</Text>
                                    <Image source={images.circle} resizeMode='contain' className='size-20 absolute -bottom-7 -right-2'/>
                                </View>
                            </View>
                            <Text className="text-xs text-center text-gray-300 mt-4 font-amedium max-w-[250px]">Earn points whenever you refer a user and he/she transacts with Navo Cargo</Text>
                            
                            {isLoading ? (
                              <View className='flex-row gap-3 items-center justify-center mt-4'>
                                <TouchableOpacity>
                                  <View className='flex-row items-center gap-2 px-3 py-2 bg-orangeLight rounded-lg'>
                                    <FontAwesome5 name="circle-notch" size={20} color="#FF6600" className='animate-spin-fast'/>
                                  </View>
                                </TouchableOpacity>
                              </View>
                            ) : code ? (
                              <View className='flex-row gap-4 items-center justify-center mt-4'>
                                  <TouchableOpacity onPress={copyCode}>
                                    <View className='flex-row items-center gap-2 px-3 py-2 bg-orangeLight rounded-lg'>
                                      <Text className="text-base text-orange font-amedium max-w-[250px]">{code || refData?.referralCode}</Text>
                                      <FontAwesome6 name="copy" size={16} color="#FF6600" />
                                    </View>
                                  </TouchableOpacity>
                                  <View className='flex-row gap-2 items-center'>
                                    <TouchableOpacity activeOpacity={0.8} onPress={shareLink} className='size-10 rounded-full items-center justify-center bg-[#2E78B6]'>
                                      <SimpleLineIcons name="share" size={16} color="#fff" />
                                    </TouchableOpacity>
                                  </View>
                              </View>
                            ) : ""}
                        </View>
                    </View>
                </View>

                {!isLoading && <CustomButton title='See Breakdown' containerStyles='mb-6' textStyles='text-white' handlePress={() => router.push("/(protected)/(routes)/ReferralBreakdown")}/>}     
            </View>

      <StatusBar backgroundColor="#ffffff" style='dark'/>
    </SafeAreaView>
  )
}

export default ReferScreen