import { View, Text, Image, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import Header from '@/components/Header'
import CustomButton from '@/components/CustomButton'
import { router } from 'expo-router'
import { images } from '@/constants'
import { Shop4MeClearItems, Shop4MeDeleteItem, Shop4MeGetItems } from '@/utils/CartStorage'
import Shop4MeCartCard from '@/components/Shop4MeCartCard'
import { useToast } from 'react-native-toast-notifications'
import { useFocusEffect } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Alert } from 'react-native'

type Shop4MeCartItemType = {
  id: string;
  goodSize: string;
  color: string;
  item: string;
  details: string;
  quantity: number;
  onlineStoreLink: string;
  // deliveryHub: string;
};

export default function CartScreen() {

    const [loading, setLoading] = useState(false)
    const [cartItems, setCartItems] = useState<Shop4MeCartItemType[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false)
    const toast = useToast();

    const loadCart = () => {
      const items = Shop4MeGetItems();
      setCartItems(items);
    };

    useFocusEffect(
      useCallback(() => {
    
        loadCart();
      }, [])
   );
  
    const handleAction = (item: any, action: string) => {

      if(action === 'delete'){
        Shop4MeDeleteItem(item.id);
        loadCart();
        toast.show("Item removed from cart", {
          type: "success",
        });
      }else if(action === 'edit'){
        router.push({
          pathname: "/(protected)/(routes)/EditCart",
          params: { item: JSON.stringify(item)},
        })
      }
    };

  const submit = async () => {
    router.push("/(protected)/(routes)/Shop4MeCartLocation")
  }

  const clearCart = () => {

    if(cartItems.length == 0){
      return toast.show("Cart is already empty", {
        type: "danger",
      });
    }

    Alert.alert(
      'Confirm',
      'Are you sure you want to clear cart?',
      [
        {
          text: 'Yes',
          onPress: () => {
            Shop4MeClearItems()
            loadCart()
          },
        },
        {
          text: 'No',
        },
      ],
      {
        cancelable: true,
      },
    );
  }

  const renderCart = ({item, index}: {item: any, index: number}) => (
      <Shop4MeCartCard item={item} index={index} handlePress={handleAction}/>
    )

    const icon = () => (
      <TouchableOpacity onPress={clearCart}>
        <MaterialCommunityIcons name="delete-forever" size={30} color="#003366" />
      </TouchableOpacity>
    )

  return (
    <SafeAreaView className="bg-white h-full px-4">
      <Header title='Cart Items' showGoBack={true} onpress={() => router.back()} showRight={cartItems.length !== 0 ? true : false} icon={icon()}/>
      <View className='pt-4 flex-1'>
        <View className='pb-9'>
            {
                loading ? (
                    <ActivityIndicator size="large" color="black"/>
                ) : (
                    <FlatList
                        nestedScrollEnabled={true}
                        scrollEnabled={true}
                        data={cartItems}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={renderCart}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={() => (
                            <View>
                              <View className="w-full items-center mx-auto justify-center my-6 mt-8 max-w-52 flex-1">
                                  <Image source={images.cart} className='size-36' resizeMode='contain'/>
                                  <Text className="text-2xl text-center text-blue mt-4 font-ablack">Your shop with link cart is empty!</Text>
                                  <Text className="text-sm text-center text-blue mt-1 font-alight">All your orders will show here when you start using the shop with link feature</Text>
                              </View>
                            </View>
                        )}
                    />
                )
            }
        </View>

      </View>
      {cartItems.length !== 0 && (
        <View className='w-full justify-center my-6'>
          <CustomButton title="Check Out" handlePress={submit} containerStyles="w-full" isLoading={isSubmitting} textStyles='text-white'/>
        </View>
      )}
    

    <StatusBar backgroundColor="#ffffff" style='dark'/>
  </SafeAreaView>
  )
}