import { View, Text, Pressable, ActivityIndicator, FlatList, TouchableOpacity, Image } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import Header from '@/components/Header'
import { StatusBar } from 'expo-status-bar'
import { router } from 'expo-router'
import Feather from '@expo/vector-icons/Feather'
import RoundedButton from '@/components/RoundedButton'
import Transactions from '@/components/Transactions'
import SearchInput from '@/components/SearchInput'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { axiosClient } from '@/globalApi'
import { useToast } from 'react-native-toast-notifications'
import CustomButtomSheet from '@/components/CustomButtomSheet'
import AntDesign from '@expo/vector-icons/AntDesign'
import FormFieldSheet from '@/components/FormFieldSheet'
import CustomButton from '@/components/CustomButton'
import { splitCurrencyParts } from '@/utils/SplitCurrencyParts'
import displayCurrency from '@/utils/displayCurrency'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { useStripe } from '@stripe/stripe-react-native'
import { images } from '@/constants'
import { useFocusEffect } from '@react-navigation/native'
import { RefreshControl } from 'react-native'
import { formatEnumsCapital } from '@/utils/formatEnumsCapital'
import { hideLoader, showLoader } from '@/redux/LoaderSlice'

const WalletScreen = () => {

  const { top } = useSafeAreaInsets()

  const { walletData, balanceLoading } = useSelector((state: RootState) => state.wallet)

  const [currency, setcurrency] = useState<any>(walletData.currency)

  // Use currency variable dynamically
  const formattedAmount = displayCurrency(Number(currency === "NGN" ? walletData.walletBalanceNGN : currency === "GBP" ? walletData.walletBalanceGBP : walletData.walletBalanceNGN ), currency);
  
  // Then split it
  const [symbol, Amount, decimalPoint] = splitCurrencyParts(formattedAmount);

    const [hideStatus,setHideStatus] = useState<any>("false")
    const [amount, setAmount] = useState(0)
    const [loading, setLoading] = useState(false)
    const [active, setActive] = useState("all")
    const [allFetchTransactions, setAllFetchTransactions] = useState<any>([]);
    const [data, setData] = useState<any>([])
    const [filteredData, setFilteredData] = useState([])
    const [transactionLoading, setTransactionLoading] = useState(false)
    const toast = useToast();
    const bottomSheetFundModalRef = useRef<BottomSheetModal>(null);
    const dispatch = useDispatch()
    const stripe = useStripe()
    const [query, setQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false)

    const [page, setPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true); // check if more data exists

    const transactions = async () => {
  
      setTransactionLoading(true)
  
      try {
        
        const result = await axiosClient.get("/transactions/history")
  
        console.log("trans=",result.data)
  
        setAllFetchTransactions(result.data.data || [])
        setData(result.data.data || [])
        setFilteredData(result.data.data || [])
  
      } catch (error: any) {
        toast.show(error.response.data.message || error.response.data.error.message,{
          type: "danger",
        });
      } finally {
        setTransactionLoading(false)
      }
    }
    

    const changeCurrency = (currency: string) => {
        if(currency === 'NGN'){
          setcurrency('NGN')
        }else{
          setcurrency('GBP')
        }
    }

    const getHideBalance = async () => {
      const hide = await AsyncStorage.getItem("hideBalance")
      setHideStatus(hide)
    }

    const hideBalance = async (hideValue: string) => {
  
      await AsyncStorage.setItem("hideBalance", hideValue)
      getHideBalance()
  
    }

    useEffect(() => {
      transactions()
    }, [])

    useFocusEffect(
      useCallback(() => {
        getHideBalance()
      }, [])
    );
    
  const allTransactions = () => {
    setActive("all")
    setData(allFetchTransactions)
  }

  const pendingTransactions = () => {
    setActive("pending")

    const pendings = allFetchTransactions.filter((item: any) => item?.paymentStatus === "pending")

    setData(pendings)
  }

  const failedTransactions = () => {
    setActive("failed")

    const fail = allFetchTransactions.filter((item: any) => item?.paymentStatus === "failed")

    setData(fail)
  }

  const successfulTransactions = () => {
    setActive("successful")

    const success = allFetchTransactions.filter((item: any) => item?.paymentStatus === "successful")

    setData(success)
  }

   const handleFundPresentModalPress = useCallback(() => {
        bottomSheetFundModalRef.current?.present();
      }, []);
  
      const handleFundCloseModalPress = useCallback(() => {
        bottomSheetFundModalRef.current?.dismiss()
      }, []);

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

          const link = result.data.tnx.checkoutLink
          
          router.push({
            pathname: "/(protected)/(routes)/PaymentGateway",
            params: { paylink:  link},
          })

          handleFundCloseModalPress()
          
          console.log("fund r data: ",result.data)

        } catch (error: any) {
          toast.show(error.response.data.message || error.response.data.error.message,{
            type: "danger",
          });
        } finally {
          dispatch(hideLoader());
        }
    }
      

    // const submitStripeAmount = async () => {
    //   if(!amount){
    //     return toast.show("kindly add an amount", {
    //       type: "warning",
    //     });
    //   }
  
    //   setIsSubmitting(true)
  
    //   const data = {
    //     amount: Number(amount),
    //     metadata: {
    //       description: "wallet topup test"
    //     },
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
    //           type: "danger",
    //         });
    //       }
  
    //     // await new Promise(resolve => setTimeout(resolve, 3000));
        
    //     const presentSheet = await stripe.presentPaymentSheet();
  
    //     if (presentSheet.error){
    //       return toast.show(presentSheet.error.message,{
    //         type: "danger",
    //       });
    //     }
        
    //     handleFundCloseModalPress()
    //     getWallet(dispatch, toast, 'GBP', true)
    //     setAmount(0)
    //     changeCurrency('GBP')
  
    //     toast.show("Payment Successful, Wallet Funded!",{
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


  const performSearch = async (searchTerm: string) => {

    setTransactionLoading(true)

      try {

        console.log("searchterm=",searchTerm)
        const result = await axiosClient.get(`/transactions/search?q=${searchTerm}`)

        setData(result.data?.data || [])

        console.log("search=",result.data?.data.results)

      } catch (error: any) {
        toast.show(error.response.data.message || error.response.data.error.message,{
          type: "danger",
        });
      } finally {
        setTransactionLoading(false)
      }
  };

   // Update debouncedQuery after user stops typing for 500ms
   useEffect(() => {
    if (query) {
      const handler = setTimeout(() => {
        console.log("q", query)
        performSearch(query);
      }, 500);
  
      return () => clearTimeout(handler);
    } else {
      // No query? Reset to original list
      setData(allFetchTransactions)
    }
  }, [query]);

  const onRefresh = async () => {
    if (active !== "all") return
    
    setRefreshing(true)
    
    try {
      
      const result = await axiosClient.get("/transactions/history")

      console.log("trans=",result.data)

      setAllFetchTransactions(result.data.data || [])
      setData(result.data.data || [])
      setFilteredData(result.data.data || [])
      setHasMore(true)
      setPage(1)

    } catch (error: any) {
      toast.show(error.response.data.message || error.response.data.error.message,{
        type: "danger",
      });
    } finally {
      setRefreshing(false)
    }
  }

  const loadMore = async () => {
      console.log("trying to loadingmore...")
      if (active !== "all" || isLoadingMore || !hasMore || allFetchTransactions.length < 20 || query) return;
      console.log("loadingmore...")
      setIsLoadingMore(true);
  
      try {
        const nextPage = page + 1;
  
        const res = await axiosClient.get(`/transactions/history?page=${nextPage}&limit=20`);
        const newData = res.data.data || [];
  
        if (newData.length < 20) {
          setHasMore(false); // No more data
        }
  
        setAllFetchTransactions((prev: any) => [...prev, ...newData]);
        setData((prev: any) => [...prev, ...newData]);
        setPage(nextPage);
        
      } catch (err) {
        console.error("Failed to load more", err);
      } finally {
        setIsLoadingMore(false);
      }
    };
  

  const renderTransaction = ({item, index}: {item: any, index: number}) => {

    const receipt: any = {
      recipient: item?.details?.phoneNumber || item?.details?.customerId || "NAVO PLUS",
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
      rechargeToken: item?.details?.phcnToken,
      status: item?.paymentStatus,
      remark: [
          item?.details?.remark,
          item?.details?.cableTvType ? `${item?.details?.cableTvType}`
            : null,
          item?.details?.disco 
            ? `${item?.details?.disco} - ${item?.details?.meterType}`
            : null
        ]
          .filter(Boolean)
          .join(' - ') || "Nil"
    }

    return (
      <Transactions item={item} index={index} handlePress={() => router.push({
        pathname: "/(protected)/(routes)/receipt/TransactionsReceipt",
        params: { Recieptdata: JSON.stringify(receipt) },
      })}/>
    )
  }

  return (
    <View style={{ paddingTop: top }} className="bg-white h-full px-4">
      <Header title="Wallet" showGoBack={true} onpress={() => router.back()}/>
      {/* transactions */}

      <View className='flex-1'>
        <View>
          <View className='mt-2'>
            <View className='bg-blueLight px-4 py-6 rounded-2xl w-full'>
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
                  <View className='items-end flex-row mt-2 min-h-9'>
                    <ActivityIndicator size={"small"} color="#003366"/>
                  </View>
                )}


                {hideStatus === "true" && !balanceLoading && (
                  <View className='items-end flex-row mt-2'>
                    <Text className="font-ablack text-3xl text-blue">*****</Text>
                  </View>
                )}
            
            
                {currency === 'NGN' && !balanceLoading && (hideStatus === "false" || !hideStatus) && (
                    <View className='items-end flex-row mt-2'>
                      <Text className="font-amedium text-base text-blue">{symbol}</Text>
                      <Text className="font-ablack text-3xl text-blue">{Amount}</Text>
                      <Text className="font-amedium text-base text-blue">{decimalPoint}</Text>
                  </View>
                )}

                {currency === 'GBP' && !balanceLoading && (hideStatus === "false" || !hideStatus) && (
                  <View className='items-end flex-row mt-2'>
                    <Text className="font-amedium text-base text-blue">{symbol}</Text>
                    <Text className="font-ablack text-3xl text-blue">{Amount}</Text>
                    <Text className="font-amedium text-base text-blue">{decimalPoint}</Text>
                  </View>
                )}

                <View className='flex-row items-center justify-between gap-2 mt-4 w-full'>
                  <RoundedButton handlePress={handleFundPresentModalPress} title="+  Fund Wallet" containerStyles="bg-orange w-full h-14" textStyles='text-white text-sm'/>
                </View>
          </View>
        </View>

        <View className='mt-4 mb-3'>
            {/* navigate */}
            <View className='flex-row justify-between items-center mb-5'>
              <Pressable className={`w-1/4 justify-center items-center py-1 ${active === "all" ? "border-b-2 border-orange" : ""}`} onPress={allTransactions}>
                  <Text className={`text-sm ${active === "all" ? "font-abold text-orange" : "text-blue"}`} numberOfLines={1}>All</Text>
              </Pressable>

              <Pressable className={`w-1/4 justify-center items-center py-1 ${active === "pending" ? "border-b-2 border-orange" : ""}`} onPress={pendingTransactions}>
                  <Text className={`text-sm ${active === "pending" ? "font-abold text-orange" : "text-blue"}`} numberOfLines={1}>Pending</Text>
              </Pressable>

              <Pressable className={`w-1/4 justify-center items-center py-1 ${active === "failed" ? "border-b-2 border-orange" : ""}`} onPress={failedTransactions}>
                  <Text className={`text-sm ${active === "failed" ? "font-abold text-orange" : "text-blue"}`} numberOfLines={1}>Failed</Text>
              </Pressable>

              <Pressable className={`w-1/4 justify-center items-center py-1 ${active === "successful" ? "border-b-2 border-orange" : ""}`} onPress={successfulTransactions}>
                  <Text className={`text-sm ${active === "successful" ? "font-abold text-orange" : "text-blue"}`} numberOfLines={1}>Completed</Text>
              </Pressable>
            </View>

            {/* search */}
            {active === "all" && (
              <View className='flex flex-row w-full gap-1'>
                <SearchInput placeholder="Search Transactions" handleChangeText={(text) => setQuery(text)} disabled={allFetchTransactions.length !== 0} otherStyles='w-2/3'/>
                <View className='flex-row gap-2 items-center justify-center w-1/3'>
                  <View className='size-12 flex items-center justify-center rounded-full bg-inputBg'>
                    <FontAwesome6 name="arrow-down-wide-short" size={18} color="#787878"/>
                  </View>
                  <View className='size-12 flex items-center justify-center rounded-full bg-inputBg'>
                    <Ionicons name="options-sharp" size={19} color="#787878"/>
                  </View>
                </View>
              </View>
            )}
            
          </View>
        </View>
        
        {transactionLoading ? (
          <View className='mt-6'>
            <ActivityIndicator size="large" color="#003366" />
          </View>
        ) : (
          <FlatList
            data={data}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderTransaction}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 30 }}
            onEndReached={loadMore}
            onEndReachedThreshold={0.4}
            ListEmptyComponent={() => (
              <View className="w-full items-center mx-auto justify-center my-6 max-w-52 flex-1">
                <Image source={images.noTransaction} className='size-20' resizeMode='contain'/>
                {query ? (
                  <>
                    <Text className="text-2xl text-center text-blue mt-4 font-ablack">No results found!</Text>
                    <Text className="text-sm text-center text-blue mt-1 font-alight">Try a different search.</Text>
                  </>
                ) : (
                  <>
                    <Text className="text-2xl text-center text-blue mt-4 font-ablack">No transactions yet!</Text>
                    <Text className="text-sm text-center text-blue mt-1 font-alight">All your transactions will show here.</Text>
                  </>
                )}
              </View>
            )}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh} 
                colors={['#003366', '#FF6600']}
                progressBackgroundColor="#ffffff"
                tintColor="#003366"
                title="Loading..."
                titleColor="#003366"
              />
            }
            ListFooterComponent={() => {
              if (isLoadingMore) {
                return (
                  <View className='items-center p-4'>
                    <ActivityIndicator size="small" color="#003366" />
                    <Text className='text-blue text-amedium text-sm mt-1'>Loading more...</Text>
                  </View>
                );
              }

              if (!hasMore && allFetchTransactions.length > 19) {
                return (
                  <View className='items-center p-4'>
                    <Text className='text-blue text-amedium text-sm'>No more Data!</Text>
                  </View>
                );
              }

              return null;
            }}
        />
        )}
        
      </View>
      
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
          </View>
        </View>
      </CustomButtomSheet>
  
      <StatusBar backgroundColor='#ffffff' style='dark'/>
    </View>
  )
}

export default WalletScreen