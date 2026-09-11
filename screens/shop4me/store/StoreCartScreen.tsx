import { View, Text, Image, FlatList, Alert, Pressable, ScrollView } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import Header from '@/components/Header'
import CustomButton from '@/components/CustomButton'
import { router } from 'expo-router'
import { useFocusEffect } from '@react-navigation/native'
import { images } from '@/constants'
import { axiosClient } from '@/globalApi'
import StoreCartCard from '@/components/StoreCartCard'
import { useToast } from 'react-native-toast-notifications'
import { StoreClearItems, storeGetCartTotal, StoreGetItems } from '@/utils/CartStorage'
import { TouchableOpacity } from 'react-native'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import displayCurrency from '@/utils/displayCurrency'
import StoreMakePayment from './StoreMakePayment'
import { Skeleton } from 'moti/skeleton'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { RootState } from '@/redux/store'
import { useDispatch, useSelector } from 'react-redux'
import { useStripe } from '@stripe/stripe-react-native'
import AntDesign from '@expo/vector-icons/AntDesign'
import SpaceBetween from '@/components/SpaceBetween'
import ConfirmPin from '@/components/ConfirmPin'
import SetPin from '@/components/SetPin'
import getWallet from '@/utils/WalletApi'
import getTransactions from '@/utils/TransactionsApi'
import CustomButtomSheet from '@/components/CustomButtomSheet'
import { hideLoader, showLoader } from '@/redux/LoaderSlice'

const SkeletonCommonProps = {
  colorMode: 'light',
  highlightColor: '#eaeaea',  // slightly lighter for shimmer
  transition: {
    type: 'timing',
    duration: 1500,
  },
  backgroundColor: '#f1f3f4',
} as const;

export default function StoreCartScreen() {

 const { walletData, balanceLoading } = useSelector((state: RootState) => state.wallet)
  const { userProfile } = useSelector((state: RootState) => state.profile)
  const { isLoading } = useSelector((state: RootState) => state.loader)
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState([])
  const [cartItems, setCartItems] = useState<any>([]);
   const bottomSheetPayModalRef = useRef<BottomSheetModal>(null);
  const [active, setActive] = useState(false)
  const [cartTotal, setCartTotal] = useState<number | string>('0.00');
  const toast = useToast();
  const loadingList = new Array(5).fill(null)
  const [form, setForm] = useState({})
  const [pinModalVisible, setPinModalVisible] = useState(false);
  

  const stripe = useStripe()
  const dispatch = useDispatch()

  const insets = useSafeAreaInsets();
  const statusBarHeight = insets.bottom;

  const bottomSheetModalPinRef = useRef<BottomSheetModal>(null);
  const bottomSheetConfirmPinModalRef = useRef<BottomSheetModal>(null);
  // const [paymentModalVisible, setPaymentModalVisible] = useState(false)

  const loadCart = () => {
    const cart = StoreGetItems();
    setCartItems(cart);
    fetchData()
  };

  const fetchData = async () => {
    const cart = StoreGetItems();

    setCartItems(cart)
    console.log("items",cartItems)
    if(cart.length > 0){
      const idArray: string[] = [];

      console.log("items",cartItems)

      cart.forEach(item => {
        
        idArray.push(item.id);
      });
  
      console.log("store1",idArray)
      const ids = idArray.join(',');
  
      setLoading(true)
      try {
        const result = await axiosClient.get(`/products/get?ids=${ids}`)
        setProducts(result.data.products);
        console.log("cart-r",result.data)
      } catch (error: any) {
        toast.show(error.response.data.message || error.response.data.error.message,{
          type: "danger",
        });
      } finally {
        setLoading(false)
      }
      
    }else{
      setProducts([])
    }
  }

  const getTotalPrice = () => {
    const total = storeGetCartTotal(products)
    setCartTotal(total);
  };

  useEffect(() => {
    getTotalPrice()
  }, [cartItems, products]);

  useFocusEffect(
    useCallback(() => {
      loadCart();
      // fetchData()
    }, [])
  );

  const clear = () => {
    StoreClearItems()
    loadCart()
    router.back()

    toast.show("Cart Cleared", {
      type: "success",
    });
  }

const clearCart = () => {

  if(cartItems.length == 0){
    return toast.show("Cart is already empty", {
      type: "danger",
    });
  }

  Alert.alert(
    'Confirm',
    'Are you sure you want to clear cart?',
    [
      {
        text: 'Yes',
        onPress: () => {
          clear()
        },
      },
      {
        text: 'No',
      },
    ],
    {
      cancelable: true,
    },
  );
}

  const showPayment = () => {
    if(products?.length !== 0 && cartItems?.length !== 0){
      setActive(true)
    }
  }

  const afterLocation = (form: {}) => {
    handlePresentPayModalPress()
    setForm(form)
  }

  // Anything Payment
  const pay = async (payType: string) => {

    if(payType === 'GBP-WALLET'){

      if(userProfile.isPinSet === false){
        handlePresentModalPinPress()
      }else if(userProfile.isPinSet === true){
        handlePresentModalConfirmPinPress()
      }

    }else if(payType === 'GBP-ONLINE'){

        const products = StoreGetItems()

        const updatedArray = products.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        }));

        const data = {
          products: updatedArray,
          cartTotal: Number(cartTotal),
          shippingAddress: form,
          paymentMethod: "nomba"
        }
    
        console.log("data",data)
    
        dispatch(showLoader());
        
      try {
 
          const result = await axiosClient.post("/orders/place-order", data)
  
          console.log("w-online", result.data)
          handleClosePayModalPress()

          router.push({
            pathname: "/(protected)/(routes)/PaymentGateway",
            params: { paylink: result.data?.checkoutLink },
          })
          // const clientSecret = result.data?.data?.clientSecret;

          // const customAppearance = {
          //   colors: {
          //     primary: '#FF6600',
          //     background: '#ffffff',
          //     componentBackground: '#f3f8fa',
          //     componentBorder: '#f3f8fa',
          //     componentDivider: '#000000',
          //     primaryText: '#000000',
          //     secondaryText: '#000000',
          //     componentText: '#000000',
          //     placeholderText: '#73757b',
          //     icon: '#FFA970'
          //   },
          //   typography: {
          //     font: 'Aeonik-Thin',
          //   },
          //   primaryButton: {
          //     colors: {
          //       background: '#FF6600',
          //       text: '#FFFFFF'
          //     },
          //   }
          // };

          // const initSheet = await stripe.initPaymentSheet({
          //   merchantDisplayName: "Navo Cargo",
          //   paymentIntentClientSecret: clientSecret,
          //   customerId: result.data?.data?.customerId,
          //   customerEphemeralKeySecret: result.data?.data?.ephemeralKey,
          //   allowsDelayedPaymentMethods: true,
          //   appearance: customAppearance
          // });

          // if (initSheet.error){
          //   return toast.show(initSheet.error.message,{
          //     type: "danger",
          //   });
          // }
          
          // const presentSheet = await stripe.presentPaymentSheet();

          // if (presentSheet.error){
          //   return toast.show(presentSheet.error.message,{
          //     type: "danger",
          //   });
          // }

          // toast.show("Payment Successful!",{
          //   type: "success",
          // });

          // StoreClearItems()

          // getTransactions(dispatch, toast, true)
          // router.dismissAll()
  
          // setForm({
          //   state: '',
          //   city: '',
          //   street: '',
          //   houseNo: '',
          //   closeLandmark: ''
          // })
  
      } catch (error: any) {
          toast.show(error.response.data.message || error.response.data.error.message,{
          type: "danger",
          });
      } finally {
          dispatch(hideLoader());
      }
    } 
  }

  const processPayment = async (pin: any) => {
    const products = StoreGetItems()

    const updatedArray = products.map(item => ({
      product_id: item.id,
      quantity: item.quantity
    }));

    const data = {
      products: updatedArray,
      cartTotal: Number(cartTotal),
      shippingAddress: form,
      paymentMethod: "wallet"
    }

      console.log("data",data)

      dispatch(showLoader());
        
      try {

          const result = await axiosClient.post("/orders/place-order", data)

          console.log("store=",result.data)


          toast.show("Payment Successful!",{
            type: "success",
          });

          StoreClearItems()

          getWallet(dispatch, toast, "GBP", true)
          getTransactions(dispatch, toast, true)
          router.dismissAll()
  
          setForm({
              state: '',
              city: '',
              street: '',
              houseNo: '',
              closeLandmark: ''
          })

          handleClosePayModalPress()

      } catch (error: any) {
          toast.show(error.response.data.message || error.response.data.error.message,{
            type: "danger",
          });
          console.log(error.response.data.message)
      } finally {
          dispatch(hideLoader());
      }
    }

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
      setPinModalVisible(true)
      bottomSheetConfirmPinModalRef.current?.present();
    }, []);

    const closeConfirmPinModal = useCallback(() => {
      setPinModalVisible(false)
      bottomSheetConfirmPinModalRef.current?.dismiss()
    }, []);

    const renderCart = ({item, index}: {item: any, index: number}) => {
      const localStore = cartItems?.filter((store: any) => store?.id === item?.id )
      console.log("local", localStore)
      return (
      <StoreCartCard item={item} fetchData={fetchData} index={index} total={getTotalPrice}/>
    )}

    const icon = () => (
      <TouchableOpacity onPress={clearCart}>
        <MaterialCommunityIcons name="delete-forever" size={30} color="#003366" />
      </TouchableOpacity>
    )

  return (
    <SafeAreaView className="bg-white h-full flex-1 px-4">
      <Header title='Cart Summary' showGoBack={true} onpress={() => router.back()} showRight={cartItems.length !== 0 && products?.length !== 0 ? true : false} icon={icon()}/>
      <View className='pt-1 flex-1'>
            <View className='pb-9'>
                {
                    loading ? (
                        <ScrollView className="w-full my-6" showsVerticalScrollIndicator={false}>
                          <Skeleton.Group show={loading}>
                            {loadingList.map((item, index) => (
                              <View className='w-full mb-4 flex-row justify-between' key={index}>
                                <Skeleton height={120} width={'100%'} {...SkeletonCommonProps} /> 
                              </View>
                            ))}
                          </Skeleton.Group>
                        </ScrollView>
                    ) : (
                      <View className='w-full'>
                        <View className='flex-row justify-between items-end w-full gap-1 mb-6 mt-2'>
                          <Pressable className='w-[48%]' onPress={() => setActive(false)}>
                            <Text className='text-blue text-sm mb-1'>Your Order</Text>
                            <View className='h-2 p-1 w-full bg-orange rounded-full'/>  
                          </Pressable>
                          <Pressable className='w-[48%]' onPress={showPayment}>
                            <Text className='text-blue text-sm mb-1' numberOfLines={1}>Shipment & Payment</Text>
                            <View className={`h-2 p-1 ${active ? 'bg-orange' : 'bg-gray-100'} w-full rounded-full`}/>
                          </Pressable>
                        </View>
                       {!active && (
                        <View>
                         <FlatList
                             nestedScrollEnabled={true}
                             scrollEnabled={true}
                             data={products}
                             contentContainerStyle={{ gap: 10, paddingBottom: 230 }}
                             keyExtractor={(item, index) => index.toString()}
                             renderItem={renderCart}
                             showsVerticalScrollIndicator={false}
                             ListEmptyComponent={() => (
                                <View>
                                  <View className="w-full items-center mx-auto justify-center my-6 mt-8 max-w-52 flex-1">
                                    <Image source={images.cart} className='size-36' resizeMode='contain'/>
                                    <Text className="text-2xl text-center text-blue mt-4 font-ablack">Your cart is empty!</Text>
                                    <Text className="text-sm text-center text-blue mt-1 font-alight">All your orders will show here when you start using the Store feature</Text>
                                  </View>
                                </View>
                             )}
                         />
                        </View>
                       )}

                        {active && (
                          <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={{paddingBottom: statusBarHeight + 200}} className='flex-1'>
                              <StoreMakePayment total={cartTotal} isSubmitting={isLoading} enableModal={afterLocation}/>
                            </View>
                          </ScrollView>
                        )}
                      </View>
                    )
                }
            </View>

        </View>
        {!active && (cartItems?.length > 0 && !loading && products?.length > 0) && (
          <View className='w-full justify-center py-6 gap-3 bg-white h-44'>
            <CustomButton title={`Total: ${displayCurrency(Number(cartTotal), 'GBP')}`} containerStyles="w-full mt-2" bgColor='bg-white border border-orange' textStyles='text-orange'/>
            <CustomButton title="Make Payment" handlePress={() => setActive(true)} containerStyles="w-full" textStyles='text-white'/>
          </View>
        )}

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
          <SpaceBetween title='Pay with GBP wallet' desc='Fast, secure, and hassle-free payments.' image={images.wallet} onpress={() => pay('GBP-WALLET')} balance={displayCurrency(Number(walletData.walletBalanceGBP), 'GBP')}/>
          <SpaceBetween title='Pay online with GBP' desc='Convenient payments anytime, anywhere.' image={images.online} onpress={() => pay('GBP-ONLINE')}/>
          </View>
        </View>
      </CustomButtomSheet>
        
      <SetPin bottomSheetModalPinRef={bottomSheetModalPinRef} closePinModal={closePinModal} isVisible={pinModalVisible}/>
      <ConfirmPin onConfirmPin={(pin: string) => processPayment(pin)} bottomSheetModalPinRef={bottomSheetConfirmPinModalRef} closePinModal={closeConfirmPinModal} isVisible={pinModalVisible}/>

    <StatusBar backgroundColor="#ffffff" style='dark'/>
  </SafeAreaView>
  )
}
