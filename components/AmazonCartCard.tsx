import { View, Text, Pressable } from 'react-native'
import React, { useCallback, useState } from 'react'
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native'
import displayCurrency from '@/utils/displayCurrency';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Image as ExpoImage } from 'expo-image';
import { AmazonDecreaseItemQuantity, AmazonDeleteItem, AmazonGetItemByAsin, AmazonIncreaseItemQuantity } from '@/utils/AmazonCartStorage';

const AmazonCartCard = ({item, index, loadCart, total, updateItem}: {item: any; index: number; loadCart: () => void; total: () => void; updateItem: any}) => {

    const blurhash = 'L~I64noffQfQfQfQfQfQfQfQfQfQ';

    const increase = (id: string) => {
        AmazonIncreaseItemQuantity(id);
        const updatedItem = AmazonGetItemByAsin(id); // fresh from storage
        if (updatedItem) {
            updateItem(updatedItem);
            total(); // update total in parent
        }
    }

    const decrease = (id: string) => {
        AmazonDecreaseItemQuantity(id);
        const updatedItem = AmazonGetItemByAsin(id);
        if (updatedItem) {
            updateItem(updatedItem);
            total();
        }
    }

    const remove = (id: string) => {
        AmazonDeleteItem(id);
        updateItem({ ...item, quantity: 0 }); // or handle removing separately in parent
        total();
        loadCart()
    }

  return (
    <View className="w-full border border-gray-50 rounded-md overflow-hidden">
        <View className="w-full flex-row items-start">
            <Pressable onPress={() => router.push({pathname: "/(protected)/(routes)/AmazonProductDetails", params: { asin: item?.asin }})} className="relative w-[30%] min-h-24 p-2 bg-gray-50 items-center justify-center">
                <Pressable onPress={() => remove(item?.asin)} className="absolute p-1 top-0 left-0 z-20 bg-red-500 rounded-sm">
                    <AntDesign name="close" size={18} color="#fff" />
                </Pressable>
                <ExpoImage source={{ uri: item.image || "" }} placeholder={{ blurhash }} cachePolicy="disk" contentFit="contain" style={{ width: "100%", height: 140 }}/>
            </Pressable>
            <View className="w-full flex-1 items-start gap-1 p-2">
                <Text className="font-abold" numberOfLines={3}>{item?.title}</Text> 
                <Text className="font-amedium text-lg" numberOfLines={2}>{displayCurrency(Number(item.price), "GBP")}</Text>
                <View className='mb-2 flex-1 flex-row gap-1'>
                    <Text className="text-lg">Subtotal:</Text>
                    <Text className='flex-1 text-lg font-abold'>{displayCurrency(item.quantity * item.price, "GBP")}</Text>
                </View>
            </View>
        </View>
        <View className="w-full p-2 flex-row gap-2">
            <View className={`flex-row px-4 items-center justify-between min-h-[48px] rounded-lg border border-black min-w-40`}>
                {
                    item?.quantity > 1 ? (
                        <Pressable onPress={() => decrease(item?.asin)} className=''>
                            <AntDesign name="minus" size={22} color="#000" />
                        </Pressable>
                    ) : (
                        <Pressable onPress={() => remove(item?.asin)} className=''>
                            <AntDesign name="delete" size={22} color="#000" />
                        </Pressable>
                    )
                }
                
                <Pressable className='px-6'>
                    <Text className='font-amedium text-xl'>{item?.quantity}</Text>
                </Pressable>
                <Pressable onPress={() => increase(item?.asin)}>
                    <AntDesign name="plus" size={22} color="#000" />
                </Pressable>
            </View>
        </View>
    </View>
  )
}

export default AmazonCartCard