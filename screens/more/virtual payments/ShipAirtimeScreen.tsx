import { View, Text, ScrollView, Image, Pressable, KeyboardAvoidingView, StyleSheet } from 'react-native'
import React, { useCallback, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import FormField from '@/components/FormField'
import CustomButton from '@/components/CustomButton'
import { router } from 'expo-router'
import AntDesign from '@expo/vector-icons/AntDesign'
import { StatusBar } from 'expo-status-bar'
import Header from '@/components/Header'
import { images } from '@/constants'
import { TouchableOpacity } from 'react-native'
import Details from '@/components/Details'
import { Platform } from 'react-native'
import CustomButtomSheet from '@/components/CustomButtomSheet'
import { BottomSheetModal, useBottomSheetModal } from '@gorhom/bottom-sheet'
import { useToast } from 'react-native-toast-notifications'
import { axiosClient } from '@/globalApi'
import SetPin from '@/components/SetPin'
import ConfirmPin from '@/components/ConfirmPin'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'
import getWallet from '@/utils/WalletApi'
import displayCurrency from '@/utils/displayCurrency'
import { formatEnumsCapital } from '@/utils/formatEnumsCapital'
import { hideLoader, showLoader } from '@/redux/LoaderSlice'

const ShipAirtimeScreen = () => {

  const { walletData, balanceLoading } = useSelector((state: RootState) => state.wallet)
  const { userProfile } = useSelector((state: RootState) => state.profile)
  const toast = useToast();
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [form, setForm] = useState({
    network: '',
    phoneNumber: '',
    amount: '',
    remark: '',
    currency: "ngn"
  })

  const dispatch = useDispatch()
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const { dismiss } = useBottomSheetModal()
  const bottomSheetModalPinRef = useRef<BottomSheetModal>(null);
  const bottomSheetConfirmPinModalRef = useRef<BottomSheetModal>(null);
  //  const [verifyModal, setVerifyModal] = useState(false)

   // callbacks
    const handlePresentModalPress = useCallback(() => {
      bottomSheetModalRef.current?.present();
    }, []);

    const confirmAirtime = () => {
      if(!form.network){
        return toast.show("Kindly select Network Provider", {
          type: "warning",
        });
      }

      if(!form.phoneNumber){
        return toast.show("Kindly add Phone number", {
          type: "warning",
        });
      }

      if(form.phoneNumber.length < 11){
        return toast.show("Phone number must be 11 digits", {
          type: "warning",
        });
      }

      if(form.phoneNumber.length > 11){
        return toast.show("Number is greater than 11 digits", {
          type: "warning",
        });
      }

      if(!form.amount){
        return toast.show("Kindly add an amount", {
          type: "warning",
        });
      }

      handlePresentModalPress()
    }

    const checkNumber = async () => {

      const data = {
        selectedNetwork: form.network,
        phoneNumber: form.phoneNumber
      }

      dispatch(showLoader());
      try {

        const result = await axiosClient.post("/vtu/detect-phone-networks", data)  

        console.log("phone Verify",result.data)

        toast.show(result.data.message,{
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

    const pay = async () => {

      if(userProfile.isPinSet === false){
        handlePresentModalPinPress()
      }else if(userProfile.isPinSet === true){
        handlePresentModalConfirmPinPress()
      }
    }

    const processPayment = async (pin: any) => {
      
      const AirtimeData = {
        phoneNumber: form.phoneNumber,
        amount: Number(form.amount),
        networkProvider: form.network,
        currency: "ngn",
        remark: form.remark,
        transactionPin: pin
      }

      dispatch(showLoader());
      try {
        
        const result = await axiosClient.post("/vtu/purchase-airtime", AirtimeData)  
        const data = result.data
        toast.show(result.data.message,{
          type: "success",
        });

        dismiss()

        console.log(result.data)

        const resData = {
          recipient: data?.transaction?.phoneNumber || "NAVO PLUS",
          transactionType: data?.transaction?.transactionType,
          paymentType: data?.transaction?.paymentType || formatEnumsCapital(data?.transaction?.utilityType),
          amount: displayCurrency(Number(data?.transaction?.amount), data?.transaction?.currency),
          networkProvider: formatEnumsCapital(data?.transaction?.networkProvider),
          utilityType: formatEnumsCapital(data?.transaction?.utilityType),
          channel: "Wallet",
          timeStamp: data?.transaction?.paidAt,
          merchantTxRef: data?.transaction?.transactionReference || data?.transaction?.merchantTxRef,
          category: data?.transaction?.category || 'Nil',
          status: data?.transaction?.finalStatus || data?.transaction?.paymentStatus,
          remark: !data?.transaction?.remark ? "Nil" : data?.transaction?.remark
        }

        router.push({
          pathname: "/(protected)/(routes)/receipt/TransactionsReceipt",
          params: { Recieptdata: JSON.stringify(resData) },
        });

        getWallet(dispatch, toast, null, true)
        setForm({
          network: '',
          phoneNumber: '',
          amount: '',
          remark: '',
          currency: "ngn"
        })
        
      } catch (error: any) {
        toast.show(error.response.data.message || error.response.data.error.message,{
          type: "danger",
        });
      } finally {
        dispatch(hideLoader());
      }

    }

    // setPin  callbacks
    const handlePresentModalPinPress = useCallback(() => {
      setPinModalVisible(true)
      bottomSheetModalPinRef.current?.present();
    }, []);

    const closePinModal = useCallback(() => {
      setPinModalVisible(false)
      bottomSheetModalPinRef.current?.dismiss()
    }, []);

    // confirmPin callbacks
    const handlePresentModalConfirmPinPress = useCallback(() => {
      setPinModalVisible(true)
      bottomSheetConfirmPinModalRef.current?.present();
    }, []);

    const closeConfirmPinModal = useCallback(() => {
      setPinModalVisible(false)
      bottomSheetConfirmPinModalRef.current?.dismiss()
    }, []);

    // const continueTransaction = () => {
    //   setVerifyModal(false)
    // }

    // const CancelTransaction = () => {
      
    // }
    


  return (
    <SafeAreaView className="bg-white h-full px-4">
      <Header title='Ship Airtime' showGoBack={true} onpress={() => router.back()}/>
      <KeyboardAvoidingView className='flex-1' behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === 'ios' ? 30 : 0}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="w-full justify-center my-6 mt-6">
            <View>
              <Text className="text-lg text-blue mt-3 font-amedium">Select network provider</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className='flex flex-row w-full justify-between gap-1'>
                      <Pressable onPress={() => setForm({ ...form, network: 'mtn' })} className={`flex items-center justify-center size-20 p-3 rounded-lg bg-orangeLight relative ${form.network === 'mtn' && 'border-2 border-orange'}`}>
                          {form.network === 'mtn' &&  <Image source={images.indicator} resizeMode='contain' className='absolute right-1 top-1'/>}
                          <Image source={images.mtn} resizeMode='contain' className='size-16'/>
                      </Pressable>
                      <Pressable onPress={() => setForm({ ...form, network: 'airtel' })} className={`flex items-center justify-center size-20 p-3 rounded-lg bg-orangeLight relative ${form.network === 'airtel' && 'border-2 border-orange'}`}>
                          {form.network === 'airtel' &&  <Image source={images.indicator} resizeMode='contain' className='absolute right-1 top-1'/>}
                          <Image source={images.airtel} resizeMode='contain' className='size-16'/>
                      </Pressable>
                      <Pressable onPress={() => setForm({ ...form, network: 'glo' })} className={`flex items-center justify-center size-20 p-3 rounded-lg bg-orangeLight relative ${form.network === 'glo' && 'border-2 border-orange'}`}>
                          {form.network === 'glo' &&  <Image source={images.indicator} resizeMode='contain' className='absolute right-1 top-1'/>}
                          <Image source={images.glo} resizeMode='contain' className='size-16'/>
                      </Pressable>
                      <Pressable onPress={() => setForm({ ...form, network: '9mobile' })} className={`flex items-center justify-center size-20 p-3 rounded-lg bg-orangeLight relative ${form.network === '9mobile' && 'border-2 border-orange'}`}>
                          {form.network === '9mobile' &&  <Image source={images.indicator} resizeMode='contain' className='absolute right-1 top-1'/>}
                          <Image source={images.mobile9} resizeMode='contain' className='size-16'/>
                      </Pressable>
                  </View>
              </ScrollView>
            </View>
            
              <FormField title="Phone Number*" value={form.phoneNumber} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, phoneNumber: e })} otherStyles="mt-7" keyboardType="phone-pad"/>
              <FormField title="Amount" value={form.amount} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, amount: e })} otherStyles="mt-7" keyboardType="phone-pad"/>
              <FormField title="Remark (optional)" value={form.remark} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, remark: e })} otherStyles="mt-7" />
            
              <View className='rounded-full px-4 py-2 mt-7 bg-blueLight flex-row gap-1 items-center self-start'>
                <Text className="font-alight text-sm text-blue">Wallet Bal:</Text>
                {balanceLoading ? (
                  <FontAwesome5 name="circle-notch" size={14} color="#003366" className='animate-spin-fast'/>
                ) : (
                  <Text className="font-amedium text-sm text-blue">{displayCurrency(Number(walletData.walletBalanceNGN), 'NGN')}</Text>
                )}
              </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    <View className='w-full justify-center my-6'>
      <CustomButton title="Confirm" handlePress={confirmAirtime} containerStyles="w-full" textStyles='text-white'/>
    </View>

    <CustomButtomSheet ref={bottomSheetModalRef} enablePenDown={false}>
      <View>
        <View className='flex-row w-full items-center justify-between gap-1'>
          <View className='w-8'/>
          <Text className="text-sm text-center text-gray-300 font-abold">Shipment Summary</Text>
          <TouchableOpacity onPress={() => dismiss()}>
            <AntDesign name="closecircleo" size={30} color="#003366" />
          </TouchableOpacity>
        </View>

        <View className={`mt-2`}>
          <Text className="text-base text-blue my-3 font-amedium">You are about to ship airtime. See details below</Text>
          <View>
            <Details title='Recipient' value={form.phoneNumber}/>
            <Details title='Type' value='Airtime Shipment'/>
            <Details title='Amount' value={displayCurrency(Number(form.amount),'NGN')}/>
            <Details title='Network Provider' value={form.network}/>
            <Details title='Channel' value='NGN Wallet'/>
          </View>
        </View>

        <CustomButton title="Make Payment" handlePress={pay} containerStyles={`w-full my-4`} textStyles='text-white'/>
      </View>     
    </CustomButtomSheet>

    <SetPin bottomSheetModalPinRef={bottomSheetModalPinRef} closePinModal={closePinModal} isVisible={pinModalVisible}/>
    <ConfirmPin onConfirmPin={(pin: string) => processPayment(pin)} bottomSheetModalPinRef={bottomSheetConfirmPinModalRef} closePinModal={closeConfirmPinModal} isVisible={pinModalVisible}/>
    
    <StatusBar backgroundColor='#ffffff' style='dark'/>
  </SafeAreaView>
  )
}

export default ShipAirtimeScreen

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    margin: 10,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  }
});