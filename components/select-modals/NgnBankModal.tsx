import { Modal, View, Text, TouchableOpacity, FlatList, ActivityIndicator, Image, Pressable } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import Ionicons from '@expo/vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo';
import { StatusBar } from 'expo-status-bar';
import { axiosClient } from '@/globalApi';
import { useToast } from 'react-native-toast-notifications';
import SearchInput from '../SearchInput';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type bankType = {
    code: string; 
    logo: string; 
    name: string; 
}[]

const NgnBankModal = ({placeholder, header, showModal, close, selectedValue, title, handlePress, handleShowModal}: {placeholder: string; header: string; showModal: boolean; close: () => void; selectedValue: string; title: string; handlePress: (bank: any) => void, handleShowModal: () => void}) => {

    const { top, bottom } = useSafeAreaInsets()
    const toast = useToast();
    const [loading, setLoading] = useState(false)
    const [items, setItems] = useState<bankType>([])
    const [allBanks, setAllBanks] = useState<bankType>([])
    const [query, setQuery] = useState('');

    const data = async () => {
    
        setLoading(true)
    
        try {
            
            const result = await axiosClient.get("/fx/get-banks")
    
            console.log("d", result.data?.banks.data)
            setItems(result.data?.banks.data)
            setAllBanks(result.data?.banks.data)
    
    
        } catch (error: any) {
            toast.show(error.response.data.message || error.response.data.error.message,{
                type: "danger",
            });
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        data()
    }, [])

    const filteredBanks = useMemo(() => {
        return query
            ? allBanks.filter(bank =>
                bank.name.toLowerCase().includes(query.toLowerCase()) ||
                bank.code.includes(query)
            )
            : allBanks;
    }, [query, allBanks]);

    useEffect(() => {
        setItems(filteredBanks);
    }, [filteredBanks]);

  return (
    <View className='flex-1 items-center justify-center'>
        <Modal animationType='slide' transparent={false} statusBarTranslucent visible={showModal} onRequestClose={handleShowModal}>
            <View className='flex-1'>
                <View className='px-4' style={{ paddingTop: top, paddingBottom: bottom }}>
                    <View className='flex-row items-center justify-between gap-2 py-2'>
                        <Text className='font-bold text-lg text-blue'>{header}</Text>
                        <TouchableOpacity onPress={() => close()}>
                            <Ionicons name="close" size={28} color="#003366" />
                        </TouchableOpacity>
                    </View>
                    {
                        loading ? (
                            <ActivityIndicator size="large" color="#003366"/>
                        ) : (
                            <View className='w-full'>
                                <View className='w-full my-2'>
                                    <SearchInput value={query} handleChangeText={(text) => setQuery(text)} disabled={allBanks.length !== 0} placeholder="Search Banks..."/>
                                </View>
                                <FlatList
                                    nestedScrollEnabled={true}
                                    scrollEnabled={true}
                                    data={items}
                                    keyExtractor={(item, index) => index.toString()}
                                    renderItem={({item, index}) => (
                                        <TouchableOpacity key={index} onPress={() => handlePress(item)} className='my-3 flex-row items-center gap-2 w-full'>
                                            {item.logo ? (
                                                <Image source={{ uri: item.logo || 'https://example.com/image.png' }} style={{ width: 30, height: 30 }}/>
                                            ) : (
                                                <FontAwesome name="bank" size={20} color="black" />
                                            )}
                                            <Text className='text-lg text-blue font-amedium'>{item.name}</Text>
                                        </TouchableOpacity>
                                    )}
                                    showsVerticalScrollIndicator={false}
                                    contentContainerStyle={{ paddingBottom: bottom + 8}}
                                    ListEmptyComponent={() => (
                                        <View className='h-[70vh]'>
                                            <View className="w-full items-center mx-auto justify-center my-6 mt-16 max-w-60 flex-1">
                                                <View className='flex items-center justify-center size-16 rounded-full bg-orangeLight'>
                                                    <Entypo name="list" size={32} color="#FF6600"/>
                                                </View>
                                                <Text className="text-xl text-center text-blue mt-4 font-ablack">{query ? "No Results Found" : "Something went wrong"}</Text>
                                                <Text className="text-sm text-center text-blue py-2 font-alight">{query ? "Check your input" : "Please try again"}</Text>
                                                {!query && (
                                                    <Pressable onPress={data}>
                                                        <SimpleLineIcons name="refresh" size={24} color="#003366" />
                                                    </Pressable>
                                                    )}
                                            </View>
                                        </View>
                                    )}
                                />
                            </View>
                        )
                    }        
                </View>
                <StatusBar backgroundColor="#ffffff" style='dark'/>
            </View>
        </Modal>
        <View className=' mt-4'>
            <Text className={`text-base font-amedium pb-2 text-blue`}>{title}</Text>
            <TouchableOpacity className='border-2 border-inputBg bg-inputBg w-full h-14 px-4 rounded-md items-center gap-1 flex-row' onPress={handleShowModal}>
                <Text className='flex-1 text-[#ccc] font-aregular text-base' numberOfLines={1}>{selectedValue ? selectedValue : placeholder}</Text>
                <Ionicons name="chevron-down-circle-sharp" size={24} color="#C3C3C3" />
            </TouchableOpacity>
        </View> 
    </View>
  )
}

export default NgnBankModal