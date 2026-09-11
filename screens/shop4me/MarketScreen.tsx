import { View, Text, Image, Pressable } from 'react-native'
import Header from '@/components/Header'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { router } from 'expo-router'
import { images } from '@/constants'
import { FlatList } from 'react-native'
import CustomButton from '@/components/CustomButton'

const data = [
  {
    image: images.amazon,
    label: "Buy From Amazon",
    route: () => router.push("/(protected)/(routes)/Amazon")
  },
  {
    image: images.naijaShop,
    label: "Naija Shop",
    route: () => router.push("/(protected)/(routes)/NaijaShop")
  },
  {
    image: images.fooding,
    label: "Fooding",
    route: () => router.push("/(protected)/(routes)/Store")
  },
  {
    image: images.request,
    label: "Shop With Link",
    route: () => router.push("/(protected)/(routes)/Shop4Me")
  },
];

const MarketScreen = () => {

  return (
    <SafeAreaView className='h-full bg-white px-4'>
      <Header title="Market" showGoBack={true} onpress={() => router.back()}/>

        <View className='flex-1'>
          <FlatList
            ListHeaderComponent={() => (
              <View className='mt-6'>
                <Text className="text-base text-blue mt-2 font-abold">Explore our pre-installed online stores</Text>
                <Text className="text-base text-blue mt-1 font-abold mb-4">or submit a request.</Text>
              </View>
            )}
            scrollEnabled={true}
            data={data}
            keyExtractor={(item, index) => index.toString()}
            numColumns={2}
            contentContainerStyle={{gap: 15}}
            columnWrapperStyle={{gap: 10, justifyContent: 'space-between', width: '100%'}}
            renderItem={({item}) => 
                <Pressable className='px-3 py-6 items-center justify-center bg-inputBg rounded-2xl w-[48%]' onPress={item.route}>
                    <View className='bg-white size-28 my-3 rounded-full items-center justify-center'>
                        <Image source={item.image} className='w-20 h-16' resizeMode='contain'/>
                    </View>
                    <Text className="text-lg text-blue font-amedium text-center">{item.label}</Text>
                </Pressable>
            }
            showsVerticalScrollIndicator={false}
          />
        </View>
        <View className='w-full justify-center my-4'>
          <CustomButton title="Go to Previous Orders" handlePress={() => router.push("/(protected)/(routes)/Orders")} containerStyles="w-full" textStyles='text-white'/>
        </View>

      <StatusBar backgroundColor="#ffffff" style='dark'/>
    </SafeAreaView>
  )
}

export default MarketScreen