import { View, Text } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { TouchableOpacity } from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import { TextInput } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import { router } from 'expo-router'
import Octicons from '@expo/vector-icons/Octicons'

type formProps = {
  value?: string;
  placeholder?: any; 
  handleChangeText?: (e: any) => void;
  labelStyle?: string;
  otherStyles?: string;
  disabled?: boolean;
  cart: number | string;
  [props:string]: any;
}

const Search = ({ value, placeholder, handleChangeText, labelStyle, cart, disabled, otherStyles, ...props}: formProps) => {

  const inputRef = useRef<TextInput>(null);

  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <View className='py-3 pr-3 flex-row items-center gap-1 bg-cyan w-full'>
      <TouchableOpacity activeOpacity={0.8} onPress={() => router.back()} className='px-2'>
        <Ionicons name="chevron-back-outline" size={28} color="#000" />
      </TouchableOpacity>
      <View className={`flex-1 bg-white border-2 gap-2 border-white w-full h-14 px-3 rounded-md focus:border-orange-300 items-center justify-center flex-row`}>
        <TouchableOpacity>
          <Octicons name="search" size={20} color="#000" />
        </TouchableOpacity>
        <TextInput ref={inputRef} selectionColor="#00ced1" className={`bg-white flex-1 text-black font-aregular text-base`} value={value} placeholder={placeholder} placeholderTextColor="#ccc" onChangeText={handleChangeText} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} editable={disabled}/>
      </View>
      <TouchableOpacity onPress={() => router.push("/(protected)/(routes)/AmazonCart")} activeOpacity={0.7} className={`flex-row rounded-md gap-2 pl-3 pr-2 min-h-[48px] justify-center items-center`}>
        <View className='relative items-center justify-center min-h-[48px]'>
          <Feather name="shopping-cart" size={22} color="#003366" />
          <Text className='absolute -right-2 top-0 bg-cyan text-center text-white text-sm min-w-6 min-h-6' numberOfLines={1}>{cart}</Text>
        </View>
      </TouchableOpacity>
    </View>
  )
}

export default Search