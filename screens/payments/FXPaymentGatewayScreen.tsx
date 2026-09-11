import { View, Text, ActivityIndicator, Dimensions } from 'react-native'
import React, { useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { router, useLocalSearchParams } from 'expo-router'
import { WebView} from "react-native-webview"
import Header from '@/components/Header'
import { useDispatch } from 'react-redux'
import { useToast } from 'react-native-toast-notifications'

const { height, width} = Dimensions.get("window")

export default function FXPaymentGatewayScreen() {

  const { paylink } = useLocalSearchParams() as any;

  const toast = useToast()
  const dispatch = useDispatch()

  const [visible, setVisible] = useState(false)

  const webview = useRef<WebView>(null);

  const handleWebViewNavigationStateChange = (newNavState: any) => {
    // newNavState looks something like this:
    // {
    //   url?: string;
    //   title?: string;
    //   loading?: boolean;
    //   canGoBack?: boolean;
    //   canGoForward?: boolean;
    // }
    const { url } = newNavState;
    console.log("url",url)
    if (!url) return;

    // Parse URL safely
    let parsed;

    try {
      parsed = new URL(url);
    } catch (e) {
      return;
    }
  
    const orderId = parsed.searchParams.get("orderId");
    const orderReference = parsed.searchParams.get("orderReference");
    
    const currencyFrom = parsed.searchParams.get("currencyFrom");
    const currencyTo = parsed.searchParams.get("currencyTo");

    console.log("Order ID:", orderId);
    console.log("Order Reference:", orderReference);

    // if (url.includes('?Account')) {

    //   if(currencyTo === "GBP"){
    //     router.replace({
    //       pathname: "/(protected)/(routes)/GBPAccount",
    //       params: {
    //         orderId: orderId,
    //         orderReference: orderReference,
    //       },
    //     });
    //   }else if (currencyTo === "NGN") {
    //     router.replace({
    //       pathname: "/(protected)/(routes)/NairaAccount",
    //       params: {
    //         orderId: orderId,
    //         orderReference: orderReference,
    //       },
    //     });
    //   }else if (currencyTo === "USD") {
    //     router.replace("/(protected)/(tabs)/home")
    //   }else if (currencyTo === "EURO") {
    //     router.replace("/(protected)/(tabs)/home")
    //   } else {
    //     router.replace("/(protected)/(tabs)/home")
    //   }

    // }

  };

  return (
    <SafeAreaView className='flex-1 bg-white'>
      <View className='px-4'>
        <Header title="FX Payment" showGoBack={true} onpress={() => router.back()}/>
      </View>

      <WebView
       ref={webview}
        source={{uri: paylink }}
        onLoadStart={() => setVisible(true)}
        onLoadEnd={() => setVisible(false)}
        onNavigationStateChange={handleWebViewNavigationStateChange}
      />

      {
        visible && (
          <ActivityIndicator size="large" color="#003366" style={{position:"absolute", top: height/2, left: width/2}}/>
        )
      }
      <StatusBar backgroundColor="#ffffff" style='dark'/>
    </SafeAreaView>
  )
}