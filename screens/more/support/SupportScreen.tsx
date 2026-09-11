import { View, Text, ScrollView, Pressable, FlatList, Touchable, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import Header from '@/components/Header'
import { StatusBar } from 'expo-status-bar'
import SpaceBetween from '@/components/SpaceBetween'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Entypo from '@expo/vector-icons/Entypo';
import Fontisto from '@expo/vector-icons/Fontisto';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'
import AntDesign from '@expo/vector-icons/AntDesign';
import * as Clipboard from 'expo-clipboard';
import { Linking } from 'react-native'
import { useToast } from 'react-native-toast-notifications'


const data = [
    {
      label: "LinkedIn",
      icon: "linkedin"
    },
    {
      label: "Twitter",
      icon: "twitter"
    },
    {
      label: "Instagram",
      icon: "instagram-with-circle"
    },
    {
      label: "Facebook",
      icon: "facebook-with-circle"
    }
  ]

export default function SupportScreen() {

    const toast = useToast();
    const [phoneNo, setPhoneNo] = useState('+2348029386768')

    const copyPhoneNo = async () => {
      await Clipboard.setStringAsync(phoneNo);
      toast.show("Phone Number Copied", {
        type: "success",
      });
    }

  return (
    <SafeAreaView className='h-full bg-white px-4'>
      <Header title="Support" showGoBack={true} onpress={() => router.back()}/>
      
        <View className='mt-4'> 
          <FlatList
            ListHeaderComponent={() => (
              <View>
                  <View className="justify-between w-full flex-row items-center bg-white border-b border-gray-100 rounded-lg py-3">
                      <Pressable onPress={() => Linking.openURL(`tel:${phoneNo}`)} className="items-center flex-row gap-2">
                          <View className={`flex items-center justify-center size-10 rounded-full bg-orangeLight `}>
                              <FontAwesome name="phone" size={22} color={"#FF6600"} />
                          </View>
                      
                          <View className='flex-col'>
                              <View className='flex-row gap-1 items-center'>
                                  <Text className="font-amedium text-base text-blue">Call Us: {phoneNo}</Text>
                              </View>
                              <Text className={`font-amedium text-gray-300 text-[9px]`}>For quick assistance over the phone.</Text>
                          </View>
                      </Pressable>

                      <TouchableOpacity onPress={copyPhoneNo}>
                        <FontAwesome6 name="copy" size={20} color="#FF6600" />
                      </TouchableOpacity>
                  </View>
                  <SpaceBetween onpress={() => Linking.openURL('https://wa.me/2348178740844?text=Hello%2C%20I%20need%20support')} title='DM on WhatsApp' desc='For fast and convenient support.' descStyle='text-[9px]' lefticon={<Fontisto name="whatsapp" size={19} color={"#FF6600"} />}/>
                  <Text className="text-base text-blue font-aregular" style={{marginTop: 140}}>Connect with us:</Text>
              </View>
            )}
            scrollEnabled={true}
            data={data}
            keyExtractor={(item, index) => index.toString()}
            numColumns={2}
            contentContainerStyle={{gap: 10}}
            columnWrapperStyle={{gap: 10, justifyContent: 'space-between', width: '100%'}}
            renderItem={({item}: {item: any}) => 
              <View className='p-3 flex-row items-center justify-between bg-orangeLight rounded-lg w-[48%]'>
                  <View className='flex-row items-center gap-1'>
                      <Entypo name={item.icon} size={20} color="#FF6600" />
                      <Text className="text-sm text-blue font-amedium">{item.label}</Text>
                  </View>
                  <AntDesign name="arrowright" size={18} color="#FF6600" />
              </View>
            }
            showsVerticalScrollIndicator={false}
          />
        </View>
      <StatusBar backgroundColor="#ffffff" style='dark'/>
    </SafeAreaView>
  )
}