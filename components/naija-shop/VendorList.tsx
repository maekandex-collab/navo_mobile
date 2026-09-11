import { View, FlatList, Text, ActivityIndicator } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { Pressable } from 'react-native'
import { Image as ExpoImage } from 'expo-image';
import { router } from 'expo-router';
import { axiosClient } from '@/globalApi';
import { useSkeletonCommonProps } from '@/utils/SkeletonProps';
import { Skeleton } from 'moti/skeleton';
import { Dimensions } from 'react-native';
const width = Dimensions.get("window").width

type vendorType = {
  id: string;
  name: string;
  logo: string;
}

let hasFetched = false;
let cachedVendors: vendorType[] = [];

const VendorList = () => {

 const blurhash = 'L~I64noffQfQfQfQfQfQfQfQfQfQ';
    
  const [vendors, setVendors] = useState<vendorType[]>([])
  const [loading, setLoading] = useState(true)
  const skeletonProps = useSkeletonCommonProps();
  const dummy = new Array(4).fill(null)

  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false)

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
      const newData = res.data.results || [];

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
    <View style={{ paddingTop: 10, paddingBottom: 20, borderBottomRightRadius: 18, borderBottomLeftRadius: 18 }}>
      <View className='w-full px-3 pb-2 flex-row items-center justify-between gap-1'>
        <Text className='font-abold text-xl'>Shop from Vendors</Text>
        <Pressable className='px-1' onPress={() => router.push("/(protected)/(routes)/(modals)/NaijaShopVendorListModal")}>
          <Text className='font-abold text-blue text-xl'>All</Text>
        </Pressable>
      </View>
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
        data={vendors}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10, paddingHorizontal: 10 }}
        keyExtractor={(item, index) => item.id.toString()}
        renderItem={({ item }) => (
          <Pressable className='p-2 items-center bg-gray-50 rounded-md' style={{ minWidth: 100 }} onPress={() => gotToVendorProduct(item?.id)}>
            <ExpoImage source={{ uri: item?.logo }} placeholder={{ blurhash }} cachePolicy="disk" contentFit="contain" style={{width:50, height:50, borderRadius: 25}}/>
            <Text className='font-abold text-center text-base mt-1 leading-4 max-w-24' numberOfLines={3}>{item?.name}</Text>
          </Pressable>
        )}
        ListEmptyComponent={() => (
          <View className="items-center justify-center px-2 py-8 bg-gray-50 rounded-md" style={{width: width - 24}}>
            <Text className="text-xl font-extrabold">
                No Vendor Found
            </Text>
            <Text className="text-sm text-center mt-1">
                All vendors will show here.
            </Text>
          </View>
        )}
        scrollEnabled={true}
        nestedScrollEnabled={true}
        onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={() => {
            if (isLoadingMore) {
              return (
                <View className='items-center p-4'>
                  <ActivityIndicator size="small" color="#003366" />
                  <Text className='text-black text-amedium text-sm mt-1'>Loading more...</Text>
                </View>
              );
            }

            if (!hasMore && vendors.length > 19) {
              return (
                <View className='items-center p-4'>
                  <Text className='text-blue text-amedium text-sm'>No more Data!</Text>
                </View>
              );
            }

            return null;
          }}
      />
    )}
    </View>
  )
}

export default VendorList
