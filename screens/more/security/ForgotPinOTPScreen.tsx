import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import CustomButton from '@/components/CustomButton'
import { router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { StyleSheet } from 'react-native'
import { useToast } from 'react-native-toast-notifications'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'
import { Platform } from 'react-native'
import { axiosClient } from '@/globalApi'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Header from '@/components/Header'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { setProfile } from '@/redux/ProfileSlice'
import { OtpInput } from 'react-native-otp-entry'
import CountDown from '@/components/CountDown'
import { hideLoader, showLoader } from '@/redux/LoaderSlice'

const ForgotPinOTPScreen = () => {

  const { userProfile } = useSelector((state: RootState) => state.profile)
  const [otp, setOtp] = useState('')
  const toast = useToast();
  const dispatch = useDispatch()
  const [resendLoading, setResendLoading] = useState(false)
  const [resend, setResend] = useState(false)
  const [emailKey, setEmailKey] = useState(0);

  const submit = async () => {

    if(!otp){
      return toast.show("OTP fields can't be empty", {
        type: "warning",
      });
    }

    if(otp.length < 4){
      return toast.show("OTP needs 4 numbers", {
        type: "warning",
      });
    }

    if(!userProfile?.isPinSet){
      router.back()
    }else{
      try {
  
        dispatch(showLoader());
  
        const data = {
          email: userProfile?.email,
          resetPinOtp: otp
        }
        
        const result = await axiosClient.post("/account/verify-forgot-pin-otp", data)

        const updateUser: any = {
          isPinSet: false,
          setPin: false
        }
  
        await AsyncStorage.mergeItem('userProfile', JSON.stringify(updateUser));

        const recentProfile = await AsyncStorage.getItem('userProfile');
        const updatedProfile = recentProfile ? JSON.parse(recentProfile) : null;

        if (updatedProfile) {
          dispatch(setProfile(updatedProfile));
        }
        
        toast.show(result.data.message, {
          type: "success",
        });
  
        router.replace("/(protected)/(routes)/SetPin")
  
        setOtp("")
  
      } catch (error: any) {
        toast.show(error.response.data.message || error.response.data.error.message,{
          type: "danger",
        });
  
      } finally {
        dispatch(hideLoader());
      } 
    }
  }

  const resendOtp = async () => {

    setResendLoading(true)

    try {
      const data = {
        email: userProfile?.email,
      }
      
      const result = await axiosClient.post("/account/resend-otp-pin", data)

      console.log(result.data)

      toast.show(result.data.message,{
        type: "success",
      });

      setResend(false)

    } catch (error: any) {
      toast.show(error.response.data.message || error.response.data.error.message,{
        type: "danger",
      });
    } finally {
      setResendLoading(false)
    }

  }

  return (
    <SafeAreaView className="bg-white h-full px-4">
      <Header title="Forgot PIN OTP" showGoBack={true} onpress={() => router.back()}/>
      <KeyboardAvoidingView className='flex-1' behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === 'ios' ? 30 : 0}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="w-full justify-center my-6 mt-6">
            <Text className="text-2xl text-blue mt-4 font-ablack">Lets verify you!</Text>
            <Text className="text-sm text-blue mt-1 font-alight mb-8">Enter the 4 digits OTP code we sent to your registered email</Text>
            <View style={{marginTop:40}}>
              <Text className="text-base text-blue font-amedium">OTP</Text>
              <OtpInput
                key={emailKey}
                numberOfDigits={4}
                onTextChange={(code) => setOtp(code)}
                theme={{
                  containerStyle: styles.container,
                  pinCodeContainerStyle: styles.pinCodeContainer,
                  pinCodeTextStyle: styles.pinCodeText,
                  focusStickStyle: styles.focusStick,
                  focusedPinCodeContainerStyle: styles.activePinCodeContainer,
                  placeholderTextStyle: styles.placeholderText,
                  filledPinCodeContainerStyle: styles.filledPinCodeContainer,
                  disabledPinCodeContainerStyle: styles.disabledPinCodeContainer,
                }}
              />
              <View className="pt-3 flex-row items-center gap-1">
                {resendLoading ? ( 
                  <FontAwesome5 name="circle-notch" size={20} color="#FF6600" className='animate-spin'/>
                ) : !resend ? (
                  <View className='flex-row items-center gap-1'>
                    <Text className="text-base text-blue-400 font-aregular">Resend OTP in</Text>
                    <CountDown
                      initialSeconds={90}
                      onFinish={() => setResend(true)}
                    />
                  </View>
                  
                ) : ""}
                {(resend && !resendLoading) &&
                  <TouchableOpacity onPress={resendOtp}>
                    <Text className='text-base text-orange font-abold'>Resend OTP</Text>
                  </TouchableOpacity>
                }
              </View>
            </View>
          </View>
      </ScrollView>
    </KeyboardAvoidingView>
    <View className='w-full justify-center my-6'>
      <CustomButton title="Verify" handlePress={submit} containerStyles="w-full" textStyles='text-white'/>
    </View>

    <StatusBar backgroundColor='#ffffff' style='dark'/>
  </SafeAreaView>
  )
}


export default ForgotPinOTPScreen


const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    width: "100%",
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 16,
    marginTop: 8
  },
  pinCodeContainer: {
    backgroundColor: "#F3F3F3",
    borderColor: "#F3F3F3",
    borderWidth: 1,
    borderRadius: 6,
    width: 45,
    height: 45,
    color: "#000",
    fontSize: 16,
    textAlign: "center"
  },
  pinCodeText: {
    color: '#111625',
    fontSize: 18,
    fontWeight: 'bold',
  },
  focusStick: {
    backgroundColor: '#FF9249',
  },
  activePinCodeContainer: {
    borderColor: '#FFAE4D',
    borderWidth: 1,
  },
  placeholderText: {
    color: '#ffffff',
  },
  filledPinCodeContainer: {
    backgroundColor: '#ffffff',
    borderColor: '#FFAE4D',
  },
  disabledPinCodeContainer: {
    backgroundColor: '#e0e0e0',
  },
});