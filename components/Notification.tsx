import { View, Text, Pressable } from 'react-native'
import React from 'react'
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DateLabels } from '@/utils/DateLabels';

const Notification = ({item, handlePress, index}: {item: any; handlePress: () => void, index: number}) => {
  return (
    <Pressable onPress={handlePress}>
        <View className="justify-between w-full flex-row items-start gap-6 bg-orangeLight rounded-lg p-2 my-1">
          <View className="items-start flex-row gap-2 flex-1">
            <View className='items-center justify-center size-7 rounded-full bg-white'>
                <FontAwesome name="bell" size={15} color="#FF6600"/>
            </View>
            <View className='flex-col flex-1'>
                <Text className="font-amedium text-base text-blue" numberOfLines={2}>{item.title}</Text>
                {/* <Text className="font-amedium text-base text-orange underline">Click to View</Text> */}
            </View>
          </View>

          <View className='items-end justify-end gap-2'>
            <Text className="font-abold text-sm text-blue">{DateLabels(item.createdAt)}</Text>
            <Text className="font-abold text-xs text-orange-300">{item.isRead === false ? 'Unread' : 'Read'}</Text>
          </View>
        </View>
    </Pressable >
  )
}

export default Notification