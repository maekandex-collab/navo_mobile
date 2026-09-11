import { View, Text, ScrollView, Image } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import FormField from '@/components/FormField'
import CustomButton from '@/components/CustomButton'
import { Link, router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import Header from '@/components/Header'
import { useToast } from 'react-native-toast-notifications'
import { axiosClient } from '@/globalApi'
import { Platform } from 'react-native'
import { KeyboardAvoidingView } from 'react-native'
import { hideLoader, showLoader } from '@/redux/LoaderSlice'
import { useDispatch } from 'react-redux'
import { isStrongPassword } from '@/utils/strongPassword'

const ManagePasswordScreen = () => {

  const dispatch = useDispatch()
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  })
  const toast = useToast();

  const submit = async () => {

    if(!form.currentPassword.trim()){
      return toast.show("Current password is required", {
        type: "warning",
      });
    }

    if(!form.newPassword.trim()){
      return toast.show("Kindly Input new password", {
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
      return toast.show("New Password do not match", {
        type: "warning",
      });
    }

    try {

      dispatch(showLoader());

      const data = {
        currentPassword: form.currentPassword.trim(),
        newPassword: form.newPassword.trim(),
        confirmNewPassword: form.confirmNewPassword.trim(),
      }
      
      const result = await axiosClient.put("/auth/change-password", data)

      toast.show(result.data.message, {
        type: "success",
      });

      setForm({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      })

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
      <Header title="Manage Password" showGoBack={true} onpress={() => router.back()}/>
        <KeyboardAvoidingView className='flex-1' behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === 'ios' ? 30 : 0}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="w-full justify-center my-6 mt-6">
              <FormField title="Current Password*" value={form.currentPassword} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, currentPassword: e })} otherStyles="mt-4"/>
              <FormField title="New Password*" value={form.newPassword} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, newPassword: e })} otherStyles="mt-4"/>
              <FormField title="Confirm New Password*" value={form.confirmNewPassword} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, confirmNewPassword: e })} otherStyles="mt-4"/>
            </View>
          </ScrollView>
      </KeyboardAvoidingView>
    <View className='w-full justify-center my-6'>
      <CustomButton title="Save Changes" handlePress={submit} containerStyles="w-full" textStyles='text-white'/>
    </View>

    <StatusBar backgroundColor='#ffffff' style='dark'/>
  </SafeAreaView>
  )
}

export default ManagePasswordScreen