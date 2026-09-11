import { View, Text, ScrollView, TouchableOpacity, Platform, KeyboardAvoidingView } from 'react-native'
import React, { useState, useMemo, useCallback, useRef } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import FormField from '@/components/FormField'
import CustomButton from '@/components/CustomButton'
import { router } from 'expo-router'
import AntDesign from '@expo/vector-icons/AntDesign'
import { StatusBar } from 'expo-status-bar'
import RadioGroup, {RadioButtonProps} from 'react-native-radio-buttons-group';
import { data, images } from '@/constants'
import Header from '@/components/Header'
import Picker from '@/components/Picker'
import Details from '@/components/Details'
import SpaceBetween from '@/components/SpaceBetween'
import { useToast } from 'react-native-toast-notifications'
import { axiosClient } from '@/globalApi'
import GoodsTypeModal from '@/components/select-modals/GoodsTypeModal'
import CustomButtomSheet from '@/components/CustomButtomSheet'
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { useStripe } from '@stripe/stripe-react-native'
import getWallet from '@/utils/WalletApi'
import SetPin from '@/components/SetPin'
import ConfirmPin from '@/components/ConfirmPin'
import TextArea from '@/components/TextArea'
import displayCurrency from '@/utils/displayCurrency'
import { formatEnums } from '@/utils/formatEnums'
import getTransactions from '@/utils/TransactionsApi'
import { hideLoader, showLoader } from '@/redux/LoaderSlice'
import NgnStateModal from '@/components/select-modals/NgnStateModal'
import UkStateModal from '@/components/select-modals/UkStateModal'

type costType = {
  currency: "NGN" | "GBP";
  pricePerKg: number;
  deliveryDays: string;
  documentationFee: number;
  subtotal: number; 
  totalCost: number;
}

const LodgeShipmentScreen = () => {
  const { walletData, balanceLoading } = useSelector((state: RootState) => state.wallet)
  const { userProfile } = useSelector((state: RootState) => state.profile)
  const [form, setForm] = useState({
    serviceType: 'send',
    locationFrom: '',
    // deliveryTypeFrom: '',
    locationTo: '',
    pickupLocation: '',
    pickupAddress: '',
    dropoffLocation: '',
    dropoffAddress: '',
    // deliveryTypeTo: '',
    // deliveryStation: '',
    itemName: '',
    itemDescription: '',
    weight: '',
    goodsType: '',
    paymentMethod: ''
  })
  const [cost, setCost] = useState<costType | null>(null)

  const stripe = useStripe()

  const toast = useToast();
  const dispatch = useDispatch()
  console.log("formsdata", form)

    const snapPoints = useMemo(() => ["85%"], [])
    const [showGoodsModal, setShowGoodsModal] = useState(false)
    const [showPickupLocationModal, setShowPickupLocationModal] = useState(false)
    const [showDropoffLocationModal, setShowDropoffLocationModal] = useState(false)
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
   const bottomSheetPayModalRef = useRef<BottomSheetModal>(null);
   const [pinModalVisible, setPinModalVisible] = useState(false);

   const bottomSheetModalPinRef = useRef<BottomSheetModal>(null);
     const bottomSheetConfirmPinModalRef = useRef<BottomSheetModal>(null);

    const submit = async () => {

      if(!form.serviceType){
        return toast.show("Service type is not selected", {
          type: "warning",
        });
      }
  
      if(!form.locationFrom){
          return toast.show("Location from is empty", {
            type: "warning",
          });
      }

      if (!form.pickupLocation) {
        return toast.show("Pick up location is empty", { type: "warning" });
      }

      if (!form.pickupAddress) {
        return toast.show("Pick up address is empty", { type: "warning" });
      }
  
      if(!form.locationTo){
        return toast.show("Location to is empty", {
          type: "warning",
        });
      }

      if (!form.dropoffLocation) {
        return toast.show("Drop off location is empty", { type: "warning" });
      }

      if (!form.dropoffAddress) {
        return toast.show("Drop off address is empty", { type: "warning" });
      }

      if(!form.itemName){
        return toast.show("Item Name is empty", {
          type: "warning",
        });
      }
  
      if(!form.weight){
        return toast.show("Weight is empty", {
          type: "warning",
        });
      }
  
      if(!form.goodsType){
        return toast.show("Goods type is empty", {
          type: "warning",
        });
      }

      const getCostData = {
        locationFrom: form.locationFrom,
        locationTo: form.locationTo,
        weight: Number(form.weight),
      }

      try {
  
        dispatch(showLoader());
        
        const costResult = await axiosClient.post("/shipments/calculate-cost", getCostData)

        console.log("cost", costResult.data)

        setCost(costResult.data)
       
        handlePresentModalPress()
  
      } catch (error: any) {
        toast.show(error.response.data.message || error.response.data.error.message,{
          type: "danger",
        });
  
      } finally {
        dispatch(hideLoader());
      } 

    }

  const ShowPay = async () => {
    // handleCloseModalPress()
    // setPaymentModalVisible(true)
    handlePresentPayModalPress()
  }

  const handleShowModal = (type: string) => {
    if(type === "goods"){
      setShowGoodsModal(!showGoodsModal)
    }
    if(type === "pickupLocation"){
      setShowPickupLocationModal(!showPickupLocationModal)
    }
    if (type === "dropoffLocation") {
      setShowDropoffLocationModal(!showDropoffLocationModal)
    }
  }

  const handleGoodsType = (value: string) => {
    setForm({ ...form, goodsType: value })
    setShowGoodsModal(!showGoodsModal)   
  }
  const handlePickupLocationType = (value: string) => {
    setForm({ ...form, pickupLocation: value })
    setShowPickupLocationModal(!showPickupLocationModal)   
  }
  const handleDropoffLocationType = (value: string) => {
    setForm({ ...form, dropoffLocation: value })
    setShowDropoffLocationModal(false)
  }

  const closeGoodsModal = () => {
    setShowGoodsModal(false) 
  }

  const closePickupLocationModal = () => {
    setShowPickupLocationModal(false) 
  }

  const closeDropoffLocationModal = () => {
  setShowDropoffLocationModal(false)
}

  const radioButtons: RadioButtonProps[] = useMemo(() => ([
        {
            id: 'send', // acts as primary key, should be unique and non-empty string
            label: 'Send',
            value: 'send',
            borderColor: "#FF6600",
            color: "#FF6600",
            size: 35,
            labelStyle: {fontWeight: '500', color: "#003366"}
        },
        // {
        //     id: 'receive',
        //     label: 'Receive',
        //     value: 'receive',
        //     borderColor: "#FF6600",
        //     color: "#FF6600",
        //     size: 35,
        //     labelStyle: {fontWeight: '500', color: "#003366"}
        // }
    ]), []);

    // callbacks
    const handlePresentModalPress = useCallback(() => {
      bottomSheetModalRef.current?.present();
    }, []);

    const handleCloseModalPress = useCallback(() => {
      bottomSheetModalRef.current?.dismiss()
    }, []);

    const handlePresentPayModalPress = useCallback(() => {
      bottomSheetPayModalRef.current?.present();
    }, []);

    const handleClosePayModalPress = useCallback(() => {
      bottomSheetPayModalRef.current?.dismiss()
    }, []);

    const pay = async (payType: string) => {
      dispatch(showLoader());

      try {

        if(payType === 'WALLET'){

          if(userProfile.isPinSet === false){
            handlePresentModalPinPress()
          }else if(userProfile.isPinSet === true){
            handlePresentModalConfirmPinPress()
          }

        }else if(payType === 'ONLINE'){
          const data = {
            ...form,
            weight: Number(form.weight),
            paymentMethod: "nomba"
          }

          console.log(data)

          const result = await axiosClient.post("/shipments/send", data)

          console.log(result.data)
          const link = result?.data?.checkoutLink
                    
          router.push({
            pathname: "/(protected)/(routes)/PaymentGateway",
            params: { paylink:  link},
          })

          // setPaymentModalVisible(false)
          handleCloseModalPress()
          handleClosePayModalPress()
          
          setCost(null)

          console.log("NOMBA", result.data)
        }
        // else if(payType === 'GBP-ONLINE'){
          
        //     const data = {
        //       ...form,
        //       weight: Number(form.weight),
        //       paymentMethod: "nomba"
        //     }
  
        //     const result = await axiosClient.post("/shipments/send", data)
  
        //     console.log("stripe", result.data)
        //     const clientSecret = result.data.data.clientSecret;

        //     const customAppearance = {
        //       colors: {
        //         primary: '#FF6600',
        //         background: '#ffffff',
        //         componentBackground: '#f3f8fa',
        //         componentBorder: '#f3f8fa',
        //         componentDivider: '#000000',
        //         primaryText: '#000000',
        //         secondaryText: '#000000',
        //         componentText: '#000000',
        //         placeholderText: '#73757b',
        //         icon: '#FFA970'
        //       },
        //       typography: {
        //         font: 'Aeonik-Thin',
        //       },
        //       primaryButton: {
        //         colors: {
        //           background: '#FF6600',
        //           text: '#FFFFFF'
        //         },
        //       }
        //     };

        //     const initSheet = await stripe.initPaymentSheet({
        //       merchantDisplayName: "Navo Cargo",
        //       paymentIntentClientSecret: clientSecret,
        //       customerId: result.data.data.userId,
        //       customerEphemeralKeySecret: result.data.data.ephemeralKey,
        //       allowsDelayedPaymentMethods: true,
        //       // defaultBillingDetails: {
        //       //   name: userProfile.firstname,
        //       // },
        //       appearance: customAppearance
        //     });

        //     if (initSheet.error){
        //       return toast.show(initSheet.error.message,{
        //         type: "danger",
        //       });
        //     }

        //     // await new Promise(resolve => setTimeout(resolve, 3000));
            
        //     const presentSheet = await stripe.presentPaymentSheet();

        //     if (presentSheet.error){
        //       return toast.show(presentSheet.error.message,{
        //         type: "danger",
        //       });
        //     }

        //     toast.show("Payment Successful!",{
        //       type: "success",
        //     });

        //     setForm({
        //       serviceType: '',
        //       locationFrom: '',
        //       deliveryTypeFrom: '',
        //       locationTo: '',
        //       deliveryTypeTo: '',
        //       deliveryStation: '',
        //       itemName: '',
        //       itemDescription: '',
        //       weight: '',
        //       goodsType: '',
        //       paymentMethod: ''
        //   })
        //   setCost(null)
  
        //   handleCloseModalPress()
        //   handleClosePayModalPress()
            
        // }

      } catch (error: any) {
        toast.show(error?.response?.data?.message || error?.response?.data?.error?.message,{
          type: "danger",
        });
      } finally {
        dispatch(hideLoader());
      }

    }

    const processPayment = async (pin: any) => {
      try{

        dispatch(showLoader());

        const data = {
          ...form,
          weight: Number(form.weight),
          paymentMethod: "wallet",
          transactionPin: pin
        }

        const result = await axiosClient.post("/shipments/send-wallet", data)

        toast.show("Payment successful",{
          type: "success",
        });
        console.log("wallet-NGN", result.data)

        getWallet(dispatch, toast, null, true)
        getTransactions(dispatch, toast, true)

        setForm({
          serviceType: '',
          locationFrom: '',
          locationTo: '',
          pickupLocation: '',
          pickupAddress: '',
          dropoffLocation: '',
          dropoffAddress: '',
          itemName: '',
          itemDescription: '',
          weight: '',
          goodsType: '',
          paymentMethod: ''
        })
        setCost(null)

        router.back()

        handleCloseModalPress()
        handleClosePayModalPress()
      
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

  return (
    <SafeAreaView className="bg-white h-full px-4">
      <Header title='Lodge Shipment' showGoBack={true} onpress={() => router.back()}/>
        <KeyboardAvoidingView className='flex-1' behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === 'ios' ? 30 : 0}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="w-full justify-center my-6 mt-6">
              <Text className="text-base text-blue mt-4 font-ablack">Service type</Text>
              <RadioGroup 
                containerStyle={{marginLeft: -10}}
                layout='row'
                labelStyle={{color: "#003366"}}
                radioButtons={radioButtons} 
                onPress={(e: any) => setForm({ ...form, serviceType: e })}
                selectedId={form.serviceType}
              />
              {/* Location From */}
              <Picker
                title='Location from'
                value={form.locationFrom}
                placeholder="(Nigeria-Lagos)"
                handleChangeText={(e: any) => setForm({ ...form, locationFrom: e.value, pickupLocation: '', pickupAddress: '' })}
                data={data.location}
                otherStyles="mt-7"
              />

              {/* Pickup Location — states based on locationFrom */}
              {form.locationFrom === 'Nigeria' && (
                <NgnStateModal
                  placeholder='Select state'
                  selectedValue={form.pickupLocation}
                  header="Pick Up Location"
                  title='Pick Up Location'
                  showModal={showPickupLocationModal}
                  close={closePickupLocationModal}
                  handlePress={handlePickupLocationType}
                  handleShowModal={() => handleShowModal('pickupLocation')}
                />
              )}
              {form.locationFrom === 'UK' && (
                <UkStateModal
                  placeholder='Select region'
                  selectedValue={form.pickupLocation}
                  header="Pick Up Location"
                  title='Pick Up Location'
                  showModal={showPickupLocationModal}
                  close={closePickupLocationModal}
                  handlePress={handlePickupLocationType}
                  handleShowModal={() => handleShowModal('pickupLocation')}
                />
              )}
              {form.locationFrom !== '' && (
                <FormField
                  title="Pick Up Address"
                  value={form.pickupAddress}
                  placeholder="Enter street name & number"
                  handleChangeText={(e: any) => setForm({ ...form, pickupAddress: e })}
                  otherStyles="mt-4"
                />
              )}

              {/* Location To */}
              <Picker
                title='Location to'
                value={form.locationTo}
                placeholder="(UK-London)"
                handleChangeText={(e: any) => setForm({ ...form, locationTo: e.value, dropoffLocation: '', dropoffAddress: '' })}
                data={data.location}
              />

              {/* Dropoff Location — states based on locationTo */}
              {form.locationTo === 'Nigeria' && (
                <NgnStateModal
                  placeholder='Select state'
                  selectedValue={form.dropoffLocation}
                  header="Drop Off Location"
                  title='Drop Off Location'
                  showModal={showDropoffLocationModal}
                  close={closeDropoffLocationModal}
                  handlePress={handleDropoffLocationType}
                  handleShowModal={() => handleShowModal('dropoffLocation')}
                />
              )}
              {form.locationTo === 'UK' && (
                <UkStateModal
                  placeholder='Select region'
                  selectedValue={form.dropoffLocation}
                  header="Drop Off Location"
                  title='Drop Off Location'
                  showModal={showDropoffLocationModal}
                  close={closeDropoffLocationModal}
                  handlePress={handleDropoffLocationType}
                  handleShowModal={() => handleShowModal('dropoffLocation')}
                />
              )}
              {form.locationTo !== '' && (
                <FormField
                  title="Drop Off Address"
                  value={form.dropoffAddress}
                  placeholder="Enter street name & number"
                  handleChangeText={(e: any) => setForm({ ...form, dropoffAddress: e })}
                  otherStyles="mt-4"
                />
              )}
              {/* <Picker title='Drop Off' value={form.deliveryTypeFrom} placeholder="Select" handleChangeText={(e: any) => setForm({ ...form, deliveryTypeFrom: e.value })} data={data.deliveryTypeList} otherStyles="mt-7"/> */}
              {/* <Picker title='Pick Up' value={form.deliveryTypeTo} placeholder="Select" handleChangeText={(e: any) => setForm({ ...form, deliveryTypeTo: e.value })} data={data.deliveryTypeList}/> */}
              {/* <Picker title='Delivery Station' value={form.deliveryStation} placeholder="Select" handleChangeText={(e: any) => setForm({ ...form, deliveryStation: e.value })} data={data.deliveryTypeList}/> */}
              <FormField title="Weight (kg)" value={form.weight} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, weight: e })} otherStyles="mt-4" keyboardType="numeric"/>
              <GoodsTypeModal placeholder='Select item' selectedValue={form.goodsType} header="Select Goods Type" title='Goods Type' showModal={showGoodsModal} close={closeGoodsModal} handlePress={handleGoodsType} handleShowModal={() => handleShowModal('goods')}/>
              <FormField title="Goods Name" value={form.itemName} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, itemName: e })} otherStyles="mt-4"/>
              <TextArea title="Details (Optional)" value={form.itemDescription} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, itemDescription: e })} otherStyles="mt-4"/>
              {/* <FormField title="Amount" value={form.amount} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, amount: e })} otherStyles="mt-4" keyboardType="number-pad"/> */}

            </View>
        </ScrollView>
    </KeyboardAvoidingView>
    <View className='w-full justify-center mt-4 mb-2'>
      <CustomButton title="Submit" handlePress={submit} containerStyles="w-full" textStyles='text-white'/>
    </View>

    <CustomButtomSheet ref={bottomSheetModalRef} snapPoints={snapPoints} dynamicSizing={false} scrollable>
      <View className='h-full'>
        <View className='flex-row w-full items-center justify-between gap-1 mb-3'>
          <View className='w-8'/>
          <Text className="text-sm text-center text-gray-300 font-abold">Shipment Summary</Text>
          <TouchableOpacity onPress={handleCloseModalPress}>
            <AntDesign name="closecircleo" size={30} color="#003366" />
          </TouchableOpacity>
        </View>

        <BottomSheetScrollView showsVerticalScrollIndicator={false} className="mt-5">
          <View className='flex-col w-full items-center justify-between my-3'>
            <Text className="text-sm text-center text-blue font-amedium">TOTAL AMOUNT</Text>
            <Text className="text-2xl text-center text-blue font-abold">{displayCurrency(Number(cost?.totalCost), cost?.currency)}</Text>
          </View>

          <View>
            <Details title='Service Type' value={form.serviceType}/>
            <Details title='Location from' value={form.locationFrom}/>
            <Details title='Pick Up Location' value={form.pickupLocation}/>
            <Details title='Pick Up Address' value={form.pickupAddress}/>
            {/* <Details title='Delivery type from' value={formatEnums(form.deliveryTypeFrom)}/> */}
            <Details title='Location to' value={form.locationTo}/>
            <Details title='Drop Off Location' value={form.dropoffLocation}/>
            <Details title='Drop Off Address' value={form.dropoffAddress}/>
            {/* <Details title='Delivery type to' value={formatEnums(form.deliveryTypeTo)}/> */}
            {/* <Details title='Delivery station' value={formatEnums(form.deliveryStation)}/> */}
            <Details title='Weight' value={`${form.weight}Kg`}/>
            <Details title='Good type' value={form.goodsType}/>
            <Details title='Delivery days' value={cost?.deliveryDays as string}/>
            <Details title='Price per kg' value={displayCurrency(Number(cost?.pricePerKg), cost?.currency)}/>
            <Details title='Sub total' value={displayCurrency(Number(cost?.subtotal), cost?.currency)}/>
            <Details title='Documentation fee' value={displayCurrency(Number(cost?.documentationFee), cost?.currency)}/>
            <Details title='Total amount' value={displayCurrency(Number(cost?.totalCost), cost?.currency)}/>
          </View>
        </BottomSheetScrollView>

        <CustomButton title="Make Payment" handlePress={ShowPay} containerStyles='w-full mt-4 my-2' textStyles='text-white'/>
      </View>
    </CustomButtomSheet>

    <CustomButtomSheet ref={bottomSheetPayModalRef} enablePenDown={false}>
      <View>
        <View className='flex-row w-full items-center justify-between gap-1'>
          <View className='w-8'/>
          <Text className="text-sm text-center text-gray-300 font-abold">Payment Route</Text>
          <TouchableOpacity  onPress={handleClosePayModalPress}>
            <AntDesign name="closecircleo" size={30} color="#003366" />
          </TouchableOpacity>
        </View>
        
        <Text className="text-lg text-blue mt-7 font-abold">What would you like</Text>
        <Text className="text-lg text-blue font-abold mb-1">to pay with?</Text>

        {form.locationFrom === "Nigeria" ? (
          <View className='mb-6'>
            <SpaceBetween title='Pay with NGN wallet' desc='Fast, secure, and hassle-free payments.' image={images.wallet} onpress={() => pay('WALLET')} balance={displayCurrency(Number(walletData.walletBalanceNGN), 'NGN')}/>
            <SpaceBetween title='Pay online with NGN' desc='Convenient payments anytime, anywhere.' image={images.online} onpress={() => pay('ONLINE')}/>
         </View>
        ) : (
          <View className='mb-6'>
            <SpaceBetween title='Pay with GBP wallet' desc='Fast, secure, and hassle-free payments.' image={images.wallet} onpress={() => pay('WALLET')} balance={displayCurrency(Number(walletData.walletBalanceGBP), 'GBP')}/>
            <SpaceBetween title='Pay online with GBP' desc='Convenient payments anytime, anywhere.' image={images.online} onpress={() => pay('ONLINE')}/>
          </View>
        )}
      </View>
    </CustomButtomSheet>

    <SetPin bottomSheetModalPinRef={bottomSheetModalPinRef} closePinModal={closePinModal} isVisible={pinModalVisible}/>
    <ConfirmPin onConfirmPin={(pin: string) => processPayment(pin)} bottomSheetModalPinRef={bottomSheetConfirmPinModalRef} closePinModal={closeConfirmPinModal} isVisible={pinModalVisible}/>
    
    <StatusBar backgroundColor="#ffffff" style='dark'/>
  </SafeAreaView>
  )
}

export default LodgeShipmentScreen