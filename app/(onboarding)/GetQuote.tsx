import { View, Text, ScrollView, Image, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useState, useMemo, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import FormField from '@/components/FormField'
import CustomButton from '@/components/CustomButton'
import { Link, router } from 'expo-router'
import AntDesign from '@expo/vector-icons/AntDesign'
import { StatusBar } from 'expo-status-bar'
import RadioGroup, {RadioButtonProps} from 'react-native-radio-buttons-group';
import { data, images } from '@/constants'
import Modal from '@/components/Modal'
import { useToast } from "react-native-toast-notifications";
import { axiosClient } from '@/globalApi'
import Picker from '@/components/Picker'
import GoodsTypeModal from '@/components/select-modals/GoodsTypeModal'
import CustomToast from '@/components/CustomToast'
import Header from '@/components/Header'
import { hideLoader, showLoader } from '@/redux/LoaderSlice'
import { useDispatch } from 'react-redux'

const GetQuote = () => {

  const [form, setForm] = useState({
    service_type: "",
    location_from: "",
    location_to: "",
    weight: "",
    goods_type: "",
    email: ""
  })

  const [showToast, setShowToast] = useState(false);
  const [showGoodsModal, setShowGoodsModal] = useState(false)
  const toast = useToast();
  const dispatch = useDispatch()

  const submit = async () => {

    if(!form.service_type){
      return toast.show("Service type is not selected", {
        type: "warning",
      });
    }

    if(!form.location_from){
        return toast.show("Location from is empty", {
          type: "warning",
        });
    }

    if(!form.location_to){
      return toast.show("Location to is empty", {
        type: "warning",
      });
    }

    if(!form.weight){
      return toast.show("Weight is empty", {
        type: "warning",
      });
    }

    if(!form.goods_type){
      return toast.show("Goods type is empty", {
        type: "warning",
      });
    }

    if(!form.email){
      return toast.show("Email is empty", {
        type: "warning",
      });
    }

    try {

      dispatch(showLoader());

      const data= {
        serviceType: form.service_type,
        locationFrom: form.location_from,
        locationTo: form.location_to,
        weight: Number(form.weight),
        goodsType: form.goods_type,
        email: form.email
      }
      
      const result = await axiosClient.post("/shipments/quote", data)

      setForm({
        service_type: "",
        location_from: "",
        location_to: "",
        weight: "",
        goods_type: "",
        email: ""
      })

      setShowToast(true)

    } catch (error: any) {
      toast.show(error.response.data.message || error.response.data.error.message,{
        type: "danger",
      });

    } finally {
      dispatch(hideLoader());
    } 
  }

    const handleShowModal = (type: string) => {
      if(type === "goods"){
        setShowGoodsModal(!showGoodsModal)
      }
    }

    const handleGoodsType = (value: string) => {
      setForm({ ...form, goods_type: value })
      setShowGoodsModal(!showGoodsModal)   
    }

    const closeGoodsModal = () => {
      setShowGoodsModal(false) 
    }

  const radioButtons: RadioButtonProps[] = useMemo(() => ([
      {
          id: 'send', // acts as primary key, should be unique and non-empty string
          label: 'Send',
          value: 'Send',
          borderColor: "#FF6600",
          color: "#FF6600",
          size: 35,
          labelStyle: {fontWeight: '500', color: "#003366"}
      },
      {
          id: 'receive',
          label: 'Receive',
          value: 'Receive',
          borderColor: "#FF6600",
          color: "#FF6600",
          size: 35,
          labelStyle: {fontWeight: '500', color: "#003366"}
      }
    ]), []);


  return (
    <SafeAreaView className="bg-white h-full px-4">
      <Header title='Get Quote' showGoBack={true} onpress={() => router.back()}/>
      {showToast && (
        <CustomToast
          message="Quote request has been sent to your email"
          onClose={() => setShowToast(false)}
          image={images.emailIcon}
        />
      )}
      <KeyboardAvoidingView className='flex-1' behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === 'ios' ? 30 : 0}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="w-full justify-center my-6 mt-6">
            <Text className="text-base text-blue mt-4 font-ablack">Service type</Text>
            <RadioGroup 
              containerStyle={{marginLeft: -10}}
              layout='row'
              labelStyle={{color: "#003366"}}
              radioButtons={radioButtons} 
              onPress={(e: any) => setForm({ ...form, service_type: e })}
              selectedId={form.service_type}
            />
            <Picker title='Location from*' value={form.location_from} placeholder="Enter locatiom from" handleChangeText={(e: any) => setForm({ ...form, location_from: e.value })} data={data.location}/>
            <Picker title='Location to*' value={form.location_to} placeholder="Enter location to" handleChangeText={(e: any) => setForm({ ...form, location_to: e.value })} data={data.location}/>
            <FormField title="Weight (kg)" value={form.weight} placeholder="Enter here" handleChangeText={(e: string) => setForm({ ...form, weight: e })} otherStyles="mt-7" keyboardType="numeric"/>
            <GoodsTypeModal placeholder='Select item' selectedValue={form.goods_type} header="Select Goods Type" title='Goods Type' showModal={showGoodsModal} close={closeGoodsModal} handlePress={handleGoodsType} handleShowModal={() => handleShowModal('goods')}/>
            <FormField title="Email*" value={form.email} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, email: e })} otherStyles="mt-7" keyboardType="email-address"/>
          </View>
      </ScrollView>
    </KeyboardAvoidingView>
    <View className='w-full justify-center my-6'>
      <CustomButton title="Get Request" handlePress={submit} containerStyles="w-full" textStyles='text-white'/>
    </View>

    <StatusBar backgroundColor='#ffffff' style='dark'/>
  </SafeAreaView>
  )
}

export default GetQuote