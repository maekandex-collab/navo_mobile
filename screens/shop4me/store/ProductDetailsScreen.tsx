import { View, Text, ScrollView, Dimensions, ImageBackground, Image, SafeAreaView } from 'react-native'
import React, { useCallback, useState } from 'react'
import { useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native'
import CustomButton from '@/components/CustomButton';
import Feather from '@expo/vector-icons/Feather';
import { TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Entypo from '@expo/vector-icons/Entypo';
import displayCurrency from '@/utils/displayCurrency';
import { StoreAddItem, StoreGetItemById, StoreGetItems } from '@/utils/CartStorage';
import { useToast } from 'react-native-toast-notifications';
import StoreIncrementBtn from '@/components/StoreIncrementBtn';
import { getFormattedCartCount } from '@/utils/getFormattedCartCount';

const ProductDetailsScreen = () => {
    const [cart, setCart] = useState<any>([]);

  const { productDetails } = useLocalSearchParams() as any;
  const product =  productDetails ? JSON.parse(productDetails) : null
  const toast = useToast();

  let isProductOnCart = StoreGetItemById(product?.id);

  console.log("id", isProductOnCart)

  const insets = useSafeAreaInsets();
    const statusBarHeight = insets.top;

  const { width, height} = Dimensions.get("window")
  const imageHeight = (width * 100) / 100;

  const addToCart = (id: any) => {
     const product = {
       id: id,
       quantity: 1
     }
     StoreAddItem(product)
     
     toast.show("Item Added to Cart", {
       type: "success",
     });
     
     loadCart();
   }

   const loadCart = () => {
        isProductOnCart = StoreGetItemById(product?.id);
        const items = StoreGetItems();
        setCart(items);
    };

    useFocusEffect(
        useCallback(() => {
    
        loadCart();
        }, [])
    );

  return (
    <View className='bg-white flex-1 relative w-full'>
        <ScrollView showsVerticalScrollIndicator={false}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}> 
                <View className='flex-row gap-1 w-full'>
                    {
                        product.image.map((item: string, index: number) => (
                            <Image style={{width, height: imageHeight,  marginTop: -statusBarHeight, minHeight: 380}} resizeMode='cover' source={{uri:item}} key={index}/>
                        ))
                    }
                </View>
            </ScrollView>

            {product?.image.length === 0 && (
                <View style={{ height: 420, marginTop: -statusBarHeight }} className="w-full bg-gray-100 justify-center items-center">
                    <Text className="text-blue text-sm mt-20">No image available</Text>
                </View>
            )}

            <View className='px-4 w-full pt-6 rounded-t-[30px] -mt-11 min-h-[73vh] bg-white z-10' style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 4,
                minHeight: (height - imageHeight) + (statusBarHeight + 44)
            }}>
                <View>
                    <Text className={`text-base mb-2 font-abold ${product.productStatus === 'in_stock' ? 'text-green-500' : product.productStatus === 'out_of_stock' ? 'text-red-500' : 'text-red-500'}`}>{product.productStatus === 'in_stock' ? 'In Stock' : product.productStatus === 'out_of_stock' ? 'Out of Stock' : 'Out of Stcok'}</Text>    
                    <Text className="text-xl text-blue mb-2 font-abold">{product.name}</Text>    
                    <Text className="text-2xl text-blue mb-2 font-ablack">{displayCurrency(Number(product.price), 'GBP')}</Text>    
                    <Text className="text-base text-blue mb-2 font-amedium">{product.description}</Text>    
                </View>

            </View>

            <View style={{ position: 'absolute', top: statusBarHeight + 20, width: width}} className='flex-row items-center px-4 justify-between z-50'>
                <TouchableOpacity onPress={() => router.back()} className={`items-center justify-center bg-white size-10 rounded-full`} style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                }}>
                    <Entypo name="chevron-left" size={30} color="#FF6600" />
                </TouchableOpacity>
                <View className={`items-center justify-center bg-white size-10 rounded-full`} style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                }}>
                    <MaterialCommunityIcons name="swap-horizontal" size={30} color="#FF6600" />
                </View>
            </View>            
        </ScrollView>

        <View className='w-full justify-center gap-2 mt-4 px-4' style={{ marginBottom: insets.bottom + 20 }}>
            <View className='flex-row justify-between items-center'>
                {isProductOnCart ? (
                    <StoreIncrementBtn id={product?.id} handleLoadCart={loadCart} showCheckout={true} otherStyles='min-w-40'/>
                ) : (
                    <View className='w-full flex-row justify-between items-center'>
                        <CustomButton title="Add to cart" handlePress={() => addToCart(product.id)} containerStyles="w-[75%]" textStyles='text-white' disableButton={product?.productStatus === 'in_stock' ? false : product?.productStatus === 'out_of_stock' ? true : false}/>
                         <TouchableOpacity onPress={() => router.push("/(protected)/(routes)/StoreCart")} activeOpacity={0.7} className={`flex-row rounded-md gap-2 px-2 min-h-[48px] justify-center items-center`}>
                            <View className='relative items-center justify-center border border-orange rounded-lg min-h-[48px] px-4 py-2'>
                                <Feather name="shopping-cart" size={24} color="#003366" />
                                <Text className='absolute right-1 top-1 p-1 rounded-full bg-orange text-center text-white text-xs min-w-6 min-h-6' numberOfLines={1}>{getFormattedCartCount(cart)}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                )}
               
            </View>
        </View>
    </View>
  )
}

export default ProductDetailsScreen