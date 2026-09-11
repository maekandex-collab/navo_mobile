import { View, Text, TouchableOpacity, Pressable } from 'react-native'
import React from 'react'
import AntDesign from '@expo/vector-icons/AntDesign'

const BeneficiaryCard = ({item, handlePress, handleDelete, index}: {item: any; handlePress: () => void, handleDelete: () => void, index: number}) => {
  return (
    <View className='flex-row items-center justify-between gap-4 w-full bg-inputBg rounded-md mb-4 px-4'>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8} className='flex-1 py-6'>
          <Text className="text-xl text-blue font-amedium uppercase">{item?.accountName}</Text>
          <Text className="text-lg text-blue font-amedium">{item?.accountNumber}</Text>
          <Text className="text-lg text-blue font-amedium">{item?.bankName}</Text>
          {item?.sortCode && <Text className="text-lg text-blue font-amedium">Sort code: {item?.sortCode}</Text>}
      </TouchableOpacity>
      <Pressable onPress={handleDelete}>
          <AntDesign name="deleteuser" size={35} color="#003366" />
      </Pressable>
    </View>
  )
}

export default BeneficiaryCard