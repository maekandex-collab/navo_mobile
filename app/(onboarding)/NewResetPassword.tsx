import { View, Text, ScrollView, Image } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import FormField from '@/components/FormField'
import CustomButton from '@/components/CustomButton'
import { router, useLocalSearchParams } from 'expo-router'
import AntDesign from '@expo/vector-icons/AntDesign'
import { StatusBar } from 'expo-status-bar'
import { useToast } from 'react-native-toast-notifications'
import { axiosClient } from '@/globalApi'
import { useDispatch } from 'react-redux'
import { hideLoader, showLoader } from '@/redux/LoaderSlice'
import { isStrongPassword } from '@/utils/strongPassword'

const NewResetPassword = () => {

  const [form, setForm] = useState({
    newPassword: '',
    confirmNewPassword: '',
  })

  const { userId } = useLocalSearchParams() as any;
  const toast = useToast();
  const dispatch = useDispatch()


  const submit = async () => {

    if(!form.newPassword.trim()){
      return toast.show("Password is empty", {
        type: "warning",
      });
    }

    if (!isStrongPassword(form.newPassword)) {
      toast.show(
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.",
        {
          type: "warning",
        }
      );

      return;
    }

    if(!form.confirmNewPassword.trim()){
      return toast.show("Confirm password is empty", {
        type: "warning",
      });
    }

    if(form.newPassword.trim() !== form.confirmNewPassword.trim()){
      return toast.show("Passwords do not match", {
        type: "warning",
      });
    }

    dispatch(showLoader());

    try {

      const data = {
        userId: userId,
        newPassword: form.newPassword.trim()
      }
      
      const result = await axiosClient.put("/auth/reset-password", data)

      console.log(result.data)

      toast.show(result.data.message,{
        type: "success",
      });

      router.replace("/(onboarding)/SignIn")

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
      <View className='flex-row items-center justify-between mt-3 pb-3'>
        <AntDesign name="leftcircle" size={30} color="#C3C3C3" onPress={() => router.push('/(onboarding)')}/>
        <Text className="text-2xl text-blue font-amedium">Password Reset</Text>
        <Text/>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="w-full justify-center my-6 mt-6">
          <Text className="text-2xl text-blue mt-4 font-ablack">Great! Now reset.</Text>
          <Text className="text-sm text-blue mt-1 font-alight">Create a new password you can easily remember</Text>
          <FormField title="New Password*" value={form.newPassword} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, newPassword: e })} otherStyles="mt-4"/>
          <FormField title="Confirm New Password*" value={form.confirmNewPassword} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, confirmNewPassword: e })} otherStyles="mt-4"/>
        </View>
    </ScrollView>
    <View className='w-full justify-center my-6'>
      <CustomButton title="Complete Reset" handlePress={submit} containerStyles="w-full" textStyles='text-white'/>
    </View>

    <StatusBar backgroundColor='#ffffff' style='dark'/>
  </SafeAreaView>
  )
}

export default NewResetPassword