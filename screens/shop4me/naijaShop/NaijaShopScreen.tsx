import { View, FlatList } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import CategoryList from '@/components/naija-shop/CategoryList'
import NaijaShopBanner from '@/components/NaijaShopBanner'
import FeaturedProduct from '@/components/naija-shop/FeaturedProduct'
import HomeProductList from '@/components/naija-shop/HomeProductList'
import SearchPlaceholder from '@/components/naija-shop/SearchPlaceholder'
import VendorList from '@/components/naija-shop/VendorList'
import { useFocusEffect } from '@react-navigation/native'
import { NaijaShopGetItems } from '@/utils/NaijaShopCartStorage'
import { getFormattedCartCount } from '@/utils/getFormattedCartCount'
import HorizontalSkeleton from '@/components/skeleton/HorizontalSkeleton'
import VerticalSkeleton from '@/components/skeleton/VerticalSkeleton'
import NaijaShopCategorySkeleton from '@/components/skeleton/NaijaShopCategorySkeleton'

type StoreItemType = {
  id: any
  quantity: number,
};

const NaijaShopScreen = () => {

  const { top, bottom } = useSafeAreaInsets()

  const [cart, setCart] = useState<StoreItemType[]>([]);
  const [showHeavy, setShowHeavy] = useState(false)

  useEffect(() => {
    setTimeout(() => setShowHeavy(true), 2000)
  }, [])
  
  const loadCart = () => {
    const items = NaijaShopGetItems();
    console.log("i=",items)
    setCart(items);
  };

  useFocusEffect(
    useCallback(() => {
  
      loadCart();
    }, [])
  );

  return (
    <View className='h-full bg-black' style={{ paddingTop: top }}>
      <SearchPlaceholder cart={getFormattedCartCount(cart)} showMenu={true}/>
      <View className='flex-1 bg-white'>
        <FlatList
          data={[]}
          renderItem={null}
          
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => (
            <View>
              {showHeavy ? <CategoryList /> : <NaijaShopCategorySkeleton />}
              <NaijaShopBanner/>
              {showHeavy ? <FeaturedProduct /> : <HorizontalSkeleton title='Popular items this season'/>}
              {showHeavy ? <VendorList /> : <HorizontalSkeleton title='Shop from Vendors'/>}
              {showHeavy ? <HomeProductList /> : <VerticalSkeleton title='Shop from all items'/>}
            </View>
          )}
          contentContainerStyle={{
            paddingBottom: bottom + 100
          }}
          nestedScrollEnabled
        />
      </View>

        <StatusBar backgroundColor="#000" style='light'/>
    </View>
  )
}

export default NaijaShopScreen