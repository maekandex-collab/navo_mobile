import { View, Text } from 'react-native'
import React from 'react'

type rateType = {
    buyRate: number; 
    pair: string; 
    sellRate: number
}

const CurrencyTable = ({rate, index}: {rate: rateType; index: number}) => {
  return (
    <View className="w-full flex-row py-3">
        <Text className="text-blue font-ablack text-xl w-1/3">{rate.pair ?? "-"}</Text>
        <Text className="text-blue font-amedium text-xl w-1/3">{rate.buyRate ?? "-"}</Text>
        <Text className="text-blue font-amedium text-xl w-1/3">{rate.sellRate ?? "-"}</Text>
    </View>
  )
}

export default CurrencyTable