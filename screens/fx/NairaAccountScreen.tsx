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
import NgnBankModal from '@/components/select-modals/NgnBankModal'
import { axiosClient } from '@/globalApi'
import CustomButtomSheet from '@/components/CustomButtomSheet'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { TouchableOpacity } from 'react-native'
import AntDesign from '@expo/vector-icons/AntDesign'
import Details from '@/components/Details'
import displayCurrency from '@/utils/displayCurrency'
import PopupModal from '@/components/PopupModal'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { hideLoader, showLoader } from '@/redux/LoaderSlice'
import { useDispatch } from 'react-redux'
import * as SecureStore from 'expo-secure-store';

type nameType = {
  name: string;
  number: string;
  status: boolean
}

const NairaAccountScreen = () => {

  // const { userData } = useLocalSearchParams() as any;
  // const parsedUserData = userData ? JSON.parse(userData) : null;
  const { status, reference, currencyFrom, currencyTo, paymentType } = useLocalSearchParams() as any;

  const [showModal, setShowModal] = useState(false)
  const toast = useToast();
  const dispatch = useDispatch()
  const [isGettingName, setIsGettingName] = useState(false)
  const [accountName, setAccountName] = useState<nameType | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [isEnabled, setIsEnabled] = useState(false)
  const [conversionId, setConversionId] = useState<string | null>(null)

  const [form, setForm] = useState({
    recipientBankName: "",
    recipientAccountNumber: "",
    recipientBankCode: "",
    conversionId: ""
  })

  useEffect(() => {
    const loadConversionId = async () => {
      const id = await SecureStore.getItemAsync("conversionId");
      setConversionId(id);
    };
    loadConversionId();
  }, []);

  const getAccountName = async () => {

    if(!form.recipientBankName){
      return toast.show("Select Bank Name", {
        type: "warning",
      });
    }

    setIsGettingName(true)
    try{
      const result = await axiosClient.post(`/fx/account-details`, {
        accountNumber: form.recipientAccountNumber,
        bankCode: form.recipientBankCode
      })

      setAccountName({
        name: result.data?.bankDetails?.data?.accountName || "",
        number: result.data?.bankDetails?.data?.accountNumber || "",
        status: result.data?.bankDetails?.status
      })

      console.log("account",result.data)

    } catch (error: any) {
      toast.show(error.response.data.message || error.response.data.error.message,{
        type: "danger",
      });

      setAccountName({
        name: "",
        number: "",
        status: false
      })

    } finally {
      setIsGettingName(false)
    } 
  }

  useEffect(() => {
    if(form.recipientAccountNumber.length === 10){

      getAccountName()
    }
  }, [form.recipientAccountNumber]);

  const handleShowModal = () => {
    setShowModal(!showModal)
  }

  const handlePress = (bank: {code: string; logo: string; name: string}) => {
    setForm({ ...form, recipientBankName: bank?.name, recipientBankCode: bank?.code, recipientAccountNumber: "" })
    setShowModal(!showModal)
    setAccountName(null)   
  }

  const confirm = () => {
    if(!form.recipientBankName){
      return toast.show("Bank name is empty", {
        type: "warning",
      });
    }
    
    if(!form.recipientAccountNumber){
      return toast.show("Account number is empty", {
        type: "warning",
      });
    }
    
    if(!accountName?.number){
      return toast.show("input valid account no. to verify", {
        type: "warning",
      });
    }

    if(!accountName?.name){
      return toast.show("input valid account no. to verify", {
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
    
    if(!form.recipientAccountNumber){
      return toast.show("Account number is empty", {
        type: "warning",
      });
    }

    if(!accountName?.number){
      return toast.show("input valid account no. to verify", {
        type: "warning",
      });
    }
    
    if(!accountName?.name){
      return toast.show("input valid account no. to verify", {
        type: "warning",
      });
    }

    dispatch(showLoader());

    const data = {
      recipientBankName: form.recipientBankName,
      recipientAccountName: accountName.name,
      recipientAccountNumber: accountName.number,
      conversionId
    }

    const BData = {
      bankName: form.recipientBankName,
      accountName: accountName.name,
      accountNumber: accountName.number,
      sortCode: "",
      currency: "NGN"
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

      setAccountName(null)
      setForm({
        recipientBankName: "",
        recipientAccountNumber: "",
        recipientBankCode: "",
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

  const closeModal = () => {
    setShowModal(false) 
  }

  const chooseBeneficiary = () => {

    const userInfo = {
      conversionId:  conversionId,
      // amount:  FXDetails?.amount,
      // convertedAmount: FXDetails?.convertedAmount,
      // fromCurrency:  FXDetails?.fromCurrency,
      // toCurrency:  FXDetails?.toCurrency,
    }

    router.push({
      pathname: "/(protected)/(routes)/NGNBeneficiaries",
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

  return (
    <SafeAreaView className="bg-white h-full px-4">
      <Header title={`${currencyTo} Account No.`} showGoBack={true} onpress={() => router.replace("/(protected)/(routes)/Fx")}/>
      <KeyboardAvoidingView className='flex-1' behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === 'ios' ? 30 : 0}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="w-full justify-center my-4 mt-6">

              <Text className="text-sm text-blue mt-2 font-abold">Kindly Input your recieving account details,</Text>
              <Text className="text-sm text-blue mt-1 font-abold mb-2">Please check your account number carefully before proceeding.</Text>

              <NgnBankModal placeholder='Select Bank' selectedValue={form.recipientBankName} header="Select Bank" title='Select Bank' showModal={showModal} close={closeModal} handlePress={handlePress} handleShowModal={() => handleShowModal()} />
              <FormField title="Account Number" value={form.recipientAccountNumber} placeholder="Enter here" handleChangeText={(e: any) => {setForm({ ...form, recipientAccountNumber: e }); setAccountName(null)}} otherStyles="mt-4" keyboardType='number-pad' maxLength={10}/>
              <View className='py-2 ml-auto'>
                <Pressable onPress={chooseBeneficiary}>
                  <Text className="text-blue mt-1 font-amedium mb-2">Choose Beneficiary</Text>
                </Pressable>
              </View>
              {isGettingName ? (
                <View className={`bg-green-50 w-full min-h-14 px-4 py-2 rounded-md items-center flex-row gap-2 mt-6`}>
                  <ActivityIndicator size={"small"} color={"#15803d"}/>
                  <Text className="text-base text-green-700 font-abold flex-1">Verifying account details</Text>
                </View>
              ) : (accountName?.name && accountName?.number) && accountName?.status === true ? (
                <View className='mt-6 gap-4'>
                  <View className={`bg-green-50 w-full min-h-14 px-4 py-2 rounded-md items-center flex-row gap-2`}>
                    <MaterialIcons name="verified-user" size={22} color="#15803d" />
                    <Text className="text-lg text-green-700 font-abold uppercase flex-1">{accountName?.name}</Text>
                  </View>
                  <View className='flex-row gap-2 items-center justify-between'>
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
              ) : (!accountName?.name || !accountName?.number) && accountName?.status === false ? (
                <View className={`bg-red-50 w-full min-h-14 px-4 py-2 rounded-md items-center flex-row gap-2 mt-6`}>
                  <AntDesign name="closecircle" size={20} color="#b91c1c" />
                  <Text className="text-base text-red-700 font-abold flex-1">Account verification failed. Please check the details or try again later.</Text>
                </View>
              ) : ''}

            </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <View className='w-full justify-center gap-2 my-4'>
        <CustomButton title="Continue" handlePress={confirm} containerStyles="w-full" disableButton={!accountName?.name} textStyles='text-white'/>
      </View>

      <CustomButtomSheet ref={bottomSheetModalRef} enablePenDown={false}>
        <View>
          <View className='flex-row w-full items-center justify-between gap-1 mb-3'>
            <View className='w-8'/>
            <Text className="text-sm text-center text-gray-300 font-abold">Confirm Account Details</Text>
            <TouchableOpacity onPress={handleCloseModalPress}>
              <AntDesign name="closecircleo" size={30} color="#003366" />
            </TouchableOpacity>
          </View>

          {/* <View className='flex-col w-full items-center justify-between my-3'>
            <Text className="text-sm text-center text-blue font-amedium">Amount you will Recieve</Text>
            <Text className="text-2xl text-center text-blue font-abold">{displayCurrency(Number(parsedUserData?.convertedAmount), parsedUserData?.toCurrency)}</Text>
          </View> */}

          <View>
            <Details title='Bank Name' value={form.recipientBankName}/>
            <Details title='Account Name' value={accountName?.name as string}/>
            <Details title='Account No.' value={accountName?.number as string}/>
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

export default NairaAccountScreen