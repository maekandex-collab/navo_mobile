import { View, Text, ScrollView, Image, Pressable, KeyboardAvoidingView } from 'react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import FormField from '@/components/FormField'
import CustomButton from '@/components/CustomButton'
import { Link, router } from 'expo-router'
import AntDesign from '@expo/vector-icons/AntDesign'
import { StatusBar } from 'expo-status-bar'
import Header from '@/components/Header'
import Picker from '@/components/Picker'
import { TouchableOpacity } from 'react-native'
import Details from '@/components/Details'
import { axiosClient } from '@/globalApi'
import { useToast } from 'react-native-toast-notifications'
import CableTVModal from '@/components/select-modals/CableTVProduct'
import CustomButtomSheet from '@/components/CustomButtomSheet'
import { BottomSheetModal, useBottomSheetModal } from '@gorhom/bottom-sheet'
import SetPin from '@/components/SetPin'
import ConfirmPin from '@/components/ConfirmPin'
import FormFieldValidate from '@/components/FormFieldValidate'
import { Platform } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'
import getWallet from '@/utils/WalletApi'
import displayCurrency from '@/utils/displayCurrency'
import { formatEnumsCapital } from '@/utils/formatEnumsCapital'
import { hideLoader, showLoader } from '@/redux/LoaderSlice'


const biller = [
  { label: 'dstv', value: 'dstv' },
  { label: 'gotv', value: 'gotv' },
  { label: 'startimes', value: 'startimes' }
];

const ShipCableTVScreen = () => {
  const { walletData, balanceLoading } = useSelector((state: RootState) => state.wallet)
  const { userProfile } = useSelector((state: RootState) => state.profile)
   const [showTVProductModal,setShowTVProductModal] = useState(false)
   const [loadCustomerCableId,setLoadCustomerCableId] = useState(false)
   const [disableConfirm,setDisableConfirm] = useState(true)
   const [idResult,setIdResult] = useState({
    message: '',
    success: null
   })
   const [pinModalVisible, setPinModalVisible] = useState(false);
  const [form, setForm] = useState({
    biller: 'dstv',
    product: '',
    amount: '',
    cableTVId: '',
    remark: '',
  })

  const toast = useToast();

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const { dismiss } = useBottomSheetModal()
  const bottomSheetModalPinRef = useRef<BottomSheetModal>(null);
  const bottomSheetConfirmPinModalRef = useRef<BottomSheetModal>(null);

  const dispatch = useDispatch()
  // callbacks
    const handlePresentModalPress = useCallback(() => {
      bottomSheetModalRef.current?.present();
    }, []);

    
    const confirmData = () => {
      if(!form.biller){
        return toast.show("Kindly select Biller", {
          type: "warning",
        });
      }

      if(!form.product){
        return toast.show("Kindly select product", {
          type: "warning",
        });
      }

      if(!form.amount){
        return toast.show("Can't get amount, try again later", {
          type: "warning",
        });
      }

      handlePresentModalPress()
  }

  const CableTVIdChange = (e: any) => {
    setForm({ ...form, cableTVId: e })
    setIdResult({
      message: '',
      success: null
    })
    setDisableConfirm(true)
  }

  const handleCableTVId = async () => {

    if(!form.biller){
      return toast.show("Kindly select Biller", {
        type: "warning",
      });
    }

    if(!form.product){
      return toast.show("Kindly select product", {
        type: "warning",
      });
    }

    if(!form.amount){
      return toast.show("Can't get amount, try again later", {
        type: "warning",
      });
    }

    if(!form.cableTVId){
      return toast.show("Kindly input CableTV ID", {
        type: "warning",
      });
    }

    if(form.cableTVId.length < 5){
      return toast.show("Kindly complete Cable ID number", {
        type: "warning",
      });
    }

  
    try {
      setLoadCustomerCableId(true)

      const result = await axiosClient.get(`/vtu/cable-tv-customer/${form.biller}/${form.cableTVId}`)

      setIdResult({
        message: result.data.data,
        success: result.data.success
      })

      setDisableConfirm(false)

      console.log("id",result.data)

    } catch (error: any) {

      setIdResult({
        message: error.response.data.message,
        success: error.response.data.success
      })
      console.log("error=",error.response.data)
    } finally {
      setLoadCustomerCableId(false)
    }
        
  }

  const processPayment = async (pin: any) => {
        
    const cableData = {
      cableTvType: form.biller,
      amount: Number(form.amount),
      customerId: form.cableTVId,
      remark: form.remark,
      currency: "ngn",
      transactionPin: pin
    }

    dispatch(showLoader());
    try {
      
      const result = await axiosClient.post("/vtu/purchase-cabletv", cableData)  
      const data = result.data
      dismiss()
      
      toast.show(result.data.message,{
        type: "success",
      });

      console.log(result.data)

      const resData = {
        recipient: data?.transaction?.customerId || "NAVO PLUS",
        transactionType: data?.transaction?.transactionType,
        paymentType: data?.transaction?.paymentType || formatEnumsCapital(data?.transaction?.utilityType),
        amount: displayCurrency(Number(data?.transaction?.amount), data?.transaction?.currency),
        utilityType: formatEnumsCapital(data?.transaction?.utilityType),
        channel: "Wallet",
        timeStamp: data?.transaction?.paidAt,
        merchantTxRef: data?.transaction?.transactionReference || data?.transaction?.merchantTxRef,
        category: data?.transaction?.category || 'Nil',
        status: data?.transaction?.finalStatus || data?.transaction?.paymentStatus,
        remark: `${data?.transaction?.cableTvType} ${!data?.transaction?.remark ? '' : `- ${data?.transaction?.remark}`}`
      }

      router.push({
        pathname: "/(protected)/(routes)/receipt/TransactionsReceipt",
        params: { Recieptdata: JSON.stringify(resData) },
      });

      getWallet(dispatch, toast, null, true)

      setForm({
        biller: 'dstv',
        product: '',
        amount: '',
        cableTVId: '',
        remark: '',
      })

      setIdResult({
        message: '',
        success: null
      })

      setDisableConfirm(true)
      
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

  const pay = async () => {

    // setIsProcessing(true)

    if(userProfile.isPinSet === false){
      handlePresentModalPinPress()
    }else if(userProfile.isPinSet === true){
      handlePresentModalConfirmPinPress()
    }

  }

  const handleShowTVProductModal = (type: string) => {
    if(type === "TV-product"){
      setShowTVProductModal(!showTVProductModal)
    }
  }

  const handleTVProductType = (amount: number, subScriptionType: string) => {
    setForm({ ...form, product: subScriptionType, amount: amount.toString() })
    setShowTVProductModal(!showTVProductModal)
    setIdResult({
      message: '',
      success: null
    })   
  }

  const closeTVProductModal = () => {
    setShowTVProductModal(false) 
  }

  const BillerChange = (e: any) => {
    setForm({ ...form, biller: e.value, product: '', amount: '', cableTVId: '' })
    setIdResult({
      message: '',
      success: null
    })
  }

  return (
    <SafeAreaView className="bg-white h-full px-4">
      <Header title='Ship CableTV' showGoBack={true} onpress={() => router.back()}/>
      <KeyboardAvoidingView className='flex-1' behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === 'ios' ? 30 : 0}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="w-full justify-center my-6 mt-6">

            <Picker title='Biller' value={form.biller} placeholder="Select" handleChangeText={BillerChange} data={biller} otherStyles="mt-7"/>
            <CableTVModal placeholder={`Select ${form.biller} product`} selectedValue={form.product} header={`Select ${form.biller} product`} title='Product' showModal={showTVProductModal} close={closeTVProductModal} handlePress={handleTVProductType} handleShowModal={() => handleShowTVProductModal('TV-product')} selectedBiller={form.biller}/>
            <FormField title="Amount" value={form.amount} placeholder={form.amount ? form.amount : "Auto generated, based in selected product"} otherStyles="mt-7" disabled={false}/>
            <FormFieldValidate title="CableTV ID" value={form.cableTVId} placeholder="Enter here" handleChangeText={CableTVIdChange} otherStyles="mt-7" keyboardType="phone-pad" verifyCustomerID={handleCableTVId} disableButton={loadCustomerCableId} loading={loadCustomerCableId} data={idResult}/>
            <FormField title="Remark" value={form.remark} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, remark: e })} otherStyles="mt-7" />
            
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
      <CustomButton title="Confirm" handlePress={confirmData} containerStyles="w-full" textStyles='text-white' disableButton={disableConfirm}/>
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
              <Text className="text-base text-blue my-3 font-amedium">You are about to ship CableTV. See details below</Text>
              <View>
                <Details title='ID' value={form.cableTVId}/>
                <Details title='Type' value='CableTV Shipment'/>
                <Details title='Amount' value={displayCurrency(Number(form.amount),'NGN')}/>
                <Details title='Biller' value={form.biller}/>
                <Details title='Product' value={form.product}/>
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

export default ShipCableTVScreen