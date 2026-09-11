import { View, Text, ScrollView, TouchableOpacity, Platform, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import Header from '@/components/Header'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import SingleShipmentCard from '@/components/SingleShipmentCard'
import WhiteButton from '@/components/WhiteButton'
import DeliveryTimeline from '@/components/DeliveryTimeline'
import Modal from '@/components/Modal'
import CustomButton from '@/components/CustomButton'
import AntDesign from '@expo/vector-icons/AntDesign'
// import MapView from "react-native-maps";
import { StyleSheet } from 'react-native'
import { useToast } from 'react-native-toast-notifications'
import { axiosClient } from '@/globalApi'
import { ActivityIndicator } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import moment from 'moment'

type timeLineType =  {
  shipmentStatus: string; 
  status: "done" | "active"; 
  updatedAt: string
}

type shipmentType = {
  clearanceFee: number | null;
  createdAt: string; 
  currency: string;
  deliveryStation: string;
  deliveryTimeline: string | null;
  deliveryTypeFrom: string; 
  deliveryTypeTo: string;
  goodsType: string;
  id: string; 
  itemDescription: string | null; 
  itemName: string; 
  locationFrom: string;
  locationTo: string;
  paymentMethod: string; 
  paymentStatus: string;
  pricePerKg: number;
  reasonForDecline: string; 
  serviceType: string; 
  shipmentStatus: string; 
  stripeTransactionId: string | null; 
  subtotal: string | null; 
  timeline: timeLineType[], 
  totalCost: number; 
  trackingId: string | null; 
  updatedAt: string; 
  userId: string;
  weight: string;
}

const ShipmentProgressScreen = () => {

    const toast = useToast()
    const { track } = useLocalSearchParams() as any;
    const parsedtrackdata = track ? JSON.parse(track) : null;
    const insets = useSafeAreaInsets();
    const statusBarBottom = insets.bottom + 100;
    const [loading, setLoading] = useState(true)
    const [shipment, setShipment] = useState<shipmentType | null>(null)

   const [modalVisible, setModalVisible] = useState(false)

   const getShipmentById = async () => {

    try {

      console.log("ship",shipment)
      const result = await axiosClient.get(`/shipments/${parsedtrackdata?.id}`)

      console.log("timeline=",result.data)
      setShipment(result.data || {});

    } catch (error: any) {
      toast.show(error.response.data.message || error.response.data.error.message,{
        type: "danger",
      });
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getShipmentById();
  }, []);
  
    // const viewMap = async () => {
    //   //   setModalVisible(!modalVisible)
    //   toast.show("This feature is coming soon!",{
    //     type: "warning",
    //   });
    // }
  
    const close =  () => {
      setModalVisible(!modalVisible)
    }
  
    const renderTimeline = ({item, index}: {item: timeLineType, index: number}) => {
      return (
        <DeliveryTimeline title={item?.shipmentStatus} status={item?.status} date={moment(item?.updatedAt).format('LL')} time={moment(item?.updatedAt).format('LT')}/>
      )
    }

  return (
    <SafeAreaView className='h-full bg-white px-4'>
        <Header title="Shipment Info" showGoBack={true} onpress={() => router.back()}/>
        <View className='flex-1'>
          {
              loading ? (
                <ActivityIndicator size="large" color="#003366"/>
              ) : (
                  <View className='w-full'>
                      <FlatList
                        ListHeaderComponent={() => (
                          <View>
                            <SingleShipmentCard item={shipment}/>
                            <View className='gap-4 pb-6'>
                              <View className="w-full flex-row gap-2 justify-between items-center">
                                <View>
                                  <Text className="text-xl text-blue font-amedium">Shipment Progress</Text>
                                </View>
                                {/* <View className='flex-row items-center gap-2'>
                                  <WhiteButton title="View Map" containerStyles='bg-white border-blue' textStyles='text-blue' handlePress={viewMap}/>
                                </View> */}
                              </View>

                              <Text className='p-4 bg-blueLight text-blue font-abold rounded-lg'>Timeline</Text>
                            </View>
                          </View>
                        )}
                        nestedScrollEnabled={true}
                        scrollEnabled={true}
                        data={shipment?.timeline}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={renderTimeline}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: statusBarBottom }}
                        ListEmptyComponent={() => (
                            <View className='h-[70vh]'>
                                <View className="w-full items-center mx-auto justify-center my-6 mt-16 max-w-60 flex-1">
                                    <View className='flex items-center justify-center size-16 rounded-full bg-orangeLight'>
                                        <FontAwesome name="bank" size={20} color="#FF6600" />
                                    </View>
                                    <Text className="text-xl text-center text-blue mt-4 font-ablack">No Shipment Found</Text>
                                    <Text className="text-sm text-center text-blue py-2 font-alight">Try again later.</Text>
                                </View>
                            </View>
                        )}
                      />
                  </View>
              )
          }        
      </View>

      {/* <Modal showModal={modalVisible} addheight={400}>
        <View>
          <View className='flex-row w-full items-center justify-between gap-1'>
            <View className='w-8'/>
            <Text className="text-sm text-center text-gray-300 font-abold">Track Shipment</Text>
            <TouchableOpacity  onPress={() => setModalVisible(false)}>
              <AntDesign name="closecircleo" size={30} color="#003366" />
            </TouchableOpacity>
          </View>

          <View className='mt-10 border-2 border-gray-100'>
            <MapView style={styles.map} />
          </View>

          <CustomButton title="Close" handlePress={close} containerStyles={`w-full mt-7`} textStyles='text-white'/>
        </View>
      </Modal> */}

      <StatusBar backgroundColor="#ffffff" style='dark'/>
    </SafeAreaView>
  )
}

export default ShipmentProgressScreen

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: 200,
  },
});