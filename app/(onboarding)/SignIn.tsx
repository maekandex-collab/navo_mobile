import { View, Text, ScrollView, ImageBackground, TouchableOpacity, Pressable, Alert } from 'react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import FormField from '@/components/FormField'
import CustomButton from '@/components/CustomButton'
import {  } from 'react-native'
import { images } from '@/constants'
import { StyleSheet } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { KeyboardAvoidingView } from 'react-native'
import { Platform } from 'react-native'
import AntDesign from '@expo/vector-icons/AntDesign';
import { router } from 'expo-router'
import Entypo from '@expo/vector-icons/Entypo';
import { useToast } from 'react-native-toast-notifications'
import { axiosClient } from '@/globalApi'
import * as SecureStore from "expo-secure-store";
import {  useBottomSheetModal } from '@gorhom/bottom-sheet';
import CustomButtomSheet from '@/components/CustomButtomSheet'
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import FormFieldSheet from '@/components/FormFieldSheet'
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from 'expo-local-authentication';
import * as Keychain from 'react-native-keychain';
import { login } from '@/redux/AuthSlice'
import { useDispatch, useSelector } from 'react-redux'
import { setEmail, setProfile } from '@/redux/ProfileSlice'
import { RootState } from '@/redux/store'
import { hideLoader, showLoader } from '@/redux/LoaderSlice'

const SignIn = () => {

  const { email } = useSelector((state: RootState) => state.profile)

  const insets = useSafeAreaInsets();
  const statusBarHeight = insets.top + 10;
  
  const dispatch = useDispatch()

  const [form, setForm] = useState({
    email: '',
    password: ''
  })

  const [resetEmail, setResetEmail] = useState('')

  const toast = useToast();

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const { dismiss } = useBottomSheetModal()

  useEffect(() => {
    const handleEmail = async () => {
      setForm({...form, email: email || ""});
    };

    handleEmail()
  }, [email])

  // callbacks
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);


  const handleSnapToIndexPress = (index: number) => bottomSheetModalRef.current?.snapToIndex(index)

   const submit = async () => {
  
      if(!form.email){
        return toast.show("Email address is empty", {
          type: "warning",
        });
      }
  
      if(!form.password.trim()){
        return toast.show("Password is empty", {
          type: "warning",
        });
      }

      if(form.password.trim().length < 8){
        return toast.show("Password must be atleast 8 character", {
          type: "warning",
        });
      }
  
      try {
        
        dispatch(showLoader());
        const result = await axiosClient.post("/auth/login", {
          email: form.email,
          password: form.password.trim(),
        })

        console.log("result=",result.data)
        const user = {
          email: result.data.user.email,
          accountName: result.data.user.accountName || "",
          phoneNumber: result.data.user.phoneNumber,
          countryOfResidence: result.data.user.countryOfResidence,
          location: result.data.user.locationDetails,
          profilePicture: result.data.user.profilePicture,
          kycVerified: result.data.user.isKycVerified,
          isPinSet: result.data.user.isPinSet,
          setPin: false,
          gender: result.data.user.gender,
          isQuestionSet: result.data.user.isQuestionSet,
          questions: result.data.user.questions || []
        }
        const userData = JSON.stringify(user);
        await SecureStore.setItemAsync("accessToken", result.data.user.accessToken);
        dispatch(login(result.data.user.accessToken));
        await SecureStore.setItemAsync("refreshToken", result.data.user.refreshToken);
        await AsyncStorage.setItem("userProfile", userData);
        dispatch(setProfile(user));

        if(email !== result.data.user.email){
          await AsyncStorage.setItem("email", result.data.user.email);
          dispatch(setEmail(result.data.user.email));

          SecureStore.deleteItemAsync("biometricEnabled");
          Keychain.resetGenericPassword({ service: 'com.navo.hashed1' })
          Keychain.resetGenericPassword({ service: 'com.navo.hashed2' })
          console.log("bio and keychain cleared")
        }

        console.log('user', user)

        setForm({
          email: '',
          password: ''
        })

        if(result.data?.user?.isKycVerified){
          toast.show("Logged in", {
            type: "success",
          });
          router.replace("/(protected)/(tabs)/home")
        }else{
          router.replace("/(protected)/(routes)/OnboardingKyc")
        }
  
      } catch (error: any) {
        toast.show(error.response.data.message || error.response.data.error.message,{
          type: "danger",
        });

        console.log(error.response.data)

        if(error.response.status === 403 && error.response.data.message === "Account not verified, kindly complete verification"){
          router.push({
            pathname: "/(onboarding)/RegisterOTP",
            params: { user: JSON.stringify({email: form.email.toLowerCase()}) },
          });
  
          setForm({
            email: '',
            password: ''
          })
        }

      } finally {
        dispatch(hideLoader());
      }
      
    }

    const handleBiometricLogin = async () => {
      const biometricEnabledValue = await SecureStore.getItemAsync('biometricEnabled');
      console.log(biometricEnabledValue)
      const shouldUseBiometric = biometricEnabledValue === 'true';
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  
      if (!hasHardware) {
        return Alert.alert(
          'Biometrics Not Supported',
          'Your device does not support biometric authentication.'
        );
      }
  
      if (!isEnrolled) {
        return Alert.alert(
          'No Biometrics set',
          'No biometrics are enrolled. Please set it up in your device settings to use this feature.'
        );
      }

      if (shouldUseBiometric) {

        if(!form.email){
          return toast.show("Please enter your email", {
            type: "warning",
          });
        }

          const credential1 = await Keychain.getGenericPassword({
            service: 'com.navo.hashed1',
            authenticationPrompt: {
              title: 'Login with Biometric',
              cancel: 'Cancel',
            },
          });

          console.log("cred=", credential1)

          if (credential1) {
            dispatch(showLoader());

            try {

              const response = await axiosClient.post('/auth/biometric-challenge', {
                email: form.email
              });

              console.log("C=", response.data)
              const challenge = response.data.challenge;

              const credential2 = await Keychain.getGenericPassword({
                service: "com.navo.hashed2",
              });

              if (credential2) {

                const result = await axiosClient.post('/auth/biometric-verify', {
                  email: form.email,
                  payload: challenge,
                  signature: credential1.password,
                  privateKey: credential2.password,
                });

                console.log("ress=",result.data)

                const user = {
                  email: result.data.user.email,
                  accountName: result.data.user.accountName || "",
                  phoneNumber: result.data.user.phoneNumber,
                  countryOfResidence: result.data.user.countryOfResidence,
                  location: result.data.user.locationDetails,
                  profilePicture: result.data.user.profilePicture,
                  kycVerified: result.data.user.isKycVerified,
                  isPinSet: result.data.user.isPinSet,
                  setPin: false,
                  gender: result.data.user.gender,
                  isQuestionSet: result.data.user.isQuestionSet,
                  questions: result.data.user.questions || []
                }
                console.log('q=', result.data.questions)
                const userData = JSON.stringify(user);
                await SecureStore.setItemAsync("accessToken", result.data.user.accessToken);
                dispatch(login(result.data.user.accessToken));
                await SecureStore.setItemAsync("refreshToken", result.data.user.refreshToken);
                await AsyncStorage.setItem("userProfile", userData);
                dispatch(setProfile(user));

                if(email !== result.data.user.email){
                  await AsyncStorage.setItem("email", result.data.user.email);
                  dispatch(setEmail(result.data.user.email));
                  
                  SecureStore.deleteItemAsync("biometricEnabled");
                  Keychain.resetGenericPassword({ service: 'com.navo.hashed1' })
                  Keychain.resetGenericPassword({ service: 'com.navo.hashed2' })
                  console.log("bio and keychain cleared")
                }
        
                if(result.data?.user?.isKycVerified){
                  toast.show("Logged in", {
                    type: "success",
                  });
                  router.replace("/(protected)/(tabs)/home")
                }else{
                  router.replace("/(protected)/(routes)/OnboardingKyc")
                }
              }

            } catch (error: any) {
              toast.show(error.response.data.message || error.response.data.error.message,{
                type: "danger",
              });
              console.log(error.response.data.message || error.response.data.error.message)
            }
            dispatch(hideLoader());

          } else {
            toast.show("Authentication Failed",{
              type: "danger",
            });
          }

        // } else {
        //   toast.show("Authentication Failed",{
        //     type: "danger",
        //   })
        // }
      }else{
        toast.show("Login to Enable biometrics", {
          type: "danger",
        });
      }
    };

  const submitEmail = async () => {

    if(!resetEmail){
      return toast.show("Email address is empty", {
        type: "warning",
      });
    }

    try {
        
      dispatch(showLoader());
      const result = await axiosClient.post("/auth/forgot-password", {
        email: resetEmail,
      })

      console.log("result=",result.data)

      setResetEmail('')

      toast.show("Please check your email",{
        type: "success",
      });

      dismiss()

      router.push({
        pathname: "/(onboarding)/ResetPasswordOTP",
        params: { user: JSON.stringify({email: result.data.user.email, userId: result.data.user.id}) },
      });

    } catch (error: any) {
      toast.show(error.response.data.message || error.response.data.error.message,{
        type: "danger",
      });
    } finally {
      dispatch(hideLoader());
    }
    
  }

  return (
      <SafeAreaProvider>
        <SafeAreaView edges={['left', 'right']} className='bg-blue h-full flex-1'>
          <ImageBackground source={images.background5} resizeMode="cover" style={styles.image}>
            <KeyboardAvoidingView className='flex-1' behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === 'ios' ? 30 : 0}>
              <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false} className='px-4'>
                  <View className='flex-row items-center justify-between' style={{marginTop: statusBarHeight}}>
                    <AntDesign name="leftcircle" size={30} color="white" onPress={() => router.push("/(onboarding)")}/>
                    <Text className="text-2xl text-white font-amedium">Login</Text>
                    <Text className='w-7'/>
                  </View>
                  <View className="flex-1 w-full justify-center my-6">
                    <Text className="text-2xl text-white mt-4 font-ablack">Yaaay, Welcome back!</Text>
                    <Text className="text-sm text-white mt-1 font-alight">Enter your login details to access your account</Text>
                    <FormField title="Email*" value={form.email} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, email: e })} otherStyles="mt-7" keyboardType="email-address" labelStyle='text-white'/>
                    <FormField title="Password*" value={form.password} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, password: e })} otherStyles="mt-4" labelStyle='text-white'/>
                    <View className="justify-end pt-3 flex-row gap-1">
                      <Text className="text-sm text-gray-100 font-aregular">Forgot Password?</Text>
                      <TouchableOpacity onPress={handlePresentModalPress}><Text className='text-sm text-orange font-abold'>Reset</Text></TouchableOpacity>
                    </View>
                    <View className='flex flex-row items-center w-full gap-2  mt-10'>
                      <CustomButton title="Login" handlePress={submit} containerStyles="w-[78%]" textStyles='text-white'/>
                      <Pressable onPress={handleBiometricLogin} className='w-[18%]'>
                        <Entypo name="fingerprint" size={46} color="white" className='mx-auto'/>
                      </Pressable>
                    </View>
                  </View>
              </ScrollView>

              <CustomButtomSheet ref={bottomSheetModalRef} enablePenDown={false}>
                <View>
                  <TouchableOpacity className='flex-row justify-end' onPress={() => dismiss()}>
                      <AntDesign name="closecircleo" size={30} color="#003366" />
                  </TouchableOpacity>

                  <Text className="text-lg text-blue mt-2 font-abold">It’s ok! We’ll help you reset</Text>
                  <Text className="text-lg text-blue font-abold mb-2">in few clicks</Text>

                  <FormFieldSheet title="Your Registered Email" value={resetEmail} handleChangeText={(text: string) => setResetEmail(text)} placeholder="Enter here" otherStyles="my-5" keyboardType="email-address"/>
                  
                  <CustomButton title="Request OTP" handlePress={submitEmail} containerStyles="w-full" textStyles='text-white'/>
                  
                </View>
              </CustomButtomSheet>

            </KeyboardAvoidingView>
          </ImageBackground>
        </SafeAreaView>

        <StatusBar style='light'/>
      </SafeAreaProvider>
  )
}

export default SignIn

const styles = StyleSheet.create({
  image: {
    flex: 1,
    justifyContent: 'center',
    width: "100%"
  }
});