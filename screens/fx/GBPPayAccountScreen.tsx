import { View, Text, ScrollView, Platform, Image, KeyboardAvoidingView, ActivityIndicator, Alert, Pressable } from 'react-native'
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import CustomButton from '@/components/CustomButton'
import { router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import Header from '@/components/Header'
import { useToast } from 'react-native-toast-notifications'
import { useLocalSearchParams } from 'expo-router'
import { axiosClient } from '@/globalApi'
import CustomButtomSheet from '@/components/CustomButtomSheet'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { TouchableOpacity } from 'react-native'
import AntDesign from '@expo/vector-icons/AntDesign'
import displayCurrency from '@/utils/displayCurrency'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import * as DocumentPicker from 'expo-document-picker';
import Octicons from '@expo/vector-icons/Octicons';
import * as Clipboard from 'expo-clipboard';
import Pdf from 'react-native-pdf';
import PopupModal from '@/components/PopupModal'
import { useDispatch } from 'react-redux'
import { hideLoader, showLoader } from '@/redux/LoaderSlice'

type photoType = {
  mimeType: string;
  name:  string;
  size: number;
  uri:  string;
}

type accountType = {
  accountName: string;
  accountNumber: string;
  bankName: string;
  currency: string; 
  sortCode: string;
}

const GBPPayAccountScreen = () => {

  const { userData } = useLocalSearchParams() as any;
  const parsedUserData = userData ? JSON.parse(userData) : null;

  const toast = useToast();
  const dispatch = useDispatch()
  const [validateModal, setValidateModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [accountDetails, setAccountDetails] = useState<accountType | null>(null)
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const [form, setForm] = useState<photoType | null>(null)

  const getAccountDetail = async () => {
    setIsLoading(true)
    try{
      const result = await axiosClient.get(`fx/fetch-details`)

      console.log("account",result.data)
      setAccountDetails(result.data?.info)

    } catch (error: any) {
      toast.show(error.response.data.message || error.response.data.error.message,{
        type: "danger",
      });

      router.back()

    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getAccountDetail()
  }, []);

  const copyAccountNo = async () => {
    if(accountDetails?.accountNumber){
      await Clipboard.setStringAsync(accountDetails?.accountNumber);

      toast.show("Account number copied ", {
        type: "success",
      });
    }
  }

  const confirm = () => {
    handlePresentModalPress()
  }

  const validateUpload = () => {
    if(!form){
      return toast.show("Upload proof of payment", {
        type: "danger",
      });
    }
    
    setValidateModal(true)
  }

  const submit = async () => {

    if(!form){
      return toast.show("Upload proof of payment", {
        type: "danger",
      });
    }

    dispatch(showLoader());
    setValidateModal(false)
    try{

      const formData = new FormData();

      formData.append('proofOfPayment', {
        uri: form?.uri,
        name: form?.name,
        type: form?.mimeType
      } as any);

      formData.append('conversionId', parsedUserData?.conversionId);

      const result = await axiosClient.post("/fx/upload-proof", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      console.log("p=",result.data)
      toast.show(result.data?.message,{
        type: "success",
      });

      const userInfo = {
        conversionId:  parsedUserData?.conversionId,
        amount:  parsedUserData?.amount,
        convertedAmount: parsedUserData?.convertedAmount,
        fromCurrency:  parsedUserData?.fromCurrency,
        toCurrency:  parsedUserData?. toCurrency,
      }

      handleCloseModalPress()

      router.replace({
        pathname: "/(protected)/(routes)/NairaAccount",
        params: { userData: JSON.stringify(userInfo) },
      });


    } catch (error: any) {
      toast.show(error.response.data.message || error.response.data.error.message,{
        type: "danger",
      });

    } finally {
      dispatch(hideLoader());
    } 
   

  }

  const openPicker = async () => {
  
    const MAX_FILE_SIZE = 5 * 1024 * 1024;

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) return;

      const file: any = result.assets[0];

      if (file.size > MAX_FILE_SIZE) {
        Alert.alert('File too large', 'Please select a file smaller than 5 MB.');
        return;
      }

      console.log("file", file)

      if (!result.canceled) {
        setForm(file) 
        console.log('Picked document:', file);
      }  
      
    } catch (err) {
      console.error('Error picking document:', err);
    }
  };

  const handleCloseModalPress = useCallback(() => {
    bottomSheetModalRef.current?.dismiss()
  }, []);

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);


  if(isLoading) return (
    <View className='flex-1 bg-white items-center justify-center'>
      <ActivityIndicator size="large" color="#003366"/>
      <Text className="text-base text-blue mt-2 font-abold">Please wait</Text>
    </View>
  )

  return (
    <SafeAreaView className="bg-white h-full px-4">
      <Header title='Make Payment' showGoBack={true} onpress={() => router.replace("/(protected)/(routes)/Fx")}/>
      {!accountDetails || (Object.keys(accountDetails).length === 0) || (
        !accountDetails?.accountName &&
        !accountDetails?.accountNumber &&
        !accountDetails?.bankName &&
        !accountDetails?.sortCode &&
        !accountDetails?.currency
      ) ? (
        <View className='flex-1 bg-white items-center justify-center'>
          <Text className="text-lg text-blue font-abold">Account details not available</Text>
          <Text className="text-sm text-blue mt-1 font-abold">Try again later</Text>
        </View>
      ) : (
        <>
          <KeyboardAvoidingView className='flex-1' behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === 'ios' ? 30 : 0}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="w-full justify-center my-4">

                  <View className='w-full flex-row items-start gap-2 border border-orange bg-orange/10 p-4 rounded-lg'>
                    <AntDesign name="exclamationcircleo" size={20} color="#FF6600" className='mt-1'/>
                    <Text className="text-base text-blue font-abold flex-1">Make payment only to {accountDetails?.accountName} using the account details below</Text>
                  </View>

                  <Text className="text-xl text-center my-4 text-blue font-amedium">{accountDetails?.currency} Account</Text>

                  <View className='bg-gray-50 p-4 rounded-lg gap-4'>
                    <View className='bg-inputBg p-4 rounded-md flex-1'>
                      <Text className="text-base text-blue font-amedium">Amount</Text>
                      <Text className="text-xl text-blue font-abold">{displayCurrency(Number(parsedUserData?.amount), parsedUserData?.fromCurrency)}</Text>
                    </View>
                    <Pressable onPress={copyAccountNo} className='bg-inputBg p-4 rounded-md flex-1 flex-row items-center justify-between gap-1'>
                      <View className='flex-1'>
                        <Text className="text-base text-blue font-amedium">Account Number</Text>
                        <Text className="text-3xl text-blue font-abold">{accountDetails?.accountNumber}</Text>
                      </View>
                      <Octicons name="copy" size={22} color="#003366" />
                    </Pressable>
                    <View className='bg-inputBg p-4 rounded-md flex-1'>
                      <Text className="text-base text-blue font-amedium">Bank Name</Text>
                      <Text className="text-xl text-blue font-abold">{accountDetails?.bankName}</Text>
                    </View>
                    <View className='bg-inputBg p-4 rounded-md flex-1'>
                      <Text className="text-base text-blue font-amedium">Account Name</Text>
                      <Text className="text-xl text-blue font-abold">{accountDetails?.accountName}</Text>
                    </View>
                    <View className='bg-inputBg p-4 rounded-md flex-1'>
                      <Text className="text-base text-blue font-amedium">Sort Code</Text>
                      <Text className="text-xl text-blue font-abold">{accountDetails?.sortCode}</Text>
                    </View>
                  </View>

                  <Text className="text-base text-center my-4 text-blue font-amedium">Send exactly {displayCurrency(Number(parsedUserData?.amount), parsedUserData?.fromCurrency)} to this account only.</Text>

                </View>
            </ScrollView>
          </KeyboardAvoidingView>
          <View className='w-full justify-center gap-2 my-4'>
            <CustomButton title="I have sent the money" handlePress={confirm} containerStyles="w-full" textStyles='text-white'/>
          </View>
        </>
      )}
      

      <CustomButtomSheet ref={bottomSheetModalRef} enablePenDown={false}>
        <View>
          <View className='flex-row w-full items-center justify-between gap-1 mb-3'>
            <View className='w-8'/>
            <Text className="text-sm text-center text-gray-300 font-abold">Proof of Payment</Text>
            <TouchableOpacity onPress={handleCloseModalPress}>
              <AntDesign name="closecircleo" size={30} color="#003366" />
            </TouchableOpacity>
          </View>

          <View className='mt-4'>
            <Text className='text-base font-amedium pb-2 text-blue'>Upload proof of payment</Text>
            {!form ? (
              <View className='bg-inputBg p-4 min-h-44 w-full rounded-lg'>
                <TouchableOpacity activeOpacity={0.8} className='border-2 border-dashed flex-1 border-gray-200 rounded-md' onPress={openPicker}>
                  <View className='items-center justify-center gap-1 my-auto'>
                    <View className={`flex items-center justify-center size-12 rounded-full bg-orangeLight `}>
                      <MaterialCommunityIcons name="cloud-upload-outline" size={26} color="#FF6600" />
                    </View>
                    <View>
                      <Text className='text-base text-center font-abold text-blue'>Tap to add</Text>
                      <Text className="font-aregular text-center text-sm text-gray-300">PNG/JPEG/PDF</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            ) : form?.mimeType === "application/pdf" ? (
              <View className='h-44 w-full relative'>
                <TouchableOpacity activeOpacity={0.8} className='w-full h-full border flex-1 border-gray-200 rounded-lg overflow-hidden' onPress={openPicker}>
                  <View className="absolute items-center justify-center"
                    style={{
                      top: '50%',
                      left: '50%',
                      transform: [{ translateX: -0.5 * 48 }, { translateY: -0.5 * 48 }],
                      zIndex: 50
                    }}>
                    <View className={`flex items-center justify-center size-12 rounded-full bg-blue-100 `}>
                      <MaterialCommunityIcons name="cloud-upload-outline" size={26} color="#003366" />
                    </View>
                  </View>
                  <Pdf
                    source={{ uri: form.uri }}
                    style={{ flex: 1, width: "100%", height: "100%" }}
                    page={1}
                    scale={1.0}
                    horizontal={false}
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <View className='h-44 w-full relative'>
                <TouchableOpacity activeOpacity={0.8} className='w-full h-full border flex-1 border-gray-200 rounded-lg overflow-hidden' onPress={openPicker}>
                  <View className="absolute items-center justify-center"
                    style={{
                      top: '50%',
                      left: '50%',
                      transform: [{ translateX: -0.5 * 48 }, { translateY: -0.5 * 48 }],
                      zIndex: 50
                    }}>
                    <View className={`flex items-center justify-center size-12 rounded-full bg-blue-100 `}>
                      <MaterialCommunityIcons name="cloud-upload-outline" size={26} color="#003366" />
                    </View>
                  </View>
                  <Image
                    source={{ uri: form?.uri }}
                    className='w-full h-full'
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              </View>
             
            )}
            <Text className="font-amedium text-sm mt-2 mb-4 text-gray-300" numberOfLines={3}>{!form ? "Less than 5MB and must be clear" : form?.name}</Text>
          </View>

          <CustomButton title="Continue" handlePress={validateUpload} containerStyles='w-full mt-4 my-2' textStyles='text-white'/>
        </View>
      </CustomButtomSheet>

      <PopupModal visible={validateModal} title='Confirm Upload' onClose={() => setValidateModal(false)}>
        <Text className="text-lg font-abold my-3 text-center">Are you sure this is the file you want to upload?</Text>
        <View className='mt-4 flex-row gap-4 items-center'>
          <TouchableOpacity className='bg-orange px-4 py-2 rounded-md w-24 items-center' onPress={submit}>
            <Text className='text-white text-lg font-abold'>Yes</Text>
          </TouchableOpacity>
          <TouchableOpacity className='bg-blue px-4 py-2 rounded-md w-24 items-center' onPress={() => setValidateModal(false)}>
            <Text className='text-white text-lg font-abold'>No</Text>
          </TouchableOpacity>
        </View>
      </PopupModal>

      <StatusBar backgroundColor="#ffffff" style='dark'/>
    </SafeAreaView>
  )
}

export default GBPPayAccountScreen