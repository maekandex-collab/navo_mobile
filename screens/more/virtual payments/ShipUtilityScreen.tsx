import { View, Text, ScrollView, StyleSheet, KeyboardAvoidingView, Modal, Alert, TouchableWithoutFeedback } from 'react-native'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import FormField from '@/components/FormField'
import CustomButton from '@/components/CustomButton'
import { router } from 'expo-router'
import AntDesign from '@expo/vector-icons/AntDesign'
import { StatusBar } from 'expo-status-bar'
import Header from '@/components/Header'
import { data } from '@/constants'
import Picker from '@/components/Picker'
import { TouchableOpacity } from 'react-native'
import Details from '@/components/Details'
import { BottomSheetModal, useBottomSheetModal } from '@gorhom/bottom-sheet'
import { useToast } from 'react-native-toast-notifications'
import SetPin from '@/components/SetPin'
import ConfirmPin from '@/components/ConfirmPin'
import { axiosClient } from '@/globalApi'
import CustomButtomSheet from '@/components/CustomButtomSheet'
import UtilityBillerModal from '@/components/select-modals/UtilityBiller'
import { Platform } from 'react-native'
import FormFieldValidate from '@/components/FormFieldValidate'
import { RootState } from '@/redux/store'
import { useDispatch, useSelector } from 'react-redux'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'
import * as Clipboard from 'expo-clipboard';
import getWallet from '@/utils/WalletApi'
import displayCurrency from '@/utils/displayCurrency'
import { formatEnumsCapital } from '@/utils/formatEnumsCapital'
import { hideLoader, showLoader } from '@/redux/LoaderSlice'

const meterTypeList = [
  { label: 'Prepaid', value: 'PREPAID' },
  { label: 'Postpaid', value: 'POSTPAID' }
];

const ShipUtilityScreen = () => {
  const { walletData, balanceLoading } = useSelector((state: RootState) => state.wallet)
  const { userProfile } = useSelector((state: RootState) => state.profile)
  const [form, setForm] = useState({
    biller: '',
    billerId: '',
    meterType: '',
    amount: '',
    meterId: '',
    cableTVId: '',
    remark: '',
  })
  const [loadCustomerMeterId,setLoadCustomerMeterId] = useState(false)
  const [showUtilityBillerModal,setShowUtilityBillerModal] = useState(false)
  const toast = useToast();
  const [idResult,setIdResult] = useState({
    message: '',
    success: null
  })
  const [disableConfirm,setDisableConfirm] = useState(true)
  const [successModal, setSuccessModal] = useState(false)
  const [rechargeToken, setRechargeToken] = useState('')
  const dispatch = useDispatch()
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const { dismiss } = useBottomSheetModal()
    const bottomSheetModalPinRef = useRef<BottomSheetModal>(null);
    const bottomSheetConfirmPinModalRef = useRef<BottomSheetModal>(null);
    const [pinModalVisible, setPinModalVisible] = useState(false);
  
    const [res, setRes] = useState({})

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
  
        if(!form.meterType){
          return toast.show("Kindly select meter type", {
            type: "warning",
          });
        }
  
        if(!form.amount){
          return toast.show("Kindly input amount", {
            type: "warning",
          });
        }

        if(Number(form.amount) < 500){
          return toast.show("amount must be atleast 500", {
            type: "warning",
          });
        }
  
        if(!form.meterId){
          return toast.show("Kindly input Meter ID", {
            type: "warning",
          });
        }
  
        handlePresentModalPress()
    }

    const MeterIdChange = (e: any) => {
        setForm({ ...form, meterId: e })
        setIdResult({
          message: '',
          success: null
        })
        setDisableConfirm(true)
      }
    
      const handleMeterId = async () => {
    
        if(!form.biller){
          return toast.show("Kindly select Biller", {
            type: "warning",
          });
        }
  
        if(!form.meterType){
          return toast.show("Kindly select meter type", {
            type: "warning",
          });
        }
  
        if(!form.amount){
          return toast.show("Kindly input amount", {
            type: "warning",
          });
        }

        if(Number(form.amount) < 500){
          return toast.show("amount must be atleast 500", {
            type: "warning",
          });
        }
  
        if(!form.meterId){
          return toast.show("Kindly input Meter ID", {
            type: "warning",
          });
        }
    
        if(form.meterId.length < 5){
          return toast.show("Kindly complete Meter ID number", {
            type: "warning",
          });
        }
    
      
        try {
          setLoadCustomerMeterId(true)
    
          const result = await axiosClient.get(`/vtu/electricity-customer/${form.billerId}/${form.meterId}`)
    
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
          setLoadCustomerMeterId(false)
        }
            
      }

    const processPayment = async (pin: any) => {
            
      const utilityData = {
        disco: form.billerId,
        amount: Number(form.amount),
        meterType: form.meterType,
        customerId: form.meterId,
        currency: "ngn",
        transactionPin: pin,
        remark: form.remark,
      }

      console.log(data)

      dispatch(showLoader());
      try {
        
        dismiss()
        
        const result = await axiosClient.post("/vtu/purchase-electricity", utilityData)  
        const data = result.data
        console.log("util-token", result.data)
        
        setIdResult({
          message: '',
          success: null
        })

        setDisableConfirm(true)

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
          rechargeToken: data?.transaction?.phcnToken || 'Nil',
          status: data?.transaction?.finalStatus || data?.transaction?.paymentStatus,
          remark: `${data?.transaction?.disco} - ${data?.transaction?.meterType} ${!data?.transaction?.remark ? '' : data?.transaction?.remark}`
        }

        if(!data?.transaction?.phcnToken){

          dismiss()

          router.push({
            pathname: "/(protected)/(routes)/receipt/TransactionsReceipt",
            params: { Recieptdata: JSON.stringify(resData) },
          });

        }else{

          const rechargeTokenResult = data?.transaction?.phcnToken
          setRechargeToken(rechargeTokenResult)

          setRes(resData)

          setSuccessModal(true)

        }

        setForm({
          biller: '',
          billerId: '',
          meterType: '',
          amount: '',
          meterId: '',
          cableTVId: '',
          remark: '',
        })

        toast.show(result.data.message,{
          type: "success",
        });

        getWallet(dispatch, toast, null, true)

      } catch (error: any) {
        toast.show(error.response.data.message || error.response.data.error.message,{
          type: "danger",
        });
        console.log("err: ",error.response.data)
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

      if(userProfile.isPinSet === false){
        handlePresentModalPinPress()
      }else if(userProfile.isPinSet === true){
        handlePresentModalConfirmPinPress()
      }

    }

    const handleShowUtilityBillerModal = (type: string) => {
      if(type === "disco-biller"){
        setShowUtilityBillerModal(!showUtilityBillerModal)
      }
    }

    const handleUtilityBillerType = (id: string, name: string) => {
      setForm({ ...form, biller: name, billerId: id, meterId: "" })
      setShowUtilityBillerModal(!showUtilityBillerModal)  
      setIdResult({
        message: '',
        success: null
      }) 
    }

    const closeUtilityBillerModal = () => {
      setShowUtilityBillerModal(false) 
    }

    const copyToken = async () => {
      if(rechargeToken){
        await Clipboard.setStringAsync(rechargeToken);
      
        toast.show("Token Copied", {
          type: "success",
        });
      }
    }

    const closeRecharge = () => {
      setSuccessModal(false)
      router.push({
        pathname: "/(protected)/(routes)/receipt/TransactionsReceipt",
        params: { Recieptdata: JSON.stringify(res) },
      });
    }

    const Receipt = () => {
      closeRecharge()
      router.push({
        pathname: "/(protected)/(routes)/receipt/TransactionsReceipt",
        params: { Recieptdata: JSON.stringify(res) },
      });
    }  


  return (
    <SafeAreaView className="bg-white h-full px-4">
      <Header title='Ship Utility' showGoBack={true} onpress={() => router.back()}/>
      <KeyboardAvoidingView className='flex-1' behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === 'ios' ? 30 : 0}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="w-full justify-center my-6 mt-6">

            <UtilityBillerModal placeholder={`Select service provider`} selectedValue={form.biller} header={`Select Disco biller`} title='Biller' showModal={showUtilityBillerModal} close={closeUtilityBillerModal} handlePress={handleUtilityBillerType} handleShowModal={() => handleShowUtilityBillerModal('disco-biller')} selectedBiller={form.biller}/>
            <Picker title='Meter Type' value={form.meterType} placeholder="Select" handleChangeText={(e: any) => setForm({ ...form, meterType: e.value })} data={meterTypeList}/>
            <FormField title="Amount" value={form.amount} placeholder="Auto generated, based in selected product" handleChangeText={(e: any) => setForm({ ...form, amount: e })} otherStyles="mt-7" keyboardType="phone-pad"/>
            <FormFieldValidate title="Meter ID" value={form.meterId} placeholder="Enter here" handleChangeText={MeterIdChange} otherStyles="mt-7" keyboardType="phone-pad" verifyCustomerID={handleMeterId} disableButton={loadCustomerMeterId} loading={loadCustomerMeterId} data={idResult}/>
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
              <Text className="text-base text-blue my-3 font-amedium">You are about to ship Utility Bill. See details below</Text>
              <View>
                <Details title='ID' value={form.meterId}/>
                <Details title='Type' value='Utility Shipment'/>
                <Details title='Amount' value={displayCurrency(Number(form.amount),'NGN')}/>
                <Details title='Biller' value={form.biller}/>
                <Details title='Meter Type' value={form.meterType}/>
                <Details title='Channel' value='NGN Wallet'/>
              </View>
            </View>
    
            <CustomButton title="Make Payment" handlePress={pay} containerStyles={`w-full my-4`} textStyles='text-white'/>
          </View>     
        </CustomButtomSheet>

        <Modal
          animationType="slide"
          transparent={true}
          visible={successModal}
          statusBarTranslucent={true}
          onRequestClose={() => closeRecharge()}>
            <TouchableWithoutFeedback onPress={() => closeRecharge()}>
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <Text className='text-blue font-abold text-lg'>Recharge Token</Text>
                  <Text className='text-blue font-abold text-xl tracking-widest'>{rechargeToken}</Text>
                  <View className='mt-4 flex-row gap-2 items-center'>
                    <TouchableOpacity className='bg-orange px-4 py-2 rounded-md' onPress={copyToken}>
                      <Text className='text-white text-lg'>Copy Token</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className='bg-blue px-4 py-2 rounded-md' onPress={Receipt}>
                      <Text className='text-white text-lg'>Receipt</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
        </Modal>

    <SetPin bottomSheetModalPinRef={bottomSheetModalPinRef} closePinModal={closePinModal} isVisible={pinModalVisible}/>
    <ConfirmPin onConfirmPin={(pin: string) => processPayment(pin)} bottomSheetModalPinRef={bottomSheetConfirmPinModalRef} closePinModal={closeConfirmPinModal} isVisible={pinModalVisible}/>
    
    <StatusBar backgroundColor='#ffffff' style='dark'/>
  </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)'
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

export default ShipUtilityScreen