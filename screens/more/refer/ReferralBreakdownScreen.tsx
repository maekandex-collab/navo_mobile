import { View, Text, Image, FlatList, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Header from '@/components/Header'
import { StatusBar } from 'expo-status-bar'
import { router } from 'expo-router'
import { images } from '@/constants'
import { ImageBackground } from 'react-native'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/redux/store'
import { axiosClient } from '@/globalApi'
import { setReferralInfo } from '@/redux/ReferralSlice'
import { useToast } from 'react-native-toast-notifications'
import CustomButton from '@/components/CustomButton'
import displayCurrency from '@/utils/displayCurrency'
import { hideLoader, showLoader } from '@/redux/LoaderSlice'

const ReferralBreakdownScreen = () => {

  const dispatch = useDispatch()
  const toast = useToast();
  const { refData } = useSelector((state: RootState) => state.referral)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    referralData()
  }, [])

  const referralData = async () => {

    setIsLoading(true)

    try {

      const result = await axiosClient.get("/referrals")

      dispatch(setReferralInfo(result.data))
      
      console.log("ref=", result.data)

    } catch (error: any) {
      toast.show(error.response.data.message || error.response.data.error.message,{
        type: "danger",
      });
    } finally {
      setIsLoading(false)
    }  
  }

  const submit = async () => {

    if(!refData?.referralWallet?.balance){
      return toast.show("You don't have any referral balance", {
        type: "warning",
      });
    }

    try {

      dispatch(showLoader());
      
      const result = await axiosClient.post("/referrals/redeem-points")

      toast.show(result.data.message, {
        type: "success",
      })

      router.replace("/(protected)/(tabs)/home")

    } catch (error: any) {
      toast.show(error.response.data.message || error.response.data.error.message,{
        type: "danger",
      });

    } finally {
      dispatch(hideLoader());
    } 
  }

  const data = [
    {
      label: 'Total points gotten',
      value: refData?.referralWallet?.balance
    },
    {
      label: 'Used points',
      value: refData?.referralWallet?.pointsUsed
    },
    {
      label: 'Expired',
      value: refData?.referralWallet?.pointsUsed === "0" ? "Nil" : refData?.referralWallet?.pointsUsed
    },
    {
      label: 'Total sign ups',
      value: refData?.totalSignups
    },
    {
      label: 'Signups that transacted',
      value: refData?.signupsThatTransacted === 0 ? "Nil" : refData?.signupsThatTransacted
    },
    {
      label: 'Pending sign ups',
      value: refData?.pendingSignups
    },
  ]

  return (
    <SafeAreaView className='h-full bg-white px-4'>
      <Header title="Refer and Earn" showGoBack={true} onpress={() => router.back()}/>

      {isLoading ? (
        <View className='mt-20'>
          <ActivityIndicator size="large" color="#003366"/>
        </View>
      ) : (
        <View className='mt-4'>
          <View className='flex-row gap-2 items-center justify-between mb-3'>
            <View className='flex-row gap-1 items-center justify-center'>
              <Image source={images.awardSmall} resizeMode='contain'/>
              <View className='items-start'>
                <Text className="text-sm text-center text-gray-300 font-amedium">Your Wallet Balance</Text>
                <Text className="text-lg text-center font-abold">{displayCurrency(Number(refData?.referralWallet?.balance), refData?.currency)}</Text>
              </View>
            </View>
            <ImageBackground source={images.awardCircle} className="size-28 items-center justify-center" resizeMode='contain'>
              <Text className="text-4xl text-orange font-abold">{refData.referralWallet.balance}</Text>
            </ImageBackground>
          </View>

          <Text className="text-xl text-blue font-abold mb-2">Breakdown</Text>

          <FlatList
            scrollEnabled={true}
            data={data}
            keyExtractor={(item, index) => index.toString()}
            numColumns={2}
            contentContainerStyle={{gap: 10}}
            columnWrapperStyle={{gap: 10, justifyContent: 'space-between', width: '100%'}}
            renderItem={({item}) => 
              <View className='p-3 bg-orangeLight rounded-lg w-[48%]'>
                <Text className="text-sm text-blue font-amedium">{item.label}</Text>
                <Text className="text-xl text-orange font-abold">{item.value}</Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
            />
            <View className='w-full justify-center my-6'>
              <Text className="text-sm text-blue font-amedium my-2">Redeem referral balance into your wallet</Text>
              <CustomButton title="Redeem" handlePress={submit}  containerStyles="w-full" textStyles='text-white'/>
            </View>
          </View>
      )}
      
      <StatusBar backgroundColor="#ffffff" style='dark'/>
    </SafeAreaView>
  )
}

export default ReferralBreakdownScreen