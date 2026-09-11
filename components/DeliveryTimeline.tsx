import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { Image } from 'react-native'
import Entypo from '@expo/vector-icons/Entypo';
import { images } from '@/constants';

type rowProp = {
    title: string;
    date: string; 
    time: string; 
    status: 'done' | 'active';
}

export default function DeliveryTimeline({title, date, time, status}: rowProp) {
  return (
    <View className="justify-between w-full flex-row items-start">
        <View className="items-start flex-row gap-2">
          <View>
            <Image source={status === "done" ? images.completed : images.pending} className="w-6 h-14" resizeMode='contain'/>
          </View>
          <View className='flex-col'>
              <View className='flex-row gap-1 items-center'>
                <Text className={`font-amedium text-base uppercase ${status === 'done' ? 'text-black' : 'text-gray-200'}`}>{title}</Text>
              </View>
              <Text className={`font-amedium text-sm ${status === 'done' ? 'text-gray-300' : 'text-gray-200'}`}>{date}</Text>
          </View>
        </View>

        <Text className={`font-amedium text-sm ${status === 'done' ? 'text-black' : 'text-gray-200'}`}>{time}</Text>
    </View>
  )
}