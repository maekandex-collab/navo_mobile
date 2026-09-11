import { View, Text, ScrollView, Image, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet, TextInput, Alert, Modal, Pressable } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import FormField from '@/components/FormField'
import CustomButton from '@/components/CustomButton'
import { router } from 'expo-router'
import AntDesign from '@expo/vector-icons/AntDesign';
import { StatusBar } from 'expo-status-bar'
import Header from '@/components/Header'
import { data, images } from '@/constants'
import Picker from '@/components/Picker'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Entypo from '@expo/vector-icons/Entypo';
import { axiosClient } from '@/globalApi'
import { useToast } from 'react-native-toast-notifications'
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import Ionicons from '@expo/vector-icons/Ionicons'
import { RootState } from '@/redux/store'
import { useDispatch, useSelector } from 'react-redux'
import { setProfile } from '@/redux/ProfileSlice'
import { Image as ExpoImage } from 'expo-image';
import CustomButtomSheet from '@/components/CustomButtomSheet'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { hideLoader, showLoader } from '@/redux/LoaderSlice'
// import { CountryPicker } from 'react-native-country-codes-picker';
// import { countryCodes } from 'react-native-country-codes-picker/constants/countryCodes';

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

const UserProfileScreen = () => {

  const blurhash = 'L~I64noffQfQfQfQfQfQfQfQfQfQ';
    
  const toast = useToast()
  const dispatch = useDispatch()
  const { userProfile } = useSelector((state: RootState) => state.profile)
  const { isLoading } = useSelector((state: RootState) => state.loader)
  const [showModal, setShowModal] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<countryType | null>(null);
  const [file, setFile] = useState<ImagePicker.ImagePickerAsset | null>(null);

  const [selectedResidence, setSelectedResidence] = useState<countryType | null>(null);
   const bottomSheetDialCodeModalRef = useRef<BottomSheetModal>(null);

  const [originalProfile, setOriginalProfile] = useState<any>(null);
  const [form, setForm] = useState({
    accountName: '',
    phoneNumber: '',
    email: '',
    gender: '',
    countryOfResidence: '',
    location: {
      state: '',
      city: '',
      street: '',
      houseNo: '',
      closestLandmark: '',
    }
  })
  const [isFocused, setIsFocused] = useState(false);

  const setUser = () => {
    setForm({
      ...form,
      accountName: userProfile.accountName,
      phoneNumber: userProfile.phoneNumber.split('-')[1],
      email: userProfile.email,
      gender: userProfile.gender || '',
      countryOfResidence: userProfile.countryOfResidence,
      location: {
        ...form.location,
        state: userProfile.location?.state || '',
        city: userProfile.location?.city || '',
        street: userProfile.location?.street || '',
        houseNo: userProfile.location?.houseNo || '',
        closestLandmark: userProfile.location?.closestLandmark || '',
      }
    })
    setOriginalProfile({
      accountName: userProfile.accountName,
      phoneNumber: userProfile.phoneNumber.split('-')[1],
      email: userProfile.email,
      gender: userProfile.gender || '',
      countryOfResidence: userProfile.countryOfResidence,
      location: {
        ...form.location,
        state: userProfile.location?.state || '',
        city: userProfile.location?.city || '',
        street: userProfile.location?.street || '',
        houseNo: userProfile.location?.houseNo || '',
        closestLandmark: userProfile.location?.closestLandmark || '',
      }
    })
  };

  useEffect(() => {
    setUser()
  }, [userProfile])

  const hasChanges = () => {
    if (!originalProfile) return true;

    const current = JSON.stringify(form);
    const original = JSON.stringify(originalProfile);

    return current !== original || selectedCountry?.dial_code !== userProfile?.phoneNumber.split('-')[0];
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Allow access to photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedImage = result.assets[0];

      // Check file size
      const fileInfo = await FileSystem.getInfoAsync(selectedImage.uri);

      // Ensure file exists and has a size
      if (!fileInfo.exists || typeof fileInfo.size !== 'number') {
        Alert.alert("Error", "Could not retrieve file info.");
        return;
      }

      if (fileInfo.size > 5 * 1024 * 1024) {
        Alert.alert("File too large", "Image must be less than 5MB.");
        return;
      }

      // Check mime type or extension
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      const isValidType = allowedTypes.includes(selectedImage.mimeType || '');

      // Fallback if mimeType is missing (use URI extension)
      const extension = selectedImage.uri.split('.').pop()?.toLowerCase();
      const isValidExtension = ['jpg', 'jpeg', 'png'].includes(extension || '');

      if (!isValidType && !isValidExtension) {
        Alert.alert("Invalid file type", "Only JPG, JPEG or PNG images are allowed.");
        return;
      }

      setFile(selectedImage)
      setShowModal(true)
    }
  };

  const uploadImage = async () => {
  
    if(!file){
      return toast.show("Select a profile pic", {
        type: "warning",
      });
    }

    setShowModal(false)

    const formData = new FormData();

    formData.append('avatar', {
      uri: file.uri,
      type: file.mimeType,
      name: file.fileName || `profile_${Date.now()}.jpg`,
    } as any);

    dispatch(showLoader());
    console.log("calling api")
    try {
      const response = await axiosClient.post('/upload-image/user', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const user: any = {
        profilePicture: response.data.avatarUrl,
      }

      await AsyncStorage.mergeItem('userProfile', JSON.stringify(user));

      const recentProfile = await AsyncStorage.getItem('userProfile');
      const updatedProfile = recentProfile ? JSON.parse(recentProfile) : null;

      if (updatedProfile) {
        dispatch(setProfile(updatedProfile));
      }

      setFile(null)

      toast.show(response.data?.message,{
        type: "success",
      });

      console.log(response.data)

    } catch (error: any) {
      toast.show(error.response.data.message || error.response.data.error.message,{
        type: "danger",
      });
    } finally {
      dispatch(hideLoader());
    }
  };


  const submit = async () => {

    if(!form.accountName){
      return toast.show("Account Name is empty", {
        type: "warning",
      });
    }

    if(!selectedCountry){
      return toast.show("Phone dail code is required", {
        type: "warning",
      });
    }

    if(!form.phoneNumber){
      return toast.show("Phone Number is empty", {
        type: "warning",
      });
    }
    
    if(!form.gender){
      return toast.show("Gender is required", {
        type: "warning",
      });
    }

    if(!form.location.city){
      return toast.show("City is required", {
        type: "warning",
      });
    }

    if(!form.location.street){
      return toast.show("Street is required", {
        type: "warning",
      });
    }

    if(!form.location.houseNo){
      return toast.show("House No. is required", {
        type: "warning",
      });
    }

    if (!hasChanges()) {
      return toast.show("No changes detected.", {
        type: "info",
      });
    }

    const phone = `${selectedCountry.dial_code}-${form.phoneNumber}`

    try {

      dispatch(showLoader());

      const data = {
        phoneNumber: phone,
        gender: form.gender,
        locationDetails: {
          state: form.location.state,
          city: form.location.city,
          street: form.location?.street,
          houseNo: form.location?.houseNo,
          closestLandmark: form.location.closestLandmark,
        }
      }

      console.log("datatosend=", data)
      
      const result = await axiosClient.patch("/profile/update-profile", data)
      console.log("pro=",result.data)
      const user: any = {
        phoneNumber: result.data.user.phoneNumber,
        location: {
          state: result.data.user.locationDetails.state || '',
          city: result.data.user.locationDetails.city || '',
          street: result.data.user.locationDetails.street || '',
          houseNo: result.data.user.locationDetails.houseNo || '',
          closestLandmark: result.data.user.locationDetails.closestLandmark || '',
        },
        gender: result.data.user.gender
      }
      console.log('userFetched', result.data)

      await AsyncStorage.mergeItem('userProfile', JSON.stringify(user));

      const recentProfile = await AsyncStorage.getItem('userProfile');
      const updatedProfile = recentProfile ? JSON.parse(recentProfile) : null;

      if (updatedProfile) {
        dispatch(setProfile(updatedProfile));
      }
    
      toast.show(result.data.message, {
        type: "success",
      });

    } catch (error: any) {
      toast.show(error.response.data.message || error.response.data.error.message,{
        type: "danger",
      });

    } finally {
      dispatch(hideLoader());
    } 
  }

   // Set default country by dial code
  useEffect(() => {

    if (!userProfile?.phoneNumber && !form.countryOfResidence) return;

    const [defaultDialCode, number] = userProfile?.phoneNumber.split('-') ?? [];
    const defaultCountry = countries.find(
      (country) => country.dial_code === defaultDialCode
    );

    if (defaultCountry) {
      setSelectedCountry(defaultCountry);
      setForm((prev) => ({
        ...prev,
        phoneNumber: number || '',
      }));
    }

    const defaultCountryOfResidence = countries.find(
      (country) => country.name.en === form.countryOfResidence
    );

    if (defaultCountryOfResidence) {
      setSelectedResidence(defaultCountryOfResidence);
    }
  }, [userProfile?.phoneNumber, form.countryOfResidence]);

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

  return (
    <SafeAreaView className="bg-white h-full px-4">
      <Header title="User Profile" showGoBack={true} onpress={() => router.back()}/>
      <KeyboardAvoidingView className='flex-1' behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === 'ios' ? 30 : 0}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="w-full justify-center my-6 mt-8">

            <View className='items-center justify-center mb-8'>
              {!userProfile?.profilePicture ? (
                <View className='size-[100px] rounded-full border border-blue relative bg-blue'>
                  <Image source={images.user} width={100} height={100} resizeMode='cover' className='w-full h-full overflow-hidden'/>
                  <TouchableOpacity activeOpacity={0.9} className='absolute -right-1 top-2 z-50' onPress={pickImage}>
                    <View className={`flex items-center justify-center size-10 rounded-full absolute -right-2 bg-orange`}>
                      <AntDesign name="edit" size={20} color="#ffffff" />
                    </View>
                  </TouchableOpacity>
                </View>
              ) : (
                <View className='size-[100px] rounded-full border border-gray-200 relative'>
                  <ExpoImage source={{ uri: `${process.env.EXPO_PUBLIC_IMAGE_URI}${userProfile?.profilePicture}` }} placeholder={{ blurhash }} cachePolicy="disk" contentFit="cover" style={{ width: "100%", height: "100%", borderRadius: 50 }}/>
                  <TouchableOpacity activeOpacity={0.9} className='absolute -right-1 top-2 z-50' onPress={pickImage}>
                    <View className={`flex items-center justify-center size-10 rounded-full absolute -right-2 bg-orange`}>
                      <AntDesign name="edit" size={20} color="#ffffff" />
                    </View>
                  </TouchableOpacity>
                </View>
              )}
              
            </View>

            <Text className={`text-base font-amedium pb-2 text-blue`}>Personal Details</Text>
            <View className='bg-gray-300 px-3 py-5 rounded-lg' style={{backgroundColor: '#F3F3F3'}}>
              <FormField title="Account Name" value={form.accountName} handleChangeText={(e: any) => setForm({ ...form, accountName: e })} inputBg='bg-gray-50' disabled={false}/>
              <FormField title="Email" value={form.email} otherStyles="mt-7" keyboardType="email-address" inputBg='bg-gray-50' disabled={false} />
              <View className='mt-7'>
                <Text className={`text-base font-amedium pb-2 text-blue`}>Phone Number</Text>
                <View className='flex-row items-center w-full justify-between gap-2'>
                  <TouchableOpacity onPress={handlePresentDialCodeModalPress} className='flex-row items-center justify-center bg-white px-2 gap-2 rounded-md h-14 w-20'>
                    <Text className='text-2xl'>
                      {selectedCountry?.flag}
                    </Text>
                    <Entypo name="chevron-down" size={18} color="#003366" />
                  </TouchableOpacity>
                  
                  <View className={`bg-white border flex-1 ${isFocused ? 'border-orange-100' : 'border-inputBg'} h-14 px-4 rounded-md items-center flex-row gap-1`}>
                    <TextInput className={`bg-white text-black font-aregular text-base h-full`} value={selectedCountry?.dial_code} placeholder="+000" placeholderTextColor="#ccc" editable={false}/>
                    <TextInput className={`bg-white flex-1 text-black font-aregular text-base h-full pl-1`} value={form.phoneNumber} placeholder="Enter here" placeholderTextColor="#ccc" onChangeText={(e: any) => setForm({ ...form, phoneNumber: e })} keyboardType="phone-pad" onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}/>
                  </View>
                </View>
              </View>
              <Picker title='Gender' value={form.gender} placeholder={form.gender} handleChangeText={(e: any) => setForm({ ...form, gender: e.value })} data={data.gender} inputBg='bg-white'/>
              <View className='mt-7'>
                <Text className={`text-base font-amedium pb-2 text-blue`}>Country of Residence</Text>
                <View className='flex-row items-center justify-between bg-gray-50 px-4 gap-2 rounded-md h-14 w-full'>
                  <View className='flex-row gap-2 items-center'>
                    <Text className='text-2xl'>
                      {selectedResidence?.flag}
                    </Text>
                    <Text className={`text-base font-amedium text-blue`} numberOfLines={1}>{selectedResidence?.name?.en}</Text>
                  </View>
                  {/* <Entypo name="chevron-down" size={18} color="#003366" /> */}
                </View>
              </View>
            </View>

            <View className='border my-8 border-gray-100'/>

            <Text className={`text-base font-amedium pb-2 text-blue`}>Location Details</Text>
            <View className='bg-gray-300 px-3 py-5 rounded-lg w-full' style={{backgroundColor: '#F3F3F3'}}>
              <FormField title="State (Optional)" value={form.location?.state} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, location: {...form.location, state: e}})} inputBg='bg-white'/>
              <FormField title="City" value={form.location?.city} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, location: {...form.location, city: e}})} otherStyles="mt-7" inputBg='bg-white'/>
              <View className='flex-row items-center w-full justify-between gap-1'>
                <FormField title="Street" value={form.location?.street} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, location: {...form.location, street: e}})} otherStyles="mt-7 w-[67%]" inputBg='bg-white'/>
                <FormField title="House No." value={form.location?.houseNo} placeholder="No." handleChangeText={(e: any) => setForm({ ...form, location: {...form.location, houseNo: e}})} otherStyles="mt-7 w-[30%]" keyboard="phone-pad" inputBg='bg-white'/>
              </View>
              <FormField title="Closest Landmark (Optional)" value={form.location?.closestLandmark} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, location: {...form.location, closestLandmark: e}})} otherStyles="mt-7" inputBg='bg-white'/>
            </View>
          </View>
      </ScrollView>
    </KeyboardAvoidingView>
    <View className='w-full justify-center my-4'>
      <CustomButton title="Update Profile" handlePress={submit} containerStyles="w-full" textStyles='text-white'/>
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

     <Modal transparent={false} visible={showModal} onRequestClose={() => setShowModal(false)}>
        <SafeAreaView className='flex-1'>
            <View className='flex-1 w-full px-4'>
                <View className='flex-row items-center justify-between gap-2 py-2'>
                  <Text className='font-bold text-lg text-blue'>Photo Preview</Text>
                  <TouchableOpacity onPress={() => setShowModal(false)}>
                    <Ionicons name="close" size={28} color="#003366" />
                  </TouchableOpacity>
                </View>
                <View className='flex-1 items-center justify-center'>
                  <View className='size-[270px] rounded-full border border-gray-200 relative'>
                    {file?.uri && <Image source={{ uri: file?.uri }} resizeMode='cover' className='w-full h-full rounded-full'/>}
                    <TouchableOpacity activeOpacity={0.9} className='absolute -right-1 bottom-2 z-50' onPress={pickImage}>
                      <View className={`flex items-center justify-center size-20 rounded-full absolute -right-2 bottom-2 bg-gray-100`}>
                        <Entypo name="camera" size={38} color="black" />
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
                <View className='w-full justify-center my-6'>
                  <CustomButton title="Save & Close" handlePress={uploadImage} isLoading={isLoading} containerStyles="w-full" textStyles='text-white'/>
                </View>      
            </View>
        </SafeAreaView>
    </Modal>
    
    <StatusBar backgroundColor='#ffffff' style='dark'/>
  </SafeAreaView>
  )
}

export default UserProfileScreen