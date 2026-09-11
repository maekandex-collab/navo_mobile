import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { icons } from '@/constants';
import { Image } from 'react-native';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import AntDesign from '@expo/vector-icons/AntDesign';

const CheckInShipmentCard = ({item, handlePress, index}: {item: any; handlePress: () => void, index: number}) => {
  return (
    <Pressable onPress={handlePress} className='border-b border-[#ccc] w-full'>
        <View className="justify-between w-full flex-row items-start gap-1 bg-blueLight rounded-lg px-2 py-3 my-3">
          <View className='gap-2'>
            <View className='flex-row gap-2 w-full justify-between'>
              <View  className="items-start flex-row gap-2">
                <View className={`flex items-center justify-center size-8 rounded-full bg-white`}>
                  <Image source={icons.shipments} className='size-4'/>
                </View>
                <View className='flex-col'>
                    <Text className="font-amedium text-lg text-blue max-w-72" numberOfLines={2}>{item?.itemName}</Text>
                </View>
              </View>
              <SimpleLineIcons name="options-vertical" size={18} color="#003366" />
            </View>

            <View className='flex-1 w-full flex-row gap-3'>
              <View className='flex-1 gap-1'>
                <Text className="font-aregular text-[10px] text-blue">Shipment ID</Text>
                <Text className="font-abold text-[10px] text-blue">{item?.id}</Text>
              </View>

              <View className='gap-1'>
                <Text className="font-aregular text-[10px] text-blue">Tracking ID</Text>
                <Text className="font-abold text-[10px] text-blue max-w-20">{item?.trackingId || "Nil"}</Text>
              </View>

              <View className='gap-1'>
                <Text className="font-aregular text-[10px] text-blue">Weight</Text>
                <Text className="font-abold text-[10px] text-blue">{item?.weight}kg</Text>
              </View>

              <View className='gap-1'>
                <Text className="font-aregular text-[10px] text-blue">Check-in Status</Text>
                <View className={`flex-row rounded-full border px-2 py-0.5 gap-1 items-center justify-center ${item?.shipmentStatus === "CHECKED_IN" ? "bg-green-100 border-green-500" : item?.shipmentStatus === "CHECKED_OUT" ? "bg-yellow-100 border-yellow-600" : "bg-red-100  border-red-500"}`}>
                  <Text className={`font-amedium text-[8px]  ${item?.shipmentStatus === "CHECKED_IN" ? "text-green-500" : item?.shipmentStatus === "CHECKED_OUT" ? "text-yellow-600" : "text-red-500"}`}>{item?.shipmentStatus || "CHECKED_OUT"}</Text>
                  <AntDesign name="close" size={8} color={item?.shipmentStatus === "CHECKED_IN" ? "#22c55e" : item?.shipmentStatus === "CHECKED_OUT" ? "#ca8a04" : "#ef4444"} />
                </View>
              </View>
             
            </View>
          </View>

        </View>
    </Pressable >
  )
}

export default CheckInShipmentCard