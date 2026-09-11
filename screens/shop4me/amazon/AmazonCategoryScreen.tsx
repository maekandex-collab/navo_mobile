import { View, TextInput, FlatList, Text, TouchableOpacity, Pressable, ActivityIndicator, Dimensions } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Image as ExpoImage } from 'expo-image';
import Stars from "react-native-stars";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { StatusBar } from "expo-status-bar";
import { axiosClient } from "@/globalApi";
import { Toast } from "react-native-toast-notifications";
import SearchPlaceholder from "@/components/amazon/SearchPlaceholder";
import { MasonryFlashList } from "@shopify/flash-list";
import { Skeleton } from "moti/skeleton";
import { useSkeletonCommonProps } from "@/utils/SkeletonProps";
import ProductSkeleton from "@/components/ProductSkeleton";
import { useFocusEffect } from "@react-navigation/native";
import { AmazonGetItems } from "@/utils/AmazonCartStorage";
import { getFormattedCartCount } from "@/utils/getFormattedCartCount";
import displayCurrency from "@/utils/displayCurrency";
import stripCurrency from "@/utils/stripCurrency";
const width = Dimensions.get("window").width

type AmazonItemType = {
  asin: any
  quantity: number,
};

type searchType = {
  asin: string;
  climate_pledge_friendly: boolean;
  currency: string;
  delivery: string;
  has_variations: boolean;
  is_amazon_choice: boolean;
  is_best_seller: boolean;
  is_prime: boolean;
  product_minimum_offer_price: string;
  product_minimum_offer_price_value: number;
  product_num_offers: number;
  product_num_ratings: number;
  product_original_price: string;
  product_original_price_value: number;
  product_photo: string;
  product_price: string;
  product_price_value: number;
  product_star_rating: string;
  product_star_rating_value: number;
  product_title: string;
  product_url: string;
  sales_volume: string;
}

let categoryCache: { [key: string]: searchType[] } = {};
let categoryFetched: { [key: string]: boolean } = {};

export default function AmazonCategoryScreen() {

  const blurhash = 'L~I64noffQfQfQfQfQfQfQfQfQfQ';
    
  const { category } = useLocalSearchParams() as any;
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<searchType[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false)
  const skeletonProps = useSkeletonCommonProps();
  const half = (width/2) - 24
  const dummy = new Array(3).fill(null)
  const [cart, setCart] = useState<AmazonItemType[]>([]);

  const { top, bottom } = useSafeAreaInsets()

  useEffect(() => {
    if (!category) return;

    if (!categoryFetched[category]) {
      getCategory()
    } else {
      // load cached products for this category
      setProducts(categoryCache[category]);
      setLoading(false);
    }
  }, [category]);

  const getCategory = async () => {
    
    setLoading(true)

    try {

      const result = await axiosClient.get(`/amazonshop/search?query=${category}`)

      const rawProducts = result.data?.data?.products || [];

      const normalizedProducts = rawProducts.map((item: any) => ({
        ...item,
        product_price: stripCurrency(item.product_price),
      }));
            
      // cache per category
      categoryFetched[category] = true;
      categoryCache[category] = normalizedProducts;

      setProducts(normalizedProducts);

      console.log("search=",result.data?.data?.products)

    } catch (error: any) {
      Toast.show(error.response.data.message || error.response.data.error.message,{
        type: "danger",
      });
    } finally {
      setLoading(false)
    }
  };

  const loadMore = async () => {
    console.log("trying to loadingmore...")
    if (isLoadingMore || !hasMore || products.length < 20) return;
    console.log("loadingmore...")
    setIsLoadingMore(true);

    try {
      const nextPage = page + 1;

      const result = await axiosClient.get(`/amazonshop/search?query=${category}&page=${nextPage}&limit=20`);

      const rawProducts = result.data?.data?.products || [];

      const normalizedProducts = rawProducts.map((item: any) => ({
        ...item,
        product_price: stripCurrency(item.product_price),
      }));

      if (normalizedProducts.length < 20) {
        setHasMore(false); // No more data
      }

      setProducts((prev: any) => [...prev, ...normalizedProducts]);
      setPage(nextPage);
      
    } catch (err) {
      console.error("Failed to load more", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

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

  const gotToProduct = (asin: string) => {
    router.push({
      pathname: "/(protected)/(routes)/AmazonProductDetails",
      params: { asin }
    });
  }

  return (
    <View className='h-full bg-cyan' style={{ paddingTop: top }}>
      <SearchPlaceholder cart={getFormattedCartCount(cart)}/>

      <View className="flex-1 bg-white">
        {loading ? (
          <View className="w-full justify-center p-4">
            <Skeleton.Group show={loading}>
              {dummy.map((Item, index) => (
                <View key={index} className='w-full mb-4 flex-row items-center justify-between gap-3'>
                  <ProductSkeleton width={half}/>
                  <ProductSkeleton width={half}/>
                </View>
              ))}
            </Skeleton.Group>
          </View>
        ) : (
          <View className="flex-1 px-1">
            <MasonryFlashList
                data={products}
                keyExtractor={(item) => item?.asin}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: 6, paddingBottom: bottom + 16 }}
                numColumns={2}
                estimatedItemSize={200}
                renderItem={({ item }: { item: any }) => (
                    <TouchableOpacity
                      activeOpacity={0.9}
                      className="m-1 w-full"
                      onPress={() => gotToProduct(item?.asin)}
                    >
                        <View className="w-full p-2 bg-gray-50" style={{ width: "100%", height: Math.random() * 100 + 150 }}>
                          <ExpoImage source={{ uri: item?.product_photo }} placeholder={{ blurhash }} cachePolicy="disk" contentFit="contain" style={{ width: "100%", height: "100%" }}/>
                        </View>
                        <View className="w-full flex-1 items-start gap-1">
                            <Text className="font-abold" numberOfLines={2}>{item?.product_title}</Text>
                            {/* <View className='items-center justify-start flex-row gap-1'>
                                <Stars
                                    display={Number(item?.product_star_rating)}
                                    spacing={2}
                                    count={5}
                                    starSize={14}
                                    fullStar= {<FontAwesome name="star" size={14} color="#FFA41C" />}
                                    emptyStar= {<FontAwesome name="star-o" size={14} color="#D5DBDB" />}
                                    halfStar={<FontAwesome name="star-half-o" size={14} color="#FFA41C" />}
                                    
                                />
                                <Text className='text-xs' numberOfLines={1}>({item?.product_num_ratings})</Text>
                            </View> */}
                            <Text className="font-amedium text-xl" numberOfLines={2}>
                              {displayCurrency(Number(item?.product_price), "GBP")}
                              {" "}
                              <Text className='line-through text-base text-gray-400'>{item?.product_original_price}</Text> 
                            </Text>
                            {/* <Text className='text-xs' numberOfLines={1}>{item?.sales_volume}</Text> */}
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={() => (
                  <View className="items-center justify-center py-8">
                    <Text className="text-2xl font-extrabold">
                      No Products Found
                    </Text>
                    <Text className="text-sm text-center mt-1">
                      All products will show here for you to order and ship.
                    </Text>
                  </View>
                )}
                onEndReached={loadMore}
                onEndReachedThreshold={0.4}
                ListFooterComponent={() => {
                  if (isLoadingMore) {
                    return (
                      <View className='items-center p-4'>
                        <ActivityIndicator size="small" color="#003366" />
                        <Text className='text-blue text-amedium text-sm mt-1'>Loading more...</Text>
                      </View>
                    );
                  }
      
                  if (!hasMore && products.length > 19) {
                    return (
                      <View className='items-center p-4'>
                        <Text className='text-black text-amedium text-sm'>No more Data!</Text>
                      </View>
                    );
                  }
      
                  return null;
                }}
            />
          </View>
        )}
      </View>

      <StatusBar backgroundColor="#00ced1" style='dark'/>
    </View>
  );
}
