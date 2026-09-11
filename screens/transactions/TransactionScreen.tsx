import { View, Text, Pressable, ActivityIndicator, FlatList, Platform, Image } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import Header from '@/components/Header'
import SearchInput from '@/components/SearchInput'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';
import Transactions from '@/components/Transactions'
import { router } from 'expo-router'
import { axiosClient } from '@/globalApi'
import { useToast } from 'react-native-toast-notifications'
import { images } from '@/constants'
import displayCurrency from '@/utils/displayCurrency'
import { RefreshControl } from 'react-native'
import { formatEnumsCapital } from '@/utils/formatEnumsCapital'

export default function TransactionScreen() {

  const { top } = useSafeAreaInsets()
  const [loading, setLoading] = useState(false)
  const [active, setActive] = useState("all")
  const toast = useToast();
  const [data, setData] = useState<any>([])
  const [refreshing, setRefreshing] = useState(false)

  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true); // check if more data exists

  const [allFetchTransaction, setAllFetchTransaction] = useState<any>([]);
  const [query, setQuery] = useState('');

  const transactions = async () => {
    
    setLoading(true)

    try {

      const result = await axiosClient.get("/transactions/history")

      console.log("trans=",result.data.data)
      console.log("details=",result.data.data.details)
      console.log("transDATA=",result.data)

      setAllFetchTransaction(result.data.data || [])
      setData(result.data.data || [])

    } catch (error: any) {
      toast.show(error.response.data.message || error.response.data.error.message,{
        type: "danger",
      });
    } finally {
      setLoading(false)
    }
  }

  const filteredData = useMemo(() => {
    switch (active) {
      case "pending":
        return allFetchTransaction.filter((i: any) => i?.paymentStatus === "pending");
      case "failed":
        return allFetchTransaction.filter((i: any) => i?.paymentStatus === "failed");
      case "successful":
        return allFetchTransaction.filter((i: any) => i?.paymentStatus === "successful");
      default:
        return data;
    }
  }, [active, allFetchTransaction, data]);

  useEffect(() => {
    transactions()
  }, [])

  const allTransactions = () => {
    setActive("all")
  }

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
        setData(allFetchTransaction)
      }
    }, [query]);
  
  
    const performSearch = async (searchTerm: string) => {
  
      setLoading(true)
  
        try {
  
          console.log("searchterm=",searchTerm)
          const result = await axiosClient.get(`/transactions/search?q=${searchTerm}`)
  
          setData(result.data?.data || [])
  
          console.log("search=",result.data?.data)
  
        } catch (error: any) {
          toast.show(error.response.data.message || error.response.data.error.message,{
            type: "danger",
          });
        } finally {
          setLoading(false)
        }
    };

    const onRefresh = async () => {
      if (active !== "all") return
      
      setRefreshing(true)

      try {

        const result = await axiosClient.get("/transactions/history")

        console.log("trans=",result.data.data)
        console.log("transData=",result.data)

        setAllFetchTransaction(result.data.data || [])
        setData(result.data.data || [])
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
    if (active !== "all" || isLoadingMore || !hasMore || allFetchTransaction.length < 20 || query) return;
    console.log("loadingmore...")
    setIsLoadingMore(true);

    try {
      const nextPage = page + 1;

      const res = await axiosClient.get(`/transactions/history?page=${nextPage}&limit=20`);
      const newData = res.data.data || [];

      if (newData.length < 20) {
        setHasMore(false); // No more data
      }

      setAllFetchTransaction((prev: any) => [...prev, ...newData]);
      setData((prev: any) => [...prev, ...newData]);
      setPage(nextPage);
      
    } catch (err) {
      console.error("Failed to load more", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const renderTransaction = ({item, index}: {item: any, index: number}) => {

    // console.log("it=",item)

    const receipt: any = {
      recipient: item?.details?.phoneNumber || item?.details?.customerId || "NAVO PLUS",
      transactionType: item?.transactionType,
      paymentType: item?.paymentType,
      amount: displayCurrency(Number(item?.amount), item?.currency),
      dataPlan: item?.details?.dataPlan,
      networkProvider: formatEnumsCapital(item?.details?.networkProvider),
      utilityType: formatEnumsCapital(item?.details?.utilityType),
      channel: item?.paymentMethod || "Nil",
      timeStamp: item?.createdAt,
      merchantTxRef: item?.transactionReference || item?.details?.merchantTxRef,
      category: item?.category || 'Nil',
      rechargeToken: item?.details?.phcnToken,
      status: item?.paymentStatus,
      remark: [
          item?.details?.remark,
          item?.details?.cableTvType ? `${item?.details?.cableTvType}`
            : null,
          item?.details?.disco 
            ? `${item?.details?.disco} - ${item?.details?.meterType}`
            : null
        ]
          .filter(Boolean)
          .join(' - ') || "Nil"
    }

    return (
      <Transactions item={item} index={index} handlePress={() => router.push({
        pathname: "/(protected)/(routes)/receipt/TransactionsReceipt",
        params: { Recieptdata: JSON.stringify(receipt) },
      })}/>
    )
  }


  return (
    <View style={{ paddingTop: top }} className={`h-full flex-1 bg-white px-4`}>
      <Header title="Transactions"/>
      
      <View className='mt-4 w-full'>
        {/* navigate */}
        <View className='flex-row justify-between items-center mb-5 w-full'>
          <Pressable className={`w-1/4 justify-center items-center py-1 ${active === "all" ? "border-b-2 border-orange" : ""}`} onPress={() => setActive("all")}>
              <Text className={`text-sm ${active === "all" ? "font-abold text-orange" : "text-blue"}`} numberOfLines={1}>All</Text>
          </Pressable>

          <Pressable className={`w-1/4 justify-center items-center py-1 ${active === "pending" ? "border-b-2 border-orange" : ""}`} onPress={() => setActive("pending")}>
              <Text className={`text-sm ${active === "pending" ? "font-abold text-orange" : "text-blue"}`} numberOfLines={1}>Pending</Text>
          </Pressable>

          <Pressable className={`w-1/4 justify-center items-center py-1 ${active === "failed" ? "border-b-2 border-orange" : ""}`} onPress={() => setActive("failed")}>
              <Text className={`text-sm ${active === "failed" ? "font-abold text-orange" : "text-blue"}`} numberOfLines={1}>Failed</Text>
          </Pressable>

          <Pressable className={`w-1/4 justify-center items-center py-1 ${active === "successful" ? "border-b-2 border-orange" : ""}`} onPress={() => setActive("successful")}>
              <Text className={`text-sm ${active === "successful" ? "font-abold text-orange" : "text-blue"}`} numberOfLines={1}>Completed</Text>
          </Pressable>
        </View>

        {/* search */}
        {active === 'all' && (
          <View className='flex flex-row w-full gap-1'>
            <SearchInput placeholder="Search Transactions" value={query} handleChangeText={(text) => setQuery(text)} disabled={allFetchTransaction.length !== 0} otherStyles='w-2/3'/>
            <View className='flex-row gap-2 items-center justify-center w-1/3'>
              <View className='size-12 flex items-center justify-center rounded-full bg-inputBg'>
                <FontAwesome6 name="arrow-down-wide-short" size={18} color="#787878"/>
              </View>
              <View className='size-12 flex items-center justify-center rounded-full bg-inputBg'>
                <Ionicons name="options-sharp" size={19} color="#787878"/>
              </View>
            </View>
          </View>
        )}
       
        
      </View>

       {/* transactions */}
       <View className='flex-1'>
          {
              active === "all" && (
                  <View className='pt-4'>
                      {
                          loading ? (
                              <ActivityIndicator size="large" color="#003366"/>
                          ) : (
                              <FlatList
                              nestedScrollEnabled={true}
                              scrollEnabled={true}
                              data={data}
                              keyExtractor={(item, index) => item?.id}
                              renderItem={renderTransaction}
                              showsVerticalScrollIndicator={false}
                              contentContainerStyle={{ paddingBottom: 30 }}
                              onEndReached={loadMore}
                              onEndReachedThreshold={0.4}
                              ListEmptyComponent={() => (
                                <View>
                                  <View className="w-full items-center mx-auto justify-center my-6 mt-8 max-w-52 flex-1">
                                      <Image source={images.noTransaction} className='size-20' resizeMode='contain'/>
                                      {query ? (
                                        <>
                                          <Text className="text-2xl text-center text-blue mt-4 font-ablack">No results found!</Text>
                                          <Text className="text-sm text-center text-blue mt-1 font-alight">Try a different search.</Text>
                                        </>
                                      ) : (
                                        <>
                                          <Text className="text-2xl text-center text-blue mt-4 font-ablack">No transactions yet!</Text>
                                          <Text className="text-sm text-center text-blue mt-1 font-alight">All your transactions will show here.</Text>
                                        </>
                                      )}
                                  </View>
                                </View>
                              )}
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

                              if (!hasMore && allFetchTransaction.length > 19) {
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
              )
          }

          {
            active === "pending" && (
                <View>
                    {
                        loading ? (
                            <ActivityIndicator size="large" color="#003366"/>
                        ) : (
                            <FlatList
                              nestedScrollEnabled={true}
                              scrollEnabled={true}
                              data={filteredData}
                              keyExtractor={(item, index) => index.toString()}
                              renderItem={renderTransaction}
                              showsVerticalScrollIndicator={false}
                              contentContainerStyle={{ paddingBottom: 30 }}
                              ListEmptyComponent={() => (
                                <View>
                                  <View className="w-full items-center mx-auto justify-center my-6 mt-8 max-w-52 flex-1">
                                      <Image source={images.noTransaction} className='size-20' resizeMode='contain'/>
                                      {query ? (
                                        <>
                                          <Text className="text-2xl text-center text-blue mt-4 font-ablack">No results found!</Text>
                                          <Text className="text-sm text-center text-blue mt-1 font-alight">Try a different search.</Text>
                                        </>
                                      ) : (
                                        <>
                                          <Text className="text-2xl text-center text-blue mt-4 font-ablack">No transactions yet!</Text>
                                          <Text className="text-sm text-center text-blue mt-1 font-alight">All your pending transactions will show here.</Text>
                                        </>
                                      )}
                                  </View>
                                </View>
                              )}
                            />
                        )
                    }
                </View>
              )
          }

          {
            active === "failed" && (
                <View>
                    {
                        loading ? (
                            <ActivityIndicator size="large" color="#003366"/>
                        ) : (
                            <FlatList
                              nestedScrollEnabled={true}
                              scrollEnabled={true}
                              data={filteredData}
                              keyExtractor={(item, index) => index.toString()}
                              renderItem={renderTransaction}
                              contentContainerStyle={{ paddingBottom: 30 }}
                              showsVerticalScrollIndicator={false}
                              ListEmptyComponent={() => (
                                <View>
                                  <View className="w-full items-center mx-auto justify-center my-6 mt-8 max-w-52 flex-1">
                                      <Image source={images.noTransaction} className='size-20' resizeMode='contain'/>
                                      {query ? (
                                        <>
                                          <Text className="text-2xl text-center text-blue mt-4 font-ablack">No results found!</Text>
                                          <Text className="text-sm text-center text-blue mt-1 font-alight">Try a different search.</Text>
                                        </>
                                      ) : (
                                        <>
                                          <Text className="text-2xl text-center text-blue mt-4 font-ablack">No transactions yet!</Text>
                                          <Text className="text-sm text-center text-blue mt-1 font-alight">All your failed transactions will show here.</Text>
                                        </>
                                      )}
                                  </View>
                                </View>
                              )}
                            />
                        )
                    }
                </View>
              )
          }

          {     
            active === "successful" && (
                <View>
                    {
                        loading ? (
                            <ActivityIndicator size="large" color="#003366"/>
                        ) : (
                            <FlatList
                              nestedScrollEnabled={true}
                              scrollEnabled={true}
                              data={filteredData}
                              keyExtractor={(item, index) => index.toString()}
                              renderItem={renderTransaction}
                              showsVerticalScrollIndicator={false}
                              contentContainerStyle={{ paddingBottom: 30 }}
                              ListEmptyComponent={() => (
                                <View>
                                  <View className="w-full items-center mx-auto justify-center my-6 mt-8 max-w-52 flex-1">
                                      <Image source={images.noTransaction} className='size-20' resizeMode='contain'/>
                                      {query ? (
                                        <>
                                          <Text className="text-2xl text-center text-blue mt-4 font-ablack">No results found!</Text>
                                          <Text className="text-sm text-center text-blue mt-1 font-alight">Try a different search.</Text>
                                        </>
                                      ) : (
                                        <>
                                          <Text className="text-2xl text-center text-blue mt-4 font-ablack">No transactions yet!</Text>
                                          <Text className="text-sm text-center text-blue mt-1 font-alight">All your successful transactions will show here.</Text>
                                        </>
                                      )}
                                  </View>
                                </View>
                              )}
                            />
                        )
                    }
                </View>
              )
          }

      </View>
      <StatusBar backgroundColor="#ffffff" style='dark'/>
    </View>
  )
}