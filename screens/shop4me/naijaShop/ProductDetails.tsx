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
import { useToast } from 'react-native-toast-notifications';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { formatEnums } from '@/utils/formatEnums';
import NaijaShopIncrementBtn from '@/components/naija-shop/NaijaShopIncrementBtn';
import { NaijaShopAddItem, NaijaShopGetItemById, NaijaShopGetItems } from '@/utils/NaijaShopCartStorage';
import { formatCount } from '@/utils/FormatCount';
import { getFormattedCartCount } from '@/utils/getFormattedCartCount';

const ProductDetails = () => {
    const [cart, setCart] = useState<any>([]);

  const { productDetails } = useLocalSearchParams() as any;
  const product =  productDetails ? JSON.parse(productDetails) : null
  const toast = useToast();

  let isProductOnCart = NaijaShopGetItemById(product?.id);

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
     NaijaShopAddItem(product)
     
     toast.show("Item Added to Cart", {
       type: "success",
     });
     
     loadCart();
   }

   const loadCart = () => {
        isProductOnCart = NaijaShopGetItemById(product?.id);
        const items = NaijaShopGetItems();
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
                        product?.image?.map((item: string, index: number) => (
                            <Image style={{width, height: imageHeight, minHeight: 380}} resizeMode='cover' source={{uri:item}} key={index}/>
                        ))
                    }
                </View>
            </ScrollView>

            {product?.image.length === 0 && (
                <View style={{ height: 420, marginTop: -statusBarHeight }} className="w-full bg-gray-100 justify-center items-center">
                    <Text className="text-blue text-sm mt-20">No image available</Text>
                </View>
            )}

            <View className='p-4 bg-black w-full'>
                <Text className='text-white'>Ship From Navo Cargo</Text>
            </View>

            <View className='p-4 w-full bg-white'>
                <View>
                    <Text className={`text-base mb-2 font-abold ${product.productStatus === 'in_stock' ? 'text-green-500' : product.productStatus === 'out_of_stock' ? 'text-red-500' : 'text-red-500'}`}>{formatEnums(product.productStatus)}</Text>    
                    <Text className="text-xl mb-2 font-abold">{product.name}</Text>    
                    <Text className="text-2xl mb-2 font-ablack">{displayCurrency(Number(product.price), 'GBP')}</Text>    
                    <Text className="text-base mb-2 font-amedium">{product.description}</Text>
                    {product?.vendor && (
                        <View>
                            <Text className="text-base mb-2 font-abold">Product by:</Text>
                            <View className="flex-1 items-center flex-row gap-2">
                                <View className='size-9 rounded-full border bg-white items-center justify-center border-gray-100 overflow-hidden'>
                                    <Image
                                        style={{ width: "50%", height: "50%" }}
                                        source={product.vendor.name || ""}
                                        resizeMode="cover"
                                    />
                                </View>
                                <View className='items-center flex-row gap-1'>
                                    <Text className="text-base mb-2 font-amedium capitalize">{product?.vendor?.name}</Text>
                                </View>
                            </View>   
                        </View>
                    )}
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
                <View className='flex-row items-center gap-3'>
                    <TouchableOpacity onPress={() => router.push("/(protected)/(routes)/(modals)/NaijaShopSearchModal")} className={`items-center justify-center bg-white size-10 rounded-full`} style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                        elevation: 5,
                    }}>
                        <FontAwesome name="search" size={18} color="#FF6600" />
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
            </View>            
        </ScrollView>

        <View className='w-full justify-center gap-2 mt-4 px-4' style={{ marginBottom: insets.bottom + 20 }}>
            <View className='flex-row justify-between items-center'>
                {isProductOnCart ? (
                    <NaijaShopIncrementBtn id={product?.id} handleLoadCart={loadCart} showCheckout={true} otherStyles='min-w-40'/>
                ) : (
                    <View className='w-full flex-row justify-between items-center'>
                        <CustomButton title="Add to cart" handlePress={() => addToCart(product.id)} containerStyles="w-[75%]" textStyles='text-white' disableButton={product?.productStatus === 'in_stock' ? false : product?.productStatus === 'out_of_stock' ? true : false}/>
                        <TouchableOpacity onPress={() => router.push("/(protected)/(routes)/NaijaShopCart")} activeOpacity={0.7} className={`flex-row rounded-md gap-2 px-2 min-h-[48px] justify-center items-center`}>
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

export default ProductDetails