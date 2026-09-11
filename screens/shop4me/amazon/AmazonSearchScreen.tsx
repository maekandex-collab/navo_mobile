import { View, TextInput, FlatList, Text, TouchableOpacity, Pressable, ActivityIndicator } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { router } from "expo-router";
import Search from "@/components/amazon/Search";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image as ExpoImage } from 'expo-image';
import Stars from "react-native-stars";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { StatusBar } from "expo-status-bar";
import { axiosClient } from "@/globalApi";
import { Toast } from "react-native-toast-notifications";
import AmazonIncrementBtn from "@/components/amazon/AmazonIncrementBtn";
import { useFocusEffect } from "@react-navigation/native";
import { AmazonAddItem, AmazonGetItemByAsin, AmazonGetItems } from "@/utils/AmazonCartStorage";
import { getFormattedCartCount } from "@/utils/getFormattedCartCount";
import displayCurrency from "@/utils/displayCurrency";
import stripCurrency from "@/utils/stripCurrency";

type AmazonItemType = {
  asin: any
  quantity: number
};

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
  product_photo: string;
  product_price: string; 
  product_original_price: string;
  query: string; 
  product_title: string;
  url: string;
}

export default function AmazonSearchScreen() {

  const blurhash = 'L~I64noffQfQfQfQfQfQfQfQfQfQ';
    
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<searchType[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchStarted, setSearchStarted] = useState(false)
  const { top, bottom } = useSafeAreaInsets()

  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false)
  const [cart, setCart] = useState<AmazonItemType[]>([]);

  const suggestions = ["iPhones", "Samsung TV", "Sneakers", "Headphones", "kitchen", "bags", "skin care", "electronic tablets"];

  useEffect(() => {

    if(!searchStarted){
      setProducts([])
    }

    if (search) {
      const handler = setTimeout(() => {
        console.log("q", search)
        performSearch(search);
      }, 500);
  
      return () => clearTimeout(handler);
    }
  }, [search]);


  const performSearch = async (searchTerm: string) => {
    
    setLoading(true)

    try {

      console.log("searchterm=",searchTerm)
      const result = await axiosClient.get(`/amazonshop/search?query=${searchTerm}`);

      const rawProducts = result.data?.data?.products || [];

      const normalizedProducts = rawProducts.map((item: any) => ({
        ...item,
        product_price: stripCurrency(item.product_price),
      }));

      setProducts(normalizedProducts);

      console.log("search=",result.data.data)
      console.log("norm=",normalizedProducts)

    } catch (error: any) {
      Toast.show(error.response.data.message || error.response.data.error.message,{
        type: "danger",
      });
    } finally {
      setLoading(false)
      setSearchStarted(true)
    }
  };

  const loadMore = async () => {
    console.log("trying to loadingmore...")
    if (isLoadingMore || !hasMore || products.length < 20) return;
    console.log("loadingmore...")
    setIsLoadingMore(true);

    try {
      const nextPage = page + 1;

      const res = await axiosClient.get(`/amazonshop/search?query=${search}&page=${nextPage}&limit=20`);

      const rawProducts = res.data?.data?.products || [];

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
  
  const addToCart = (details: searchType) => {
    
    // const product = {
    //   asin: details.asin,
    //   quantity: 1,
    //   title: details.product_title,
    //   price: details.product_price,
    //   image: details.product_photo
    // }

    const product = {
      asin: details.asin,
      quantity: 1,
      title: details.product_title,
      price: details.product_price,
      image: details.product_photo
    }

    AmazonAddItem(product)
    
    Toast.show("Item Added to Cart", {
      type: "success",
    });
    
    loadCart();
  }

  const gotToProduct = (asin: string) => {
    router.push({
      pathname: "/(protected)/(routes)/AmazonProductDetails",
      params: { asin }
    });
  }

  return (
    <View className='h-full bg-cyan' style={{ paddingTop: top }}>
        <Search cart={getFormattedCartCount(cart)} placeholder='Search products...' value={search} handleChangeText={setSearch}/>

        <View className="flex-1 bg-white px-4">
          {loading ? (
            <View className="py-10">
              <ActivityIndicator size="large" color="black"/>
            </View>
          ) : (
            <View>
                {search ? (
                    <FlatList
                      data={products}
                      keyExtractor={(item) => item?.asin}
                      showsVerticalScrollIndicator={false}
                      contentContainerStyle={{ gap: 10, paddingBottom: bottom + 16, paddingTop: 16 }}
                      renderItem={({item}) => {
                  
                        const isInCart = AmazonGetItemByAsin(item?.asin)
          
                        return (
                          <TouchableOpacity
                            activeOpacity={0.9}
                            className="w-full flex-row items-start border border-gray-50 rounded-md overflow-hidden"
                            onPress={() => gotToProduct(item?.asin)}
                          >
                              <View className="w-[30%] relative min-h-36 p-2 bg-gray-50 items-center justify-center">
                                <ExpoImage source={{ uri: item?.product_photo }} placeholder={{ blurhash }} cachePolicy="disk" contentFit="contain" style={{ width: "100%", height: 170 }}/> 
                                  {/* {item?.is_best_seller && (
                                    <View className="py-1 px-2 absolute top-1 left-1 rounded-md bg-red-600">
                                      <Text className="text-white text-xs font-amedium">Best seller</Text>
                                    </View>
                                  )} */}
                              </View>
                              <View className="w-full flex-1 items-start gap-1 p-2">
                                  <Text className="font-abold" numberOfLines={3}>{item?.product_title}</Text>
                                  {/* <View className='items-center justify-start flex-row gap-1'>
                                      <Text className='text-xs' numberOfLines={1}>{item?.product_star_rating}</Text>
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
                                  {/* <Text className='text-xs' numberOfLines={1}>{item?.sales_volume}</Text> */}
                                  <Text className="font-amedium text-xl" numberOfLines={2}>
                                    {displayCurrency(Number(stripCurrency(item?.product_price)), "GBP")}
                                    {" "}
                                    <Text className='line-through text-base text-gray-400'>{item?.product_original_price}</Text> 
                                  </Text>
                                  {/* <Text className='text-xs' numberOfLines={1}>{item?.sales_volume}</Text> */}
                                  {isInCart ? (
                                    <AmazonIncrementBtn id={item?.asin} handleLoadCart={loadCart} otherStyles="w-full"/>
                                  ): (
                                    <TouchableOpacity onPress={() => addToCart(item)} activeOpacity={0.8} className={`w-full min-h-[48px] bg-amazonYellow py-3 px-2 rounded-md items-center justify-center`} >
                                      <Text className="text-black font-abold text-lg" numberOfLines={1}>Add to cart</Text>
                                    </TouchableOpacity>
                                  )}
                              </View>
                          </TouchableOpacity>
                        )
                      }}
                      ListEmptyComponent={
                        searchStarted ? (
                          <View className="items-center justify-center py-8">
                            <Text className="text-2xl font-extrabold">
                              No Results Found
                            </Text>
                            <Text className="text-sm text-center mt-1">
                              All searched products will show here.
                            </Text>
                          </View>
                        ) : null
                      }
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
                ) : (
                  <FlatList
                    data={suggestions}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => { setSearchStarted(false); setSearch(item) }}
                          className="py-3 border-b border-gray-100"
                        >
                          <Text>{item}</Text>
                        </TouchableOpacity>
                    )}
                    /> 
                )}
            </View>
          )}
        </View>

      <StatusBar backgroundColor="#00ced1" style='dark'/>
    </View>
  );
}