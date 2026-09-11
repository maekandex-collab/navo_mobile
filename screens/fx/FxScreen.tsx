import { View, Text, ScrollView, TextInput, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, Pressable } from 'react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import CustomButton from '@/components/CustomButton'
import { router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useToast } from "react-native-toast-notifications";
import { axiosClient } from '@/globalApi'
import Header from '@/components/Header'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'
import { LineChart } from "react-native-gifted-charts"
import { Dimensions } from 'react-native'
import { useStripe } from '@stripe/stripe-react-native'
import CustomButtomSheet from '@/components/CustomButtomSheet'
import AntDesign from '@expo/vector-icons/AntDesign'
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import Details from '@/components/Details'
import displayCurrency from '@/utils/displayCurrency'
import { useFocusEffect } from '@react-navigation/native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { hideLoader, showLoader } from '@/redux/LoaderSlice'
import { useDispatch } from 'react-redux'
import * as SecureStore from 'expo-secure-store';

const chartWidth = Dimensions.get("window").width - 32; // 16px padding on both sides

const currencyData = [
  {
    label: 'United States Dollar',
    value: 'USD',
    flag: "🇺🇸"
  },
  {
    label: 'Nigerian Naira',
    value: 'NGN',
    flag: "🇳🇬"
  },
  { 
    label: 'British Pound',
    value: 'GBP',
    flag: "🇬🇧"
  },
  {
    label: 'Euro',
    value: 'EUR',
    "flag": "🇪🇺"
  },
]

// const GBP = [
//   {value: 200, label: 'apr 8'},
//   {value: 2050, label: '18'},
//   {value: 2100, label: '28'},
//   {value: 2150, label: 'May 8'},
//   {value: 2200, label: '18'}
// ];

// const NGN = [
//   {value: 200, label: 'apr 8'},
//   {value: 2050, label: '18'},
//   {value: 2100, label: '28'},
//   {value: 2150, label: 'May 8'},
//   {value: 2200, label: '18'}
// ];

type currencyType = {
  label: string;
  value: "NGN" | "GBP" | "USD" | "EUR";
  flag: string;
}

type ChartPoint = {
  value: number;
  label: string;
}

type RatePair = {
  pair: string;
  data: ChartPoint[];
}
const FxScreen = () => {

  const dispatch = useDispatch()
  const inputRef = useRef<TextInput>(null);
  const [currencyFrom, setCurrencyFrom] = useState<currencyType>({
    label: 'Nigerian Naira',
    value: 'NGN',
    flag: "🇳🇬"
  });
  const [currencyTo, setCurrencyTo] = useState<currencyType>( { 
    label: 'British Pound',
    value: 'GBP',
    flag: "🇬🇧"
  });
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const bottomSheetFromModalRef = useRef<BottomSheetModal>(null);
  const fromSnapPoints = useMemo(() => ["50%"], [])

  const bottomSheetToModalRef = useRef<BottomSheetModal>(null);
  const toSnapPoints = useMemo(() => ["50%"], [])

  const [amount, setAmount] = useState("")
 const [selectedPair, setSelectedPair] = useState<RatePair | null>(null);

  const [latestToValue, setlatestToValue] = useState<number>(0);
  const [rates, setRates] = useState<RatePair[]>([]);
  const toast = useToast();

  const stripe = useStripe()

  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleCurrencyFrom = (currency: currencyType) => {
    setCurrencyFrom(currency)
    handleCloseFromModalPress()
  }
  
  const handleCurrencyTo = (currency: currencyType) => {
    setCurrencyTo(currency)
    handleCloseToModalPress()
  }

  useEffect(() => {
    
    if (currencyFrom.value === currencyTo.value) {
      toast.show("Same Currency not Supported", {
        type: "danger",
      });
      return;
    }

    // if (
    //   currencyFrom.value === "EUR" || currencyFrom.value === "USD" ||
    //   currencyTo.value === "EUR" || currencyTo.value === "USD"
    // ) {
    //   toast.show("Only NGN and GBP exchange are currently available at the moment", {
    //     type: "danger",
    //   });
    //   return;
    // }

    const pair = rates.find((p: RatePair | null) => p?.pair === `${currencyFrom.value}/${currencyTo.value}`);

    const latestValue = pair?.data?.[pair?.data.length - 1]?.value ?? 0;
    setlatestToValue(latestValue)
    setSelectedPair(pair || null)

    console.log("pair", selectedPair)
  }, [currencyFrom, currencyTo, rates]);

  useFocusEffect(
    useCallback(() => {
      loadConversion();
    }, [])
  );

  const flipCurrency = () => {
    rotation.value = withTiming(rotation.value + 180, { duration: 300 });

    const temp = currencyFrom;
    setCurrencyFrom(currencyTo);
    setCurrencyTo(temp);
  };

  const loadConversion = async () => {
    dispatch(showLoader());

    try{
      const result = await axiosClient.get("/fx/chart")

      console.log("chart=",result.data)
      console.log("chart=",result.data[0].data)
      setRates(result.data || [])
      // setRates(normalizeRates(result.data || []));

      
    } catch (error: any) {
      toast.show(error.response.data.message || error.response.data.error.message,{
        type: "danger",
      });

    } finally {
      dispatch(hideLoader());
    } 
  }

  const confirm = async () => {

    if(!latestToValue){
      return toast.show("No conversion rate found",{
        type: "danger",
      });
    }

    if(currencyFrom.value === currencyTo.value){
      return toast.show("Same Currency not Supported",{
        type: "danger",
      });
    }

    if(!amount){
      return toast.show("Input amount to continue",{
        type: "danger",
      });
    }

    if(Number(amount) < 10){
      return toast.show("Amount must be at least 10",{
        type: "danger",
      });
    }

    // if(currencyFrom.value === "NGN" && Number(amount) < 3000){
    //   return toast.show("Amount must be at least 3000 when exchanging with NGN",{
    //     type: "danger",
    //   });
    // }

    // if(currencyFrom.value === "NGN" && Number(amount) < 100){
    //   return toast.show("Amount must be at least 100 when exchanging with NGN",{
    //     type: "danger",
    //   });
    // }

    handlePresentModalPress()

  }

  const submit = async () => {

    // if (
    //   currencyFrom.value === "EUR" || currencyFrom.value === "USD" ||
    //   currencyTo.value === "EUR" || currencyTo.value === "USD"
    // ) {
    //   toast.show("Only NGN and GBP exchange are currently available at the moment", {
    //     type: "danger",
    //   });
    //   return;
    // }

    try {

      dispatch(showLoader());

      const data = {
        from: currencyFrom.value,
        to: currencyTo.value,
        amount: Number(amount)
      }

      console.log("data=",data)
      const result = await axiosClient.post("/fx/exchange", data)
      await SecureStore.setItemAsync("conversionId", result.data.conversionId);

      console.log("exchange=",result.data)
      const link = result.data.checkoutLink
                
      router.push({
        pathname: "/(protected)/(routes)/FXPaymentGateway",
        params: { paylink:  link},
      })

      handleCloseModalPress()

      // if(currencyFrom.value === "GBP"){
        

      //   const userInfo = {
      //     conversionId:  result.data?.transaction?.conversionId,
      //     amount:  result.data?.transaction?.amount,
      //     convertedAmount: result.data?.transaction?.convertedAmount,
      //     fromCurrency:  result.data?.transaction?.from,
      //     toCurrency:  result.data?.transaction?.to
      //   }

      //   console.log(userInfo)

      //   handleCloseModalPress()

      //   router.push({
      //     pathname: "/(protected)/(routes)/GBPPayAccount",
      //     params: { userData: JSON.stringify(userInfo) },
      //   });

      // }else if(currencyFrom.value === "NGN"){
      //   const link = result.data.checkoutLink
                
      //   router.push({
      //     pathname: "/(protected)/(routes)/FXPaymentGateway",
      //     params: { paylink:  link},
      //   })

      //   handleCloseModalPress()
      // }else{
      //   toast.show("No payment method found",{
      //     type: "danger",
      //   });
      // }

    } catch (error: any) {
      toast.show(error.response.data.message || error.response.data.error.message,{
        type: "danger",
      });
      console.log("error=",error.response.data.message)

    } finally {
      dispatch(hideLoader());
    } 
  }

  const handleCloseFromModalPress = useCallback(() => {
    bottomSheetFromModalRef.current?.close()
  }, []);
  
  const handlePresentFromModalPress = useCallback(() => {
    bottomSheetFromModalRef.current?.present();
  }, []);

  const handleCloseToModalPress = useCallback(() => {
    bottomSheetToModalRef.current?.close()
  }, []);
  
  const handlePresentToModalPress = useCallback(() => {
    bottomSheetToModalRef.current?.present();
  }, []);

  const handleCloseModalPress = useCallback(() => {
    bottomSheetModalRef.current?.close()
  }, []);
  
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);


  return (
    <SafeAreaView className="bg-white h-full px-4">
      <Header title='FX Payment' showGoBack={true} onpress={() => router.back()}/>
      <KeyboardAvoidingView className='flex-1' behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === 'ios' ? 30 : 0}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="w-full justify-center my-4">
            <View className="w-full flex-row items-center justify-between gap-1">
              <Text className="text-base text-gray-300 font-amedium">Today’s exchange rate:</Text>
              <Pressable onPress={() => router.push("/(protected)/(routes)/CurrencyRates")}>
                <Text className="font-amedium text-base text-blue">See all rates</Text>
              </Pressable>
            </View>
            <View className='rounded-md px-4 py-2 mt-2 bg-blueLight flex-row gap-1 items-center self-start'>
              <Text className="font-amedium text-lg text-blue">{`${currencyFrom.value} 1 = ${currencyTo.value} ${latestToValue}`}</Text>
            </View>
            <Text className="font-amedium text-xs text-blue mt-7 mb-1">You will pay</Text>
            <View className='bg-inputBg h-24 rounded-lg'>
              <View className='bg-inputBg border-2 border-inputBg w-full h-20 px-4 rounded-t-lg items-center flex-row gap-1'>
                <TouchableOpacity activeOpacity={0.8} className='h-12 w-28 bg-white rounded-md flex-row gap-2 items-center justify-center' onPress={handlePresentFromModalPress}>
                  <Text className='text-xl text-blue font-amedium'>{currencyFrom.flag}</Text>
                  <Text className='text-xl text-blue font-amedium'>{currencyFrom.value}</Text>
                </TouchableOpacity>
                <TextInput ref={inputRef} selectionColor="#003366" value={amount} onChangeText={(e: string) => setAmount(e)} className='bg-inputBg flex-1 text-blue font-abold text-2xl h-full pl-3' placeholder={"0.00"} placeholderTextColor="#ccc" keyboardType={'numeric'} editable={true}/> 
              </View>
            </View>
            <Text className="font-amedium text-xs text-blue mt-2 mb-1">You will get</Text>
            <View className='bg-inputBg h-24 rounded-lg justify-end relative'>
              <TouchableOpacity onPress={flipCurrency} activeOpacity={0.8} className='absolute -top-12 z-10 bg-orange rounded-full size-16 items-center justify-center' style={{
                left: '50%',
                transform: [{ translateX: -32 }], // center horizontally based on size 16 (64px)
              }}>
                <Animated.View style={[animatedStyle]}>
                  <FontAwesome5 name="exchange-alt" size={28} color="white" style={{ transform: [{ rotate: '90deg' }] }}/>
                </Animated.View>
              </TouchableOpacity>
              <View className='bg-inputBg border-2 border-inputBg w-full h-20 px-4 rounded-b-lg items-center flex-row gap-1'>
                <TouchableOpacity activeOpacity={0.8} className='h-12 w-28 bg-white rounded-md flex-row gap-2 items-center justify-center' onPress={handlePresentToModalPress}>
                  <Text className='text-xl text-blue font-amedium'>{currencyTo.flag}</Text>
                  <Text className='text-xl text-blue font-amedium'>{currencyTo.value}</Text>
                </TouchableOpacity>
                <TextInput className='bg-inputBg flex-1 text-blue font-abold text-2xl h-full pl-3' value={String((Number(amount) * latestToValue).toFixed(2))} placeholder={"0.00"} placeholderTextColor="#ccc" keyboardType={'numeric'} editable={false}/> 
              </View>
            </View>
            
            <View className='mt-8'>
              <LineChart
                data={selectedPair?.data ?? []}
                // data2={selectedPair?.data2}
                height={200}
                width={chartWidth}
                showVerticalLines
                verticalLinesColor="#E0E0E0"
                spacing={chartWidth / (selectedPair?.data?.length ?? 1)}
                noOfSections={5} // Only 5 vertical labels (sections)
                initialSpacing={0}
                color1="skyblue"
                color2="orange"
                textColor1="green"
                // dataPointsHeight={6}
                // dataPointsWidth={6}
                // dataPointsColor1="blue"
                // dataPointsColor2="red"
                hideDataPoints
                textShiftY={-2}
                textShiftX={-5}
                textFontSize={13}
                curved
                xAxisLabelTextStyle={{
                  transform: [{ rotate: '-45deg' }],
                }}
              />

              {/* Custom Legend */}
              <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20, gap: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 12, height: 12, backgroundColor: 'skyblue', marginRight: 6, borderRadius: 3 }} />
                  <Text>{currencyTo.value}</Text>
                </View>
                {/* <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 12, height: 12, backgroundColor: 'orange', marginRight: 6, borderRadius: 3 }} />
                  <Text>{currencyTo.value}</Text>
                </View> */}
              </View>
            </View>
          </View>
      </ScrollView>
    </KeyboardAvoidingView>
    <View className='w-full justify-center my-4'>
      <CustomButton title="Continue" handlePress={confirm} containerStyles="w-full" textStyles='text-white'/>
    </View>

    <CustomButtomSheet ref={bottomSheetModalRef} enablePenDown={false}>
      <View>
        <View className='flex-row w-full items-center justify-between gap-1 mb-3'>
          <View className='w-8'/>
          <Text className="text-sm text-center text-gray-300 font-abold">FX Summary</Text>
          <TouchableOpacity onPress={handleCloseModalPress}>
            <AntDesign name="closecircleo" size={30} color="#003366" />
          </TouchableOpacity>
        </View>

        <View>
          <Details title='Paying Currency' value={currencyFrom.value}/>
          <Details title='You will pay' value={displayCurrency(Number(amount), currencyFrom.value)}/>
          <Details title='Recieving Currency' value={currencyTo.value}/>
          <Details title='You will recieve' value={displayCurrency(Number(Number(amount) * latestToValue), currencyTo.value)}/>
        </View>

        <CustomButton title="Continue" handlePress={submit} containerStyles='w-full mt-4 my-2' textStyles='text-white'/>
      </View>
    </CustomButtomSheet>

    <CustomButtomSheet ref={bottomSheetFromModalRef} snapPoints={fromSnapPoints} enablePenDown={true} dynamicSizing={false} scrollable>
      <View className='h-full'>
        <View className='flex-row w-full items-center justify-between gap-1'>
          <View className='w-8'/>
          <Text className="text-sm text-center text-gray-300 font-abold">Select Paying Currency</Text>
          <TouchableOpacity onPress={handleCloseFromModalPress}>
            <AntDesign name="closecircleo" size={30} color="#003366" />
          </TouchableOpacity>
        </View>

        <BottomSheetScrollView showsVerticalScrollIndicator={false} className="mt-5">
          <View className='h-full'>
            {currencyData.map((currency: any, index) => (
              <Pressable key={index} className='flex-row gap-2 items-center my-3' onPress={() => handleCurrencyFrom(currency)}>
                <View className='flex-row gap-2 flex-1 items-center'>
                  <Text className="text-3xl text-blue font-abold">{currency.flag}</Text>
                  <View className='flex-1'>
                    <Text className="text-xl text-blue font-amedium" numberOfLines={1}>{currency.label}</Text>
                    <Text className="text-sm text-blue font-aregular">{currency.value}</Text>
                  </View>
                </View>
                <View>
                  <View className='size-7 items-center justify-center border-2 border-orange rounded-full'>
                    <View className={`size-4 rounded-full ${currencyFrom.value === currency.value ? 'bg-orange' : ''}`} />
                  </View>
                </View>
              </Pressable>
            ))}
           
          </View>
        </BottomSheetScrollView>
      </View>     
    </CustomButtomSheet>

    <CustomButtomSheet ref={bottomSheetToModalRef} snapPoints={toSnapPoints} enablePenDown={true} dynamicSizing={false} scrollable>
      <View className='h-full'>
        <View className='flex-row w-full items-center justify-between gap-1'>
          <View className='w-8'/>
          <Text className="text-sm text-center text-gray-300 font-abold">Select Receiving Currency</Text>
          <TouchableOpacity onPress={handleCloseToModalPress}>
            <AntDesign name="closecircleo" size={30} color="#003366" />
          </TouchableOpacity>
        </View>

        <BottomSheetScrollView showsVerticalScrollIndicator={false} className="mt-5">
          <View className='h-full'>
            {currencyData.map((currency: any, index) => (
              <Pressable key={index} className='flex-row gap-2 items-center my-3' onPress={() => handleCurrencyTo(currency)}>
                <View className='flex-row gap-2 flex-1 items-center'>
                  <Text className="text-3xl text-blue font-abold">{currency.flag}</Text>
                  <View className='flex-1'>
                    <Text className="text-xl text-blue font-amedium" numberOfLines={1}>{currency.label}</Text>
                    <Text className="text-sm text-blue font-aregular">{currency.value}</Text>
                  </View>
                </View>
                <View>
                  <View className='size-7 items-center justify-center border-2 border-orange rounded-full'>
                    <View className={`size-4 rounded-full ${currencyTo.value === currency.value ? 'bg-orange' : ''}`} />
                  </View>
                </View>
              </Pressable>
            ))}
           
          </View>
        </BottomSheetScrollView>
      </View>     
    </CustomButtomSheet>

    <StatusBar backgroundColor='#ffffff' style='dark'/>
  </SafeAreaView>
  )
}

export default FxScreen