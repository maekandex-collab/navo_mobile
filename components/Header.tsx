import { View, Text, TouchableOpacity } from 'react-native'
import React, { ReactElement } from 'react'
import AntDesign from '@expo/vector-icons/AntDesign'
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';

type headerProps = {
    title: string;
    right?: ReactElement, 
    showGoBack?: boolean;
    showRight?: boolean;
    icon?: any;
    onpress?: () => void
}

export default function Header({title, right, showGoBack, showRight, icon, onpress}: headerProps) {
  return (
    <View className='flex-row items-center justify-between mt-4 pb-4 gap-1'>
      {showGoBack ? <TouchableOpacity onPress={onpress}><AntDesign name="leftcircle" size={30} color="#C3C3C3"/></TouchableOpacity>
        : <Text/>
      }
      <Text className="flex-1 text-2xl text-blue font-amedium text-center" numberOfLines={1}>{title}</Text>
      {showRight ? (
        icon
      ) : (
        <View className='w-7'/>
      )}
    </View>
  )
}