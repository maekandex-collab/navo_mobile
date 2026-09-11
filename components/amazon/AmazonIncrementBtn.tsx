import { View, Text, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import AntDesign from '@expo/vector-icons/AntDesign'
import { AmazonDecreaseItemQuantity, AmazonDeleteItem, AmazonGetItemByAsin, AmazonIncreaseItemQuantity } from '@/utils/AmazonCartStorage'

const AmazonIncrementBtn = ({id, handleLoadCart, otherStyles}: {id: string; handleLoadCart: () => void; otherStyles?: string}) => {
    const [product, setProduct] = useState<any>([])

    const getProduct = () => {
        const item = AmazonGetItemByAsin(id)
        setProduct(item)
    }

    useEffect(() => {
        getProduct()
    }, [])

    const increase = (id: string) => {
        AmazonIncreaseItemQuantity(id)
        getProduct()
        handleLoadCart()
    }

    const decrease = (id: string) => {
        AmazonDecreaseItemQuantity(id)
        getProduct()
        handleLoadCart()
    }

    const remove = (id: string) => {
        console.log("remove",id)
        AmazonDeleteItem(id)
        getProduct()
        handleLoadCart()
    }

  return (
    <View className='flex-row gap-3 w-full'>
        <View className={`flex-row px-4 items-center justify-between min-h-[48px] rounded-lg border border-amazonYellow ${otherStyles}`}>
            {
                product?.quantity > 1 ? (
                    <Pressable onPress={() => decrease(id)}>
                        <AntDesign name="minus" size={22} color="#000" />
                    </Pressable>
                ) : (
                    <Pressable onPress={() => remove(id)}>
                        <AntDesign name="delete" size={22} color="#000" />
                    </Pressable>
                )
            }
            
            <Pressable className='px-6'>
                <Text className='text-black font-amedium text-xl'>{product?.quantity}</Text>
            </Pressable>
            <Pressable onPress={() => increase(id)}>
                <AntDesign name="plus" size={22} color="#000" />
            </Pressable>
        </View>
    </View>
  )
}

export default AmazonIncrementBtn