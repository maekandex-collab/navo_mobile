import { View, Text, ActivityIndicator, FlatList, Platform, TouchableOpacity, Alert, StyleSheet } from 'react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import Header from '@/components/Header'
import { router } from 'expo-router'
import CustomButton from '@/components/CustomButton'
import Notification from '@/components/Notification'
import AntDesign from '@expo/vector-icons/AntDesign'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { axiosClient } from '@/globalApi'
import { useToast } from 'react-native-toast-notifications'
import CustomButtomSheet from '@/components/CustomButtomSheet'
import { BottomSheetModal, BottomSheetScrollView, useBottomSheetModal } from '@gorhom/bottom-sheet'
import { RefreshControl } from 'react-native'
import { hideLoader, showLoader } from '@/redux/LoaderSlice'
import { useDispatch } from 'react-redux'

type messageType = {
  createdAt: string; 
  id: string;  
  isRead: boolean;
  message: string; 
  title: string; 
  type: string; 
  userId: string;
  status: string | null;
  meta: any;
}

export default function NotificationScreen() {

  const dispatch = useDispatch()
  const insets = useSafeAreaInsets();
  const statusBarBottom = insets.bottom + 200;

  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["70%"], [])
  const { dismiss } = useBottomSheetModal()

  const [modalMessage, setModalMessage] = useState<messageType | null>(null)

  const toast = useToast();
  const [active, setActive] = useState("transactions")
  const [userNotifications, setUserNotifications] = useState<any>([])

  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true); // check if more data exists

  // callbacks
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);
  
  useEffect(() => {
    const notifications = async () => {

      setLoading(true)

      try {

        const result = await axiosClient.get("/notifications")

        console.log("noti=",result.data?.data)

        setUserNotifications(result.data?.data || [])


      } catch (error: any) {
        toast.show(error.response.data.message || error.response.data.error.message,{
          type: "danger",
        });
      } finally {
        setLoading(false)
      }
    }

    notifications()
  }, [])

  const transactions = () => {
    setActive("transactions")
    // const filteredTransaction = filterTransactions()
    // setUserNotifications(filteredTransaction)
  }
  
  const activities = () => {
    setActive("activities")
    // const filteredActivities = filterActivities()
    // setUserNotifications(filteredActivities)
  }
  
  // const filterActivities = () => {
  //   const activity = userNotifications?.filter((item: any) => item.type === 'activity')
  //   return activity 
  // }

  // const filterTransactions = () => {
  //   const transaction  = userNotifications?.filter((item: any) => item.type === 'transaction')
  //   return transaction 
  // }

  // useEffect(() => {
  //   setUserNotifications(filterTransactions())
  // }, [])


  const click = async (item: any) => {

      setModalMessage(item)
      handlePresentModalPress()

      if(!item?.isRead){
        axiosClient.patch(`/notifications/${item?.id}/read`, {})
      }
      
  }

    const arrangeMyself = async (id: string) => {
       dispatch(showLoader());
  
       console.log("id", id)
        try {
  
          const result = await axiosClient.patch(`/shop/${id}/handle-shipping`, {})
  
          toast.show("Order updated", {
            type: "success",
          });

          dismiss();
  
  
        } catch (error: any) {
          toast.show(error.response.data.message || error.response.data.error.message,{
            type: "danger",
          });
          console.log("e=",error.response.data)
        } finally {
          dispatch(hideLoader());
        }
    }

  const payShipmentBalance = async (meta: string,) => {

    router.push({
      pathname: "/(protected)/(routes)/ShipmentAdjustment",
      params: { adjustmentData: JSON.stringify(meta) },
    })
    dismiss();
      
  }

  const onRefresh = async () => {
    setRefreshing(true)

      try {
        
        const result = await axiosClient.get("/notifications")

        setUserNotifications(result.data?.data || [])
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
    if (isLoadingMore || !hasMore || userNotifications.length < 20) return;
    console.log("loadingmore...")
    setIsLoadingMore(true);

    try {
      const nextPage = page + 1;

      const res = await axiosClient.get(`/notifications?page=${nextPage}&limit=20`);
      const newData = res.data?.data || [];

      if (newData.length < 20) {
        setHasMore(false); // No more data
      }

      setUserNotifications((prev: any) => [...prev, ...newData])
      setPage(nextPage);
      
    } catch (err) {
      console.error("Failed to load more", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const renderNotification = ({item, index}: {item: any, index: number}) => (
    <Notification item={item} index={index} handlePress={() => click(item)}/>
  )

  return (
    <SafeAreaView className={`h-full bg-white px-4`}>
      <Header title="Notifications" showGoBack={true} onpress={() => router.back()}/>
      
      <View className='mt-5 w-full'>

        {/* filter */}
        <View className='flex-row items-center w-full justify-between'>
          <CustomButton title='Transactions' containerStyles="w-[48%]" bgColor={active === 'transactions' ? 'bg-blue' : 'bg-blue/50'} textStyles='text-white' handlePress={transactions}/>
          <CustomButton title='Activities' containerStyles="w-[48%]"  bgColor={active === 'activities' ? 'bg-blue' : 'bg-blue/50'} textStyles='text-white' handlePress={activities}/>
        </View>
      </View>

      {/* notifications */}
      <View className='pt-4'>
            <View>
              {
                loading ? (
                  <ActivityIndicator size="large" color="#003366"/>
                ) : (
                  <FlatList
                    nestedScrollEnabled={true}
                    scrollEnabled={true}
                    data={userNotifications}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={renderNotification}
                    contentContainerStyle={{ paddingBottom: statusBarBottom }}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.4}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={() => (
                      <View>
                        <View className="w-full items-center mx-auto justify-center my-6 mt-16 max-w-52 flex-1">
                          <View className='flex items-center justify-center size-16 rounded-full bg-orangeLight'>
                            <FontAwesome name="bell" size={32} color="#FF6600"/>
                          </View>
                          <Text className="text-2xl text-center text-blue mt-4 font-ablack">Nothing to see here for now</Text>
                          <Text className="text-sm text-center text-blue mt-1 font-alight">You don't have any notifications yet</Text>
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
        
                      if (!hasMore && userNotifications.length > 19) {
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

    <CustomButtomSheet ref={bottomSheetModalRef} snapPoints={snapPoints} enablePenDown={false} dynamicSizing={false} scrollable>
      <View className='h-full'>
        <View className='flex-row w-full items-center justify-between gap-1'>
          <View className='w-8'/>
          <Text className="text-sm text-center text-gray-300 font-abold">Notification</Text>
          <TouchableOpacity onPress={() => dismiss()}>
            <AntDesign name="closecircleo" size={30} color="#003366" />
          </TouchableOpacity>
        </View>

        <BottomSheetScrollView showsVerticalScrollIndicator={false} className="mt-5">
          <View>
            <Text className="text-2xl text-blue mt-5 font-abold mb-2">{modalMessage?.title}</Text>
            <Text className="text-base text-blue mt-5 font-aregular mb-2">{modalMessage?.message}</Text>
            <Text className="text-base text-blue mt-5 font-aregular mb-2">Thank you for trusting NAVO Plus!</Text>
          </View>
        </BottomSheetScrollView>

        {(modalMessage?.type === "shop_for_me" && !modalMessage?.status) ? (
          <View>
            <CustomButton title="Arrange Shipping" handlePress={() => { dismiss(); router.push("/(protected)/(routes)/LodgeShipment") }} containerStyles={`w-full mt-4`} textStyles='text-white'/>
            <CustomButton title="I’ll Handle It Myself" handlePress={() => arrangeMyself(modalMessage?.meta?.orderId)} containerStyles="w-full mt-4" bgColor='bg-white border border-orange' textStyles='text-orange'/>
          </View>
        ) : (modalMessage?.type === "shipment_adjustment") ? (
          <View>
            <CustomButton title="Pay Balance" handlePress={() => payShipmentBalance(modalMessage?.meta)} containerStyles={`w-full mt-4`} textStyles='text-white'/>
          </View>
        ) : ''}
      </View>     
    </CustomButtomSheet>

      <StatusBar backgroundColor="#ffffff" style='dark'/>
    </SafeAreaView>
  )
}