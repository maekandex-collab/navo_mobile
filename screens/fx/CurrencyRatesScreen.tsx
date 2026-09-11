import { View, Text, ActivityIndicator, FlatList, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'
import Header from '@/components/Header'
import { router } from 'expo-router'
import { axiosClient } from '@/globalApi'
import { useToast } from 'react-native-toast-notifications'
import { images } from '@/constants'
import CurrencyTable from '@/components/CurrencyTable'

type rateType = {
  buyRate: number; 
  pair: string; 
  sellRate: number
}

export default function CurrencyRatesScreen() {

    const toast = useToast();
    const [loading, setLoading] = useState(false)
    const [rates, setRates] = useState<rateType[] | []>([])

  const loadRates = async () => {
      setLoading(true)
  
      try{
        const result = await axiosClient.get("/fx")
  
        console.log("d=",result.data)
        setRates(result.data || [])
  
    
      } catch (error: any) {
        toast.show(error.response.data.message || error.response.data.error.message,{
          type: "danger",
        });
  
      } finally {
        setLoading(false)
      } 
    }

    useEffect(() => {
        loadRates()
    }, [])

    const renderRates = ({item, index}: {item: rateType, index: number}) => (
      <CurrencyTable rate={item} index={index}/>
    )

  return (
    <SafeAreaView className={`h-full flex-1 bg-white px-4`}>
       <Header title='Exchange Rates' showGoBack={true} onpress={() => router.back()}/>
          
        <View className='flex-1 pt-4'>
            {
                loading ? (
                    <ActivityIndicator size="large" color="#003366"/>
                ) : (
                    <FlatList
                        ListHeaderComponent={() => (
                            <View className='w-full'>
                                <View className='flex-row items-center gap-3 mb-2'>
                                  <Text className='text-blue font-aregular text-2xl'>Rates</Text>
                                  <View className='rounded-xl px-3 py-1 flex-row items-center gap-1 bg-red-50'>
                                      <View className='size-2 rounded-full bg-red-600'/>
                                      <Text className='font-aregular text-red-600 text-sm'>Current</Text>
                                  </View>
                                </View>
                                <View className="w-full flex-row my-3">
                                  <Text className='text-blue font-amedium text-2xl w-1/3'>Pair</Text>
                                  <Text className='text-blue font-amedium text-2xl w-1/3'>Buy</Text>
                                  <Text className='text-blue font-amedium text-2xl w-1/3'>Sell</Text>
                                </View>
                            </View>
                        )}
                        nestedScrollEnabled={true}
                        scrollEnabled={true}
                        data={rates}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={renderRates}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 30 }}
                        ListEmptyComponent={() => (
                        <View>
                            <View className="w-full items-center mx-auto justify-center my-6 mt-8 max-w-52 flex-1">
                                <Image source={images.noTransaction} className='size-20' resizeMode='contain'/> 
                                <Text className="text-2xl text-center text-blue mt-4 font-ablack">No Currency rates yet!</Text>
                                <Text className="text-sm text-center text-blue mt-1 font-alight">All rates will show here.</Text>
                            </View>
                        </View>
                        )}
                    />
                )
            }
        </View>

      <StatusBar backgroundColor="#ffffff" style='dark'/>
    </SafeAreaView>
  )
}