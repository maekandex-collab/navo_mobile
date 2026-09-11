import { View, Text, Image, FlatList, ActivityIndicator, Platform, RefreshControl } from 'react-native'
import React, { useEffect, useState } from 'react'
import Header from '@/components/Header'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { router } from 'expo-router'
import SearchInput from '@/components/SearchInput'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'
import CheckInShipmentCard from '@/components/CheckInShipmentCard'
import { useToast } from 'react-native-toast-notifications'
import { axiosClient } from '@/globalApi'
import { images } from '@/constants'
import CustomButton from '@/components/CustomButton'

const CheckInShipment = () => {

  const [loading, setLoading] = useState(false)
  const [shipment, setShipment] = useState<any>([])
  const toast = useToast();
  const [allShipments, setAllShipments] = useState<any>([]);
  const [refreshing, setRefreshing] = useState(false)
  
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true); // check if more data exists
  

  const getShipments = async () => {
  
        setLoading(true)
  
        try {
          
          const result = await axiosClient.get("/shipments/checked")
  
          console.log("ship=",result.data?.data)
  
          setAllShipments(result.data?.data || []); // Save the original list
          setShipment(result.data?.data || []);     // Also show it initially
  
        } catch (error: any) {
          toast.show(error.response.data.message || error.response.data.error.message,{
            type: "danger",
          });
        } finally {
          setLoading(false)
        }
      }
  
      useEffect(() => {
        getShipments();
      }, []);
  
  
    // Update debouncedQuery after user stops typing for 500ms
    useEffect(() => {
      if (query) {
        const handler = setTimeout(() => {
          console.log("q", query)
          performSearch(query);
        }, 500);
    
        return () => clearTimeout(handler);
      } else {
        // No query? Reset to original list
        setShipment(allShipments);
      }
    }, [query]);

    const performSearch = async (searchTerm: string) => {
        
      setLoading(true)
  
      try {

        console.log("searchterm=",searchTerm)
        const result = await axiosClient.get(`/shipment/search?q=${searchTerm}`)

        setShipment(result.data?.data || [])

        console.log("search=",result.data.results)

      } catch (error: any) {
        toast.show(error.response.data.message || error.response.data.error.message,{
          type: "danger",
        });
      } finally {
        setLoading(false)
      }
    };

    const onRefresh = async () => {
      setRefreshing(true)

        try {
          
          const result = await axiosClient.get("/shipment/checked")

          console.log("ship=",result.data.results)

          setAllShipments(result.data?.data || []); // Save the original list
          setShipment(result.data?.data || []);     // Also show it initially
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
      if (isLoadingMore || !hasMore || allShipments.length < 20 || query) return;
      console.log("loadingmore...")
      setIsLoadingMore(true);
  
      try {
        const nextPage = page + 1;
  
        const res = await axiosClient.get(`/shipment/checked?page=${nextPage}&limit=20`);
        const newData = res.data?.data || [];
  
        if (newData.length < 20) {
          setHasMore(false); // No more data
        }
  
        setAllShipments((prev: any) => [...prev, ...newData]);
        setShipment((prev: any) => [...prev, ...newData]);
        setPage(nextPage);
        
      } catch (err) {
        console.error("Failed to load more", err);
      } finally {
        setIsLoadingMore(false);
      }
    };

    const renderCheckIn = ({item, index}: {item: any, index: number}) => (
      <CheckInShipmentCard item={item} index={index} handlePress={() => router.push({
        pathname: "/(protected)/(routes)/ShipmentProgress",
        params: { track: JSON.stringify(item) },
      })}/>
    )

  return (
    <SafeAreaView className='h-full bg-white px-4'>
      <Header title="Check in Shipments" showGoBack={true} onpress={() => router.back()}/>

      {shipment?.length === 0 && !loading ?
        <View className='flex-1'>

          <View className='w-full flex-1 items-center justify-center'>
            <Image source={images.shipmentGray} className="mx-auto" resizeMode='contain'/>
            
             {query ? (
                <>
                  <Text className="text-2xl text-center text-blue mt-4 font-abold">No results found</Text>
                  <Text className="text-center text-blue font-aregular mt-1">Try a different search</Text>
                </>
              ) : (
                <>
                  <Text className="text-2xl text-center text-blue mt-4 font-abold">You have no checkedin</Text>
                  <Text className="text-2xl text-center text-blue font-abold">shipments yet!</Text>
                </>
              )}
         </View>

          {!query && (
            <CustomButton title='Lodge Shipment' containerStyles='mb-6' textStyles='text-white' handlePress={() => router.push("/(protected)/(routes)/LodgeShipment")}/>
          )}
        </View> :
        <View className={`pt-4 ${Platform.OS == "ios" ? "pb-[125px]" : "pb-[145px]"}`}>
          {/* search */}
          <View className='flex flex-row w-full'>
            <SearchInput placeholder="Search Transactions" value={query} handleChangeText={(text) => setQuery(text)} disabled={shipment.length !== 0} otherStyles='w-4/5'/>
            <View className='flex-row gap-2 items-center justify-center w-1/5'>
              <View>
                <FontAwesome6 name="arrow-down-wide-short" size={28} color="#003366"/>
              </View>
            </View>
          </View>

          <View className='pt-4'>
            {
              loading ? (
                  <ActivityIndicator size="large" color="#003366"/>
              ) : (
                <FlatList
                  nestedScrollEnabled={true}
                  scrollEnabled={true}
                  data={shipment}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={renderCheckIn}
                  onEndReached={loadMore}
                  onEndReachedThreshold={0.4}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 30 }}
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
      
                    if (!hasMore && allShipments.length > 19) {
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

export default CheckInShipment