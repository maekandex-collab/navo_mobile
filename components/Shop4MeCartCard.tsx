import { View, Text, Pressable, TouchableOpacity } from 'react-native'
import React from 'react'
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import displayCurrency from '@/utils/displayCurrency';

const Shop4MeCartCard = ({item, handlePress, index}: {item: any; handlePress: (item: any, action: string) => void, index: number}) => {

  return (
    <Pressable>
        <View className="justify-between w-full items-start gap-2 bg-orangeLight rounded-lg p-3 my-1">
          <View className="gap-2 w-full max-w-full">
            <View className='border-b border-[#b8b4b4] pb-2'>
              <Text className="font-abold text-base text-blue">Product Name:</Text>
              <Text className="font-amedium text-base text-blue">{item.item}</Text>
            </View>
            <View className='border-b border-[#b8b4b4] pb-2'>
              <Text className="font-abold text-base text-blue">Size:</Text>
              <Text className="font-amedium text-base text-blue">{item.goodSize}</Text>
            </View>
            <View className='border-b border-[#b8b4b4] pb-2'>
              <Text className="font-abold text-base text-blue">Color:</Text>
              <Text className="font-amedium text-base text-blue">{item.color}</Text>
            </View>
            <View className='border-b border-[#b8b4b4] pb-2'>
              <Text className="font-abold text-base text-blue">Quantity:</Text>
              <Text className="font-amedium text-base text-blue">{item.quantity}</Text>
            </View>
            <View className='border-b border-[#b8b4b4] pb-2'>
              <Text className="font-abold text-base text-blue">Product Amount:</Text>
              <Text className="font-amedium text-base text-blue">{displayCurrency(Number(item.amount), 'GBP')}</Text>
            </View>
            <View className='border-b border-[#b8b4b4] pb-2'>
              <Text className="font-abold text-base text-blue">Online Store Link:</Text>
              <TouchableOpacity onPress={() => router.push({
                pathname: "/(protected)/(routes)/ExternalLinks",
                params: { paylink:  item.onlineStoreLink},
              })}>
                <Text className="font-amedium text-base text-orange">{item.onlineStoreLink}</Text>
              </TouchableOpacity>
            </View>
            <View className='pb-2'>
              <Text className="font-abold text-base text-blue">Details:</Text>
              <Text className="font-amedium text-base text-blue">{item.details}</Text>
            </View>
          </View>

          <View className='flex-row gap-4 ml-auto'>
            <TouchableOpacity onPress={() => handlePress(item, 'delete')}>
              <View className='flex items-center justify-center size-10 rounded-full bg-white'>
                <MaterialIcons name="delete" size={22} color="#FF6600" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handlePress(item, 'edit')}>
              <View className='flex items-center justify-center size-10 rounded-full bg-white'>
                <MaterialIcons name="edit-square" size={22} color="#FF6600" />
              </View>
            </TouchableOpacity>
          </View>
          
        </View>
    </Pressable >
  )
}

export default Shop4MeCartCard