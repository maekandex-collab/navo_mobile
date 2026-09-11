import { View, Text, ActivityIndicator, Dimensions } from 'react-native'
import React, { useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { router, useLocalSearchParams } from 'expo-router'
import { WebView} from "react-native-webview"
import Header from '@/components/Header'
import getWallet from '@/utils/WalletApi'
import { useToast } from 'react-native-toast-notifications'
import { useDispatch } from 'react-redux'
import { Shop4MeClearItems } from '@/utils/CartStorage'
import { axiosClient } from '@/globalApi'
import { NaijaShopClearItems } from '@/utils/NaijaShopCartStorage'
import { AmazonClearItems } from '@/utils/AmazonCartStorage'
import getTransactions from '@/utils/TransactionsApi'

const { height, width} = Dimensions.get("window")

export default function PaymentGatewayScreen() {

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

    
    console.log("Order ID:", orderId);
    console.log("Order Reference:", orderReference);

    // if (url.includes('?home')) {

    //   console.log("Order ID:", orderId);
    //   console.log("Order Reference:", orderReference);
     
    //   router.replace({
    //     pathname: "/(protected)/(tabs)/home",
    //     params: {
    //       orderId: orderId,
    //       orderReference: orderReference,
    //     },
    //   });

    // }

    // if (url.includes('?shopforme')) {
     
    //   const verifyShopPayment = async () => {
    //     try {
    //       const result = await axiosClient.get(`/payments/verify-shop?idType=ORDER_ID&id=${orderId}`);
    //       console.log("shop-verify", result.data);

    //       if(result.data?.data?.success && result.data?.data.paymentStatus === "SUCCESSFUL") {
    //         console.log("cart cleared");
    //         Shop4MeClearItems();
    //       }

    //       router.replace("/(protected)/(tabs)/home")
    //     } catch (error: any) {
    //       router.replace("/(protected)/(tabs)/home")
    //       console.log("shop-verify-error", error.response?.data?.message || error.response?.data?.error?.message);
    //     }
    //   };

    //   verifyShopPayment();

    // }

    // if (url.includes('?naijaShopLoad')) {
     
    //   const verifyNaijaShopPayment = async () => {
    //     try {
    //       const result = await axiosClient.get(`/payments/verify-orders?idType=ORDER_ID&id=${orderId}`);
    //       console.log("naija-verify", result.data);

    //       if(result.data?.data?.success && result.data?.data.paymentStatus === "SUCCESSFUL") {
    //         console.log("naija cart cleared");
    //         NaijaShopClearItems();
    //       }

    //       router.replace("/(protected)/(tabs)/home")
    //     } catch (error: any) {
    //       router.replace("/(protected)/(tabs)/home")
    //       console.log("shop-verify-error", error.response?.data?.message || error.response?.data?.error?.message);
    //     }
    //   };

    //   verifyNaijaShopPayment()

    // }

    // if (url.includes('?AmazonShopLoad')) {
     
    //   const verifyAmazonShopPayment = async () => {
    //     try {
    //       const result = await axiosClient.get(`/payments/verify-carts?idType=ORDER_ID&id=${orderId}`);
    //       console.log("amazon-verify", result.data);

    //       if(result.data?.data?.success && result.data?.data.paymentStatus === "SUCCESSFUL") {
    //         console.log("amazon cart cleared");
    //         AmazonClearItems();
    //       }

    //       router.replace("/(protected)/(tabs)/home")
    //     } catch (error: any) {
    //       router.replace("/(protected)/(tabs)/home")
    //       console.log("shop-verify-error", error.response?.data?.message || error.response?.data?.error?.message);
    //     }
    //   };

    //   verifyAmazonShopPayment()
    // }

  };

  return (
    <SafeAreaView className='flex-1 bg-white'>
      <View className='px-4'>
        <Header title="Pay Now" showGoBack={true} onpress={() => router.back()}/>
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