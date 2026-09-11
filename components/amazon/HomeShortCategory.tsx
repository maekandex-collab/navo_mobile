import { View, Text, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import { axiosClient } from '@/globalApi'
import ProductCard from './ProductCard'
import ProductSkeleton from '../ProductSkeleton'
import { Dimensions } from 'react-native'
import stripCurrency from '@/utils/stripCurrency'
const width = Dimensions.get("window").width

// type searchType = {
//   asin: string;
//   climate_pledge_friendly: boolean;
//   currency: string;
//   delivery: string;
//   has_variations: boolean;
//   is_amazon_choice: boolean;
//   is_best_seller: boolean;
//   is_prime: boolean;
//   product_minimum_offer_price: string;
//   product_minimum_offer_price_value: number;
//   product_num_offers: number;
//   product_num_ratings: number;
//   product_original_price: string;
//   product_original_price_value: number;
//   product_photo: string;
//   product_price: string;
//   product_price_value: number;
//   product_star_rating: string;
//   product_star_rating_value: number;
//   product_title: string;
//   product_url: string;
//   sales_volume: string;
// }

type searchType = {
  asin: string; 
  createdAt: string;
  currency: string;
  id: number;
  photo: string;
  price: string; 
  query: string; 
  title: string;
  url: string;
}

let hasFetched = false;
let cachedPC: searchType[] = [];
let cachedFashion: searchType[] = [];

const HomeShortCategory = () => {

    const [pcProducts, setPcProducts] = useState<searchType[]>([]);
    const [fashionProducts, setFashionProducts] = useState<searchType[]>([]);
    const [loading, setLoading] = useState(true)
    const half = (width/2) - 21
    const dummy = new Array(4).fill(null)

    useEffect(() => {
        if (!hasFetched) {
            fetchCategories()
        } else {
            setPcProducts(cachedPC)
            setFashionProducts(cachedFashion)
            setLoading(false);
        }
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);

            const [pcRes, fashionRes] = await Promise.all([
                axiosClient.get('/amazonshop/search?query=phones'),
                axiosClient.get('/amazonshop/search?query=electronics'),
            ]);

            console.log("K",pcRes.data?.data?.products)

            const listPC = (pcRes.data?.data?.products || []).slice(0, 8)
            const listFashion = (fashionRes.data?.data?.products || []).slice(0, 8)

            const normalizedPCProducts = listPC.map((item: any) => ({
                ...item,
                product_price: stripCurrency(item.product_price),
            }));

            const normalizedFashionProducts = listFashion.map((item: any) => ({
                ...item,
                product_price: stripCurrency(item.product_price),
            }));

            hasFetched = true;
            cachedPC = normalizedPCProducts 
            cachedFashion = normalizedFashionProducts


            setPcProducts(normalizedPCProducts);
            setFashionProducts(normalizedFashionProducts);
            
        } catch (error) {

        } finally {
            setLoading(false);
        }
    }

  return (
    <View className="flex-1 px-1">
        <View className='flex-1 py-2'>
            {/* <Text className='font-abold text-xl px-3 pb-2'>Level up your PC here</Text> */}
            <Text className='font-abold text-xl px-3 pb-2'>Level up your Phones here</Text>
            {loading ? (
                <FlatList
                    data={dummy}
                    numColumns={2}
                    showsHorizontalScrollIndicator={false}
                    style={{ paddingHorizontal: 12 }}
                    columnWrapperStyle={{gap: 10, justifyContent: 'space-between', width: '100%'}}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={{gap: 10}}
                    renderItem={({ item }) => (
                        <View style={{ marginBottom: 10 }}>
                            <ProductSkeleton width={half} />
                        </View>
                    )}
                    scrollEnabled={true}
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <FlatList
                    data={pcProducts}
                    numColumns={2}
                    keyExtractor={(item) => item?.asin}
                    columnWrapperStyle={{gap: 8, justifyContent: 'space-between', width: '100%'}}
                    style={{ paddingHorizontal: 12 }}
                    renderItem={({ item }: { item: any }) => (
                        <ProductCard item={item} />
                    )}
                    ListEmptyComponent={() => (
                        <View className="items-center justify-center py-8 bg-gray-50 rounded-md">
                            <Text className="text-xl font-extrabold">
                                No Products Found
                            </Text>
                            <Text className="text-sm text-center mt-1">
                                All products will show here for you to order and ship.
                            </Text>
                        </View>
                    )}
                />
            )}
        </View>
        <View className='flex-1 py-2'>
            {/* <Text className='font-abold text-xl px-3 pb-2'>Shine brighter with your fashion faves</Text> */}
            <Text className='font-abold text-xl px-3 pb-2'>shop for your electronics</Text>
            {loading ? (
                <FlatList
                    data={dummy}
                    numColumns={2}
                    showsHorizontalScrollIndicator={false}
                    style={{ paddingHorizontal: 12 }}
                    columnWrapperStyle={{gap: 10, justifyContent: 'space-between', width: '100%'}}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={{gap: 10}}
                    renderItem={({ item }) => (
                       <View style={{ marginBottom: 10 }}>
                            <ProductSkeleton width={half} />
                        </View>
                    )}
                    scrollEnabled={true}
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <FlatList
                    data={fashionProducts}
                    numColumns={2}
                    keyExtractor={(item) => item?.asin}
                    columnWrapperStyle={{gap: 8, justifyContent: 'space-between', width: '100%'}}
                    style={{ paddingHorizontal: 12 }}
                    renderItem={({ item }: { item: any }) => (
                        <ProductCard item={item} />
                    )}
                    ListEmptyComponent={() => (
                        <View className="items-center justify-center py-8 bg-gray-50 rounded-md">
                            <Text className="text-xl font-extrabold">
                                No Products Found
                            </Text>
                            <Text className="text-sm text-center mt-1">
                                All products will show here for you to order and ship.
                            </Text>
                        </View>
                    )}
                />
            )}
        </View>
    </View>
  )
}

export default HomeShortCategory