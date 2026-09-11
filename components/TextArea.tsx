import { View, Text, TextInput, Image, TouchableOpacity } from 'react-native'
import { useState } from 'react'
import {images} from '../constants'

type formProps = {
  title: string; 
  value: string;
  placeholder?: any; 
  handleChangeText?: (e: any) => void;
  labelStyle?: string,
  otherStyles?: string;
  [props:string]: any;
}

const TextArea = ({ title, value, placeholder, handleChangeText, labelStyle, otherStyles, ...props}: formProps) => {
  
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <View className={`space-y-2 w-full ${otherStyles}`}>
      <Text className={`text-base font-amedium pb-2 ${labelStyle ? labelStyle : 'text-blue'}`}>{title}</Text>
      <View className={`border ${isFocused ? 'border-orange-100' : 'border-inputBg'} w-full h-44 py-2 px-4 bg-inputBg rounded-md flex-row`}>
        <TextInput className="flex-1 bg-inputBg text-black font-aregular text-base h-40" textAlignVertical='top' multiline={true} value={value} placeholder={placeholder} placeholderTextColor="#ccc" onChangeText={handleChangeText} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}/>
      </View>
    </View>
  )
}

export default TextArea