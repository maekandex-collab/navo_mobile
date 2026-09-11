import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Header from '@/components/Header'
import { StatusBar } from 'expo-status-bar'
import SpaceBetween from '@/components/SpaceBetween'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import CustomButtomSheet from '@/components/CustomButtomSheet'
import FormFieldSheet from '@/components/FormFieldSheet'
import CustomButton from '@/components/CustomButton'
import AntDesign from '@expo/vector-icons/AntDesign'
import { useToast } from 'react-native-toast-notifications'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { axiosClient } from '@/globalApi'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { hideLoader, showLoader } from '@/redux/LoaderSlice'

export default function SecurityScreen() {

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

        try {
    
          dispatch(showLoader());
    
          const data = {
            email: userProfile?.email,
            password: password
          }
          
          const result = await axiosClient.post("/account/forgot-pin", data)

          toast.show(result.data.message, {
            type: "success",
          });
    
          handleCloseModalPress()

          router.replace("/(protected)/(routes)/ForgotPinOTP")
    
          setPassword('')
    
        } catch (error: any) {
          toast.show(error.response.data.message || error.response.data.error.message,{
            type: "danger",
          });
    
        } finally {
          dispatch(hideLoader());
        } 
    }

  return (
    <SafeAreaView className='h-full bg-white px-4'>
      <Header title="Manage Pin" showGoBack={true} onpress={() => router.back()}/>
      
      {userProfile?.isPinSet === true? (
         <View className='mt-4'>
          <SpaceBetween onpress={() => router.push(userProfile?.isQuestionSet ? "/(protected)/(routes)/SecurityQuestions" : "/(protected)/(routes)/SetQuestions")} title='Protect PIN' desc='Protect your PIN with security questions.' descStyle='text-[9px]' lefticon={<MaterialIcons name="password" size={20} color={"#FF6600"} />}/>
          <SpaceBetween onpress={() => router.push(userProfile?.isQuestionSet ? "/(protected)/(routes)/VerifyQuestions" : "/(protected)/(routes)/ChangePin")} title='Change PIN' desc='Change your personalized PIN.' descStyle='text-[9px]' lefticon={<MaterialIcons name="password" size={20} color={"#FF6600"} />}/>
          <SpaceBetween onpress={handlePresentModalPress} title='Forgot PIN' desc='Reset your personalized PIN, if forgotten.' descStyle='text-[9px]' lefticon={<MaterialIcons name="password" size={20} color={"#FF6600"} />}/>
       </View>
      ) : userProfile?.isPinSet === false ? (
        <View className='mt-4'>
          <SpaceBetween onpress={() => router.push("/(protected)/(routes)/SetPin")} title='Set PIN' desc='Set PIN for all transactions.' descStyle='text-[9px]' lefticon={<MaterialIcons name="password" size={20} color={"#FF6600"} />}/>
      </View>
      ) : ""}
     

      <CustomButtomSheet ref={bottomSheetModalRef} enablePenDown={false}>
        <View>
          <View className='flex-row w-full items-center justify-between gap-1'>
            <View className='w-8'/>
            <Text className="text-sm text-center text-gray-300 font-abold">Forgot PIN?</Text>
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