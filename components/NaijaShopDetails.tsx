import { View, Text, Pressable } from 'react-native'

type rowProp = {
  itemName: string;
  quantity: number;
  price: number | string;
  subTotal: number | string;
}

export default function NaijaShopDetails({itemName, quantity, price, subTotal}: rowProp) {
  return (
    <View className="w-full gap-2 items-start bg-white border-b border-gray-100 rounded-lg py-2">
      <View className="justify-between w-full flex-row gap-10 items-start">
        <View className="items-center flex-row gap-1">
          <Text className="font-amedium text-sm text-blue">Item Name</Text>
        </View>

        <Text className={`font-amedium text-lg text-right flex-1 text-blue`} numberOfLines={3}>{itemName}</Text>
      </View>
      <View className="justify-between w-full flex-row gap-10 items-start">
        <View className="items-center flex-row gap-1">
          <Text className="font-amedium text-sm text-blue">Quantity</Text>
        </View>

        <Text className={`font-amedium text-lg text-right flex-1 text-blue`} numberOfLines={3}>{quantity}</Text>
      </View>
      <View className="justify-between w-full flex-row gap-10 items-start">
        <View className="items-center flex-row gap-1">
          <Text className="font-amedium text-sm text-blue">Price</Text>
        </View>

        <Text className={`font-amedium text-lg text-right flex-1 text-blue`} numberOfLines={3}>{price}</Text>
      </View>
       <View className="justify-between w-full flex-row gap-10 items-start">
        <View className="items-center flex-row gap-1">
          <Text className="font-amedium text-sm text-blue">Sub total</Text>
        </View>

        <Text className={`font-amedium text-lg text-right flex-1 text-blue`} numberOfLines={3}>{subTotal}</Text>
      </View>
    </View>
  )
}