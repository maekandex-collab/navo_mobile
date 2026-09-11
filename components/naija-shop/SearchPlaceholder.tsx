import { View, Text, Pressable } from 'react-native'
import { TouchableOpacity } from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import Ionicons from '@expo/vector-icons/Ionicons'
import { router } from 'expo-router'
import Octicons from '@expo/vector-icons/Octicons'

const SearchPlaceholder = ({cart, showMenu, showDeleteCart, icon}: {cart: number | string; showMenu?: boolean, showDeleteCart?: boolean, icon?: any;}) => {

  return (
    <View className='py-3 pr-3 flex-row items-center gap-1 bg-dark w-full'>
      <TouchableOpacity activeOpacity={0.8} onPress={() => router.back()} className='px-2'>
        <Ionicons name="chevron-back-outline" size={28} color="#fff" />
      </TouchableOpacity>
      <View className={`flex-1 bg-dark-light border-2 gap-2 border-dark-light w-full h-14 px-3 rounded-md focus:border-orange-300 items-center justify-center flex-row`}>
        <TouchableOpacity>
          <Octicons name="search" size={20} color="#fff" />
        </TouchableOpacity>
        <Pressable onPress={() => router.push("/(protected)/(routes)/(modals)/NaijaShopSearchModal")} className={`bg-dark-light h-full flex-1 font-aregular text-base justify-center`}>
          <Text className='text-white'>Search Products...</Text>
        </Pressable>
        {showMenu && (
          <TouchableOpacity activeOpacity={0.8} onPress={() => router.push("/(protected)/(routes)/(modals)/NaijaShopVendorListModal")}>
            <Ionicons name="menu" size={26} color="#fff" className='ml-2' />
          </TouchableOpacity>
        )}
      </View>
      {showDeleteCart ? (
        icon
      ) : (
        <TouchableOpacity onPress={() => router.push("/(protected)/(routes)/NaijaShopCart")} activeOpacity={0.7} className={`flex-row rounded-md gap-2 pl-3 pr-2 min-h-[48px] justify-center items-center`}>
          <View className='relative items-center justify-center min-h-[48px]'>
            <Feather name="shopping-cart" size={22} color="#fff" />
            <Text className='absolute -right-2 top-0 bg-dark text-center text-white text-sm min-w-6 min-h-6' numberOfLines={1}>{cart}</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  )
}

export default SearchPlaceholder