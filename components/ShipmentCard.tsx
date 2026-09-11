import { View, Text } from 'react-native'
import React from 'react'
import { icons } from '@/constants';
import { Image } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import WhiteButton from './WhiteButton';
import displayCurrency from '@/utils/displayCurrency';

const ShipmentCard = ({item, handlePress, index}: {item: any; handlePress: () => void, index: number}) => {
  return (
    <View className='border-b border-[#ccc]'>
        <View className="w-full bg-orangeLight rounded-lg px-3 py-3 my-4">
          <View className="w-full">
            <View className='gap-2'>
              <View  className="items-start gap-2">
                <View className="w-full flex-row gap-2 justify-between items-center">
                  <View className={`flex items-center justify-center size-8 rounded-full bg-white`}>
                    <Image source={icons.shipments} className='size-4'/>
                  </View>
                  <View className='flex-row items-center gap-2'>
                    <WhiteButton title="track" handlePress={handlePress} containerStyles='bg-white border-blue' textStyles='text-blue' icon={<FontAwesome name="file-text" size={12} color="#003366" />}/>
                    {/* <WhiteButton title="See Reviews" containerStyles='bg-white border-orange' textStyles='text-orange' icon={<Entypo name="star" size={12} color="#FF6600" />}/> */}
                  </View>
                </View>
                <View className='flex-col mb-3'>
                    <Text className="font-amedium text-lg text-blue">{item?.itemName}</Text>
                    <Text className="font-amedium text-lg text-blue">{displayCurrency(Number(item?.totalCost), item?.currency)}</Text>
                </View>
              </View>
            </View>
          </View>

          <View className='gap-4 w-full'>
            <View className='w-full flex-row gap-4 border-b border-[#b8b4b4] pb-4'>
              <View className='gap-1'>
                <Text className="font-aregular text-xs text-blue">Goods type</Text>
                <Text className="font-abold text-sm text-blue max-w-24">{item?.goodsType}</Text>
              </View>

              <View className='gap-1'>
                <Text className="font-aregular text-xs text-blue">Tracking ID</Text>
                <Text className="font-abold text-sm text-blue max-w-28">{item?.trackingId || "Nil"}</Text>
              </View>

              <View className='gap-1 flex-1'>
                <Text className="font-aregular text-xs text-blue">Shipment ID</Text>
                <Text className="font-abold text-sm text-blue">{item?.id}</Text>
              </View>
            </View>

            <View className='w-full flex-row gap-4 border-b border-[#b8b4b4] pb-4'>
              <View className='gap-1'>
                <Text className="font-aregular text-xs text-blue">Delivery Timeline</Text>
                <Text className="font-abold text-sm text-blue">{item?.deliveryTimeline || "Nil"}</Text>
              </View>

              <View className='gap-1 flex-1 overflow-auto'>
                <Text className="font-aregular text-xs text-blue">Delivery Address</Text>
                <Text className="font-abold text-sm text-blue" numberOfLines={2}>{item?.locationTo}</Text>
              </View>
            </View>

            <View className='w-full flex-row gap-4'>
              <View className='gap-1'>
                <Text className="font-aregular text-xs text-blue">Weight</Text>
                <Text className="font-abold text-sm text-blue">{item?.weight}kg</Text>
              </View>

              <View className='gap-1'>
                <Text className="font-aregular text-xs text-blue">Payment status</Text>
                <Text className="font-abold text-sm text-blue capitalize">{item?.transaction?.paymentStatus}</Text>
              </View>

              <View className='gap-1 flex-1'>
                <Text className="font-aregular text-xs text-blue">Shipment status</Text>
                <Text className={`font-abold text-sm capitalize ${item?.shipmentStatus === "COMPLETED" ? "text-green-500" : item?.shipmentStatus === "PRE-TRANSIST" ? "text-red-500" : item?.shipmentStatus === "TRANSIST" ? "text-yellow-600" : "text-blue"}`}>{item?.shipmentStatus}</Text>
              </View>
            </View>
          </View>
        </View>
    </View>
  )
}

export default ShipmentCard