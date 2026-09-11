import { View, Text, ScrollView, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
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
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { hideLoader, showLoader } from '@/redux/LoaderSlice'

const VerifyQuestionsScreen = () => {

  const { userProfile } = useSelector((state: RootState) => state.profile)
  const [form, setForm] = useState({
    answer1: '',
    answer2: '',
  })
  const dispatch = useDispatch()
  const toast = useToast();

  if(!userProfile?.isQuestionSet){
    router.back()
  }

  const submit = async () => {

    if(!form.answer1 || !form.answer2){
      return toast.show("Input current question answers", {
        type: "warning",
      });
    }

    try {

      dispatch(showLoader());

      const data = {
        answer1: form.answer1,
        answer2: form.answer2
      }
      
      const result = await axiosClient.post("/secure/verify-security-questions", data)

      router.replace("/(protected)/(routes)/ChangePin")

      setForm({
        answer1: '',
        answer2: '',
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
      <Header title="Verify Questions" showGoBack={true} onpress={() => router.back()}/>
        <KeyboardAvoidingView className='flex-1' behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === 'ios' ? 30 : 0}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="w-full justify-center my-6 mt-6">
              <FormField title={userProfile?.questions[0]?.question} value={form.answer1} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, answer1: e })} otherStyles="mt-4"/>
              <FormField title={userProfile?.questions[1]?.question} value={form.answer2} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, answer2: e })} otherStyles="mt-4"/>
            </View>
          </ScrollView>
      </KeyboardAvoidingView>
      <View className='w-full justify-center my-6'>
        <CustomButton title="Confirm" handlePress={submit} containerStyles="w-full" textStyles='text-white'/>
      </View>

      <StatusBar backgroundColor='#ffffff' style='dark'/>
    </SafeAreaView>
  )
}

export default VerifyQuestionsScreen