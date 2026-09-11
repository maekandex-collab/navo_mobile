import { View, ScrollView, Platform, KeyboardAvoidingView } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import FormField from '@/components/FormField'
import CustomButton from '@/components/CustomButton'
import { router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import Header from '@/components/Header'
import TextArea from '@/components/TextArea'
import GoodsTypeModal from '@/components/select-modals/GoodsTypeModal'
import ItemCategoryModal from '@/components/select-modals/ItemCategoryModal'
import { useToast } from 'react-native-toast-notifications'
import { Shop4MeGetItems, Shop4MeUpdateItem } from '@/utils/CartStorage'
import { useLocalSearchParams } from 'expo-router'

type Shop4MeCartItemType = {
  id: string
  goodSize: string
  color: string
  item: string
  details: string
  quantity: number
  amount: number
  onlineStoreLink: string
};

const EditCartScreen = () => {

  const { item } = useLocalSearchParams() as any;
  const parsedItem = item ? JSON.parse(item as string) : null;
  
  const [showGoodsModal, setShowGoodsModal] = useState(false)
  const [showCatModal, setShowCatModal] = useState(false)
  const toast = useToast();

  const [form, setForm] = useState({
    id: '',
    goodSize: '',
    color: '',
    item: '',
    details: '',
    quantity: '',
    amount: '',
    onlineStoreLink: ''
  })

  useEffect(() => {
    if (parsedItem) {
      setForm({
        id: parsedItem.id || '',
        goodSize: parsedItem.goodSize || '',
        color: parsedItem.color || '',
        item: parsedItem.item || '',
        details: parsedItem.details || '',
        quantity: parsedItem.quantity?.toString() || '',
        amount: parsedItem.amount?.toString() || '',
        onlineStoreLink: parsedItem.onlineStoreLink || ''
      });
    }
  }, []);

  const urlRegex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/\S*)?$/;

  console.log("formsdata", form)

  const handleShowModal = (type: string) => {
    if(type === "goods"){
      setShowCatModal(false)
      setShowGoodsModal(!showGoodsModal)
    }else if(type === "cat"){
      setShowGoodsModal(false)
      setShowCatModal(!showCatModal)
    }
  }

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

    if(!form.amount){
      return toast.show("Product amount is empty", {
        type: "warning",
      });
    }

    if(!form.details){
      return toast.show("Details is empty", {
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

    Shop4MeUpdateItem(data)

    toast.show("Item Updated Successfully", {
        type: "success",
    });

    router.back();

  }

  return (
    <SafeAreaView className="bg-white h-full px-4">
      <Header title='Edit Product' showGoBack={true} onpress={() => router.back()}/>
      <KeyboardAvoidingView className='flex-1' behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === 'ios' ? 30 : 0}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="w-full justify-center my-4">

            <FormField title="Online Store link" value={form.onlineStoreLink} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, onlineStoreLink: e })} otherStyles="mt-4"/>
            <FormField title="Product Name" value={form.item} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, item: e })} otherStyles="mt-4"/>
            <FormField title="Size" value={form.goodSize} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, goodSize: e })} otherStyles="mt-4"/>
            <FormField title="Color" value={form.color} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, color: e })} otherStyles="mt-4"/>
            <FormField title="Quantity" value={form.quantity} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, quantity: e })} otherStyles="mt-4" keyboardType="number-pad"/>
            <FormField title="Product Amount(GBP)" value={form.amount} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, amount: e })} otherStyles="mt-4" keyboardType="numeric"/>
            <TextArea title="Details" value={form.details} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, details: e })} otherStyles="mt-4"/>
          </View>
      </ScrollView>
    </KeyboardAvoidingView>
    <View className='w-full justify-center gap-2 my-4'>
      <CustomButton title="Save Changes" handlePress={submit} containerStyles="w-full" isLoading={isSubmitting} textStyles='text-white'/>
    </View>

    <StatusBar backgroundColor="#ffffff" style='dark'/>
  </SafeAreaView>
  )
}

export default EditCartScreen