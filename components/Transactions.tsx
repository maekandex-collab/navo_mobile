import { View, Text, Pressable } from 'react-native'
import React from 'react'
import Feather from '@expo/vector-icons/Feather';
import moment from 'moment'
import displayCurrency from '@/utils/displayCurrency';
import Ionicons from '@expo/vector-icons/Ionicons';
import { formatEnums } from '@/utils/formatEnums';

const Transactions = ({item, handlePress, index}: {item: any; handlePress: () => void, index: number}) => {
  return (
    <Pressable onPress={handlePress}>
        <View className="justify-between w-full flex-row items-start gap-4 bg-inputBg rounded-lg p-2 my-1">
          <View className="items-start flex-row gap-2 flex-1">
            <View className={`items-center justify-center size-10 border-2 rounded-full ${item?.paymentStatus === "successful" ? "bg-green-100 border-green-500" : item?.paymentStatus === "failed" ? "bg-red-100  border-red-500" : "bg-yellow-100 border-yellow-600"} `}>
              <Feather name={item?.paymentStatus === "successful" ? "arrow-up-right" : item?.paymentStatus === "failed" ? "arrow-down-left" : "minus"} color={item?.paymentStatus === "successful" ? "#22c55e" : item?.paymentStatus === "failed" ? "#ef4444" : "#ca8a04"} size={24}/>
            </View>
            <View className='flex-1'>
              <Text className="font-amedium text-base text-blue capitalize" numberOfLines={1}>{formatEnums(item?.category) || 'Nil'}</Text>
              <Text className="font-amedium text-xs text-gray-300" numberOfLines={1}>{item?.transactionReference || item?.details?.merchantTxRef}</Text>
              <Text className="font-amedium text-xs text-gray-300" numberOfLines={1}>{moment(item?.createdAt).format('llll')}</Text>
            </View>
          </View>

          <View className='items-end justify-end gap-2'>
            <Text className="font-abold text-sm text-blue">{displayCurrency(Number(item?.amount), item?.currency)}</Text>
            <View className='flex items-center justify-center size-7 rounded-full bg-white'>
              <Ionicons name="eye" size={16} color="#C3C3C3" />
            </View>
          </View>
        </View>
    </Pressable >
  )
}

export default Transactions