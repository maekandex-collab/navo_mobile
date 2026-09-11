import { View, FlatList, Text, Pressable, ActivityIndicator } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { router } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Image as ExpoImage } from 'expo-image';
import Search from "@/components/naija-shop/Search";
import { StatusBar } from "expo-status-bar";
import { useSkeletonCommonProps } from "@/utils/SkeletonProps";
import { axiosClient } from "@/globalApi";
import { Skeleton } from "moti/skeleton";
import { Dimensions } from "react-native";
import { NaijaShopGetItems } from "@/utils/NaijaShopCartStorage";
import { useFocusEffect } from "@react-navigation/native";
import { getFormattedCartCount } from "@/utils/getFormattedCartCount";
const width = Dimensions.get("window").width

type vendorType = {
  id: string;
  name: string;
  logo: string;
}

type StoreItemType = {
  id: any
  quantity: number,
};

let hasFetched = false;
let cachedVendors: vendorType[] = [];

export default function VendorList() {

  const blurhash = 'L~I64noffQfQfQfQfQfQfQfQfQfQ';
    
  const [search, setSearch] = useState("");
   const { top, bottom } = useSafeAreaInsets()
   const [vendors, setVendors] = useState<vendorType[]>([])
    const [loading, setLoading] = useState(true)
    const skeletonProps = useSkeletonCommonProps();
    const dummy = new Array(15).fill(null)
    const boxWidth = (width - 32 - 20) / 3
  
    const [page, setPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [refreshing, setRefreshing] = useState(false)

    const [cart, setCart] = useState<StoreItemType[]>([]);
    
    const loadCart = () => {
      const items = NaijaShopGetItems();
      console.log("i=",items)
      setCart(items);
    };
  
    useFocusEffect(
      useCallback(() => {
    
        loadCart();
      }, [])
    );

    useEffect(() => {
      fetchVendors()
    }, [])

    useEffect(() => {
      if (!hasFetched) {
        fetchVendors()
      } else {
        setVendors(cachedVendors)
        setLoading(false);
      }
    }, []);
    
    const fetchVendors = async () => {
      setLoading(true)
      try {
        const result = await axiosClient.get("/vendors")
        const list = result.data?.data || []
        setVendors(list);
        hasFetched = true;
        cachedVendors = list
  
        console.log("vendor=", result.data)
      } catch (error: any) {
          
      } finally {
        setLoading(false)
      }
    }

    const loadMore = async () => {
      console.log("trying to loadingmore...")
      if (isLoadingMore || !hasMore || vendors.length < 30) return;
      console.log("loadingmore...")
      setIsLoadingMore(true);
  
      try {
        const nextPage = page + 1;
  
        const res = await axiosClient.get(`/vendors?page=${nextPage}&limit=30`);
        const newData = res.data?.data || [];
  
        if (newData.length < 30) {
          setHasMore(false); // No more data
        }
  
        setVendors((prev: any) => [...prev, ...newData]);
        setPage(nextPage);
        
      } catch (err) {
        console.error("Failed to load more", err);
      } finally {
        setIsLoadingMore(false);
      }
    };
    
    const gotToVendorProduct = (id: string) => {
      router.push({
        pathname: "/(protected)/(routes)/NaijaShopVendorProducts",
        params: { id }
      });
    }

  return (
    <View className='h-full bg-black' style={{ paddingTop: top }}>
        <Search cart={getFormattedCartCount(cart)} placeholder='Search vendors...' value={search} handleChangeText={setSearch} showMenu={false}/>

        <View className="flex-1 px-4 bg-white">
          {loading ? (
            <FlatList
              data={dummy}
              keyExtractor={(item, index) => index.toString()}
              numColumns={3}
              columnWrapperStyle={{gap: 10}}
              contentContainerStyle={{gap: 10, paddingTop: 16, paddingBottom: bottom + 16}}
              ListHeaderComponent={() => <Text className='font-abold text-xl'>Shop from different vendors</Text>}
              renderItem={({ item }) => (
                <View style={{ width: boxWidth }}>
                  <Skeleton.Group show={loading}>
                    <Skeleton height={boxWidth} width={boxWidth} radius={10} {...skeletonProps} />
                  </Skeleton.Group>
                </View>
              )}
              showsVerticalScrollIndicator={false}
            
            />
          ) : (
            <FlatList
              data={vendors}
              keyExtractor={(item) => item?.id}
              numColumns={3}
              columnWrapperStyle={{gap: 10}}
              contentContainerStyle={{gap: 10, paddingTop: 16, paddingBottom: bottom + 16}}
              ListHeaderComponent={() => <Text className='font-abold text-xl'>Shop from different vendors</Text>}
              renderItem={({ item }) => (
                <Pressable className='p-2 items-center flex-1 bg-gray-50 rounded-md' onPress={() => gotToVendorProduct(item?.id)}>
                  <ExpoImage source={{ uri: item?.logo }} placeholder={{ blurhash }} cachePolicy="disk" contentFit="contain" style={{width:50, height:50, borderRadius: 25}}/>
                  <Text className='font-abold text-center text-base leading-4 mt-1' numberOfLines={3}>{item?.name}</Text>
                </Pressable>
              )}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={() => (
                <View className="items-center justify-center py-8">
                  <Text className="text-2xl font-extrabold">
                    No vendor Found
                  </Text>
                  <Text className="text-sm text-center mt-1">
                    All vendors will show here.
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
    
                if (!hasMore && vendors.length > 29) {
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

        <StatusBar backgroundColor="#000" style='light'/>
    </View>
  );
}