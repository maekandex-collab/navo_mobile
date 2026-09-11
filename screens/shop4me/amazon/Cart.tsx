import { View, FlatList, Text, TouchableOpacity, Alert, Image } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { router } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import SearchPlaceholder from "@/components/amazon/SearchPlaceholder";
import CustomAmazonButton from "@/components/CustomAmazonButton";
import { StatusBar } from "expo-status-bar";
import { useToast } from "react-native-toast-notifications";
import { useFocusEffect } from "@react-navigation/native";
import { AmazonClearItems, AmazonGetCartTotal, AmazonGetItems } from "@/utils/AmazonCartStorage";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import AmazonCartCard from "@/components/AmazonCartCard";
import displayCurrency from "@/utils/displayCurrency";
import { images } from "@/constants";
import { getFormattedCartCount } from "@/utils/getFormattedCartCount";

type AmazonItemType = {
  asin: any;
  quantity: number;
  title: string;
  price: string;
  image: string;
};

const Cart = () => {

  const { top, bottom } = useSafeAreaInsets()

  const toast = useToast();
  const [cartItems, setCartItems] = useState<AmazonItemType[]>([]);
  const [cartTotal, setCartTotal] = useState<number | string>('0.00');
  
  useFocusEffect(
    useCallback(() => {
  
      loadCart();
    }, [])
  );

  const loadCart = () => {
    const cart = AmazonGetItems();
    setCartItems(cart);
  };
  
  const getTotalPrice = () => {
    const total = AmazonGetCartTotal(cartItems)
    setCartTotal(total);
  };
  
  useEffect(() => {
    getTotalPrice()
  }, [cartItems]);
  
  const clear = () => {
    AmazonClearItems()
    loadCart()

    toast.show("Cart Cleared", {
      type: "success",
    });
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
            clear()
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

    const goToLocation = () => {

      if(!cartTotal){
        toast.show("No valid total", {
          type: "warning",
        });
        return
      }

      router.push({
        pathname: "/(protected)/(routes)/AmazonLocation",
        params: { cartTotal }
      });
    }
    
    const renderCart = ({item, index}: {item: AmazonItemType, index: number}) => {
      return (
        <AmazonCartCard item={item} index={index} total={getTotalPrice} loadCart={loadCart} updateItem={(updatedItem: any) => {
          const newCart = cartItems.map(ci =>
            ci.asin === updatedItem.asin ? updatedItem : ci
          );
          setCartItems(newCart); // triggers FlatList re-render
        }}/>
      )
    }

    const icon = () => (
      <TouchableOpacity onPress={clearCart}>
        <MaterialCommunityIcons name="delete-forever" size={32} color="#fff" />
      </TouchableOpacity>
    )
  
    return (
      <View className='h-full bg-cyan' style={{ paddingTop: top }}>

        <SearchPlaceholder cart={getFormattedCartCount(cartItems)} showDeleteCart={true} icon={icon()} />

        <View className="flex-1 bg-white p-4">
          {cartItems.length > 0 && <CustomAmazonButton title="Proceed to checkout" handlePress={goToLocation} containerStyles="w-full mb-4" textStyles='text-black'/>}
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.asin}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ gap: 10, paddingBottom: bottom + 16}}
            renderItem={renderCart}
            ListHeaderComponent={
              cartItems.length > 0 ? (
                <View className="flex-1 mb-2 flex-row gap-2 justify-between">
                  <View className='flex-1 flex-row gap-1'>
                    <Text className="text-xl">Total:</Text>
                    <Text className='flex-1 text-xl font-abold'>{displayCurrency(Number(cartTotal), "GBP")}</Text>
                  </View>
                  <Text className='text-lg font-abold'>({getFormattedCartCount(cartItems)}) Items</Text>
                </View>
              ) : null
            }
            ListEmptyComponent={() => (
              <View>
                <View className="w-full items-center mx-auto justify-center my-6 mt-8 max-w-52 flex-1">
                  <Image source={images.cart} className='size-36' resizeMode='contain'/>
                  <Text className="text-2xl text-center mt-4 font-ablack">Your cart is empty!</Text>
                  <Text className="text-sm text-center mt-1 font-alight">All your cart items will show here.</Text>
                </View>
              </View>
            )}
          />
        </View>

      <StatusBar backgroundColor="#00ced1" style='dark'/>
    </View>
  )
}

export default Cart