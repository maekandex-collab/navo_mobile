import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native'
import { useState } from 'react'
import AntDesign from '@expo/vector-icons/AntDesign';

type formProps = {
  value?: string;
  placeholder?: any; 
  handleChangeText?: (e: any) => void;
  labelStyle?: string;
  otherStyles?: string;
  disabled?: boolean;
  [props:string]: any;
}

const SearchInput = ({ value, placeholder, handleChangeText, labelStyle, disabled, otherStyles, ...props}: formProps) => {
  
    const [isFocused, setIsFocused] = useState(false);

    return (
    <View className={`space-y-2 ${otherStyles}`}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View className={`border ${isFocused ? 'border-orange-100' : 'border-inputBg'} w-full h-14 px-2 bg-inputBg rounded-md items-center gap-1 flex-row`}>
            <TouchableOpacity>
                <AntDesign name="search1" size={18} color="#ccc" />
            </TouchableOpacity>
            <TextInput className="flex-1 bg-inputBg text-black font-aregular text-base" placeholder={placeholder} placeholderTextColor="#ccc" onChangeText={handleChangeText} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} editable={disabled}/>
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

export default SearchInput