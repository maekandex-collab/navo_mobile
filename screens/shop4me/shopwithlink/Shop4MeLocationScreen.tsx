import { View, Text, ScrollView, KeyboardAvoidingView, TouchableOpacity, Alert } from 'react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import Header from '@/components/Header'
import FormField from '@/components/FormField'
import CustomButton from '@/components/CustomButton'
import { router } from 'expo-router'
import { useToast } from 'react-native-toast-notifications'
import { useLocalSearchParams } from 'expo-router'
import { Platform } from 'react-native'
import { axiosClient } from '@/globalApi'
import { BottomSheetFlatList, BottomSheetModal } from '@gorhom/bottom-sheet'
import { RootState } from '@/redux/store'
import { useDispatch, useSelector } from 'react-redux'
import SetPin from '@/components/SetPin'
import ConfirmPin from '@/components/ConfirmPin'
import SpaceBetween from '@/components/SpaceBetween'
import AntDesign from '@expo/vector-icons/AntDesign'
import Modal from '@/components/Modal'
import { images } from '@/constants'
import displayCurrency from '@/utils/displayCurrency'
import Checkbox from 'expo-checkbox'
import CustomButtomSheet from '@/components/CustomButtomSheet'
import Details from '@/components/Details'
import ShopDetails from '@/components/ShopDetails'
import getWallet from '@/utils/WalletApi'
import getTransactions from '@/utils/TransactionsApi'
import { hideLoader, showLoader } from '@/redux/LoaderSlice'

type itemsType = {
  item: string;
  originalPriceGBP: number;
  amount: number;
  serviceFee: number;
  subtotal: number;
  quantity: number;
}[]

type costType =  {
  id: string;
  status: string;
  totalAmount: string;
  currency: "NGN" | "GBP",
  items: itemsType
}

export default function Shop4MeLocationScreen() {
  const { walletData, balanceLoading } = useSelector((state: RootState) => state.wallet)
  const { userProfile } = useSelector((state: RootState) => state.profile)
  const toast = useToast();
  const { shopData } = useLocalSearchParams() as any;
  const snapPoints = useMemo(() => ["70%"], [])
   const bottomSheetModalRef = useRef<BottomSheetModal>(null);
   const bottomSheetPayModalRef = useRef<BottomSheetModal>(null);
   const [pinModalVisible, setPinModalVisible] = useState(false);
   const dispatch = useDispatch()

  const bottomSheetModalPinRef = useRef<BottomSheetModal>(null);
  const bottomSheetConfirmPinModalRef = useRef<BottomSheetModal>(null);
   const [cost, setCost] = useState<costType | null>(null)

  const [checked, setChecked] = useState(false)

  const [form, setForm] = useState({
    deliveryHub: 'Delivery to Hub',
    state: '',
    city: '',
    street: '',
    houseNo: '',
    closeLandmark: ''
  })

  const handleAutoFill = (isChecked: boolean) => {

    // Check if profile location is incomplete
    const noProfileLocation =
      !userProfile.location?.state &&
      !userProfile.location?.city &&
      !userProfile.location?.street &&
      !userProfile.location?.houseNo &&
      !userProfile.location?.closestLandmark;

    if(noProfileLocation){
      return toast.show("No location set on your profile", {
        type: "warning",
      });
    }

    const oneInputAlreadyFilled =
      form.state ||
      form.city ||
      form.street ||
      form.houseNo ||
      form.closeLandmark;

    const compareForm = {
      state: form.state,
      city: form.city,
      street: form.street,
      houseNo: form.houseNo,
      closestLandmark: form.closeLandmark
    }

    const profileLocation = {
      state: userProfile.location?.state || '',
      city: userProfile.location?.city || '',
      street: userProfile.location?.street || '',
      houseNo: userProfile.location?.houseNo || '',
      closestLandmark: userProfile.location?.closestLandmark || ''
    }

    const sameFields = JSON.stringify(profileLocation) === JSON.stringify(compareForm);

    if (oneInputAlreadyFilled && !sameFields) {
      return Alert.alert("Fields Edited", "One or more of these fields have been edited already and fields are not empty.")
    }

    setChecked(isChecked);

    if (isChecked) {
      setForm({
        ...form,
        state: userProfile.location?.state || '',
        city: userProfile.location?.city || '',
        street: userProfile.location?.street || '',
        houseNo: userProfile.location?.houseNo || '',
        closeLandmark: userProfile.location?.closestLandmark || ''
      });
    } else {
      setForm({
        ...form,
        state: '',
        city: '',
        street: '',
        houseNo: '',
        closeLandmark: ''
      });
    }
  };

  const submit = async () => {

      if(!form.deliveryHub){
        return toast.show("Delivery hub is required", {
          type: "warning",
        });
      }

      if(!form.state){
        return toast.show("State is required", {
          type: "warning",
        });
      }
  
      if(!form.city){
        return toast.show("City is required", {
          type: "warning",
        });
      }
  
      if(!form.street){
        return toast.show("Street is required", {
          type: "warning",
        });
      }

      if(!form.houseNo){
        return toast.show("House No. is required", {
          type: "warning",
        });
      }

      if(!form.closeLandmark){
        return toast.show("Close landmark is required", {
          type: "warning",
        });
      }

     const parsedItems = JSON.parse(shopData)

      const updatedItems = {
        ...parsedItems,
        currency: "GBP"
      }

      const data = {
        items: [
          updatedItems
        ],
        shippingAddress: form,
      }
  
      console.log("data",data)
  
      dispatch(showLoader());
        
      try {
  
        const result = await axiosClient.post("/shop/checkout", data)

        console.log("shop4Me=",result.data)
        console.log("ite=",result.data.shop.items)

        setCost(result.data?.shop || null)

        handlePresentModalPress()

        // setForm({
        //     deliveryHub: '',
        //     state: '',
        //     city: '',
        //     street: '',
        //     houseNo: '',
        //     closeLandmark: ''
        // })

        // Shop4MeClearItems()
  
  
      } catch (error: any) {
        toast.show(error.response.data.message || error.response.data.error.message,{
          type: "danger",
        });
          console.log(error.response.data.message)
      } finally {
        dispatch(hideLoader());
      }
  }
  
  const pay = async (payType: string) => {

    if(payType === 'NGN-WALLET'){

      if(userProfile.isPinSet === false){
        handlePresentModalPinPress()
      }else if(userProfile.isPinSet === true){
        handlePresentModalConfirmPinPress()
      }

    }else if(payType === 'NGN-ONLINE'){
  
      dispatch(showLoader());
        
      try {
  
        const result = await axiosClient.post("/shop/confirm-and-pay", {
          draftOrderId: cost?.id,
          paymentMethod: "nomba"
        })

        console.log("final=",result.data)

        handleCloseModalPress()
        handleClosePayModalPress()

        router.push({
          pathname: "/(protected)/(routes)/PaymentGateway",
          params: { paylink: result.data?.checkoutLink },
        })
  
  
      } catch (error: any) {
        toast.show(error.response.data.message || error.response.data.error.message,{
          type: "danger",
        });
          console.log(error.response.data.message)
      } finally {
        dispatch(hideLoader());
      }
    } 
  }

  const processPayment = async (pin: any) => {

      dispatch(showLoader());
        
      try {

        const result = await axiosClient.post("/shop/confirm-and-pay", {
          draftOrderId: cost?.id,
          paymentMethod: "wallet"
        })

        console.log("final=",result.data)

        handleCloseModalPress()
        handleClosePayModalPress()


        toast.show(result.data?.message,{
          type: "success",
        });

        getWallet(dispatch, toast, null, true)
        getTransactions(dispatch, toast, true)
        router.dismissAll()

      } catch (error: any) {
          toast.show(error.response.data.message || error.response.data.error.message,{
            type: "danger",
          });
          console.log(error.response.data.message)
      } finally {
        dispatch(hideLoader());
      }
    }

    const openPaymentModal = () => {
      handlePresentPayModalPress()
    }

    // callbacks
    const handlePresentModalPress = useCallback(() => {
      setPinModalVisible(true)
      bottomSheetModalRef.current?.present();
    }, []);

    const handleCloseModalPress = useCallback(() => {
      setPinModalVisible(false)
      bottomSheetModalRef.current?.dismiss()
    }, []);

    const handlePresentPayModalPress = useCallback(() => {
      bottomSheetPayModalRef.current?.present();
    }, []);

    const handleClosePayModalPress = useCallback(() => {
      bottomSheetPayModalRef.current?.dismiss()
    }, []);

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
      bottomSheetConfirmPinModalRef.current?.present();
    }, []);

    const closeConfirmPinModal = useCallback(() => {
      bottomSheetConfirmPinModalRef.current?.dismiss()
    }, []);



  return (
    <SafeAreaView className="bg-white h-full px-4">
      <Header title='Checkout' showGoBack={true} onpress={() => router.back()}/>
       <KeyboardAvoidingView className='flex-1' behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === 'ios' ? 30 : 0}>
        <ScrollView showsVerticalScrollIndicator={false}>
            <View className="w-full justify-center my-4 mt-6">
              
              <Text className="text-sm text-orange font-abold mb-2">Note that the total prices of these products will be converted to its NGN equivalent for you to pay with Naira!</Text>
              <Text className="text-sm text-blue mt-2 font-abold">Enter your location details below</Text>

              <View className='flex-row gap-2 items-center mt-5'>
                <Checkbox value={checked} onValueChange={handleAutoFill} color={checked ? '#FF6600' : undefined} style={{borderRadius: 5, marginTop: 5, borderColor: "#003366"}}/>
                <Text className="text-sm text-blue mt-2 font-abold flex-1">Auto fill location details with location on your profile?</Text>
              </View>

              <FormField title="Delivery Hub" value={form.deliveryHub} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, deliveryHub: e })} otherStyles="mt-7" disabled />
              <FormField title="State" value={form.state} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, state: e })} otherStyles="mt-7" />
              <FormField title="City" value={form.city} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, city: e })} otherStyles="mt-7"/>
              <View className='flex-row items-center w-full justify-between gap-1'>
                <FormField title="Street" value={form.street} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, street: e })} otherStyles="mt-7 w-[67%]" />
                <FormField title="House No." value={form.houseNo} placeholder="No." handleChangeText={(e: any) => setForm({ ...form, houseNo: e })} otherStyles="mt-7 w-[30%]" keyboard="phone-pad"/>
              </View>
              <FormField title="Closest Landmark" value={form.closeLandmark} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, closeLandmark: e })} otherStyles="mt-7" />
            </View>
        </ScrollView>
    </KeyboardAvoidingView>
    <View className='w-full justify-center my-6'>
      <CustomButton title="Make Payment" handlePress={submit} containerStyles="w-full" textStyles='text-white'/>
    </View>

    <CustomButtomSheet ref={bottomSheetModalRef} snapPoints={snapPoints}  enablePenDown={false} dynamicSizing={false} scrollable>
      <View className='h-full'>
        <View className='flex-row w-full items-center justify-between gap-1 mb-3'>
          <View className='w-8'/>
          <Text className="text-sm text-center text-gray-300 font-abold">Shopping summary</Text>
          <TouchableOpacity onPress={handleCloseModalPress}>
            <AntDesign name="closecircleo" size={30} color="#003366" />
          </TouchableOpacity>
        </View>

        <BottomSheetFlatList
          ListHeaderComponent={() => (
            <View className='flex-col w-full items-center justify-between my-3'>
              <Text className="text-sm text-center text-blue font-amedium">TOTAL AMOUNT</Text>
              <Text className="text-2xl text-center text-blue font-abold">{displayCurrency(Number(cost?.totalAmount), "NGN")}</Text>
            </View>
          )}
          data={cost?.items || []}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <ShopDetails quantity={item?.quantity} itemName={item?.item} priceGBP={displayCurrency(Number(item?.originalPriceGBP), "GBP")} priceNGN={displayCurrency(Number(item?.amount), "NGN")} serviceFee={displayCurrency(Number(item?.serviceFee), "NGN")} subTotal={displayCurrency(Number(item?.subtotal), "NGN")}/>
          )}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={() => (
            <Details title='Total amount' value={displayCurrency(Number(cost?.totalAmount), "NGN")}/>
          )}
        />

        <CustomButton title="Make Payment" handlePress={openPaymentModal} containerStyles='w-full mt-4 my-2' textStyles='text-white'/>
      </View>
    </CustomButtomSheet>

   <CustomButtomSheet ref={bottomSheetPayModalRef} enablePenDown={false}>
      <View>
        <View className='flex-row w-full items-center justify-between gap-1'>
          <View className='w-8'/>
          <Text className="text-sm text-center text-gray-300 font-abold">Payment Route</Text>
          <TouchableOpacity onPress={handleClosePayModalPress}>
            <AntDesign name="closecircleo" size={30} color="#003366" />
          </TouchableOpacity>
        </View>
        
        <Text className="text-lg text-blue mt-7 font-abold">What would you like</Text>
        <Text className="text-lg text-blue font-abold mb-1">to pay with?</Text>
       
        <View className='mb-6'>
          <SpaceBetween title='Pay with NGN wallet' desc='Fast, secure, and hassle-free payments.' image={images.wallet} onpress={() => pay('NGN-WALLET')} balance={displayCurrency(Number(walletData.walletBalanceNGN), 'NGN')}/>
          <SpaceBetween title='Pay online with NGN' desc='Convenient payments anytime, anywhere.' image={images.online} onpress={() => pay('NGN-ONLINE')}/>
        </View>
      </View>
    </CustomButtomSheet>

    <SetPin bottomSheetModalPinRef={bottomSheetModalPinRef} closePinModal={closePinModal} isVisible={pinModalVisible}/>
    <ConfirmPin onConfirmPin={(pin: string) => processPayment(pin)} bottomSheetModalPinRef={bottomSheetConfirmPinModalRef} closePinModal={closeConfirmPinModal} isVisible={pinModalVisible}/>

    <StatusBar backgroundColor="#ffffff" style='dark'/>
  </SafeAreaView>
  )
}