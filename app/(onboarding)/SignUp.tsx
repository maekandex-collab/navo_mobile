import { View, Text, ScrollView, Image, KeyboardAvoidingView, Platform, TextInput } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import FormField from '@/components/FormField'
import CustomButton from '@/components/CustomButton'
import { Link, router } from 'expo-router'
import AntDesign from '@expo/vector-icons/AntDesign'
import { StatusBar } from 'expo-status-bar'
import { useToast } from "react-native-toast-notifications";
import { axiosClient } from '@/globalApi'
import { CountryPicker } from 'react-native-country-codes-picker';
import { TouchableOpacity } from 'react-native'
import Entypo from '@expo/vector-icons/Entypo'
import FullScreenLoader from '@/components/FullScreenLoader'
import CustomButtomSheet from '@/components/CustomButtomSheet'
import { Pressable } from 'react-native'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { useDispatch } from 'react-redux'
import { hideLoader, showLoader } from '@/redux/LoaderSlice'
import { isStrongPassword } from '@/utils/strongPassword'

const countries: countryType[] = [
  {
    "name": {
      "en": "United Kingdom"
    },
    "dial_code": "+44",
    "code": "GB",
    "flag": "🇬🇧"
  },
  {
    "name": {
      "en": "Nigeria"
    },
    "dial_code": "+234",
    "code": "NG",
    "flag": "🇳🇬"
  }
]

type countryType = {
  name: {
    en: string;
  },
  dial_code: string;
  code: string;
  flag: string;
}

const SignUp = () => {

  const dispatch = useDispatch()
  const [selectedCountry, setSelectedCountry] = useState<countryType>({
    "name": {
      "en": "United Kingdom"
    },
    "dial_code": "+44",
    "code": "GB",
    "flag": "🇬🇧"
  });

  const [selectedResidence, setSelectedResidence] = useState<countryType | null>(null);
  const bottomSheetDialCodeModalRef = useRef<BottomSheetModal>(null);
  const bottomSheetCountryModalRef = useRef<BottomSheetModal>(null);

  const [form, setForm] = useState({
    firstname: '',
    lastname: '',
    phoneNumber: '',
    email: '',
    country: '',
    password: '',
    confirmPassword: '',
    referral: ''
  })

  const [isFocused, setIsFocused] = useState(false);

  const toast = useToast();

  const submit = async () => {

    if(!form.firstname){
        return toast.show("Firstname is empty", {
          type: "warning",
        });
    }

    if(!form.lastname){
      return toast.show("Lastname is empty", {
        type: "warning",
      });
    }

    if(Object.keys(selectedCountry).length === 0){
      return toast.show("Phone dail code is required", {
        type: "warning",
      });
    }

    if(!form.phoneNumber){
      return toast.show("Phone Number is empty", {
        type: "warning",
      });
    }

    if(!form.email){
      return toast.show("Email address is empty", {
        type: "warning",
      });
    }

    if(!selectedResidence){
      return toast.show("Country is empty", {
        type: "warning",
      });
    }

    if(!form.password.trim()){
      return toast.show("Password is empty", {
        type: "warning",
      });
    }

    if (!isStrongPassword(form.password)) {
      toast.show(
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.",
        {
          type: "warning",
        }
      );

      return;
    }

    if(!form.confirmPassword.trim()){
      return toast.show("Confirm password is empty", {
        type: "warning",
      });
    }

    if(form.password.trim() !== form.confirmPassword.trim()){
      return toast.show("Passwords do not match", {
        type: "warning",
      });
    }

    const phone = `${selectedCountry.dial_code}-${form.phoneNumber}`;

    const cResidence = selectedResidence.name.en;

    try {

      dispatch(showLoader());
      
      const result = await axiosClient.post("/auth/register", {
        accountName: `${form.firstname} ${form.lastname}`,
        phoneNumber: phone,
        email: form.email,
        countryOfResidence: cResidence,
        password: form.password.trim(),
        confirmPassword: form.confirmPassword.trim(),
        referralCode: form.referral,
      })

      console.log("reg", result.data)

      router.push({
        pathname: "/(onboarding)/RegisterOTP",
        params: { user: JSON.stringify({email: result.data.user.user.email}) },
      });

      setForm({
        firstname: '',
        lastname: '',
        phoneNumber: '',
        email: '',
        country: '',
        password: '',
        confirmPassword: '',
        referral: ''
      })

    } catch (error: any) {
      toast.show(error.response.data.message || error.response.data.error.message,{
        type: "danger",
      });
       console.log("signUp", error.response.data)

      if(error.response.status === 409 && error.response.data.message === "account not verified, kindly login to verify"){
        router.push("/(onboarding)/SignIn")

          setForm({
            firstname: '',
            lastname: '',
            phoneNumber: '',
            email: '',
            country: '',
            password: '',
            confirmPassword: '',
            referral: ''
          })
      }

    } finally {
      dispatch(hideLoader());
    } 
  }

  const handleCloseDialCodeModalPress = useCallback(() => {
    bottomSheetDialCodeModalRef.current?.close()
  }, []);
  
  const handlePresentDialCodeModalPress = useCallback(() => {
    bottomSheetDialCodeModalRef.current?.present();
  }, []);

  const handleDialCode = (country: countryType) => {
    setSelectedCountry(country);
    handleCloseDialCodeModalPress()
  }

  const handleCloseCountryModalPress = useCallback(() => {
    bottomSheetCountryModalRef.current?.close()
  }, []);
  
  const handlePresentCountryModalPress = useCallback(() => {
    bottomSheetCountryModalRef.current?.present();
  }, []);

  const handleCountry = (country: countryType) => {
    setSelectedResidence(country);
    handleCloseCountryModalPress()
  }

  return (
    <SafeAreaView className="bg-white h-full px-4">
      <View className='flex-row items-center justify-between mt-3 pb-3'>
        <AntDesign name="leftcircle" size={30} color="#C3C3C3" onPress={() => router.push('/(onboarding)')}/>
        <Text className="text-2xl text-blue font-amedium">Sign Up</Text>
        <Text/>
      </View>
      <KeyboardAvoidingView className='flex-1' behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === 'ios' ? 30 : 0}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="w-full justify-center my-6 mt-6">
            <Text className="text-2xl text-blue mt-4 font-ablack">Good to have you here!</Text>
            <Text className="text-sm text-blue mt-1 font-alight">Let’s get you set up in few clicks</Text>
            <View className='w-full flex-row items-center justify-between'>
              <FormField title="First Name*" value={form.firstname} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, firstname: e })} otherStyles="mt-7 w-[49%]" />
              <FormField title="Last Name*" value={form.lastname} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, lastname: e })} otherStyles="mt-7 w-[49%]" />
            </View>
            <View className='mt-7'>
              <Text className={`text-base font-amedium pb-2 text-blue`}>Phone Number*</Text>
              <View className='flex-row items-center w-full justify-between gap-2'>
                <TouchableOpacity onPress={handlePresentDialCodeModalPress} className='flex-row items-center justify-center bg-inputBg px-2 gap-2 rounded-md h-14 w-20'>
                  <Text className='text-2xl'>
                    {selectedCountry?.flag}
                  </Text>
                  <Entypo name="chevron-down" size={18} color="#003366" />
                </TouchableOpacity>
                
                <View className={`bg-inputBg border flex-1 ${isFocused ? 'border-orange-100' : 'border-inputBg'} h-14 px-4 rounded-md items-center flex-row gap-1`}>
                  <TextInput className={`bg-inputBg text-black font-aregular text-base h-full`} value={selectedCountry?.dial_code} placeholder="+000" placeholderTextColor="#ccc" editable={false}/>
                  <TextInput className={`bg-inputBg flex-1 text-black font-aregular text-base h-full pl-1`} value={form.phoneNumber} placeholder="8178676486" placeholderTextColor="#ccc" onChangeText={(e: any) => setForm({ ...form, phoneNumber: e })} keyboardType="phone-pad" onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}/>
                </View>
              </View>
            </View>
            <FormField title="Email*" value={form.email} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, email: e })} otherStyles="mt-7" keyboardType="email-address"/>
            <View className='mt-7'>
              <Text className={`text-base font-amedium pb-2 text-blue`}>Country of Residence*</Text>
              <TouchableOpacity onPress={handlePresentCountryModalPress} className='flex-row items-center justify-between bg-inputBg px-4 gap-2 rounded-md h-14 w-full'>
                <View className='flex-row gap-2 items-center'>
                  {selectedResidence && (
                    <Text className='text-2xl'>
                      {selectedResidence?.flag}
                    </Text>
                  )}
                  <Text className={`text-base font-amedium text-blue`} numberOfLines={1}>{selectedResidence?.name?.en ?? 'Select Country'}</Text>
                </View>
                <Entypo name="chevron-down" size={18} color="#003366" />
              </TouchableOpacity>
            </View>
            <FormField title="Password*" value={form.password} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, password: e })} otherStyles="mt-7"/>
            <FormField title="Confirm Password*" value={form.confirmPassword} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, confirmPassword: e })} otherStyles="mt-7"/>
            <FormField title="Referral (optional)" value={form.referral} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, referral: e })} otherStyles="mt-7" />
          </View>
      </ScrollView>
    </KeyboardAvoidingView>
    <View className='w-full justify-center my-6'>
      <CustomButton title="Sign Up" handlePress={submit} containerStyles="w-full" textStyles='text-white'/>
    </View>

    <CustomButtomSheet ref={bottomSheetDialCodeModalRef} enablePenDown={true}>
      <View>
        <View className='flex-row w-full items-center justify-between gap-1'>
          <View className='w-8'/>
          <Text className="text-sm text-center text-gray-300 font-abold">Select Dial Code</Text>
          <TouchableOpacity onPress={handleCloseDialCodeModalPress}>
            <AntDesign name="closecircleo" size={30} color="#003366" />
          </TouchableOpacity>
        </View>

          <View className="mt-5">
            {countries.map((country: countryType, index) => (
              <Pressable key={index} className='flex-row gap-2 items-center my-3' onPress={() => handleDialCode(country)}>
                <View className='flex-row gap-2 flex-1 items-center'>
                  <Text className="text-3xl text-blue font-abold">{country.flag}</Text>
                  <View className='flex-1'>
                    <Text className="text-xl text-blue font-amedium" numberOfLines={1}>{country.dial_code}</Text>
                    <Text className="text-sm text-blue font-aregular">{country.name.en}</Text>
                  </View>
                </View>
                <View>
                  <View className='size-7 items-center justify-center border-2 border-orange rounded-full'>
                    <View className={`size-4 rounded-full ${selectedCountry?.dial_code === country.dial_code ? 'bg-orange' : ''}`} />
                  </View>
                </View>
              </Pressable>
            ))}
           
          </View>
      </View>     
    </CustomButtomSheet>

    <CustomButtomSheet ref={bottomSheetCountryModalRef} enablePenDown={true}>
      <View>
        <View className='flex-row w-full items-center justify-between gap-1'>
          <View className='w-8'/>
          <Text className="text-sm text-center text-gray-300 font-abold">Select Country</Text>
          <TouchableOpacity onPress={handleCloseCountryModalPress}>
            <AntDesign name="closecircleo" size={30} color="#003366" />
          </TouchableOpacity>
        </View>

          <View className="mt-5">
            {countries.map((country: countryType, index) => (
              <Pressable key={index} className='flex-row gap-2 items-center my-3' onPress={() => handleCountry(country)}>
                <View className='flex-row gap-2 flex-1 items-center'>
                  <Text className="text-3xl text-blue font-abold">{country.flag}</Text>
                  <View className='flex-1'>
                    <Text className="text-xl text-blue font-amedium" numberOfLines={1}>{country.name.en}</Text>
                    <Text className="text-sm text-blue font-aregular">{country.dial_code}</Text>
                  </View>
                </View>
                <View>
                  <View className='size-7 items-center justify-center border-2 border-orange rounded-full'>
                    <View className={`size-4 rounded-full ${selectedResidence?.dial_code === country.dial_code ? 'bg-orange' : ''}`} />
                  </View>
                </View>
              </Pressable>
            ))}
           
          </View>
      </View>     
    </CustomButtomSheet>

    {/* <CountryPicker
      lang='en'
      show={show}
      pickerButtonOnPress={(item) => {
        setSelectedCountry(item);
        setShow(false);
      }}
      style={{
        modal: {
          height: '95%',
        }
      }}
    /> */}

    <StatusBar style='dark'/>
  </SafeAreaView>
  )
}

export default SignUp
