import { View, Text, FlatList, Pressable } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import AmazonBanner from '@/components/AmazonBanner'
import CategoryList from '@/components/amazon/CategoryList'
import RecommendedProduct from '@/components/amazon/RecommendedProduct'
import FeaturedProduct from '@/components/amazon/FeaturedProduct'
import SearchPlaceholder from '@/components/amazon/SearchPlaceholder'
import HomeShortCategory from '@/components/amazon/HomeShortCategory'
import { useFocusEffect } from '@react-navigation/native'
import { AmazonGetItems } from '@/utils/AmazonCartStorage'
import { getFormattedCartCount } from '@/utils/getFormattedCartCount'
import CategorySkeleton from '@/components/skeleton/NaijaShopCategorySkeleton'
import VerticalSkeleton from '@/components/skeleton/VerticalSkeleton'
import AmazonCategorySkeleton from '@/components/skeleton/AmazonCategorySkeleton'

type AmazonItemType = {
  asin: any
  quantity: number,
};

const AmazonScreen = () => {

  const { top, bottom } = useSafeAreaInsets()

  const [cart, setCart] = useState<AmazonItemType[]>([]);

  const [showHeavy, setShowHeavy] = useState(false)

  useEffect(() => {
    setTimeout(() => setShowHeavy(true), 2000)
  }, [])
  
  const loadCart = () => {
    const items = AmazonGetItems();
    console.log("i=",items)
    setCart(items);
  };

  useFocusEffect(
    useCallback(() => {
  
      loadCart();
    }, [])
  );

  return (
    <View className='h-full bg-cyan' style={{ paddingTop: top }}>
      <SearchPlaceholder cart={getFormattedCartCount(cart)}/>
      <View className='flex-1 bg-white'>
        <FlatList
          data={[]}
          renderItem={null}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => (
            <View>
              <Pressable className='bg-cyan-light py-2 px-4'>
                <Text className='font-amedium text-base' numberOfLines={1}>Shop products from amazon and pay in Naira.</Text>
              </Pressable>
              {showHeavy ? <CategoryList /> : <AmazonCategorySkeleton />}
              <AmazonBanner/>
              {/* <FeaturedProduct/> */}
              {/* <RecommendedProduct/> */}
              {showHeavy ? <HomeShortCategory/> : <VerticalSkeleton title='Shop from amazon products'/>}
            </View>
          )}
          contentContainerStyle={{
            paddingBottom: bottom + 16
          }}
          nestedScrollEnabled
        />
      </View>

      <StatusBar backgroundColor="#00ced1" style='dark'/>
    </View>
  )
}

export default AmazonScreen