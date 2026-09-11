import { View, Text, ScrollView, TouchableOpacity, Platform, KeyboardAvoidingView } from 'react-native'
import React, { useState, useMemo, useCallback, useRef } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import CustomButton from '@/components/CustomButton'
import { router, useLocalSearchParams } from 'expo-router'
import AntDesign from '@expo/vector-icons/AntDesign'
import { StatusBar } from 'expo-status-bar'
import { data, images } from '@/constants'
import Header from '@/components/Header'
import SpaceBetween from '@/components/SpaceBetween'
import { useToast } from 'react-native-toast-notifications'
import { axiosClient } from '@/globalApi'
import CustomButtomSheet from '@/components/CustomButtomSheet'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { useStripe } from '@stripe/stripe-react-native'
import getWallet from '@/utils/WalletApi'
import SetPin from '@/components/SetPin'
import ConfirmPin from '@/components/ConfirmPin'
import displayCurrency from '@/utils/displayCurrency'
import Details from '@/components/Details'
import getTransactions from '@/utils/TransactionsApi'
import { hideLoader, showLoader } from '@/redux/LoaderSlice'

type costType = {
  currency: "NGN" | "GBP";
  documentationFee: number;
  subtotal: number; 
  totalCost: number;
}

const PayShipmentAdjustment = () => {

  const { walletData, balanceLoading } = useSelector((state: RootState) => state.wallet)
  const { userProfile } = useSelector((state: RootState) => state.profile)
   const { adjustmentData } = useLocalSearchParams() as any;
    const parsedAdjustmentData =  adjustmentData ? JSON.parse(adjustmentData) : null

  const stripe = useStripe()

  const toast = useToast();
  const dispatch = useDispatch()

   const bottomSheetPayModalRef = useRef<BottomSheetModal>(null);
   const [pinModalVisible, setPinModalVisible] = useState(false);

   const bottomSheetModalPinRef = useRef<BottomSheetModal>(null);
    const bottomSheetConfirmPinModalRef = useRef<BottomSheetModal>(null);

    const ShowPay = async () => {
      handlePresentPayModalPress()
    }

    const handlePresentPayModalPress = useCallback(() => {
      bottomSheetPayModalRef.current?.present();
    }, []);

    const handleClosePayModalPress = useCallback(() => {
      bottomSheetPayModalRef.current?.dismiss()
    }, []);

    const pay = async (payType: string) => {
      dispatch(showLoader());

      try {

        if(payType === 'NGN-WALLET'){

          if(userProfile.isPinSet === false){
            handlePresentModalPinPress()
          }else if(userProfile.isPinSet === true){
            handlePresentModalConfirmPinPress()
          }

        }else if(payType === 'GBP-WALLET'){

          if(userProfile.isPinSet === false){
            handlePresentModalPinPress()
          }else if(userProfile.isPinSet === true){
            handlePresentModalConfirmPinPress()
          }

        }else if(payType === 'NGN-ONLINE'){

          const result = await axiosClient.post("/adjustment/checkout", {
            shipmentOrderId: parsedAdjustmentData?.shipmentId,
            paymentMethod: "NOMBA"
          })

          console.log(result.data)
          const link = result?.data?.checkoutLink
                    
          router.push({
            pathname: "/(protected)/(routes)/PaymentGateway",
            params: { paylink:  link},
          })

          handleClosePayModalPress()
          

          console.log("NOMBA", result.data)
        }else if(payType === 'GBP-ONLINE'){
  
            const result = await axiosClient.post("/adjustment/checkout", {
                shipmentOrderId: parsedAdjustmentData?.shipmentId,
                paymentMethod: "STRIPE"
            })
  
            console.log("stripe", result.data)
            const clientSecret = result.data.data.clientSecret;

            const customAppearance = {
              colors: {
                primary: '#FF6600',
                background: '#ffffff',
                componentBackground: '#f3f8fa',
                componentBorder: '#f3f8fa',
                componentDivider: '#000000',
                primaryText: '#000000',
                secondaryText: '#000000',
                componentText: '#000000',
                placeholderText: '#73757b',
                icon: '#FFA970'
              },
              typography: {
                font: 'Aeonik-Thin',
              },
              primaryButton: {
                colors: {
                  background: '#FF6600',
                  text: '#FFFFFF'
                },
              }
            };

            const initSheet = await stripe.initPaymentSheet({
              merchantDisplayName: "Navo Plus",
              paymentIntentClientSecret: clientSecret,
              customerId: result.data.data.userId,
              customerEphemeralKeySecret: result.data.data.ephemeralKey,
              allowsDelayedPaymentMethods: true,
              // defaultBillingDetails: {
              //   name: userProfile.firstname,
              // },
              appearance: customAppearance
            });

            if (initSheet.error){
              return toast.show(initSheet.error.message,{
                type: "danger",
              });
            }

            // await new Promise(resolve => setTimeout(resolve, 3000));
            
            const presentSheet = await stripe.presentPaymentSheet();

            if (presentSheet.error){
              return toast.show(presentSheet.error.message,{
                type: "danger",
              });
            }

            toast.show("Payment Successful!",{
              type: "success",
            });

            handleClosePayModalPress()

            router.dismissAll()
            
        }

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

        const result = await axiosClient.post("/adjustment/wallet", {
            shipmentOrderId: parsedAdjustmentData?.shipmentId,
            paymentMethod: "WALLET",
            transactionPin: pin
        })

        console.log("wallet-NGN", result.data)

        getWallet(dispatch, toast, null, true)
        getTransactions(dispatch, toast, true)

        handleClosePayModalPress()
        router.dismissAll()

        toast.show("Payment Successful!",{
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
      <Header title='Pay Balance' showGoBack={true} onpress={() => router.back()}/>
        <KeyboardAvoidingView className='flex-1' behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === 'ios' ? 30 : 0}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="w-full justify-center my-4 mt-6">
            
                <Text className="text-sm text-orange font-abold mb-2">Note that this is the adjusted balance of your previous shipment made, below is the goods details!</Text>

                <View className='mt-4 gap-2'>
                    <Details title='Location from' value={parsedAdjustmentData?.locationFrom}/>
                    <Details title='Location to' value={parsedAdjustmentData?.locationTo}/>
                    <Details title='Item name' value={parsedAdjustmentData?.itemName}/>
                    <Details title='Good type' value={parsedAdjustmentData?.goodsType}/>
                    <Details title='Item description' value={parsedAdjustmentData?.itemDescription || "---"}/>
                    <Details title='Weight' value={`${parsedAdjustmentData?.PreviousWeight}Kg`}/>
                    <Details title='Previous Total amount' value={displayCurrency(Number(parsedAdjustmentData?.totalCost), parsedAdjustmentData?.currency)}/>
                </View>

                <View className='flex-col w-full items-center justify-between my-4'>
                    <Text className="text-sm text-center text-blue font-amedium">EXTRA AMOUNT TO BE PAID NOW</Text>
                    <Text className="text-2xl text-center text-blue font-abold">{displayCurrency(Number(parsedAdjustmentData?.amountToBePaid), parsedAdjustmentData?.currency)}</Text>
                </View>
            </View>
        </ScrollView>
    </KeyboardAvoidingView>
    <View className='w-full justify-center my-6'>
      <CustomButton title={`Pay ${displayCurrency(Number(parsedAdjustmentData?.amountToBePaid), parsedAdjustmentData?.currency)}`} handlePress={ShowPay} containerStyles="w-full" textStyles='text-white'/>
    </View>

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

        {parsedAdjustmentData?.locationFrom === "Nigeria" ? (
          <View className='mb-6'>
            <SpaceBetween title='Pay with NGN wallet' desc='Fast, secure, and hassle-free payments.' image={images.wallet} onpress={() => pay('NGN-WALLET')} balance={displayCurrency(Number(walletData.walletBalanceNGN), 'NGN')}/>
            <SpaceBetween title='Pay online with NGN' desc='Convenient payments anytime, anywhere.' image={images.online} onpress={() => pay('NGN-ONLINE')}/>
         </View>
        ) : (
          <View className='mb-6'>
            <SpaceBetween title='Pay with GBP wallet' desc='Fast, secure, and hassle-free payments.' image={images.wallet} onpress={() => pay('GBP-WALLET')} balance={displayCurrency(Number(walletData.walletBalanceGBP), 'GBP')}/>
            <SpaceBetween title='Pay online with GBP' desc='Convenient payments anytime, anywhere.' image={images.online} onpress={() => pay('GBP-ONLINE')}/>
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

export default PayShipmentAdjustment