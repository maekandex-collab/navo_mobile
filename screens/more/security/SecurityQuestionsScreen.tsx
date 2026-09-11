import { View, Text, TouchableOpacity } from 'react-native'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import Header from '@/components/Header'
import { StatusBar } from 'expo-status-bar'
import SpaceBetween from '@/components/SpaceBetween'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import CustomButtomSheet from '@/components/CustomButtomSheet'
import AntDesign from '@expo/vector-icons/AntDesign'
import FormFieldSheet from '@/components/FormFieldSheet'
import CustomButton from '@/components/CustomButton'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { axiosClient } from '@/globalApi'
import { useToast } from 'react-native-toast-notifications'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { hideLoader, showLoader } from '@/redux/LoaderSlice'

export default function SecurityQuestionsScreen() {

  const dispatch = useDispatch()
  const { userProfile } = useSelector((state: RootState) => state.profile)
  const [password, setPassword] = useState('')
  const toast = useToast();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleCloseModalPress = useCallback(() => {
    bottomSheetModalRef.current?.close()
  }, []);

  const submit = async () => {

    
    if(!password.trim()){
      return toast.show("Current Password is required", {
        type: "warning",
      });
    }

      if(!userProfile?.isQuestionSet){
        router.back()
      }else{
        try {
    
          dispatch(showLoader());
    
          const data = {
            email: userProfile?.email,
            password: password
          }
          
          const result = await axiosClient.post("/secure/forgot-security-questions", data)

          toast.show(result.data.message, {
            type: "success",
          });
    
          handleCloseModalPress()

          router.replace("/(protected)/(routes)/QuestionOTP")
    
          setPassword('')
    
        } catch (error: any) {
          toast.show(error.response.data.message || error.response.data.error.message,{
            type: "danger",
          });
    
        } finally {
          dispatch(hideLoader());
        } 
      }
  }

  return (
    <SafeAreaView className='h-full bg-white px-4'>
      <Header title="Protect Pin" showGoBack={true} onpress={() => router.back()}/>
      
      {userProfile?.isQuestionSet === true ? (
        <View className='mt-4'>
          <SpaceBetween onpress={() => router.push("/(protected)/(routes)/ConfirmUpdateQuestions")} title='Update Questions' desc='Update your current security questions.' descStyle='text-[9px]' lefticon={<MaterialIcons name="password" size={20} color={"#FF6600"} />}/>
          <SpaceBetween onpress={() => router.push("/(protected)/(routes)/ConfirmQuestions")} title='Change Questions' desc='Change your security questions.' descStyle='text-[9px]' lefticon={<MaterialIcons name="password" size={20} color={"#FF6600"} />}/>
          <SpaceBetween onpress={handlePresentModalPress} title='Forgot Questions' desc='Reset your security questions.' descStyle='text-[9px]' lefticon={<MaterialIcons name="password" size={20} color={"#FF6600"} />}/>
        </View>
      ) : userProfile?.isQuestionSet === false ? (
        <View className='mt-4'>
          <SpaceBetween onpress={() => router.push("/(protected)/(routes)/SetQuestions")} title='Set Questions' desc='Protect your PIN with security questions.' descStyle='text-[9px]' lefticon={<MaterialIcons name="password" size={20} color={"#FF6600"} />}/>
        </View>
      ) : ""}
      

      <CustomButtomSheet ref={bottomSheetModalRef} enablePenDown={false}>
        <View>
          <View className='flex-row w-full items-center justify-between gap-1'>
            <View className='w-8'/>
            <Text className="text-sm text-center text-gray-300 font-abold">Forgot Security Questions?</Text>
            <TouchableOpacity onPress={handleCloseModalPress}>
              <AntDesign name="closecircleo" size={30} color="#003366" />
            </TouchableOpacity>
          </View>

          <FormFieldSheet title="Confirm Password*" handleChangeText={(text) => setPassword(text)} placeholder="Enter current password here" otherStyles="mt-2 mb-6" />

          <View className='flex-row gap-2 items-center justify-between'>
            <CustomButton title="Verify" handlePress={submit} containerStyles="w-full" textStyles='text-white'/>
          </View>
        </View>
      </CustomButtomSheet>
     
      <StatusBar backgroundColor='#ffffff' style='dark'/>
    </SafeAreaView>
  )
}