import { View, Text, Image, Pressable, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { ScrollView } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { images } from '@/constants'
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Feather from '@expo/vector-icons/Feather';
import RoundedButton from '@/components/RoundedButton'
import { Link, router, useLocalSearchParams } from 'expo-router'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import HomeBanner from '@/components/HomeBanner'
import CustomButton from '@/components/CustomButton'
import AntDesign from '@expo/vector-icons/AntDesign'
import { axiosClient } from '@/globalApi'
import { useToast } from 'react-native-toast-notifications'
import AsyncStorage from '@react-native-async-storage/async-storage'
import CustomButtomSheet from '@/components/CustomButtomSheet'
import { BottomSheetModal, useBottomSheetModal } from '@gorhom/bottom-sheet'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'
import FormFieldSheet from '@/components/FormFieldSheet'
import { useStripe } from '@stripe/stripe-react-native'
import SetPin from '@/components/SetPin'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import getWallet from '@/utils/WalletApi'
import { useFocusEffect } from '@react-navigation/native'
import moment from 'moment'
import { splitCurrencyParts } from '@/utils/SplitCurrencyParts'
import displayCurrency from '@/utils/displayCurrency'
import { Skeleton } from 'moti/skeleton'
import { setWalletInfo } from '@/redux/WalletSlice'
import getTransactions from '@/utils/TransactionsApi'
import { setProfile } from '@/redux/ProfileSlice'
import { Image as ExpoImage } from 'expo-image';
import { formatCount } from '@/utils/FormatCount'
import { formatEnumsCapital } from '@/utils/formatEnumsCapital'
import { hideLoader, showLoader } from '@/redux/LoaderSlice'
import { formatEnums } from '@/utils/formatEnums'

const SkeletonCommonProps = {
  colorMode: 'light',
  highlightColor: '#eaeaea',  // slightly lighter for shimmer
  transition: {
    type: 'timing',
    duration: 1500,
  },
  backgroundColor: '#f1f3f4',
} as const;

export default function HomeScreen() {

  const blurhash = 'L~I64noffQfQfQfQfQfQfQfQfQfQ';
    
  const { top } = useSafeAreaInsets()
  // const { orderId, orderReference } = useLocalSearchParams() as any;

  const { walletData, balanceLoading } = useSelector((state: RootState) => state.wallet)
  const { transactionData, transactionLoading } = useSelector((state: RootState) => state.transactions)
  const { userProfile } = useSelector((state: RootState) => state.profile)

  const [currency, setcurrency] = useState<any>(walletData.currency)

  // Use currency variable dynamically
  const formattedAmount = displayCurrency(Number(currency === "NGN" ? walletData.walletBalanceNGN : currency === "GBP" ? walletData.walletBalanceGBP : walletData.walletBalanceNGN ), currency);
  
  // Then split it
  const [symbol, Amount, decimalPoint] = splitCurrencyParts(formattedAmount);

  const [amount, setAmount] = useState(0)
  
  const dispatch = useDispatch()

  const [hideStatus,setHideStatus] = useState<any>("false")
   const bottomSheetModalRef = useRef<BottomSheetModal>(null);
   const bottomSheetFundModalRef = useRef<BottomSheetModal>(null);
   const { dismiss } = useBottomSheetModal()
   const toast = useToast();
   const [refreshing, setRefreshing] = useState(false)
   const [pinModalVisible, setPinModalVisible] = useState(false);
   const [notificationCount, setNotificationCount] = useState(0);

   const stripe = useStripe()

    // callbacks
    const handlePresentModalPress = useCallback(() => {
      setPinModalVisible(true)
      bottomSheetModalRef.current?.present();
    }, []);

    const handleCloseModalPress = useCallback(() => {
      setPinModalVisible(false)
      bottomSheetModalRef.current?.dismiss();
    }, []);

    const handleFundPresentModalPress = useCallback(() => {
      bottomSheetFundModalRef.current?.present();
    }, []);

    const handleFundCloseModalPress = useCallback(() => {
      bottomSheetFundModalRef.current?.dismiss()
    }, []);
  
  useEffect(() => {
    const handleFirstTime = async () => {
      const notFirstTime = await AsyncStorage.getItem('notFirstTime');
      if(!notFirstTime){
        await AsyncStorage.setItem("notFirstTime", "true");
      }
    };
    handleFirstTime()
  }, []);

    useEffect(() => {
      // if (orderId && orderReference) {

      //   const verifyWalletPayment = async () => {
      //     try {
      //       const result = await axiosClient.get(`/payments/verify-wallet?idType=ORDER_ID&id=${orderId}`);
      //       console.log("shop-verify", result.data);
  
      //       if(result.data?.data?.success && result.data?.data.paymentStatus === "successful") {
      //         getTransactions(dispatch, toast, true)
      //         getWallet(dispatch, toast, null, true)
      //         return toast.show("Wallet Funded", {
      //           type: "success",
      //         });
      //       }
  
      //     } catch (error: any) {
      //       console.log("shop-verify-error", error.response?.data?.message || error.response?.data?.error?.message);
      //     }
      //   };
      //   verifyWalletPayment();

      // } else {
        getTransactions(dispatch, toast, false)
        getWallet(dispatch, toast, null, false)
        getUnReadNotificationCount()
      // }
    }, []);

    // const handleSnapToIndexPress = (index: number) => bottomSheetModalRef.current?.snapToIndex(index)

    const changeCurrency = (currency: string) => {
        if(currency === 'NGN'){
          setcurrency('NGN')
        }else{
          setcurrency('GBP')
        }
    }
  
    const submitAmount = async (currency: "ngn" | "gbp") => {

        if(!amount){
          return toast.show("kindly add an amount", {
            type: "warning",
          });
        }

        if (Number(amount) > Number.MAX_SAFE_INTEGER) {
          return toast.show("Amount is too large", {
            type: "warning",
          });
        }

        dispatch(showLoader());

        const data = {
          amount: Number(amount)
        }

        try {

          const result = await axiosClient.post(`/wallet/${currency}`, data)

          console.log("wallet", result.data)
          const link = result.data.tnx.checkoutLink
          
          router.push({
            pathname: "/(protected)/(routes)/PaymentGateway",
            params: { paylink:  link},
          })

          handleFundCloseModalPress()

        } catch (error: any) {
          toast.show(error.response.data.message || error.response.data.error.message,{
            type: "danger",
          });
        } finally {
          dispatch(hideLoader());
        }
    }

    useEffect(() => {
      const checkIfPinSet = async () => {
        setTimeout(() => {
          if(userProfile?.isPinSet === false && userProfile?.setPin === false){
            handlePresentModalPress()
          }
        }, 7000);
      }

      checkIfPinSet()
    }, [])

    const getHideBalance = async () => {
      const hide = await AsyncStorage.getItem("hideBalance")
      setHideStatus(hide)
    }

  const hideBalance = async (hideValue: string) => {

    await AsyncStorage.setItem("hideBalance", hideValue)
    getHideBalance()

  }

  const closePinModal = async () => {
    setPinModalVisible(false)
    dismiss()
    const pinStatus = {setPin: true}
    await AsyncStorage.mergeItem('userProfile', JSON.stringify(pinStatus));

    const recentProfile = await AsyncStorage.getItem('userProfile');
    const updatedProfile = recentProfile ? JSON.parse(recentProfile) : null;

    if (updatedProfile) {
      dispatch(setProfile(updatedProfile));
    }

  }

  const getUnReadNotificationCount = async () => {
    try {
      const result = await axiosClient.get('/notifications/unread')
      console.log("noti=", result.data)
      setNotificationCount(result.data?.notifications || 0)

    } catch (error: any) {
      
    }
  };

  // const submitStripeAmount = async () => {
  //   if(!amount){
  //     return toast.show("kindly add an amount", {
  //       type: "warning",
  //     });
  //   }

  //   setIsSubmitting(true)

  //   const data = {
  //     amount: Number(amount)
  //   }

  //   try {

  //     const result = await axiosClient.post("/wallet/fund-walletgbp", data)
      
  //     console.log("fund r data: ",result.data)

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
  //       merchantDisplayName: "Navo Plus",
  //       paymentIntentClientSecret: clientSecret,
  //       customerId: result.data.data.userId,
  //       customerEphemeralKeySecret: result.data.data.ephemeralKey,
  //       allowsDelayedPaymentMethods: true,
  //       defaultBillingDetails: {
  //         name: userProfile.accountName,
  //       },
  //       appearance: customAppearance
  //     });

  //     if (initSheet.error){
  //       return toast.show(initSheet.error.message,{
  //          type: "danger",
  //        });
  //      }

  //     // await new Promise(resolve => setTimeout(resolve, 3000));
      
  //     const presentSheet = await stripe.presentPaymentSheet();

  //     if (presentSheet.error){
  //      return toast.show(presentSheet.error.message,{
  //         type: "danger",
  //       });
  //     }
      
  //     handleFundCloseModalPress()
  //     getWallet(dispatch, toast, 'GBP', true)
  //     setAmount(0)
  //     changeCurrency('GBP')
  //     getTransactions(dispatch, toast, true)

  //     toast.show("Payment successful, Wallet Funded!",{
  //       type: "success",
  //     });

  //   } catch (error: any) {
  //     toast.show(error.response.data.message || error.response.data.error.message,{
  //       type: "danger",
  //     });
  //   } finally {
  //     setIsSubmitting(false)
  //   }
  // }

  const transactions = async () => {
    getTransactions(dispatch, toast, false)
  }

  const renderReceipt = (item: any) => {
  
    const receipt: any = {
      recipient: item?.details?.phoneNumber || "NAVO PLUS",
      transactionType: item?.transactionType,
      paymentType: item?.paymentType,
      amount: displayCurrency(Number(item?.amount), item?.currency),
      dataPlan: item?.details?.dataPlan,
      networkProvider: formatEnumsCapital(item?.details?.networkProvider),
      utilityType: formatEnumsCapital(item?.details?.utilityType),
      channel: item?.paymentMethod || "Nil",
      timeStamp: item?.createdAt,
      merchantTxRef: item?.transactionReference || item?.details?.merchantTxRef,
      category: item?.category || 'Nil',
      rechargeToken: item?.data?.vtuTransaction?.phcnToken,
      status: item?.paymentStatus,
      remark: !item?.details?.remark ? "Nil" : item?.details?.remark
    }
  
    router.push({
      pathname: "/(protected)/(routes)/receipt/TransactionsReceipt",
      params: { Recieptdata: JSON.stringify(receipt) },
    })
  }

  useFocusEffect(
    useCallback(() => {
      getHideBalance()
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await getWallet(dispatch, toast, null, true);
    setRefreshing(false);
  }

  const goToNotification =  () => {
    setNotificationCount(0)
    axiosClient.patch('/notifications/read-all', {})
    router.push("/(protected)/(routes)/Notifications")
  }

  return (
    <View style={{ paddingTop: top }} className="bg-skyBlue h-full">
          <View className="w-full justify-between items-center flex-row gap-3 my-3 px-4">
            <Pressable className="flex-1 items-center flex-row gap-2" onPress={() => router.push("/(protected)/(routes)/UserProfile")}>
              <View className='size-9 rounded-full border border-gray-100 bg-blue'>
                {userProfile?.profilePicture ? (
                  <ExpoImage source={{ uri: `${process.env.EXPO_PUBLIC_IMAGE_URI}${userProfile?.profilePicture}` }} placeholder={{ blurhash }} cachePolicy="disk" contentFit="cover" style={{ width: "100%", height: "100%", borderRadius: 50 }}/>
                ) : (
                  <Image source={images.user} className="w-9 h-9" resizeMode='cover'/>
                )}
              </View>
              <View className='flex-1 items-center flex-row gap-1'>
                <Text className="font-amedium text-base text-blue-400">Hello,</Text>
                <Text className="text-base font-abold text-blue capitalize" numberOfLines={1}>{!userProfile?.accountName ? "Dear" : userProfile?.accountName.split(' ')[0]}!</Text>
              </View>
            </Pressable>

            <Pressable className='bg-white p-2 rounded-full relative' onPress={goToNotification}>
              {!!notificationCount && (
                <View className="absolute -top-1 -right-1 bg-orange rounded-full min-w-[18px] items-center justify-center px-[4px] z-50">
                  <Text className="text-white text-sm font-mbold" numberOfLines={1} adjustsFontSizeToFit>{formatCount(notificationCount)}</Text>
                </View>
              )}
              <FontAwesome name="bell" size={20} color="#003366" />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh} 
                colors={['#003366', '#FF6600']} // Android
                progressBackgroundColor="#ffffff" // Android
                tintColor="#003366"              // iOS
                title="Loading..."    // iOS
                titleColor="#003366"             // iOS
              />
          }>
            <View className='mt-2 mb-3 px-4 justify-center gap-1'>
              <View className='bg-white px-4 py-6 rounded-2xl w-full'>
                <View className='flex-row gap-2 items-start justify-between'>
                 
                  <View className='items-center flex-row gap-1'>
                    <Text className="font-amedium text-base text-blue-400">Wallet Balance</Text>
                    {hideStatus === "false" || !hideStatus ? (
                      <TouchableOpacity className='items-center flex-row gap-1'  onPress={() => hideBalance('true')}>
                        <Feather name="eye" size={20} color="#FF6600" />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity className='items-center flex-row gap-1' onPress={() => hideBalance('false')}>
                        <Feather name="eye-off" size={20} color="#FF6600"/>
                      </TouchableOpacity>
                    )}
                  </View> 
                 
                  <View className='flex-row items-center p-1 gap-1 border rounded-full border-gray-100 bg-white'>
                    <Pressable onPress={() => changeCurrency('NGN')} className={`rounded-full ${currency === 'NGN' ? 'bg-orangeLight' : ''} px-2 py-2`}>
                      <Text className='text-orange font-amedium'>NGN</Text>
                    </Pressable>
                    <Pressable onPress={() => changeCurrency('GBP')} className={`rounded-full ${currency === 'GBP' ? 'bg-orangeLight' : ''} px-2 py-2`}>
                      <Text className='text-blue font-amedium'>GBP</Text>
                    </Pressable>
                  </View>
                </View>
                
                {balanceLoading && (
                  <View className='items-end flex-row mt-3 min-h-9'>
                    <ActivityIndicator size={"small"} color="#003366"/>
                    {/* <FontAwesome5 name="circle-notch" size={24} color="#003366" className='animate-spin-fast'/> */}
                  </View>
                )}


                {hideStatus === "true" && !balanceLoading && (
                  <View className='items-end flex-row mt-3'>
                    <Text className="font-ablack text-3xl text-blue">*****</Text>
                  </View>
                )}

                {currency === 'NGN' && !balanceLoading && (hideStatus === "false" || !hideStatus) && (
                  <View className='items-end flex-row mt-3'>
                    <Text className="font-amedium text-base text-blue">{symbol}</Text>
                    <Text className="font-ablack text-3xl text-blue">{Amount}</Text>
                    <Text className="font-amedium text-base text-blue">{decimalPoint}</Text>
                  </View>
                )}

                {currency === 'GBP' && !balanceLoading && (hideStatus === "false" || !hideStatus) && (
                  <View className='items-end flex-row mt-3'>
                    <Text className="font-amedium text-base text-blue">{symbol}</Text>
                    <Text className="font-ablack text-3xl text-blue">{Amount}</Text>
                    <Text className="font-amedium text-base text-blue">{decimalPoint}</Text>
                  </View>
                )}
                

                <View className='flex-row items-center justify-between gap-2 mt-4 w-full'>
                  <RoundedButton handlePress={handleFundPresentModalPress} title="+  Fund Wallet" containerStyles="bg-orange w-[125px]" textStyles='text-white text-sm'/>
                  <RoundedButton handlePress={() => router.push('/(onboarding)/GetQuote')} title="Get Quote" containerStyles="bg-blue w-[125px]" textStyles='text-white text-sm'/>
                </View>
              </View>

              
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className='flex-row items-center justify-center gap-2 my-4 w-full'>
                  <Pressable className='bg-white w-32 items-center px-2 py-4 rounded-2xl h-full' onPress={() => router.push("/(protected)/(routes)/LodgeShipment")}>
                    <View className='rounded-full items-center justify-center bg-blueLight w-12 h-12'>
                      <Image source={images.grid1} resizeMode='contain' className='size-7'/>
                    </View>
                    <Text className="font-amedium text-base text-blue mt-2 text-center">Cargo</Text>
                  </Pressable>

                  <Pressable className='bg-white w-32 items-center px-2 py-4 rounded-2xl h-full' onPress={() => router.push("/(protected)/(routes)/Market")}>
                    <View className='rounded-full items-center justify-center bg-orangeLight w-12 h-12'>
                      <Image source={images.grid4} resizeMode='contain' className='size-7'/>
                    </View>
                    <Text className="font-amedium text-base text-blue mt-2 text-center">Market Place</Text>
                  </Pressable>

                  <Pressable className='bg-white w-32 items-center px-2 py-4 rounded-2xl h-full' onPress={() => router.push("/(protected)/(routes)/Fx")}>
                    <View className='rounded-full items-center justify-center bg-blueLight w-12 h-12'>
                      <Image source={images.grid2} resizeMode='contain' className='size-7'/>
                    </View>
                    <Text className="font-amedium text-base text-blue mt-2 text-center">FX</Text>
                  </Pressable>

                  <Pressable className='bg-white w-32 items-center px-2 py-4 rounded-2xl h-full' onPress={() => router.push("/(protected)/(routes)/VirtualPayments")}>
                    <View className='rounded-full items-center justify-center bg-orangeLight w-12 h-12'>
                      <Image source={images.grid3} resizeMode='contain' className='size-7'/>
                    </View>
                    <Text className="font-amedium text-base text-blue mt-2 text-center">Bill Payment</Text>
                  </Pressable>
                </View>
              </ScrollView>

              <View className='px-2 py-3 bg-white rounded-2xl w-full gap-2'>
                {transactionData.length === 0 && !transactionLoading ? (
                  <View className='min-h-44 items-center justify-center'>
                    <View className="w-full items-center justify-center flex-1 gap-2">
                      <Image source={images.noTransaction} className='size-18' resizeMode='contain'/>
                      <Text className="text-base text-center text-blue font-amedium">No transactions yet!</Text>
                    </View>
                  </View>
                ) : transactionLoading ? (
                  <View className='min-h-40 items-center justify-center'>
                    <View className="w-full justify-center opacity-50">
                      <Skeleton.Group show={transactionLoading}>
                        <View className='w-full mb-3 flex-row justify-between'>
                          <Skeleton height={64} width={'100%'} {...SkeletonCommonProps} /> 
                        </View>
                        <View className='w-full flex-row justify-between'>
                          <Skeleton height={64} width={'100%'} {...SkeletonCommonProps} /> 
                        </View>
                      </Skeleton.Group>
                    </View>
                  </View>
                ) : (
                  <View>
                     <View className="justify-between w-full flex-row gap-2 items-center pb-2">
                      <View className="flex-1 items-center flex-row gap-2">
                        <View className='items-center flex-row gap-1'>
                          <Text className="font-amedium text-base text-blue" numberOfLines={1}>Recent Transactions</Text>
                        </View>
                        <TouchableOpacity onPress={transactions}>
                          <FontAwesome6 name="arrow-rotate-right" size={16} color="#FF6600" />
                        </TouchableOpacity>
                      </View>

                      <Link href={"/(protected)/(tabs)/transactions"}>
                        <Text className='text-orange font-amedium underline'>View All</Text>
                      </Link>
                    </View>

                    {transactionData?.map((item: any, index) => (
                      <Pressable key={index} onPress={() => renderReceipt(item)} className="justify-between mt-2 w-full gap-6 flex-row items-end bg-orange-100/10 rounded-lg p-2">
                        <View className="items-center flex-1 flex-row gap-2">
                          <View className={`items-center justify-center size-10 rounded-full ${item?.paymentStatus === "successful" ? "bg-green-100" : item?.paymentStatus === "failed" ? "bg-red-100" : "bg-yellow-100"} `}>
                            <Feather name={item?.paymentStatus === "successful" ? "arrow-up-right" : item?.paymentStatus === "failed" ? "arrow-down-left" : "minus"} color={item?.paymentStatus === "successful" ? "#22c55e" : item?.paymentStatus === "failed" ? "#ef4444" : "#ca8a04"} size={20}/>
                          </View>
                          <View className='flex-col flex-1'>
                            <Text className="font-amedium text-base text-blue capitalize">{formatEnums(item?.category) || 'Nil'}</Text>
                            <Text className="font-amedium text-xs text-blue">{moment(item?.createdAt).format('llll')}</Text>
                          </View>
                        </View>

                        <Text className="font-abold text-sm text-blue">{displayCurrency(Number(item?.amount), item?.currency)}</Text>
                      </Pressable>
                      ))}
                  </View>
                )}
              </View>
            </View>
            <HomeBanner />
          </ScrollView>

          <CustomButtomSheet ref={bottomSheetFundModalRef} enablePenDown={false}>
            <View>
              <View className='flex-row w-full items-center justify-between gap-1'>
                <View className='w-8'/>
                <Text className="text-sm text-center text-gray-300 font-abold">Fund Wallet</Text>
                <TouchableOpacity onPress={handleFundCloseModalPress}>
                  <AntDesign name="closecircleo" size={30} color="#003366" />
                </TouchableOpacity>
              </View>

              <FormFieldSheet title="Amount" handleChangeText={(text) => setAmount(text)} placeholder="Enter amount here" otherStyles="mt-2 mb-6" keyboardType="number-pad"/>

              <View className='flex-row gap-2 items-center justify-between'>
                <CustomButton title="NGN" handlePress={() => submitAmount("ngn")} containerStyles="w-[47%]" textStyles='text-white' />
                <CustomButton title="GBP" handlePress={() => submitAmount("gbp")} containerStyles="w-[47%]" textStyles='text-white' />
                {/* <CustomButton title="GBP" handlePress={submitStripeAmount} containerStyles="w-[47%]" textStyles='text-white' /> */}
              </View>
            </View>
          </CustomButtomSheet>

          <SetPin bottomSheetModalPinRef={bottomSheetModalRef} closePinModal={closePinModal} isVisible={pinModalVisible}/>
          
          <StatusBar backgroundColor="#F0F6FF" style='dark'/>
    </View>
  )
}
