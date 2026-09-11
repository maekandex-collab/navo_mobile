import { View, Text, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import AntDesign from '@expo/vector-icons/AntDesign'
import { StoreDecreaseItemQuantity, StoreDeleteItem, StoreGetItemById, StoreIncreaseItemQuantity } from '@/utils/CartStorage'
import CustomButton from './CustomButton'
import { router } from 'expo-router'

const StoreIncrementBtn = ({id, handleLoadCart, showCheckout, otherStyles}: {id: string; handleLoadCart: () => void; showCheckout?: boolean; otherStyles?: string}) => {
    const [product, setProduct] = useState<any>([])

    const getProduct = () => {
        const item = StoreGetItemById(id)
        setProduct(item)
    }

    useEffect(() => {
        getProduct()
    }, [])

    const increase = (id: string) => {
        StoreIncreaseItemQuantity(id)
        getProduct()
        handleLoadCart()
    }

    const decrease = (id: string) => {
        StoreDecreaseItemQuantity(id)
        getProduct()
        handleLoadCart()
    }

    const remove = (id: string) => {
        console.log("remove",id)
        StoreDeleteItem(id)
        getProduct()
        handleLoadCart()
    }


  return (
    <View className='flex-row gap-3 w-full'>
        <View className={`flex-row px-4 items-center justify-between min-h-[48px] rounded-lg border border-orange ${otherStyles}`}>
            {
                product?.quantity > 1 ? (
                    <Pressable onPress={() => decrease(id)} className=''>
                        <AntDesign name="minus" size={22} color="#003366" />
                    </Pressable>
                ) : (
                    <Pressable onPress={() => remove(id)} className=''>
                        <AntDesign name="delete" size={22} color="#003366" />
                    </Pressable>
                )
            }
            
            <Pressable className='px-6'>
                <Text className='text-blue font-amedium text-xl'>{product?.quantity}</Text>
            </Pressable>
            <Pressable onPress={() => increase(id)}>
                <AntDesign name="plus" size={22} color="#003366" />
            </Pressable>
        </View>
        {showCheckout && (
            <CustomButton title="Check Out" handlePress={() => router.push("/(protected)/(routes)/StoreCart")} containerStyles="flex-1" textStyles='text-white'/>
        )}
    </View>
  )
}

export default StoreIncrementBtn