import { View, Text, Pressable } from 'react-native'

type rowProp = {
    title: string;
    value: string; 
    status?: string;
    type?: string
}

export default function ShopReceiptList({title, value, status, type}: rowProp) {
  return (
    <View className="justify-between w-full flex-row gap-2 items-start border-b border-gray-200/20 py-1">
        <View className="items-center flex-row gap-1">
            <Text className="font-amedium text-[8px] text-blue">{title}</Text>
        </View>

        <Text className={`font-amedium text-[10px] text-right text-blue max-w-52`}>{value}</Text>
    </View>
  )
}