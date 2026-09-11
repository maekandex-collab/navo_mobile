import { View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import Header from '@/components/Header'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { router } from 'expo-router'
import CustomButton from '@/components/CustomButton'
import { axiosClient } from '@/globalApi'
import { useToast } from 'react-native-toast-notifications'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import ShopWithLinkCard from '@/components/orders-card/ShopWithLinkCard'

const ShopWithLinkOrdersScreen = () => {

  const [loading, setLoading] = useState(false)

  const [orders, setOrders] = useState<any>([])
  const [allOrders, setAllOrders] = useState<any>([]);
  const toast = useToast();
  const [refreshing, setRefreshing] = useState(false)
  const onEndReachedCalledDuringMomentum = useRef(false);

  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true); // check if more data exists

  const getOrders = async () => {

      setLoading(true)

      try {

        console.log("ship",orders)
        const result = await axiosClient.get("/orders?category=SHOPFORME")

        console.log("ship=",result.data)

        setAllOrders(result.data?.data || []);
        setOrders(result.data?.data || []);

      } catch (error: any) {
        toast.show(error.response.data.message || error.response.data.error.message,{
          type: "danger",
        });
      } finally {
        setLoading(false)
      }
    }

  useEffect(() => {
    getOrders();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true)

    try {

      const result = await axiosClient.get("/orders?category=SHOPFORME")

      console.log("ship=",result.data)

      setAllOrders(result.data?.data || []); // Save the original list
      setOrders(result.data?.data || []);     // Also show it initially
      setHasMore(true)
      setPage(1)

    } catch (error: any) {
      toast.show(error.response.data.message || error.response.data.error.message,{
        type: "danger",
      });
    } finally {
      setRefreshing(false)
    }
  }

  const loadMore = async () => {
    console.log("trying to loadingmore...")
    if (isLoadingMore || !hasMore || allOrders.length < 20) return;
    console.log("loadingmore...")
    setIsLoadingMore(true);

    try {
      const nextPage = page + 1;

      const res = await axiosClient.get(`/orders?category=SHOPFORME&page=${nextPage}&limit=20`);
      const newData = res.data?.data || [];

      if (newData.length < 20) {
        setHasMore(false); // No more data
      }

      setAllOrders((prev: any) => [...prev, ...newData]);
      setOrders((prev: any) => [...prev, ...newData]);
      setPage(nextPage);
      
    } catch (err) {
      console.error("Failed to load more", err);
    } finally {
      setIsLoadingMore(false);
    }
  };
  
  const renderorders = ({item, index}: {item: any, index: number}) => (
    <ShopWithLinkCard item={item}/>
  )

  return (
    <SafeAreaView className='h-full bg-white px-4'>
      <Header title="Shop With Link" showGoBack={true} onpress={() => router.back()}/>

      {orders?.length === 0 && !loading ?
        <View className='flex-1'>
          <View className='w-full flex-1 items-center justify-center'>
            <View className="items-center justify-center size-24 rounded-full bg-orangeLight">
              <MaterialCommunityIcons name="shopping" size={45} color={"#FF6600"} />
            </View>
            <Text className="text-2xl text-center text-blue mt-4 font-abold">You have no shop</Text>
            <Text className="text-2xl text-center text-blue font-abold">with link orders yet!</Text>
         </View>

          <CustomButton title='Go to Shop With Link' containerStyles='mb-4' textStyles='text-white' handlePress={() => router.push("/(protected)/(routes)/Shop4Me")}/>
        </View> :
        <View>   
          <View>
            {
              loading ? (
                <View className='pt-4'>
                  <ActivityIndicator size="large" color="#003366"/>
                </View>
              ) : (
                  <FlatList
                    nestedScrollEnabled={true}
                    scrollEnabled={true}
                    data={orders}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={renderorders}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    onEndReached={() => {
                      if (!onEndReachedCalledDuringMomentum.current) {
                        loadMore();
                        onEndReachedCalledDuringMomentum.current = true;
                      }
                    }}
                    onMomentumScrollBegin={() => {
                      onEndReachedCalledDuringMomentum.current = false;
                    }}
                    onEndReachedThreshold={0.4}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                      <RefreshControl 
                        refreshing={refreshing} 
                        onRefresh={onRefresh} 
                        colors={['#003366', '#FF6600']}
                        progressBackgroundColor="#ffffff"
                        tintColor="#003366"
                        title="Loading..."
                        titleColor="#003366"
                      />
                   }
                   ListFooterComponent={() => {
                      if (isLoadingMore) {
                        return (
                          <View className='items-center p-4'>
                            <ActivityIndicator size="small" color="#003366" />
                            <Text className='text-blue text-amedium text-sm mt-1'>Loading more...</Text>
                          </View>
                        );
                      }
        
                      if (!hasMore && allOrders.length > 19) {
                        return (
                          <View className='items-center p-4'>
                            <Text className='text-blue text-amedium text-sm'>No more Data!</Text>
                          </View>
                        );
                      }
        
                      return null;
                    }}
                  />
              )
            }
          </View>
        </View>
      }

      <StatusBar backgroundColor="#ffffff" style='dark'/>
    </SafeAreaView>
  )
}

export default ShopWithLinkOrdersScreen