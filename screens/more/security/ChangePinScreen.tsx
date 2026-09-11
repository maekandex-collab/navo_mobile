import { View, Text, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import CustomButton from '@/components/CustomButton'
import { StatusBar } from 'expo-status-bar'
import { StyleSheet } from 'react-native'
import Header from '@/components/Header'
import { router } from 'expo-router'
import { useToast } from 'react-native-toast-notifications'
import * as SecureStore from "expo-secure-store";
import { axiosClient } from '@/globalApi'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useDispatch } from 'react-redux'
import { clearProfile } from '@/redux/ProfileSlice'
import { logout } from '@/redux/AuthSlice'
import { OtpInput } from 'react-native-otp-entry'
import { hideLoader, showLoader } from '@/redux/LoaderSlice'

const ChangePinScreen = () => {

  const dispatch = useDispatch();
  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmNewPin, setConfirmNewPin] = useState('')
  const [resetKey, setResetKey] = useState(0);

  console.log("currentpin", currentPin)

  const toast = useToast();

  const submit = async () => {

    if(!currentPin){
      return toast.show("Current pin is required", {
        type: "warning",
      });
    }

    if(currentPin.length < 4){
      return toast.show("Current pin must be 4 numbers", {
        type: "warning",
      });
    }

    if(!newPin){
      return toast.show("New Pin is required", {
        type: "warning",
      });
    }

    if(newPin.length < 4){
      return toast.show("New pin must be 4 numbers", {
        type: "warning",
      });
    }

    if(!confirmNewPin){
      return toast.show("Confirm New Pin is required", {
        type: "warning",
      });
    }

    if(confirmNewPin.length < 4){
      return toast.show("Confirm new pin must be 4 numbers", {
        type: "warning",
      });
    }

    if (newPin !== confirmNewPin) {
      return toast.show("New PINs do not match", {
        type: "warning",
      });
    }

    try {

       dispatch(showLoader());

      const data = {
        oldPin: currentPin,
        newPin: newPin,
        confirmNewPin: confirmNewPin
      }
      
      const result = await axiosClient.patch("/account/change-pin", data)

      console.log("newpin", result.data)

      const newAccessToken = result.data.accessToken
      await SecureStore.setItemAsync('accessToken', newAccessToken);

      toast.show(result.data.message, {
        type: "success",
      });

      setResetKey(prev => prev + 1);

      setCurrentPin('')
      setNewPin('')
      setConfirmNewPin('')

      // await SecureStore.deleteItemAsync("accessToken");
      // await SecureStore.deleteItemAsync("refreshToken");
      // await AsyncStorage.removeItem('userProfile');
    
      // dispatch(logout());
      // dispatch(clearProfile());

      // router.replace("/(onboarding)/SignIn")

    } catch (error: any) {
      toast.show(error.response.data.message || error.response.data.error.message,{
        type: "danger",
      });

    } finally {
      dispatch(hideLoader());
    } 
  }
  

  return (
    <SafeAreaView className="bg-white h-full px-4">
      <Header title="Change PIN" showGoBack={true} onpress={() => router.back()}/>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="w-full justify-center my-6 mt-6">
          <View style={{marginTop:10}}>
            <Text className="text-base text-blue font-amedium">Current PIN</Text>
            <OtpInput
              key={`current-${resetKey}`}
              numberOfDigits={4}
              onTextChange={(code) => setCurrentPin(code)}
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
          </View>
          <View style={{marginTop:10}}>
            <Text className="text-base text-blue font-amedium">New PIN</Text>
            <OtpInput
              key={`new-${resetKey}`}
              numberOfDigits={4}
              onTextChange={(code) => setNewPin(code)}
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
          </View>
          <View style={{marginTop:10}}>
            <Text className="text-base text-blue font-amedium">Confirm New PIN</Text>
            <OtpInput
              key={`confirm-${resetKey}`}
              numberOfDigits={4}
              onTextChange={(code) => setConfirmNewPin(code)}
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
          </View>
        </View>
    </ScrollView>
    <View className='w-full justify-center my-6'>
      <CustomButton title="Save Changes" handlePress={submit} containerStyles="w-full" textStyles='text-white'/>
    </View>

    <StatusBar backgroundColor='#ffffff' style='dark'/>
  </SafeAreaView>
  )
}


export default ChangePinScreen


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