import { View, Text, FlatList, Pressable, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Image as ExpoImage } from 'expo-image';
import Stars from 'react-native-stars';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import { useSkeletonCommonProps } from '@/utils/SkeletonProps';
import { axiosClient } from '@/globalApi';
import { Skeleton } from 'moti/skeleton';
const width = Dimensions.get("window").width

type FeaturedTypes = {
    asin: string; 
    product_num_ratings: number,
    product_photo: string; 
    product_price: string; 
    product_star_rating: string;
    product_title: string; 
    product_url: string; 
    rank: number; 
    rank_change_label: string | null;
}

let hasFetched = false;
let cachedFeatured: FeaturedTypes[] = [];

const FeaturedProduct = () => {

    const blurhash = 'L~I64noffQfQfQfQfQfQfQfQfQfQ';
    
    const [featured, setFeatured] = useState<FeaturedTypes[]>([])
    const [loading, setLoading] = useState(true)
    const skeletonProps = useSkeletonCommonProps();
    const dummy = new Array(4).fill(null)

    useEffect(() => {
        if (!hasFetched) {
            fetchFeatured()
        } else {
            setFeatured(cachedFeatured)
            setLoading(false);
        }
    }, []);

    const fetchFeatured = async () => {
        setLoading(true)
        try {
            const result = await axiosClient.get("/amazonshop/bestsellers")
            const features = result.data.data.best_sellers || []
            setFeatured(features);
            hasFetched = true;
            cachedFeatured = features 

            console.log("bestseller=", result.data.data.best_sellers)
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
    
    const renderDeal = ({ item }: { item: FeaturedTypes }) => (
        <Pressable className='w-40 gap-1' onPress={() => gotToProduct(item.asin)}>
            <View className="bg-gray-50 size-40 rounded-xl items-center justify-center p-3">
                <ExpoImage source={{ uri: item?.product_photo }} placeholder={{ blurhash }} cachePolicy="disk" contentFit="contain" style={{ width: "100%", height: "100%" }}/>
            </View>
            <View className="items-start gap-1">
                <Text className="font-abold" numberOfLines={2}>{item.product_title}</Text>
                <View className='items-center justify-start flex-row gap-1'>
                    <Stars
                        display={Number(item.product_star_rating)}
                        spacing={2}
                        count={5}
                        starSize={14}
                        fullStar= {<FontAwesome name="star" size={14} color="#FFA41C" />}
                        emptyStar= {<FontAwesome name="star-o" size={14} color="#D5DBDB" />}
                        halfStar={<FontAwesome name="star-half-o" size={14} color="#FFA41C" />}
                        
                    />
                    <Text className='text-xs' numberOfLines={1}>{item.product_num_ratings}</Text>
                </View>
                <Text className="font-amedium" numberOfLines={2}>{item.product_price}</Text>
            </View>
        </Pressable>
    );

  return (
    <View className='py-2'>
        <Text className='font-abold text-xl px-4 pb-2'>Best selling this season</Text>
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
                data={featured}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16 }}
                keyExtractor={(item, index) => item?.asin?.toString()}
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

export default FeaturedProduct