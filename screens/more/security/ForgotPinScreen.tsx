import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import Header from '@/components/Header'
import { router } from 'expo-router'
import { useToast } from 'react-native-toast-notifications'
import { axiosClient } from '@/globalApi'
import { hideLoader, showLoader } from '@/redux/LoaderSlice'
import { useDispatch } from 'react-redux'

const ForgotPinScreen = () => {

  const dispatch = useDispatch()
  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')

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

    try {

      dispatch(showLoader());

      const data = {
        oldPin: currentPin,
        newPin: newPin
      }
      
      const result = await axiosClient.patch("/account/change-pin", data)

      toast.show(result.data.message, {
        type: "success",
      });

      setCurrentPin('')
      setNewPin('')

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
      <Header title="Forgot PIN" showGoBack={true} onpress={() => router.back()}/>

      <StatusBar backgroundColor='#ffffff' style='dark'/>
  </SafeAreaView>
  )
}


export default ForgotPinScreen