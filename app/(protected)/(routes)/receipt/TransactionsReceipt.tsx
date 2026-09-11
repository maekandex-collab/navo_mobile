import { View, Text, ScrollView, Modal, Platform, ActivityIndicator, Alert, Pressable } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import Header from '@/components/Header'
import Feather from '@expo/vector-icons/Feather';
import IconButton from '@/components/IconButton'
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import Details from '@/components/Details'
import { router, useLocalSearchParams } from 'expo-router'
import { generateReceiptPDF, downloadReceiptPDF } from '@/utils/ReceiptPDF'
import moment from 'moment'
import { useToast } from 'react-native-toast-notifications'
import * as Clipboard from 'expo-clipboard';
import { formatEnumsCapital } from '@/utils/formatEnumsCapital'
import Ionicons from '@expo/vector-icons/Ionicons';
import { hideLoader, showLoader } from '@/redux/LoaderSlice'
import { useDispatch } from 'react-redux'

const TransactionsReceipt = () => {
  
  const toast = useToast();
   const dispatch = useDispatch()

  const { Recieptdata } = useLocalSearchParams() as any;
  const parsedRecieptdata = Recieptdata ? JSON.parse(Recieptdata) : null;

  const transaction =  {
    recipient: parsedRecieptdata?.recipient,
    amount: parsedRecieptdata?.amount, 
    dataPlan: parsedRecieptdata?.dataPlan,
    networkProvider: parsedRecieptdata?.networkProvider,
    utilityType: parsedRecieptdata?.utilityType,
    transactionType: parsedRecieptdata?.transactionType || "Nil",
    paymentType: formatEnumsCapital(parsedRecieptdata?.paymentType) || "Nil",
    channel: parsedRecieptdata?.channel,
    referenceCode: parsedRecieptdata?.merchantTxRef,
    rechargeToken: parsedRecieptdata?.rechargeToken,
    status: parsedRecieptdata?.status,
    timestamp: moment(parsedRecieptdata?.timeStamp).format('llll'),
    category: parsedRecieptdata?.category,
    remark: !parsedRecieptdata?.remark ? "Nil" : parsedRecieptdata?.remark
  }

  const shareReceipt = async () => {
    generateReceiptPDF(transaction)
   
  }

  const downloadReceipt = async () => {

    if (Platform.OS === 'android') {
      dispatch(showLoader());
      try {
        const result = await downloadReceiptPDF(transaction);
        if (typeof result === 'object') {
          Alert.alert(result.title, result.message);
        } else {
          Alert.alert(result);
        }
      } catch (error) {
        console.error("Download failed:", error);
        Alert.alert('failed to download receipt');
      } finally {
        dispatch(hideLoader());
      }
    }else{
      generateReceiptPDF(transaction)
    }
  }

  const copyCode = async () => {
    if(transaction.referenceCode){
      const copyCode = await Clipboard.setStringAsync(transaction.referenceCode);

      toast.show("Reference Code Copied", {
        type: "success",
      });
    } 
  }

  return (
    <SafeAreaView className="bg-white h-full px-4">
      <Header title='Transaction Details' showGoBack={true} onpress={() => router.back()}/>

      <ScrollView className='mb-4' showsVerticalScrollIndicator={false}>
        <View className='mt-3 mb-2 items-center justify-center gap-1'>
          <View className='items-center flex-row gap-1'>
            <View className={`flex items-center justify-center size-12 border-2 rounded-full ${transaction.status === "successful" ? "bg-green-100 border-green-500" : transaction.status === "failed" ? "bg-red-100  border-red-500" : "bg-yellow-100 border-yellow-600"} `}>
              <Feather name={transaction.status === "successful" ? "arrow-up-right" : transaction.status === "failed" ? "arrow-down-left" : "minus"} color={transaction.status === "successful" ? "#22c55e" : transaction.status === "failed" ? "#ef4444" : "#ca8a04"} size={28}/>
            </View>
          </View>
          
          <View className='items-center justify-center mt-2'>
            <Text className="font-abold text-xl text-blue">{transaction.status === "successful" ? "Payment Successful" : transaction.status === "failed" ? "Payment Failed" :  transaction.status === "reversed" ? "Payment Reversed" : "Payment Pending"}!</Text>
            <Text className="font-amedium text-xs text-blue mt-4 mb-1">Amount</Text>
            <Text className="font-abold text-3xl text-blue">{transaction.amount}</Text>
            <Pressable className='w-full gap-1 mt-1' onPress={copyCode}>
              <Text className="font-alight text-xs text-blue text-center">Reference Code:</Text>
              <View className="flex-row flex-wrap items-center justify-center gap-1">
                <Text className="font-abold text-xs text-blue uppercase text-center">
                  {transaction.referenceCode}
                </Text>
                <Ionicons name="copy-outline" size={12} color="#003366" />
              </View>
            </Pressable>
          </View>

          {/* payment details */}
          <View className='w-full'>
            <Details title='Recipient' value={transaction.recipient}/>
            <Details title='Transaction Type' value={transaction.transactionType} type={transaction.transactionType}/>
            <Details title='Payment Type' value={transaction.paymentType} type={transaction.paymentType}/>
            {transaction?.dataPlan && <Details title='Data Plan' value={transaction?.dataPlan}/>}
            {transaction?.networkProvider && <Details title='Network Provider' value={transaction?.networkProvider}/>}
            {transaction?.utilityType && <Details title='Utility Type' value={transaction?.utilityType}/>}
            {transaction?.rechargeToken && <Details title='Recharge Token' value={transaction?.rechargeToken}/>}
            <Details title='Channel' value={transaction.channel}/>
            <Details title='Status' value={transaction.status} status={transaction.status}/>
            <Details title='Time stamp' value={transaction.timestamp}/>
            <Details title='Category' value={transaction.category}/>
            <Details title='Remark' value={transaction.remark}/>
          </View>
        </View>
      </ScrollView>

      {transaction.status === "successful" && (
        <View>
          <View className='flex-row items-center justify-center gap-3 mb-5'>
            <IconButton title='Download' textStyles='text-white' icon={<MaterialCommunityIcons name="download-box" size={20} color="white" />} containerStyles='bg-orange w-1/2' handlePress={downloadReceipt}/>
            <IconButton title='Share' textStyles='text-white' icon={<FontAwesome name="send" size={18} color="white" />} containerStyles='bg-blue w-1/2' handlePress={shareReceipt}/>
          </View>
        </View>
      )}

      <StatusBar backgroundColor='#ffffff' style='dark'/>
    </SafeAreaView>
  )
}

export default TransactionsReceipt