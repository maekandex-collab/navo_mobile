import { useState } from 'react';
import { View, TextInput } from 'react-native'

type formProps = {
  value?: string;
  placeholder?: any; 
  handleChangeText?: (e: any) => void;
  labelStyle?: string,
  otherStyles?: string;
  [props:string]: any;
}

const TextInputBox = ({ value, placeholder, handleChangeText, labelStyle, otherStyles, ...props}: formProps) => {
  
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className={`space-y-2 ${otherStyles}`}>
      <View className={`border ${isFocused ? 'border-orange-100' : 'border-inputBg'} w-full h-14 px-2 bg-inputBg rounded-md items-center flex-row`}>
        <TextInput className="flex-1 bg-inputBg text-black font-aregular text-base" value={value} placeholder={placeholder} placeholderTextColor="#ccc" onChangeText={handleChangeText} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}/>
      </View>
    </View>
  )
}

export default TextInputBox