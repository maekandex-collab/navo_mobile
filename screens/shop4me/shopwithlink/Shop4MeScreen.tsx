import { View, Text, ScrollView, Platform, TouchableOpacity, KeyboardAvoidingView } from 'react-native'
import React, { useState, useCallback } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import FormField from '@/components/FormField'
import CustomButton from '@/components/CustomButton'
import { Link, router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import Feather from '@expo/vector-icons/Feather';
import Header from '@/components/Header'
import TextArea from '@/components/TextArea'
import { useToast } from 'react-native-toast-notifications'
import { Shop4MeAddItem, Shop4MeGetItems } from '@/utils/CartStorage'
import { generateCartId } from '@/utils/GenerateID'
import { useFocusEffect } from '@react-navigation/native'
import { getFormattedCartCount } from '@/utils/getFormattedCartCount'

type Shop4MeCartItemType = {
  id: string
  goodSize: string,
  color: string,
  item: string,
  details: string,
  quantity: number,
  onlineStoreLink: string,
};

const Shop4MeScreen = () => {

  const [showGoodsModal, setShowGoodsModal] = useState(false)
  const [showCatModal, setShowCatModal] = useState(false)
  const toast = useToast();
  const [cart, setCart] = useState<Shop4MeCartItemType[]>([]);

  const [form, setForm] = useState({
    goodSize: '',
    color: '',
    item: '',
    details: '',
    quantity: '',
    onlineStoreLink: '',
    amount: ''
  })

  const urlRegex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/\S*)?$/;

  console.log("formsdata", form)
  
  const loadCart = () => {
    const items = Shop4MeGetItems();
    setCart(items);
  };

  useFocusEffect(
    useCallback(() => {
  
      loadCart();
    }, [])
  );

  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const submit = async () => {

    if(!form.goodSize){
      return toast.show("Size is empty", {
        type: "warning",
      });
    }

    if(!form.color){
        return toast.show("Color is empty", {
          type: "warning",
        });
    }

    if(!form.item){
      return toast.show("Product name is empty", {
        type: "warning",
      });
    }

    if(!form.quantity){
      return toast.show("Quantity is empty", {
        type: "warning",
      });
    }

    if(!form.details){
      return toast.show("Details is empty", {
        type: "warning",
      });
    }

    if(!form.amount){
      return toast.show("Product amount is empty", {
        type: "warning",
      });
    }

    if(!form.onlineStoreLink){
      return toast.show("Online Store link is empty", {
        type: "warning",
      });
    }

    if(!urlRegex.test(form.onlineStoreLink)){
      return toast.show("Invalid Url Link", {
        type: "warning",
      });
    }

    const data = {
      ...form,
      quantity: Number(form.quantity),
      amount: Number(form.amount)
    }

    router.push({
      pathname: "/(protected)/(routes)/Shop4MeLocation",
      params: { shopData: JSON.stringify(data) },
    });

  }

    const AddtoCart = () => {

      if(!form.goodSize){
        return toast.show("Size is empty", {
          type: "warning",
        });
      }
  
      if(!form.color){
          return toast.show("Color is empty", {
            type: "warning",
          });
      }
  
      if(!form.item){
        return toast.show("Product name is empty", {
          type: "warning",
        });
      }
  
      if(!form.quantity){
        return toast.show("Quantity is empty", {
          type: "warning",
        });
      }
  
      if(!form.details){
        return toast.show("Details is empty", {
          type: "warning",
        });
      }

      if(!form.amount){
        return toast.show("Product amount is empty", {
          type: "warning",
        });
      }
  
      if(!form.onlineStoreLink){
        return toast.show("Online Store link is empty", {
          type: "warning",
        });
      }

      if(!urlRegex.test(form.onlineStoreLink)){
        return toast.show("Invalid Url Link", {
          type: "warning",
        });
      }

      const cartId = generateCartId();
  
      const cartItem = {
        id: cartId,
        ...form,
        quantity: Number(form.quantity),
        amount: Number(form.amount)
      }

      Shop4MeAddItem(cartItem)

      toast.show("Item Added to Cart", {
        type: "success",
      });

      loadCart();

      setForm({
        goodSize: '',
        color: '',
        item: '',
        details: '',
        quantity: '',
        onlineStoreLink: '',
        amount: ''
      })
      
    }

    const closeCatModal = () => {
      setShowCatModal(false) 
    }

    const closeGoodsModal = () => {
      setShowGoodsModal(false) 
    }

    const icon = () => (
      <TouchableOpacity onPress={() => router.push("/(protected)/(routes)/Cart")} activeOpacity={0.7} className={`flex-row rounded-md gap-2 px-2 min-h-[48px] justify-center items-center`}>
        <View className='relative items-center justify-center min-h-[48px]'>
          <Feather name="shopping-cart" size={28} color="#003366" />
          <Text className='absolute -right-2 top-0 p-1 rounded-full bg-orange text-center text-white text-xs min-w-6 min-h-6' numberOfLines={1}>{getFormattedCartCount(cart)}</Text>
        </View>
      </TouchableOpacity>
    )

  return (
    <SafeAreaView className="bg-white h-full px-4">
      <Header title='Shop With Link' showGoBack={true} onpress={() => router.back()} showRight={true} icon={icon()}/>
      <KeyboardAvoidingView className='flex-1' behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === 'ios' ? 30 : 0}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="w-full justify-center my-4 mt-6">

            <Text className="text-sm text-blue mt-2 font-abold">With just few details, we’ll help you shop,</Text>
            <Text className="text-sm text-blue mt-1 font-abold mb-2">while you relax.</Text>


            <FormField title="Paste your online item/store link here" value={form.onlineStoreLink} placeholder="Paste here" handleChangeText={(e: any) => setForm({ ...form, onlineStoreLink: e })} otherStyles="mt-4"/>
            <FormField title="Item Name" value={form.item} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, item: e })} otherStyles="mt-4"/>
            <FormField title="Size" value={form.goodSize} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, goodSize: e })} otherStyles="mt-4"/>
            <FormField title="Color" value={form.color} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, color: e })} otherStyles="mt-4"/>
            <FormField title="Quantity" value={form.quantity} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, quantity: e })} otherStyles="mt-4" keyboardType="number-pad"/>
            <FormField title="Item Amount (GBP)" value={form.amount} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, amount: e })} otherStyles="mt-4" keyboardType="numeric"/>
            <TextArea title="Details" value={form.details} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, details: e })} otherStyles="mt-4"/>
          </View>
      </ScrollView>
    </KeyboardAvoidingView>
    <View className='w-full justify-center gap-2 my-4'>
      <CustomButton title="Add to cart" handlePress={AddtoCart} containerStyles="w-full" bgColor='bg-white border border-orange' isLoading={isSubmitting} textStyles='text-orange'/>
      <CustomButton title="Continue" handlePress={submit} containerStyles="w-full" isLoading={isSubmitting} textStyles='text-white'/>
    </View>

    <StatusBar backgroundColor="#ffffff" style='dark'/>
  </SafeAreaView>
  )
}

export default Shop4MeScreen