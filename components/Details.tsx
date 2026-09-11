import { View, Text, Pressable } from 'react-native'

type rowProp = {
    title: string;
    value: string; 
    status?: string;
    type?: string
}

export default function Details({title, value, status, type}: rowProp) {
  return (
    <View className="justify-between w-full flex-row gap-10 items-start bg-white border-b border-gray-100 rounded-lg py-2">
      <View className="items-center flex-row gap-1">
        <Text className="font-amedium text-sm text-blue">{title}</Text>
      </View>

      <Text className={`font-amedium text-lg text-right flex-1 capitalize ${status === "successful" || type === "credit" ? "text-green-500" : status === "failed" || type === "debit" ? "text-red-500" : status === "pending" || status === "reversed" ? "text-yellow-600" : "text-blue"}`} numberOfLines={3}>{value}</Text>
    </View>
  )
}