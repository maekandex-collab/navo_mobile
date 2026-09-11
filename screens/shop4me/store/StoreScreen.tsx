import { View, Text, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import SearchInput from '@/components/SearchInput'
import Header from '@/components/Header'
import { router } from 'expo-router'
import { useFocusEffect } from '@react-navigation/native'
import { TouchableOpacity } from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import { FlatList } from 'react-native'
import { Image } from 'react-native'
import { StoreAddItem, StoreGetItemById, StoreGetItems } from '@/utils/CartStorage'
import { useToast } from 'react-native-toast-notifications'
import displayCurrency from '@/utils/displayCurrency'
import { axiosClient } from '@/globalApi'
import StoreIncrementBtn from '@/components/StoreIncrementBtn'
import { getFormattedCartCount } from '@/utils/getFormattedCartCount'

type StoreItemType = {
  id: any
  quantity: number,
};

const StoreScreen = () => {

  const { top } = useSafeAreaInsets()
  const [products, setProducts] = useState<any>([])
  const [loading, setLoading] = useState(false)
  const [cart, setCart] = useState<StoreItemType[]>([]);
  const toast = useToast();
  const [allProducts, setAllProducts] = useState<any>([])
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const result = await axiosClient.get("/products")
      console.log("p=",result.data)
      setProducts(result.data.data || []);
      setAllProducts(result.data.data || [])
    } catch (error: any) {
      toast.show(error.response.data.message || error.response.data.error.message,{
        type: "danger",
      });
    } finally {
      setLoading(false)
    }
  }

  const loadCart = () => {
    const items = StoreGetItems();
    console.log("i=",items)
    setCart(items);
  };

  useFocusEffect(
    useCallback(() => {
  
      loadCart();
    }, [])
  );

  const addToCart = (id: any) => {
    const product = {
      id: id,
      quantity: 1
    }

    StoreAddItem(product)
    
    toast.show("Item Added to Cart", {
      type: "success",
    });
    
    loadCart();
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
        setProducts(allProducts);
      }
    }, [query]);
  
  
    const performSearch = async (searchTerm: string) => {
      
      setLoading(true)
  
        try {
  
          console.log("searchterm=",searchTerm)
          const result = await axiosClient.get(`/products/search?query=${searchTerm}`)
  
          setProducts(result.data?.products || [])
  
          console.log("search=",result.data?.products)
  
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
          
          const result = await axiosClient.get("/products")

          setProducts(result.data.data || []);
          setAllProducts(result.data.data || [])
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
      if (isLoadingMore || !hasMore || allProducts.length < 20 || query) return;
      console.log("loadingmore...")
      setIsLoadingMore(true);
  
      try {
        const nextPage = page + 1;
  
        const res = await axiosClient.get(`/products?page=${nextPage}&limit=20`);
        const newData = res.data.data || [];
  
        if (newData.length < 20) {
          setHasMore(false); // No more data
        }
  
        setProducts((prev: any) => [...prev, ...newData]);
        setAllProducts((prev: any) => [...prev, ...newData])
        setPage(nextPage);
        
      } catch (err) {
        console.error("Failed to load more", err);
      } finally {
        setIsLoadingMore(false);
      }
    };

    const icon = () => (
      <TouchableOpacity onPress={() => router.push("/(protected)/(routes)/StoreCart")} activeOpacity={0.7} className={`flex-row rounded-md gap-2 px-2 min-h-[48px] justify-center items-center`}>
        <View className='relative items-center justify-center min-h-[48px]'>
          <Feather name="shopping-cart" size={28} color="#003366" />
          <Text className='absolute -right-2 top-0 p-1 rounded-full bg-orange text-center text-white text-xs min-w-6 min-h-6' numberOfLines={1}>{getFormattedCartCount(cart)}</Text>
        </View>
      </TouchableOpacity>
    )

  return (
   <View style={{ paddingTop: top }} className="bg-white h-full">
       <StatusBar backgroundColor="#ffffff" style='dark'/>
       <View className='px-4'>
          <Header title='Store' showGoBack={true} onpress={() => router.back()} showRight={true} icon={icon()}/>
          <View className='mb-4'>
            <SearchInput placeholder="Search Products..." handleChangeText={setQuery} disabled={products.length !== 0}/>
          </View>
       </View>

        {loading ? (
          <ActivityIndicator size="large" color="#003366"/>
        ) : (
          <FlatList
            scrollEnabled={true}
            data={products}
            keyExtractor={(item, index) => index.toString()}
            numColumns={2}
            contentContainerStyle={{gap: 10, padding:16}}
            columnWrapperStyle={{gap: 10, justifyContent: 'space-between', width: '100%'}}
            renderItem={({item}) => {

              const isInCart = StoreGetItemById(item?.id)

              return (
                <TouchableOpacity style={styles.productBox} className='p-3 bg-orangeLight rounded-lg w-[48%]' onPress={() => router.push({pathname: "/(protected)/(routes)/ProductDetails", params: { productDetails: JSON.stringify(item) },})}>
                  <Image style={{width: "100%", height:110}} resizeMode='cover' source={{ uri: item?.image[0]}} className='rounded-lg'/>
                  <View style={{width:"100%"}}>
                      <Text numberOfLines={1} className='text-blue mt-2'>{item?.name}</Text>
                      <View style={{marginVertical:7, flexDirection:"row", justifyContent:"space-between", width:"100%", gap:10}} className='flex-1'>
                          <Text style={{fontSize:15, fontWeight:"bold"}} className='text-blue flex-1'>{displayCurrency(Number(item?.price), 'GBP')}</Text>
                          <Text style={{fontWeight:"bold"}} className={`text-xs ${item?.productStatus === 'in_stock' ? 'text-green-500' : item?.productStatus === 'out_of_stock' ? 'text-red-500' : 'text-red-500'}`}>{item?.productStatus === 'in_stock' ? 'In Stock' : item?.productStatus === 'out_of_stock' ? 'Out of Stock' : 'Out of Stcok'}</Text>
                      </View>
                      {isInCart ? (
                        <StoreIncrementBtn id={item?.id} handleLoadCart={loadCart} showCheckout={false} otherStyles="w-full"/>
                      ): (
                        <TouchableOpacity onPress={() => addToCart(item?.id)} style={{backgroundColor:"#FF6600", padding:10, borderRadius:5, alignItems:"center", justifyContent:"center"}} className={`min-h-[48px] ${item?.productStatus === 'out_of_stock' && 'opacity-50'}`} disabled={item?.productStatus === 'in_stock' ? false : item?.productStatus === 'out_of_stock' ? true : false}>
                          <Text className='text-white font-amedium'>Add to Cart</Text>
                        </TouchableOpacity>
                      )}
                  </View>
                </TouchableOpacity>
              )
             
            }}
            showsVerticalScrollIndicator={false}
            onEndReached={loadMore}
            onEndReachedThreshold={0.4}
            ListEmptyComponent={() => (
                <View>
                  {query ? (
                    <View className="w-full items-center mx-auto justify-center my-6 mt-8 max-w-52 flex-1">
                      <Text className="text-2xl text-center text-blue mt-4 font-ablack">No Results Found!</Text>
                      <Text className="text-sm text-center text-blue mt-1 font-alight">Try a different search.</Text>
                    </View>
                  ) : (
                    <View className="w-full items-center mx-auto justify-center my-6 mt-8 max-w-52 flex-1">
                      <Text className="text-2xl text-center text-blue mt-4 font-ablack">No Products Found</Text>
                      <Text className="text-sm text-center text-blue mt-1 font-alight">All products will show here for you to order and ship</Text>
                    </View>
                  )}
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

              if (!hasMore && allProducts.length > 19) {
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

export default StoreScreen

const styles = StyleSheet.create({
  productBox: {
      alignItems:"center",
      justifyContent:"center",
      backgroundColor:"white",
      minHeight: 150,
      padding: 4,
      borderRadius:8,
      shadowColor: '#333333',
      elevation: 12,
      shadowOffset: {width: -2, height: 4},
      shadowOpacity: 0.3,
      shadowRadius: 8,
  }
})




