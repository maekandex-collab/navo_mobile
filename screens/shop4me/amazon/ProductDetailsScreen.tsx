import { View, Text, Pressable, TextInput, StyleSheet, Image, Linking } from 'react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { FlatList } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import Stars from 'react-native-stars'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import ProductDetailCarousel from '@/components/amazon/ProductDetailCarousel'
import { TouchableOpacity } from 'react-native'
import Entypo from '@expo/vector-icons/Entypo'
import CustomButtomSheet from '@/components/CustomButtomSheet'
import AntDesign from '@expo/vector-icons/AntDesign'
import { BottomSheetFlatList, BottomSheetModal, BottomSheetTextInput } from '@gorhom/bottom-sheet'
import CustomAmazonButton from '@/components/CustomAmazonButton'
import SearchPlaceholder from '@/components/amazon/SearchPlaceholder'
import { useLocalSearchParams } from 'expo-router'
import { axiosClient } from '@/globalApi'
import { useSkeletonCommonProps } from '@/utils/SkeletonProps'
import { images } from '@/constants'
import { Skeleton } from 'moti/skeleton'
import displayCurrency from '@/utils/displayCurrency'
import { Alert } from 'react-native'
import { AmazonAddItem, AmazonGetItems, AmazonRandomAddItem } from '@/utils/AmazonCartStorage'
import { useFocusEffect } from '@react-navigation/native'
import { useToast } from 'react-native-toast-notifications'
import { router } from 'expo-router'
import { getFormattedCartCount } from '@/utils/getFormattedCartCount'
import Ionicons from '@expo/vector-icons/Ionicons'
import stripCurrency from '@/utils/stripCurrency'

type AmazonItemType = {
  asin: any
  quantity: number,
};

type ProductVariation = {
  configuration: string;
  size: string;
  style: string;
};

type ProductDetailsTypes = {
  about_product: string[];
  all_product_variations: Record<string, ProductVariation>;
  product_photos: string[];
  aplus_images: string[];
  asin: string;
  sales_volume: string;
  deal_badge: string;
  brand: string;
  category: {
    id: string;
    name: string;
  },
  category_path: {
    id: string;
    link: string;
    name: string;
  }[];
  climate_pledge_friendly: false,
  country: string;
  coupon_code: string;
  coupon_discount_percentage: number;
  currency: string;
  has_aplus: boolean;
  is_best_seller: boolean;
  product_availability: string;
  product_byline: string;
  product_description: string;
  product_details: {
    [key: string]: string;
  };
  product_information: {
    [key: string]: string;
  };
  product_num_ratings: number;
  product_original_price: string;
  product_photo: string;
  product_price: string;
  product_star_rating: string;
  product_title: string;
  product_url: string;
  rating_distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  },
  review_summary: string;
  video_thumbnail: string;
  product_videos: {
    title: string;
    thumbnail_url: string;
    video_url: string;
  }[];
  customers_say: string;
  top_reviews: {
    review_title: string;
    review_star_rating: string;
    review_comment: string;
    review_author: string;
    review_date: string;
 }[];
}

let productCache: { [key: string]: ProductDetailsTypes | null } = {};
let productFetched: { [key: string]: boolean } = {};

const ProductDetailsScreen = () => {

    const { asin } = useLocalSearchParams() as any;
    const toast = useToast();
    const { top, bottom } = useSafeAreaInsets()
    const snapPoints = useMemo(() => ["70%"], [])
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const availableQuantity = Array.from({ length: 30 }, (_, i) => i + 1);
    const [quantity, setQuantity] = useState(1)
    const [details, setDetails] = useState<ProductDetailsTypes | null>(null)
    const [loading, setLoading] = useState(true)
    const skeletonProps = useSkeletonCommonProps();
    const [cart, setCart] = useState<AmazonItemType[]>([]);
    

    const  handleQuantity = (quantity: number) => {
        setQuantity(quantity);
        handleCloseModalPress()
    }

    useEffect(() => {
        if (!asin) return;

        if (!productFetched[asin]) {
            fetchDetails();
        } else {
            setDetails(productCache[asin]);
            setLoading(false);
        }
    }, [asin]);

    const fetchDetails = async () => {
        setLoading(true)
        try {
            const result = await axiosClient.get(`/amazonshop/details/${asin}`)

            const list = result.data.data || {}

            const normalizedProduct = {
                ...list,
                product_price: stripCurrency(list.product_price),
                product_original_price: stripCurrency(list.product_original_price)
            };
            
            productFetched[asin] = true;
            productCache[asin] = normalizedProduct;

            setDetails(normalizedProduct);

            console.log("details=", result.data.data || {})
        } catch (error: any) {
            toast.show(error.response.data.message || error.response.data.error.message,{
                type: "danger",
            });
        } finally {
            setLoading(false)
        }
    }

    const openLink = async (url: string) => {

        const supported = await Linking.canOpenURL(url);

        if (supported) {
            await Linking.openURL(url);
        } else {
            Alert.alert('Error', 'Unable to open the link');
        }

    };

    const handlePresentModalPress = useCallback(() => {
        bottomSheetModalRef.current?.present();
    }, []);

    const handleCloseModalPress = useCallback(() => {
        bottomSheetModalRef.current?.dismiss()
    }, []);
    
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

    const addToCart = (details: ProductDetailsTypes | null) => {

        if(!details) return; 

        const product = {
            asin: asin || details.asin,
            quantity,
            title: details.product_title,
            price: details.product_price,
            image: details.product_photo
        }
        
        AmazonRandomAddItem(product)
        
        toast.show("Item Added to Cart", {
            type: "success",
        });
        
        loadCart();
    }

    const buyNow = (details: ProductDetailsTypes | null) => {

        if(!details) return; 

        const product = {
            asin: asin || details.asin,
            quantity,
            cartTotal: Number(details.product_price) * quantity
        }
    
        router.push({
            pathname: "/(protected)/(routes)/AmazonLocation", 
            params: { productDetails: JSON.stringify(product) }
        })
    }

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
                        {loading ? (
                            <View className="w-full justify-center p-4">
                                <Skeleton.Group show={loading}>
                                    <View className='w-full mb-4 flex-row flex-wrap items-center gap-3'>
                                        <Skeleton height={36} width={36} radius={18} {...skeletonProps} />
                                        <Skeleton height={20} width={100} {...skeletonProps} />
                                    </View>
                                    <View className='w-full mb-4 gap-2 items-center'>
                                        <Skeleton height={20} width={'100%'} {...skeletonProps} />
                                        <Skeleton height={20} width={'100%'} {...skeletonProps} />
                                        <Skeleton height={20} width={'100%'} {...skeletonProps} />
                                    </View>
                                    <View className='w-full mb-4'>
                                        <Skeleton height={300} width={'100%'} {...skeletonProps} /> 
                                    </View>
                                    <View className='w-full mb-4 flex-row items-center justify-center gap-3'>
                                        <Skeleton height={10} width={10} radius={5} {...skeletonProps} />
                                        <Skeleton height={10} width={10} radius={5} {...skeletonProps} />
                                        <Skeleton height={10} width={10} radius={5} {...skeletonProps} />
                                    </View>
                                    <View className="w-full mb-4 justify-between gap-3">
                                        <Skeleton height={20} width={100} {...skeletonProps} />
                                        <Skeleton height={20} width={180} {...skeletonProps} />
                                    </View>
                                    <View className='w-full gap-2 items-center'>
                                        <Skeleton height={20} width={'100%'} {...skeletonProps} />
                                        <Skeleton height={20} width={'100%'} {...skeletonProps} />
                                        <Skeleton height={20} width={'100%'} {...skeletonProps} />
                                    </View>
                                </Skeleton.Group>
                            </View>
                        ) : (
                            <View>
                                {!details ? (
                                    <View className="items-center justify-center py-8 my-6 mx-4 bg-gray-50 rounded-md">
                                        <Text className="text-xl font-extrabold">
                                            Something went wrong
                                        </Text>
                                        <Text className="text-sm text-center mt-1">
                                            The details of the product will show here.
                                        </Text>
                                        <TouchableOpacity activeOpacity={0.8} className='mt-4' onPress={fetchDetails}>
                                            <Ionicons name="refresh-sharp" size={30} color="black" />
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <View className='gap-3 pt-6'>
                                        <View className='px-4 gap-2'>
                                            <View className='flex-row gap-5 justify-between items-center'>
                                                <View className="flex-1 items-center flex-row gap-2">
                                                    <View className='size-9 rounded-full border bg-white items-center justify-center border-gray-100'>
                                                        <Image
                                                            style={{ width: "50%", height: "50%" }}
                                                            source={images.tag}
                                                            resizeMode="cover"
                                                        />
                                                    </View>
                                                    <View className='items-center flex-row gap-1'>
                                                        <Text className="font-abold text-base capitalize">{details?.brand || details?.product_details["Manufacturer"] || details?.product_details["Brand"] || details?.product_information["Brand"] || details?.product_information["Manufacturer"]}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                            <Text>{details?.product_title}</Text>
                                            <View className='items-center justify-start flex-row gap-1'>
                                                <Text className='text-xs'>{details?.product_star_rating}</Text>
                                                <Stars
                                                    display={Number(details?.product_star_rating)}
                                                    spacing={2}
                                                    count={5}
                                                    starSize={12}
                                                    fullStar= {<FontAwesome name="star" size={12} color="#FFA41C" />}
                                                    emptyStar= {<FontAwesome name="star-o" size={12} color="#D5DBDB" />}
                                                    halfStar={<FontAwesome name="star-half-o" size={12} color="#FFA41C" />}
                                                    
                                                />
                                                <Text className='text-xs' numberOfLines={1}>({details?.product_num_ratings})</Text>
                                            </View>
                                            {details?.sales_volume && <Text>{details?.sales_volume}</Text>}
                                        </View>
                                        <View>
                                            <ProductDetailCarousel images={details?.product_photos || details?.aplus_images || []}/>
                                        </View>
                                        {details?.deal_badge && (
                                            <View className="py-1 px-2 mx-4 rounded-md bg-red-600 self-start">
                                                <Text className="text-white text-sm font-amedium">
                                                    {details?.deal_badge}
                                                </Text>
                                            </View>
                                            )
                                        }
                                        <View className='px-4 gap-2'>
                                            <Text className="font-aregular text-3xl">
                                                {/* <Text className='text-red-600'>-20%</Text>  */}
                                                <Text className='font-abold'>{displayCurrency(Number(details?.product_price), "GBP")}</Text>
                                            </Text>
                                            {details?.product_original_price && (
                                                <Text className="font-aregular text-lg">
                                                    <Text className="text-gray-900">Original Price: </Text> 
                                                    <Text className='line-through'>{displayCurrency(Number(details?.product_original_price), "GBP")}</Text>
                                                </Text>
                                            )}
                                            {
                                                details?.product_availability === "Available now" || details?.product_availability === "In stock" ? (
                                                    <Text className='font-amedium text-xl capitalize text-green-600'>{details?.product_availability}</Text>
                                                ) : (
                                                    <Text className='font-amedium text-xl capitalize'>{details?.product_availability}</Text>
                                                )
                                            }
                                            <TouchableOpacity activeOpacity={0.8} onPress={handlePresentModalPress} className='flex-row items-center justify-between border border-gray-200 bg-inputBg px-4 gap-2 rounded-md h-14 w-full'>
                                                <View className='flex-row gap-2 items-center'>
                                                    <Text className={`text-xl font-amedium text-black`} numberOfLines={1}>Quantity: {quantity}</Text>
                                                </View>
                                                <Entypo name="chevron-down" size={22} color="#003366" />
                                            </TouchableOpacity>
                                            <CustomAmazonButton title="Add to Cart" handlePress={() => addToCart(details)} containerStyles="w-full mt-2" textStyles='text-black'/>
                                            <CustomAmazonButton title="Buy Now" handlePress={() => buyNow(details)} containerStyles="w-full mt-2" bgColor='bg-amazonGold' textStyles='text-black'/>
                                        </View>
                                        <View className='border-y border-gray-200 p-3 mt-4'>
                                            <Text className='font-abold text-2xl'>Product details</Text>
                                        </View>
                                        <View className='px-4'>
                                            {Object.entries(details?.product_information || details?.product_details || {}).map(([key, value], index) => {
                                                // Extract the first number safely
                                                const firstNumber = value.match(/[\d.]+/)?.[0] || "0";
            
                                                // Clean up multiple spaces/newlines
                                                const cleaned = value.replace(/\s+/g, " ").trim();
            
                                                // Split the "ratings" part (e.g., "3,966 ratings") from the rest
                                                const [mainText, ratingsText] = cleaned.split(/(\d[\d,]* ratings)/).filter(Boolean);
            
                                                return (
                                                    <View key={index} className="mb-2">
                                                        <Text className="font-abold">{key}</Text>
            
                                                        {key === "Customer reviews" ? (
                                                            <View>
                                                                {/* First line: stars + main text */}
                                                                <View className="flex-row items-center gap-2">
                                                                    <Stars
                                                                        display={Number(firstNumber)}
                                                                        spacing={2}
                                                                        count={5}
                                                                        starSize={12}
                                                                        fullStar={<FontAwesome name="star" size={12} color="#FFA41C" />}
                                                                        emptyStar={<FontAwesome name="star-o" size={12} color="#D5DBDB" />}
                                                                        halfStar={<FontAwesome name="star-half-o" size={12} color="#FFA41C" />}
                                                                    />
                                                                    <Text ellipsizeMode="tail">
                                                                        {mainText.replace(firstNumber, "").trim()}
                                                                    </Text>
                                                                </View>
            
                                                                    {/* Second line: number of ratings */}
                                                                    {ratingsText && <Text>{ratingsText}</Text>}
                                                                </View>
                                                            ) : (
                                                                <Text>{value}</Text>
                                                            )
                                                        }
                                                    </View>
                                                );
                                            })}
                                        </View>
                                        <View className='px-4'>
                                            {Array.isArray(details?.about_product) ? (
                                                details.about_product.map((item, index) => (
                                                    <View key={index} className="mb-2">
                                                        <Text className="font-amedium">• {item}</Text>
                                                    </View>
                                                ))
                                            ) : (
                                                <Text>{details?.about_product}</Text>
                                            )}
                                        </View>
                                        {details?.product_url && (
                                            <View className='px-4'>
                                                <TouchableOpacity onPress={() => openLink(details?.product_url)}>
                                                    <Text className='text-abold text-red-600'>View this product directly on amazon website</Text>
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                        {typeof details?.about_product === 'string' && details?.about_product && (
                                            <View>
                                                <View className='border-y border-gray-200 p-3 mt-4'>
                                                    <Text className='font-abold text-2xl'>Product description</Text>
                                                </View>
                                                <Text className="px-4">{details.about_product}</Text>
                                            </View>
                                        )}
                                        {details?.customers_say && (
                                                <View>
                                                    <View className='border-y border-gray-200 p-3'>
                                                        <Text className='font-abold text-2xl'>Customer reviews</Text>
                                                    </View>
                                                    <View className='p-4'>
                                                        {Object.entries(details?.product_information || details?.product_details || {}).map(([key, value], index) => {
                                                            // Extract the first number safely
                                                            const firstNumber = value.match(/[\d.]+/)?.[0] || "0";
                    
                                                            // Clean up multiple spaces/newlines
                                                            const cleaned = value.replace(/\s+/g, " ").trim();
                    
                                                            // Split the "ratings" part (e.g., "3,966 ratings") from the rest
                                                            const [mainText, ratingsText] = cleaned.split(/(\d[\d,]* ratings)/).filter(Boolean);
                    
                                                            return (
                                                                <View key={index}>
                                                                    {key === "Customer reviews" && (
                                                                        <View>
                                                                            {/* First line: stars + main text */}
                                                                            <View className="flex-row items-center gap-2">
                                                                                <Stars
                                                                                    display={Number(firstNumber)}
                                                                                    spacing={2}
                                                                                    count={5}
                                                                                    starSize={12}
                                                                                    fullStar={<FontAwesome name="star" size={12} color="#FFA41C" />}
                                                                                    emptyStar={<FontAwesome name="star-o" size={12} color="#D5DBDB" />}
                                                                                    halfStar={<FontAwesome name="star-half-o" size={12} color="#FFA41C" />}
                                                                                />
                                                                                <Text ellipsizeMode="tail">
                                                                                    {mainText.replace(firstNumber, "").trim()}
                                                                                </Text>
                                                                            </View>
                    
                                                                                {/* Second line: number of ratings */}
                                                                                {ratingsText && <Text>{ratingsText}</Text>}
                                                                            </View>
                                                                        )}
                                                                </View>
                                                            );
                                                        })}
                                                    </View>
                                                    <View className='px-4 gap-4'>
                                                        <View>
                                                            <Text className="font-abold text-xl">Customer says</Text>
                                                            <Text>{details?.customers_say}</Text>
                                                        </View>
                                                        {details?.top_reviews && (
                                                            <View className='gap-4'>
                                                                <Text className="font-abold text-xl">Top reviews</Text>
                                                                <View className='gap-6'>
                                                                    {(details?.top_reviews || []).map((item, index) => (
                                                                            <View key={index} className='gap-1'>
                                                                                <View className='flex-row gap-2 items-center'>
                                                                                    <View className='size-9 rounded-full'>
                                                                                        <Image source={images.userGray} className="w-9 h-9" resizeMode='cover'/>
                                                                                    </View>
                                                                                    <Text className='font-amedium'>{item?.review_author}</Text>
                                                                                </View>
                                                                                <View className='items-center justify-start flex-row gap-1'>
                                                                                    <Stars
                                                                                        display={Number(item?.review_star_rating)}
                                                                                        spacing={2}
                                                                                        count={5}
                                                                                        starSize={16}
                                                                                        fullStar= {<FontAwesome name="star" size={16} color="#FFA41C" />}
                                                                                        emptyStar= {<FontAwesome name="star-o" size={16} color="#FFA41C" />}
                                                                                        halfStar={<FontAwesome name="star-half-o" size={16} color="#FFA41C" />}
                                                                                        
                                                                                    />
                                                                                    <Text className='text-xs text-yellow-600 font-abold' numberOfLines={1}>Verified Purchase</Text>
                                                                                </View>
                                                                                <Text className='font-abold'>{item?.review_title}</Text>
                                                                                <Text className='text-gray-300'>{item?.review_date}</Text>
                                                                                <Text>{item?.review_comment}</Text>
                                                                            </View>
                                                                        ))
                                                                    }
                                                                </View>
                                                                {details?.rating_distribution && (
                                                                    <View className='gap-4'>
                                                                        <Text className='font-amedium'>Rate distribution</Text>
                                                                        {Object.entries(details?.rating_distribution || {}).map(([key, value], index) => (
                                                                                <View key={index} className="flex-row gap-1 items-center">
                                                                                    <Text className={`w-20 ${value == 0 ? "text-black" : "text-blue"}`}>{key} star</Text>
                                                                                    <View className="flex-1 h-6 bg-gray-100 rounded-[4px] overflow-hidden">
                                                                                        <View
                                                                                            className="h-full bg-amazonGold"
                                                                                            style={{ width: `${value}%` }}
                                                                                        />
                                                                                    </View>
                                                                                    <Text className={`w-16 text-right ${value == 0 ? "text-black" : "text-blue"}`}>{value}%</Text>
                                                                                </View>
                                                                            ))
                                                                        }
                                                                    </View>
                                                                )}
                                                            </View>
                                                        )}
                                                    </View>
                                                </View>
                                            )
                                        }
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                )}
                contentContainerStyle={{
                    paddingBottom: bottom + 16
                }}
                nestedScrollEnabled
            />
            </View>

        <CustomButtomSheet ref={bottomSheetModalRef} snapPoints={snapPoints}  enablePenDown={false} dynamicSizing={false} scrollable>
            <View className='h-full'>
                <View className='flex-row w-full items-center justify-between gap-1 mb-3'>
                    <View className='w-8'/>
                    <Text className="text-sm text-center text-gray-100 font-abold">Select quantity</Text>
                    <TouchableOpacity onPress={handleCloseModalPress}>
                        <AntDesign name="closecircleo" size={30} color="#003366" />
                    </TouchableOpacity>
                </View>

                <View className={`bg-inputBg border-2 mb-3 gap-2 border-inputBg w-full h-14 px-3 rounded-md focus:border-orange-300 items-center justify-center flex-row`}>
                    <Text>Quantity :</Text>
                    <BottomSheetTextInput className={`bg-inputBg flex-1 text-black font-aregular text-base`} placeholder={'Please enter your quantity'} placeholderTextColor="#ccc" keyboardType='decimal-pad' onChangeText={(e) => setQuantity(Number(e))}/>
                </View>
        
                <BottomSheetFlatList
                    data={availableQuantity}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <Pressable onPress={() => handleQuantity(item)} className='py-3 border-b border-gray-100'>
                            <Text className='text-xl'>{item}</Text>
                        </Pressable>
                    )}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </CustomButtomSheet>

        <StatusBar backgroundColor="#00ced1" style='dark'/>
    </View>
  )
}

export default ProductDetailsScreen