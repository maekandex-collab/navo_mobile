import { View, FlatList, Text, TouchableOpacity, Alert } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { router } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import SearchPlaceholder from "@/components/naija-shop/SearchPlaceholder";
import CustomButton from "@/components/CustomButton";
import { useFocusEffect } from "@react-navigation/native";
import { NaijaShopClearItems, NaijaShopGetCartTotal, NaijaShopGetItems } from "@/utils/NaijaShopCartStorage";
import { axiosClient } from "@/globalApi";
import { useToast } from "react-native-toast-notifications";
import displayCurrency from "@/utils/displayCurrency";
import { Image } from "react-native";
import { images } from "@/constants";
import { Skeleton } from "moti/skeleton";
import { ScrollView } from "react-native";
import { useSkeletonCommonProps } from "@/utils/SkeletonProps";
import NaijaShopCartCard from "@/components/NaijaShopCartCard";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { getFormattedCartCount } from "@/utils/getFormattedCartCount";

type ProductType = {
  id: string; 
  description: string; 
  image: string[]; 
  name: string; 
  price: string; 
  productStatus: "in_stock" | "out_of_stock"; 
  quantity: number;
}

type StoreItemType = {
  id: any
  quantity: number,
};


const Cart = () => {

  const { top, bottom } = useSafeAreaInsets()
  
  const toast = useToast();
  const { userProfile } = useSelector((state: RootState) => state.profile)
  const [cartItems, setCartItems] = useState<StoreItemType[]>([]);
  const [products, setProducts] = useState<ProductType[]>([])
  const [loading, setLoading] = useState(false)
  const loadingList = new Array(5).fill(null)
  const [cartTotal, setCartTotal] = useState<number | string>('0.00');

  const skeletonProps = useSkeletonCommonProps();
  
  useFocusEffect(
    useCallback(() => {
  
      loadCart();
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
  
      fetchData()
    }, [])
  );

    const loadCart = () => {
      const cart = NaijaShopGetItems();
      setCartItems(cart);
    };
  
    const fetchData = async () => {
      
      const cart = NaijaShopGetItems();
  
      setCartItems(cart)
      console.log("items",cartItems)
      if(cart.length > 0){
        const idArray: string[] = [];
  
        console.log("items",cartItems)
  
        cart.forEach(item => {
          
          idArray.push(item.id);
        });
    
        console.log("store1",idArray)
        const ids = idArray.join(',');
    
        setLoading(true)
        try {
          const result = await axiosClient.get(`/vendors/products/ids?ids=${ids}`)
          console.log("cart-r",result.data)
          setProducts(result.data.products);
        } catch (error: any) {
          toast.show(error.response.data.message || error.response.data.error.message,{
            type: "danger",
          });
        } finally {
          setLoading(false)
        }
        
      }else{
        setProducts([])
      }
    }
  
    const getTotalPrice = () => {
      const total = NaijaShopGetCartTotal(products)
      setCartTotal(total);
    };
  
    useEffect(() => {
      getTotalPrice()
    }, [cartItems, products]);
  
    useFocusEffect(
      useCallback(() => {
        loadCart();
        // fetchData()
      }, [])
    );
  
    const clear = () => {
      NaijaShopClearItems()
      loadCart()
      router.back()
  
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
    )
  };

    const goToLocation = () => {

      if(!cartTotal){
        toast.show("No valid total", {
          type: "warning",
        });
        return
      }

      router.push("/(protected)/(routes)/NaijaShopLocation");
    }
    
    const renderCart = ({item, index}: {item: any, index: number}) => {
      const localStore = cartItems?.filter((store: any) => store?.id === item?.id )
      console.log("local", localStore)
      return (
      <NaijaShopCartCard item={item} fetchData={fetchData} index={index} total={getTotalPrice} loadCart={loadCart}/>
    )}

    const icon = () => (
      <TouchableOpacity onPress={clearCart}>
        <MaterialCommunityIcons name="delete-forever" size={32} color="#fff" />
      </TouchableOpacity>
    )

    return (
      <View className='h-full bg-black' style={{ paddingTop: top }}>

        <SearchPlaceholder cart={getFormattedCartCount(cartItems)} showMenu={false} showDeleteCart={true} icon={icon()} />

        <View className="flex-1 bg-white">
          {
          loading ? (
              <ScrollView className="w-full my-4 px-4" showsVerticalScrollIndicator={false}>
                <Skeleton.Group show={loading}>
                  {loadingList.map((item, index) => (
                    <View className='w-full mb-4 flex-row justify-between' key={index}>
                      <Skeleton height={120} width={'100%'} {...skeletonProps} /> 
                    </View>
                  ))}
                </Skeleton.Group>
              </ScrollView>
          ) : (
            <View className="p-4">
              {products.length > 0 && <CustomButton title="Proceed to checkout" handlePress={goToLocation} containerStyles="w-full mb-4" textStyles='text-white'/>}
              <FlatList
                data={products}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ gap: 10, paddingBottom: bottom + 16}}
                renderItem={renderCart}
                ListHeaderComponent={
                  products.length > 0 ? (
                    <View className="flex-1 mb-2 flex-row gap-2 justify-between">
                      <View className='flex-1 flex-row gap-1'>
                        <Text className="text-xl">Total:</Text>
                        <Text className='flex-1 text-xl font-abold'>{displayCurrency(Number(cartTotal), userProfile.countryOfResidence === "Nigeria" ? "NGN" : "GBP")}</Text>
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
          )}
        </View>

    </View>
  )
}

export default Cart