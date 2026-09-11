import { Modal, View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import Ionicons from '@expo/vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo';
import { StatusBar } from 'expo-status-bar';
import { useToast } from 'react-native-toast-notifications';
import { axiosClient } from '@/globalApi';
import displayCurrency from '@/utils/displayCurrency';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type dataProps = {
    plan : string;
    amount: number;
}[]

const DataPlansModal = ({placeholder, header, showModal, close, selectedValue, title, handlePress, handleShowModal, selectedNetwork}: {placeholder: string; header: string; showModal: boolean; close: () => void; selectedValue: string; title: string; handlePress: (plan: string, amount: number) => void, handleShowModal: () => void; selectedNetwork: string}) => {

    const [loading, setLoading] = useState(false)
    const [items, setItems] = useState<dataProps>([])
    const toast = useToast();
    const [dataPlans, setDataPlans] = useState([])
    const { top, bottom } = useSafeAreaInsets()

    useEffect(() => {
        const data = async () => {
    
        setLoading(true)
    
        try {
            
            const result = await axiosClient.get("/vtu/data-plans")
    
            setDataPlans(result.data.data)
            console.log("9mobile ",result.data.data['9mobile'])
            console.log("mtn ",result.data.data.mtn)
            console.log("glo ", result.data.data.glo)
            console.log("airtel", result.data.data.airtel)
    
    
        } catch (error: any) {
            toast.show(error.response.data.message || error.response.data.error.message,{
                type: "danger",
            });
        } finally {
            setLoading(false)
        }
     }
        data()
    }, [])

    let plans;

    if(selectedNetwork === 'mtn'){
        plans = dataPlans?.mtn
    }else if(selectedNetwork === 'airtel'){
        plans = dataPlans?.airtel
    }else if(selectedNetwork === 'glo'){
        plans = dataPlans?.glo
    }else if(selectedNetwork === '9mobile'){
        plans = dataPlans["9mobile"]
    }

  return (
    <View className='flex-1 items-center justify-center'>
        <Modal animationType='slide' transparent={false} visible={showModal} statusBarTranslucent onRequestClose={handleShowModal}>
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
                            <FlatList
                                nestedScrollEnabled={true}
                                scrollEnabled={true}
                                data={plans}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({item, index}: {item: {plan: string; amount: number}; index: number}) => (
                                    <TouchableOpacity key={index} onPress={() => handlePress(item.plan, item.amount)} className='my-3 w-full'>
                                        <Text className='text-lg text-blue font-amedium'>{item.plan} {selectedNetwork === 'mtn' && '('+displayCurrency(Number(item.amount),'NGN')+')'}</Text>
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
                                            <Text className="text-2xl text-center text-blue mt-4 font-ablack">Nothing to see here for now</Text>
                                            <Text className="text-sm text-center text-blue mt-1 font-alight">There is no Data Plans yet</Text>
                                        </View>
                                    </View>
                                )}
                            />
                        )
                    }
                </View>
            </View>
            <StatusBar backgroundColor="#ffffff" style='dark'/>
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

export default DataPlansModal