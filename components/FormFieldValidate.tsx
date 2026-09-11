import { View, Text, TextInput, Image, TouchableOpacity } from 'react-native'
import { useState } from 'react'
import {images} from '../constants'
import { KeyboardTypeOptions } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

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
}

const FormFieldValidate = ({ title, value, placeholder, inputBg, keyboardType, handleChangeText, disabled, labelStyle, otherStyles, ...props}: formProps) => {
    
    const [isFocused, setIsFocused] = useState(false);
  
    return (
    <View className={`space-y-2 ${otherStyles}`}>
      {title ? <Text className={`text-base font-amedium pb-2 ${labelStyle ? labelStyle : 'text-blue'}`}>{title}</Text> : ''}
      <View className={`${inputBg ? inputBg : 'bg-inputBg'} border ${isFocused ? 'border-orange-100' : 'border-inputBg'} w-full h-14 px-4 rounded-md items-center flex-row gap-1`}>
        <TextInput className={`${inputBg ? inputBg : 'bg-inputBg'} flex-1 text-black font-aregular text-base h-full`} value={value} placeholder={placeholder} placeholderTextColor="#ccc" onChangeText={handleChangeText} keyboardType={keyboardType ? keyboardType: 'default'} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}/>
        {title === 'CableTV ID' && (
            <TouchableOpacity onPress={props.verifyCustomerID}  className={`bg-blue py-2 px-4 rounded-md -mr-3 ${props.disableButton ? 'opacity-50' : ''}`} disabled={props.disableButton}>
                <Text className='text-white font-amedium'>Verify</Text>
            </TouchableOpacity>
        )}
        {title === 'Meter ID' && (
            <TouchableOpacity onPress={props.verifyCustomerID}  className={`bg-blue py-2 px-4 rounded-md -mr-3 ${props.disableButton ? 'opacity-50' : ''}`} disabled={props.disableButton}>
                <Text className='text-white font-amedium'>Verify</Text>
            </TouchableOpacity>
        )}
      </View>
      {
        props.loading && title === 'CableTV ID' ? (
          <View className='mt-1 flex-row items-center gap-1'>
              <FontAwesome5 name="circle-notch" size={15} color="#22c55e" className='animate-spin-fast'/>
              <Text className='text-green-500 flex-1'>Verifying Account Details</Text>
          </View>
        ) : !props.loading && !props.data.success && props.data.message && title === 'CableTV ID' ? (
          <View className='mt-1 flex-row items-center gap-1'>
            <MaterialCommunityIcons name="close-circle" size={16} color="#ef4444" />
            <Text className='text-red-500 flex-1'>{props.data.message}</Text>
          </View>
        ) : !props.loading && props.data.success && props.data.message && title === 'CableTV ID' ? (
          <View className='mt-1 flex-row items-center gap-1'>
            <MaterialCommunityIcons name="check-circle" size={16} color="#22c55e" />
            <Text className='text-green-500 flex-1'>{props.data.message}</Text>
          </View>
        ) : ""
      }

      {
        props.loading && title === 'Meter ID' ? (
          <View className='mt-1 flex-row items-center gap-1'>
              <FontAwesome5 name="circle-notch" size={15} color="#22c55e" className='animate-spin-fast'/>
              <Text className='text-green-500 flex-1'>Verifying Account Details</Text>
          </View>
        ) : !props.loading && !props.data.success && props.data.message && title === 'Meter ID' ? (
          <View className='mt-1 flex-row items-center gap-1'>
            <MaterialCommunityIcons name="close-circle" size={16} color="#ef4444" />
            <Text className='text-red-500 flex-1'>{props.data.message}</Text>
          </View>
        ) : !props.loading && props.data.success && props.data.message && title === 'Meter ID' ? (
          <View className='mt-1 flex-row items-center gap-1'>
            <MaterialCommunityIcons name="check-circle" size={16} color="#22c55e" />
            <Text className='text-green-500 flex-1'>{props.data.message}</Text>
          </View>
        ) : ""
      }
    </View>
  )
}

export default FormFieldValidate