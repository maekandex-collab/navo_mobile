import { View, Text, FlatList, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Image as ExpoImage } from 'expo-image';
import { useSkeletonCommonProps } from '@/utils/SkeletonProps';
import { axiosClient } from '@/globalApi';
import { Skeleton } from 'moti/skeleton';
import { Dimensions } from 'react-native';
import { router } from 'expo-router';
const width = Dimensions.get("window").width

type RecommendedTypes = {
  canonical_deal_url: string;
  deal_badge: string;
  deal_ends_at: string;
  deal_id: string;
  deal_photo: string;
  deal_price: {
    amount: string;
    currency: string;
  },
  deal_starts_at: string;
  deal_state: string;
  deal_title: string;
  deal_type: string;
  deal_url: string;
  list_price: {
    amount: string;
    currency: string;
  },
  product_asin: string;
  savings_amount: {
    amount: string;
    currency: string;
  },
  savings_percentage: number;
  type: string;
}

let hasFetched = false;
let cachedFeatured: RecommendedTypes[] = [];

const RecommendedProduct = () => {

    const blurhash = 'L~I64noffQfQfQfQfQfQfQfQfQfQ';
    
    const [recommended, setRecommended] = useState<RecommendedTypes[]>([])
    const [loading, setLoading] = useState(true)
    const skeletonProps = useSkeletonCommonProps();
    const dummy = new Array(4).fill(null)

    useEffect(() => {
        if (!hasFetched) {
            fetchRecommended()
        } else {
            setRecommended(cachedFeatured)
            setLoading(false);
        }
    }, []);

    const fetchRecommended = async () => {
        setLoading(true)
        try {
            const result = await axiosClient.get("/amazonshop/deals")
            const list = result.data.data.deals || []
            setRecommended(list);
            hasFetched = true;
            cachedFeatured = list 

            console.log("rec=", result.data.data.deals)
        } catch (error: any) {
            
        } finally {
            setLoading(false)
        }
    }

    const gotToProduct = (asin: string) => {
        router.push({
            pathname: "/(protected)/(routes)/AmazonProductDetails",
            params: { asin },
        });
    }

    const renderDeal = ({ item }: {item: RecommendedTypes}) => (
        <Pressable className="w-40" onPress={() => gotToProduct(item.product_asin)}>
            <View className="relative bg-gray-50 rounded-xl items-center justify-center p-6">
                <ExpoImage source={{ uri: item?.deal_photo }} placeholder={{ blurhash }} cachePolicy="disk" contentFit="contain" style={{width: "100%", height: 100 }}/>
                <View className="py-1 px-2 absolute bottom-2 left-2 rounded-md bg-red-600">
                    {item.deal_badge ? (
                        <Text className="text-white text-sm font-amedium">
                            {item.deal_badge}
                        </Text>
                    ) : (
                        <Text className="text-white text-sm font-amedium">
                            0% off
                        </Text>
                    )}
                </View>
            </View>
        </Pressable>
    );

  return (
    <View className='py-2'>
        <Text className='font-abold text-xl px-4 pb-2'>Recommended deals for you</Text>
        {loading ? (
            <FlatList
                data={dummy}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 10 }}
                keyExtractor={(item, index) => index.toString()}
                ItemSeparatorComponent={() => <View className="w-3" />}
                renderItem={({ item }) => (
                    <View style={{ width: 130 }}>
                        <Skeleton.Group show={loading}>
                            <Skeleton height={130} width={130} radius={10} {...skeletonProps} />
                        </Skeleton.Group>
                    </View>
                )}
                scrollEnabled={true}
                nestedScrollEnabled={true}
            />
        ) : (
            <FlatList
                data={recommended}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16 }}
                keyExtractor={(item, index) => item.product_asin.toString()}
                ItemSeparatorComponent={() => <View className="w-3" />}
                renderItem={renderDeal}
                scrollEnabled={true}
                nestedScrollEnabled
                ListEmptyComponent={() => (
                    <View className="items-center justify-center px-2 py-8 bg-gray-50 rounded-md" style={{width: width - 32}}>
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
  )
}

export default RecommendedProduct