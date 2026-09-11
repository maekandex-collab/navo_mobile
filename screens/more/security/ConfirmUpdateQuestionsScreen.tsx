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
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { hideLoader, showLoader } from '@/redux/LoaderSlice'

const ConfirmUpdateQuestionsScreen = () => {

  const dispatch = useDispatch()
  const { userProfile } = useSelector((state: RootState) => state.profile)
  const [form, setForm] = useState({
    currentPassword: '',
    answer1: '',
    answer2: '',
  })
  const toast = useToast();

  if(!userProfile?.isQuestionSet){
    router.back()
  }

  const submit = async () => {

    if(!form.currentPassword.trim()){
      return toast.show("Current password is required", {
        type: "warning",
      });
    }

    if(!form.answer1 || !form.answer2){
      return toast.show("Input current question answers", {
        type: "warning",
      });
    }

    try {

      dispatch(showLoader());

      const data = {
        currentAnswers: {
          answer1: form.answer1,
          answer2: form.answer2
        },
        password: form.currentPassword.trim(),
      }
      
      const result = await axiosClient.post("/secure/change-question-with-password", data)

      router.push({
        pathname: "/(protected)/(routes)/UpdateQuestions",
        params: { password:  JSON.stringify(form.currentPassword)}
      })

      setForm({
        currentPassword: '',
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
      <Header title="Current Questions" showGoBack={true} onpress={() => router.back()}/>
        <KeyboardAvoidingView className='flex-1' behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === 'ios' ? 30 : 0}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="w-full justify-center my-6 mt-6">
              <FormField title="Current Password*" value={form.currentPassword} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, currentPassword: e })} otherStyles="mt-4"/>
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

export default ConfirmUpdateQuestionsScreen