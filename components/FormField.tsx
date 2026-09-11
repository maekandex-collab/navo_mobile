import { View, Text, TextInput, Image, TouchableOpacity } from 'react-native'
import { useState } from 'react'
import { KeyboardTypeOptions } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

type formProps = {
  title?: string; 
  value?: string;
  placeholder?: any; 
  handleChangeText?: (e: any) => void;
  labelStyle?: string;
  inputBg?: string;
  disabled?: boolean;
  otherStyles?: string;
  keyboardType?: KeyboardTypeOptions;
  [props:string]: any;
  maxLength?: number
}

const FormField = ({ title, value, placeholder, inputBg, keyboardType, handleChangeText, disabled, maxLength, labelStyle, otherStyles, ...props}: formProps) => {
    
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)
  
    return (
    <View className={`space-y-2 ${otherStyles}`}>
      {title ? <Text className={`text-base font-amedium pb-2 ${labelStyle ? labelStyle : 'text-blue'}`}>{title}</Text> : ''}
      <View className={`${inputBg ? inputBg : 'bg-inputBg'} border ${isFocused ? 'border-orange-100' : 'border-inputBg'} w-full h-14 px-4 rounded-md items-center flex-row gap-1`}>
        <TextInput className={`${inputBg ? inputBg : 'bg-inputBg'} flex-1 text-black font-aregular text-base h-full`} value={value} placeholder={placeholder} placeholderTextColor="#ccc" onChangeText={handleChangeText} secureTextEntry={title === "Password*" ? !showPassword : title === "Confirm Password*" ? !showConfirmPassword : title === "Current Password*" ? !showCurrentPassword : title === "New Password*" ? !showNewPassword : title === "Confirm New Password*" ? !showConfirmNewPassword : false} keyboardType={keyboardType ? keyboardType: 'default'} editable={!disabled} maxLength={maxLength} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}/>
        {title === 'Password*' && (
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={!showPassword ? "eye" : "eye-off"} size={24} color="#C3C3C3" />
            </TouchableOpacity>
        )}
        {title === "Confirm Password*" && (
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons name={!showConfirmPassword ? "eye" : "eye-off"} size={24} color="#C3C3C3" />
            </TouchableOpacity>
        )}
        {title === "Current Password*" && (
            <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                <Ionicons name={!showCurrentPassword ? "eye" : "eye-off"} size={24} color="#C3C3C3" />
            </TouchableOpacity>
        )}
        {title === "New Password*" && (
            <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                <Ionicons name={!showNewPassword ? "eye" : "eye-off"} size={24} color="#C3C3C3" />
            </TouchableOpacity>
        )}
        {title === "Confirm New Password*" && (
            <TouchableOpacity onPress={() => setShowConfirmNewPassword(!showConfirmNewPassword)}>
                <Ionicons name={!showConfirmNewPassword ? "eye" : "eye-off"} size={24} color="#C3C3C3" />
            </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

export default FormField