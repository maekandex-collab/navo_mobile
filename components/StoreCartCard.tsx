import { View, Text, StyleSheet, Pressable } from 'react-native'
import React, { useCallback, useState } from 'react'
import { StoreDecreaseItemQuantity, StoreDeleteItem, StoreGetItemById, StoreIncreaseItemQuantity } from '@/utils/CartStorage';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native'
import displayCurrency from '@/utils/displayCurrency';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Image as ExpoImage } from 'expo-image';

const StoreCartCard = ({item, index, fetchData, total}: {item: any; index: number; fetchData: () => void; total: () => void}) => {

    const blurhash = 'L~I64noffQfQfQfQfQfQfQfQfQfQ';
    
    const [product, setProduct] = useState<any>([])
    const [subTotal, setSubtotal] = useState(0)

    useFocusEffect(
        useCallback(() => {
            const sub = product?.quantity * item?.price
            setSubtotal(sub)
        }, [product])
    );

    const getProduct = () => {
        const cartitem = StoreGetItemById(item?.id)
        setProduct(cartitem)
    }

    useFocusEffect(
        useCallback(() => {
            getProduct()
        }, [])
    );

    const increase = (id: string) => {
        StoreIncreaseItemQuantity(id)
        getProduct()
        const sub = product?.quantity * item?.price
        setSubtotal(sub)
        total()
    }
    
    const decrease = (id: string) => {
        StoreDecreaseItemQuantity(id)
        getProduct()
        const sub = product?.quantity * item?.price
        setSubtotal(sub)
        total()
    }

    const remove = (id: string) => {
        console.log("remove",id)
        StoreDeleteItem(id)
        fetchData()
        getProduct()
        total()
    }

  return (
    <View key={index} className="w-full border border-gray-50 rounded-md overflow-hidden">
        <View className="w-full flex-row items-start">
            <Pressable onPress={() => router.push({pathname: "/(protected)/(routes)/ProductDetails", params: { productDetails: JSON.stringify(item) }})} className="relative w-[30%] h-32 bg-gray-50 items-center justify-center">
                <Pressable onPress={() => remove(item?.id)} className="absolute p-1 top-0 left-0 z-20 bg-orange rounded-sm">
                    <AntDesign name="close" size={18} color="#fff" />
                </Pressable>
                <ExpoImage source={{ uri: item?.image[0] }} placeholder={{ blurhash }} cachePolicy="disk" contentFit="cover" style={{ width: "100%", height: "100%" }}/>
            </Pressable>
            <View className="w-full flex-1 items-start gap-1 p-2">
                <Text className="font-abold" numberOfLines={2}>{item?.name}</Text>
                <Text className="font-amedium text-xl">
                    {displayCurrency(Number(item?.price), 'GBP')}
                </Text>
                <Text style={{fontWeight:"bold"}} className={`text-xs ${item?.productStatus === 'in_stock' ? 'text-green-500' : item?.productStatus === 'out_of_stock' ? 'text-red-500' : 'text-red-500'}`}>{item?.productStatus === 'in_stock' ? 'In Stock' : item?.productStatus === 'out_of_stock' ? 'Out of Stock' : 'Out of Stcok'}</Text>
                <View className='mb-2 flex-1 flex-row gap-1'>
                    <Text className="text-lg text-blue">Subtotal:</Text>
                    <Text className='text-blue flex-1 text-lg font-abold'>{displayCurrency(Number(subTotal), 'GBP')}</Text>
                </View>
            </View>
        </View>
        <View className="w-full p-2 flex-row gap-2">
            <View className={`flex-row px-4 items-center justify-between min-h-[48px] rounded-lg border border-orange min-w-40`}>
                {
                    product?.quantity > 1 ? (
                        <Pressable onPress={() => decrease(item?.id)} className=''>
                            <AntDesign name="minus" size={22} color="#003366" />
                        </Pressable>
                    ) : (
                        <Pressable onPress={() => remove(item?.id)} className=''>
                            <AntDesign name="delete" size={22} color="#003366" />
                        </Pressable>
                    )
                }
                
                <Pressable className='px-6'>
                    <Text className='text-blue font-amedium text-xl'>{product?.quantity}</Text>
                </Pressable>
                <Pressable onPress={() => increase(item?.id)}>
                    <AntDesign name="plus" size={22} color="#003366" />
                </Pressable>
            </View>
        </View>
    </View>
  )
}

export default StoreCartCard

const styles = StyleSheet.create({
  productBox: {
      display: 'flex',
      backgroundColor:"white",
      padding: 4,
      borderRadius:8,
      shadowColor: '#333333',
      elevation: 6,
      shadowOffset: {width: -2, height: 2},
      shadowOpacity: 0.2,
      shadowRadius: 8,
  }
})