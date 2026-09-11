import { View, Text, Pressable, Image } from 'react-native'
import React, { ReactElement } from 'react'
import Entypo from '@expo/vector-icons/Entypo';

type rowProp = {
  title: string;
  desc: string; 
  image?: any; 
  balance?: string;
  descStyle?: string;
  lefticon?: ReactElement;
  onpress: () => void;
}

export default function SpaceBetween({
  title,
  desc,
  descStyle,
  image,
  onpress,
  balance,
  lefticon
}: rowProp) {
  return (
    <Pressable 
      onPress={onpress} 
      className="justify-between w-full flex-row items-center bg-white border-b border-gray-100 py-3"
    >
      {/* Left side (icon + text) */}
      <View className="flex-1 w-full flex-row items-center gap-2">
        {lefticon ? (
          <View className="items-center justify-center size-10 rounded-full bg-orangeLight">
            {lefticon}
          </View>
        ) : (
          <View>
            <Image 
              source={image} 
              className="w-10 h-10" 
              resizeMode="contain" 
            />
          </View>
        )}
        
        {/* Title + description */}
        <View className="flex-1 flex-col">
          <View className="flex-row items-center">
            <Text 
              className="font-amedium text-base text-blue flex-1"
              numberOfLines={1}
            >
              {title}
            </Text>

            {balance && (
              <View className="ml-2 rounded-full px-2 py-1 bg-orangeLight flex-row gap-1 items-center">
                <Text className="font-alight text-xs text-orange">Bal:</Text>
                <Text className="font-amedium text-xs text-orange">{balance}</Text>
              </View>
            )}
          </View>

          <Text 
            className={`font-amedium text-gray-300 ${descStyle ? descStyle : 'text-xs'}`} 
            numberOfLines={1}
          >
            {desc}
          </Text>
        </View>
      </View>

      {/* Right arrow */}
      <Entypo name="chevron-small-right" size={24} color="#787878" />
    </Pressable>
  )
}
