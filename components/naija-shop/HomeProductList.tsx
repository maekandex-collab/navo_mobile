import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, Image, Dimensions, ActivityIndicator } from "react-native";
import { MasonryFlashList } from "@shopify/flash-list";
import { Image as ExpoImage } from 'expo-image';
import { router } from "expo-router";
import { axiosClient } from "@/globalApi";
import { useSkeletonCommonProps } from "@/utils/SkeletonProps";
import { FlatList } from "react-native";
import ProductSkeleton from "../ProductSkeleton";
import displayCurrency from "@/utils/displayCurrency";
import { formatEnums } from "@/utils/formatEnums";
const width = Dimensions.get("window").width

type vendorType = {
  id: string;
  name: string;
  logo: string;
}

type ProductType = {
  id: string; 
  description: string; 
  image: string[]; 
  name: string; 
  currency: "GBP" | "NGN";
  price: string; 
  productStatus: "in_stock" | "out_of_stock";
  quantity: number;
  vendor: vendorType
}

let hasFetched = false;
let cachedProducts: ProductType[] = [];

const HomeProductList = () => {

  const blurhash = 'L~I64noffQfQfQfQfQfQfQfQfQfQ';
    
  const [products, setProducts] = useState<ProductType[]>([])
  const [loading, setLoading] = useState(true)
  const skeletonProps = useSkeletonCommonProps();
  const dummy = new Array(6).fill(null)
  const half = (width/2) - 21

  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false)
  
  useEffect(() => {
    if (!hasFetched) {
      fetchProducts()
    } else {
      setProducts(cachedProducts)
      setLoading(false);
    }
  }, []);
  
  const fetchProducts = async () => {
    setLoading(true)
    try {
      console.log("products")
      const result = await axiosClient.get("/vendors/products")
      const list = result.data.data || []
      setProducts(list);
      hasFetched = true;
      cachedProducts = list

      console.log("products=", result.data)
    } catch (error: any) {
        
    } finally {
      setLoading(false)
    }
  }

  const loadMore = async () => {
    console.log("trying to loadingmore...")
    if (isLoadingMore || !hasMore || products.length < 20) return;
    console.log("loadingmore...")
    setIsLoadingMore(true);

    try {
      const nextPage = page + 1;

      const res = await axiosClient.get(`/vendors/products?page=${nextPage}&limit=20`);
      const newData = res.data.data || [];

      if (newData.length < 20) {
        setHasMore(false); // No more data
      }

      setProducts((prev: any) => [...prev, ...newData]);
      setPage(nextPage);
      
    } catch (err) {
      
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <View className="flex-1 px-1 py-2">
      <Text className='font-abold text-xl px-3 pb-2'>Shop from all items</Text>
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
        <MasonryFlashList
          data={products}
          numColumns={2}
          keyExtractor={(item) => item?.id}
          estimatedItemSize={200}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }: { item: ProductType }) => (
            <TouchableOpacity
              activeOpacity={0.9}
              className="m-1 w-full"
              onPress={() => router.push({pathname: "/(protected)/(routes)/NaijaShopProductDetails", params: { productDetails: JSON.stringify(item) }})}
            >
              <View className="w-full bg-gray-50" style={{ width: "100%", height: Math.random() * 100 + 150 }}>
                <ExpoImage source={{ uri: item?.image[0] }} placeholder={{ blurhash }} cachePolicy="disk" contentFit="cover" style={{width: "100%", height: "100%" }}/>
              </View>
              <View className="w-full flex-1 items-start gap-1">
                <Text className="font-abold" numberOfLines={2}>{item?.name}</Text>
                <Text numberOfLines={2}>{item?.description}</Text>
                <Text className={`text-sm font-abold ${item.productStatus === 'in_stock' ? 'text-green-500' : item.productStatus === 'out_of_stock' ? 'text-red-500' : 'text-red-500'}`}>{formatEnums(item.productStatus)}</Text>
                <Text className="font-amedium">{displayCurrency(Number(item.price), item.currency)}</Text>
                <Text numberOfLines={1}>By {item?.vendor?.name}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={() => (
            <View className="items-center justify-center py-8 mx-3 bg-gray-50 rounded-md">
              <Text className="text-xl font-extrabold">
                No Products Found
              </Text>
              <Text className="text-sm text-center mt-1">
                All products will show here.
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
      )}
    </View>
  );
};

export default HomeProductList;