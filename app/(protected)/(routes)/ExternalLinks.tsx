import { View, Text, ActivityIndicator, Dimensions } from 'react-native'
import React, { useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { router, useLocalSearchParams } from 'expo-router'
import { WebView} from "react-native-webview"
import Header from '@/components/Header'

const { height, width} = Dimensions.get("window")

export default function PaymentGatewayScreen() {

  const { paylink } = useLocalSearchParams() as any;

  const [visible, setVisible] = useState(false)

  const webview = useRef<any>();

  return (
    <SafeAreaView className='flex-1 bg-white'>
      <View className='px-4'>
        <Header title="View Link" showGoBack={true} onpress={() => router.back()}/>
      </View>

      <WebView
       ref={webview}
        source={{uri: paylink }}
        onLoad={() => setVisible(true)}
        onLoadEnd={() => setVisible(false)}
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