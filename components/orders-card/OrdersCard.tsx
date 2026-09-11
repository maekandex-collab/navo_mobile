import { View, Text, TouchableOpacity, Pressable } from 'react-native'
import React from 'react'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import WhiteButton from '../WhiteButton';
import displayCurrency from '@/utils/displayCurrency';
import moment from 'moment';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import * as Clipboard from 'expo-clipboard';
import { useToast } from 'react-native-toast-notifications';

type OrderSummaryProps = {
  item: any;
  onViewItems: () => void;
};

export default function OrdersCard({ item, onViewItems }: OrderSummaryProps) {
  
    const toast = useToast();

    const copyOrderId = async (id: string) => {
      if(id){
        const copyCode = await Clipboard.setStringAsync(id);
  
        toast.show("Order ID Copied", {
            type: "success",
          });
      } 
    }

    return (
    <View className="w-full bg-gray-100/70 rounded-lg px-3 py-3 my-4">
        <View className="w-full">
            <View className='gap-2'>
                <View  className="items-start gap-2">
                <View className="w-full flex-row gap-2 justify-between items-center">
                    <View className={`flex items-center justify-center size-8 rounded-full bg-white`}>
                    <MaterialCommunityIcons name="shopping" size={16} color={"#FF6600"} />
                    </View>
                    <View className='flex-row items-center gap-2'>
                    <WhiteButton title="View Items" handlePress={onViewItems} containerStyles='bg-white border-blue' textStyles='text-blue' icon={<MaterialCommunityIcons name="eye" size={16} color="#003366" />}/>
                    </View>
                </View>
                <View className='flex-col mb-3'>
                    <Text className="font-amedium text-lg text-blue">{displayCurrency(Number(item?.totalAmount), item?.currency)}</Text>
                </View>
                </View>
            </View>
        </View>

        <View className='gap-4'>
            <View className='w-full flex-row gap-4 border-b border-[#b8b4b4] pb-4'>
                <View className='gap-1'>
                    <Text className="font-aregular text-xs text-blue">Order ID</Text>
                    <Pressable onPress={() => copyOrderId(item?.id)} className="flex-row items-center gap-2 flex-wrap">
                        <Text className="font-abold text-sm text-blue">{item?.id}</Text>
                        <FontAwesome6 name="copy" size={14} color="#003366"/>
                    </Pressable>
                </View>
            </View>

            <View className='w-full flex-row gap-4 border-b border-[#b8b4b4] pb-4'>
                <View className='gap-1'>
                    <Text className="font-aregular text-xs text-blue">Payment Method</Text>
                    <Text className="font-abold text-sm text-blue">{item?.paymentMethod || "Nil"}</Text>
                </View>

                <View className='gap-1 flex-1 overflow-auto'>
                <Text className="font-aregular text-xs text-blue">Payment Status</Text>
                <Text className="font-abold text-sm text-blue" numberOfLines={2}>{item?.paymentStatus || "Nil"}</Text>
                </View>
            </View>

            <View className='w-full flex-row gap-4'>
                <View className='gap-1'>
                <Text className="font-aregular text-xs text-blue">Status</Text>
                <Text className="font-abold text-sm text-blue">{item?.status}</Text>
                </View>

                <View className='gap-1'>
                <Text className="font-aregular text-xs text-blue">Date Created</Text>
                <Text className="font-abold text-sm text-blue capitalize">{moment(item?.createdAt).format('llll')}</Text>
                </View>
            </View>
        </View>
    </View>
  )
}