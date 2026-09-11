import { View, Text, Pressable } from 'react-native'
import React, { useCallback, useState } from 'react'
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native'
import displayCurrency from '@/utils/displayCurrency';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Image as ExpoImage } from 'expo-image';
import { formatEnums } from '@/utils/formatEnums';
import { NaijaShopDecreaseItemQuantity, NaijaShopDeleteItem, NaijaShopGetItemById, NaijaShopIncreaseItemQuantity } from '@/utils/NaijaShopCartStorage';

const NaijaShopCartCard = ({item, index, fetchData, loadCart, total}: {item: any; index: number; fetchData: () => void; loadCart: () => void; total: () => void}) => {

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
        const cartitem = NaijaShopGetItemById(item?.id)
        setProduct(cartitem)
    }

   
    useFocusEffect(
        useCallback(() => {
            getProduct()
        }, [])
    );

    const increase = (id: string) => {
        NaijaShopIncreaseItemQuantity(id)
        getProduct()
        const sub = product?.quantity * item?.price
        setSubtotal(sub)
        total()
        loadCart()
    }
    
    const decrease = (id: string) => {
        NaijaShopDecreaseItemQuantity(id)
        getProduct()
        const sub = product?.quantity * item?.price
        setSubtotal(sub)
        total()
        loadCart()
    }

    const remove = (id: string) => {
        console.log("remove",id)
        NaijaShopDeleteItem(id)
        fetchData()
        getProduct()
        total()
        loadCart()
    }

  return (
    <View className="w-full border border-gray-50 rounded-md overflow-hidden">
        <View className="w-full flex-row items-start">
            <Pressable onPress={() => router.push({pathname: "/(protected)/(routes)/NaijaShopProductDetails", params: { productDetails: JSON.stringify(item) }})} className="relative w-[30%] min-h-24 bg-gray-50 items-center justify-center">
                <Pressable onPress={() => remove(item?.id)} className="absolute p-1 top-0 left-0 z-20 bg-orange rounded-md">
                    <AntDesign name="close" size={18} color="#fff" />
                </Pressable>
                <ExpoImage source={{ uri: item?.image[0] }} placeholder={{ blurhash }} cachePolicy="disk" contentFit="cover" style={{ width: "100%", height: 140 }}/>
            </Pressable>
            <View className="w-full flex-1 items-start gap-1 p-2">
                <Text className="font-abold" numberOfLines={2}>{item?.name}</Text>
                <Text numberOfLines={2}>{item?.description}</Text>
                <Text className={`text-sm font-abold ${item.productStatus === 'in_stock' ? 'text-green-500' : item.productStatus === 'out_of_stock' ? 'text-red-500' : 'text-red-500'}`}>{formatEnums(item.productStatus)}</Text>  
                <Text className="font-amedium text-lg" numberOfLines={2}>{displayCurrency(Number(item.price), item?.currency)}</Text>
                <View className='flex-1 flex-row gap-1'>
                    <Text className="text-lg">Subtotal:</Text>
                    <Text className='flex-1 text-lg font-abold'>{displayCurrency(Number(subTotal), item?.currency)}</Text>
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

export default NaijaShopCartCard