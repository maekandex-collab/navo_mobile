import { View, Text, ScrollView, Platform, KeyboardAvoidingView, ActivityIndicator, Pressable, Switch } from 'react-native'
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import FormField from '@/components/FormField'
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
import Details from '@/components/Details'
import displayCurrency from '@/utils/displayCurrency'
import PopupModal from '@/components/PopupModal'
import { hideLoader, showLoader } from '@/redux/LoaderSlice'
import { useDispatch } from 'react-redux'
import * as SecureStore from 'expo-secure-store';

type FXInfoType = {
  toCurrency: "GBP" | "NGN" | "USD" | "EUR";
  amount: number, 
  convertedAmount: number, 
  fromCurrency: "GBP" | "NGN" | "USD" | "EUR";
  fxId: string; 
  message: string; 
  order: {
    amount: string; 
    currency: string; 
    customerEmail: string;
  }, 
  paymentStatus: string;
  success: boolean
}
const USDAccountScreen = () => {

  const { status, reference, currencyFrom, currencyTo, paymentType } = useLocalSearchParams() as any;

  const toast = useToast();
  const dispatch = useDispatch()
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)
  const [FXDetails, setFXDetails] = useState<FXInfoType | null>(null)
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [isEnabled, setIsEnabled] = useState(false)
  const [conversionId, setConversionId] = useState<string | null>(null)

  const [form, setForm] = useState({
    recipientBankName: "",
    recipientAccountName: "",
    recipientAccountNumber: "",
    recipientSortCode: "",
    conversionId: ""
  })

  useEffect(() => {
    const loadConversionId = async () => {
      const id = await SecureStore.getItemAsync("conversionId");
      setConversionId(id);
    };
    loadConversionId();
  }, []);

  // const verify = async () => {
  //   console.log("")
  //   try{
  //     const result = await axiosClient.get(`/payments/verify?idType=ORDER_ID&id=${orderId}`)

  //     console.log("verify",result.data)
  //     setFXDetails(result.data?.data)

  //   } catch (error: any) {
  //     toast.show(error.response.data.message || error.response.data.error.message,{
  //       type: "danger",
  //     });
  //     router.replace("/(protected)/(tabs)/home")
  //   } 
  // }

  // useEffect(() => {
  //   if (orderId && orderReference) {
  //     console.log("there is order id")
  //     verify()
  //   }else{
  //     router.push("/(protected)/(tabs)/home")
  //   }
  // }, [orderId, orderReference]);

  // useEffect(() => {
  //   if(FXDetails){

  //     if(!FXDetails?.success && FXDetails?.paymentStatus !== "SUCCESSFUL") {
  //       toast.show(FXDetails?.message, {
  //         type: "warning",
  //       });
  //       router.replace("/(protected)/(routes)/Fx")
  //     }else{
  //       setIsVerifying(false)
  //     }
  //   }
  // }, [FXDetails]);

  const confirm = () => {
    if(!form.recipientBankName){
      return toast.show("Bank name is empty", {
        type: "warning",
      });
    }

    if(!form.recipientAccountName){
      return toast.show("Account name is empty", {
        type: "warning",
      });
    }

    if(!form.recipientAccountNumber){
        return toast.show("Account number is empty", {
          type: "warning",
        });
    }

    if(!form.recipientSortCode){
        return toast.show("Sort Code is empty", {
          type: "warning",
        });
    }

    handlePresentModalPress()
  }

  const submit = async () => {

    if(!form.recipientBankName){
      return toast.show("Bank name is empty", {
        type: "warning",
      });
    }

    if(!form.recipientAccountName){
      return toast.show("Account name is empty", {
        type: "warning",
      });
    }

    if(!form.recipientAccountNumber){
      return toast.show("Account number is empty", {
        type: "warning",
      });
    }

    if(!form.recipientSortCode){
      return toast.show("Sort Code is empty", {
        type: "warning",
      });
    }

    dispatch(showLoader());

    const data = {
      ...form,
      conversionId
    }

    const BData = {
      bankName: form.recipientBankName,
      accountName: form.recipientAccountName,
      accountNumber: form.recipientAccountNumber,
      sortCode: form.recipientSortCode,
      currency: "USD"
    }

    if(isEnabled){
      // Fire and forget beneficiary call
      axiosClient.post("/beneficiary/save-beneficiary", BData).catch((err) => {
        toast.show(err.response.data?.message,{
          type: "warning",
        });
      });
    }

    try{
      const result = await axiosClient.post("/fx/save-recipient", data)

      await SecureStore.deleteItemAsync("conversionId");

      toast.show(result.data.message,{
        type: "success",
      });

      setShowSuccessModal(true)
      handleCloseModalPress()

      setForm({
        recipientBankName: "",
        recipientAccountName: "",
        recipientAccountNumber: "",
        recipientSortCode: "",
        conversionId: ""
      })

    } catch (error: any) {
      toast.show(error.response.data.message || error.response.data.error.message,{
        type: "danger",
      });

    } finally {
      dispatch(hideLoader());
    } 

  }

  const chooseBeneficiary = () => {

    const userInfo = {
      conversionId,
      // amount:  FXDetails?.amount,
      // convertedAmount: FXDetails?.convertedAmount,
      // fromCurrency:  FXDetails?.fromCurrency,
      // toCurrency:  FXDetails?.toCurrency,
    }

    router.push({
      pathname: "/(protected)/(routes)/UKBeneficiaries",
      params: { userData: JSON.stringify(userInfo) },
    });
  }

  const handleCloseModalPress = useCallback(() => {
    bottomSheetModalRef.current?.dismiss()
  }, []);

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const closeSuccessModal = () => {
    setShowSuccessModal(false); 
    router.replace("/(protected)/(tabs)/transactions")
  }

  // if(isVerifying) return (
  //   <View className='flex-1 bg-white items-center justify-center'>
  //     <ActivityIndicator size="large" color="#003366"/>
  //     <Text className="text-base text-blue mt-2 font-abold">Please wait</Text>
  //     <StatusBar backgroundColor="#ffffff" style='dark'/>
  //   </View>
  // )

  return (
    <SafeAreaView className="bg-white h-full px-4">
      <Header title={`${currencyTo} Account No.`} showGoBack={true} onpress={() => router.replace("/(protected)/(routes)/Fx")}/>
      <KeyboardAvoidingView className='flex-1' behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === 'ios' ? 30 : 0}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="w-full justify-center my-4 mt-6">

              <Text className="text-sm text-blue mt-2 font-abold">Kindly Input your recieving account details,</Text>
              <Text className="text-sm text-blue mt-1 font-abold mb-2">Please check your account number carefully before proceeding.</Text>

              <FormField title="Bank Name" value={form.recipientBankName} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, recipientBankName: e })} otherStyles="mt-4"/>
              <View className='ml-auto'>
                <Pressable onPress={chooseBeneficiary}>
                  <Text className="text-blue mt-1 font-amedium mb-2">Choose Beneficiary</Text>
                </Pressable>
              </View>
              <FormField title="Account Name" value={form.recipientAccountName} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, recipientAccountName: e })}/>
              <FormField title="Account Number" value={form.recipientAccountNumber} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, recipientAccountNumber: e })} otherStyles="mt-4"/>
              <FormField title="Sort Code" value={form.recipientSortCode} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, recipientSortCode: e })} otherStyles="mt-4"/>
              <View className='flex-row gap-2 items-center justify-between my-4'>
                <Text className="text-blue mt-1 font-amedium mb-2 flex-1">Save as Beneficiary</Text>
                <Switch
                  trackColor={{false: '#ccc', true: '#FFC198'}}
                  thumbColor={isEnabled ? '#FF6600' : '#787878'}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={setIsEnabled}
                  value={isEnabled}
                />
              </View>
            </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <View className='w-full justify-center gap-2 my-4'>
        <CustomButton title="Continue" handlePress={confirm} containerStyles="w-full" textStyles='text-white'/>
      </View>

      <CustomButtomSheet ref={bottomSheetModalRef} enablePenDown={false}>
        <View>
          <View className='flex-row w-full items-center justify-between gap-1 mb-3'>
            <View className='w-8'/>
            <Text className="text-sm text-center text-gray-300 font-abold">Account Summary</Text>
            <TouchableOpacity onPress={handleCloseModalPress}>
              <AntDesign name="closecircleo" size={30} color="#003366" />
            </TouchableOpacity>
          </View>

          <View className='flex-col w-full items-center justify-between my-3'>
            <Text className="text-sm text-center text-blue font-amedium">Amount you will Recieve</Text>
            <Text className="text-2xl text-center text-blue font-abold">{displayCurrency(Number(FXDetails?.convertedAmount), FXDetails?.toCurrency)}</Text>
          </View>

          <View>
            <Details title='Bank Name' value={form.recipientBankName}/>
            <Details title='Account No.' value={form.recipientAccountNumber}/>
            <Details title='Account Name' value={form.recipientAccountName}/>
            <Details title='Sort Code' value={form.recipientSortCode}/>
          </View>

          <CustomButton title="Continue" handlePress={submit} containerStyles='w-full mt-4 my-2' textStyles='text-white'/>
        </View>
      </CustomButtomSheet>

      <PopupModal visible={showSuccessModal} title='Your account details have been submitted' onClose={closeSuccessModal}>
        <View className='flex-start w-full my-3'>
          <Text className="font-abold text-center text-blue">You will recieve an alert within 24 hour, if your payment have been confirmed</Text>
        </View>
        <View className='mt-4 flex-row gap-4 items-center'>
          <TouchableOpacity className='bg-blue px-4 py-2 rounded-md w-24 items-center' onPress={closeSuccessModal}>
            <Text className='text-white text-lg font-abold'>OK</Text>
          </TouchableOpacity>
        </View>
      </PopupModal>

      <StatusBar backgroundColor="#ffffff" style='dark'/>
    </SafeAreaView>
  )
}

export default USDAccountScreen