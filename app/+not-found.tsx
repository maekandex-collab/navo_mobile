import AntDesign from '@expo/vector-icons/AntDesign'
import { router } from 'expo-router'
import { View, Text, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const notFound = () => {

  return (
    <SafeAreaView className="bg-white flex-1 h-full px-4 items-center justify-center">
      <Text className='text-xl font-abold'>Screen Not Found</Text>
      <TouchableOpacity activeOpacity={0.8} className='mt-2' onPress={() => router.replace("/(protected)/(tabs)/home")}><AntDesign name="leftcircle" size={30} color="#C3C3C3"/></TouchableOpacity>
    </SafeAreaView>
  )
}

export default notFound