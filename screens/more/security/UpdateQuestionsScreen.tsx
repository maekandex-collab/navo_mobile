import { View, Text, ScrollView, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import FormField from '@/components/FormField'
import CustomButton from '@/components/CustomButton'
import { Link, router, useLocalSearchParams } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import Header from '@/components/Header'
import { useToast } from 'react-native-toast-notifications'
import { axiosClient } from '@/globalApi'
import { Platform } from 'react-native'
import { KeyboardAvoidingView } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { setProfile } from '@/redux/ProfileSlice'
import { hideLoader, showLoader } from '@/redux/LoaderSlice'

const UpdateQuestionsScreen = () => {

  const { userProfile } = useSelector((state: RootState) => state.profile)
  const { password } = useLocalSearchParams() as any;
  const parsedPassword = password ? JSON.parse(password as string) : null;
  const [form, setForm] = useState({
    answer1: '',
    answer2: '',
  })
  const toast = useToast();
  const dispatch = useDispatch()

  if(!userProfile?.isQuestionSet){
    router.back()
  }

  const submit = async () => {

    if(!form.answer1 && !form.answer2){
      return toast.show("Two fields can't be empty", {
        type: "warning",
      });
    }

    try {

      dispatch(showLoader());

      const data = {
        password: parsedPassword,
        question1Id: form.answer1 ? userProfile?.questions[0]?.id : '',
        answer1: form.answer1,
        question2Id: form.answer2 ? userProfile?.questions[1]?.id : '',
        answer2: form?.answer2
      }
      
      const result = await axiosClient.patch("/secure/update-security-questions", data)

      const user: any = {
        questions: result.data.questions || []
      }

      console.log("sec=", result.data)

      await AsyncStorage.mergeItem('userProfile', JSON.stringify(user));

      const recentProfile = await AsyncStorage.getItem('userProfile');
      const updatedProfile = recentProfile ? JSON.parse(recentProfile) : null;

      if (updatedProfile) {
        dispatch(setProfile(updatedProfile));
      }

      toast.show(result.data.message, {
        type: "success",
      });

      setForm({
        answer1: '',
        answer2: '',
      })

      router.replace("/(protected)/(tabs)/more")


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
      <Header title="Update Questions" showGoBack={true} onpress={() => router.back()}/>
        <KeyboardAvoidingView className='flex-1' behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === 'ios' ? 30 : 0}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="w-full justify-center my-6 mt-6">
              <FormField title={userProfile?.questions[0]?.question} value={form.answer1} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, answer1: e })} otherStyles="mt-4"/>
              <FormField title={userProfile?.questions[1]?.question} value={form.answer2} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, answer2: e })} otherStyles="mt-4"/>
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

export default UpdateQuestionsScreen