import { View, Text, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import React, { useState } from 'react'
import FormField from '@/components/FormField'
import CustomButton from '@/components/CustomButton'
import { useToast } from 'react-native-toast-notifications'
import displayCurrency from '@/utils/displayCurrency'
import Checkbox from 'expo-checkbox'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'

const StoreMakePayment = ({total, isSubmitting, enableModal}: {total: number | string; isSubmitting: boolean; enableModal: (form: {}) => void}) => {

  const { userProfile } = useSelector((state: RootState) => state.profile)
  const toast = useToast();

    const [form, setForm] = useState({
      deliveryHub: 'Delivery to Hub',
      state: '',
      city: '',
      street: '',
      houseNo: '',
      closeLandmark: ''
    })

    const [checked, setChecked] = useState(false)
    
    const handleAutoFill = (isChecked: boolean) => {
    
        // Check if profile location is incomplete
        const noProfileLocation =
          !userProfile.location?.state &&
          !userProfile.location?.city &&
          !userProfile.location?.street &&
          !userProfile.location?.houseNo &&
          !userProfile.location?.closestLandmark;
    
        if(noProfileLocation){
          return toast.show("No location set on your profile", {
            type: "warning",
          });
        }
    
        const oneInputAlreadyFilled =
          form.state ||
          form.city ||
          form.street ||
          form.houseNo ||
          form.closeLandmark;
    
        const compareForm = {
          state: form.state,
          city: form.city,
          street: form.street,
          houseNo: form.houseNo,
          closestLandmark: form.closeLandmark
        }
    
        const profileLocation = {
          state: userProfile.location?.state || '',
          city: userProfile.location?.city || '',
          street: userProfile.location?.street || '',
          houseNo: userProfile.location?.houseNo || '',
          closestLandmark: userProfile.location?.closestLandmark || ''
        }

        const sameFields = JSON.stringify(profileLocation) === JSON.stringify(compareForm);
    
        if (oneInputAlreadyFilled && !sameFields) {
          return Alert.alert("Fields Edited", "One or more of these fields have been edited already and fields are not empty.")
        }
    
        setChecked(isChecked);
    
        if (isChecked) {
          setForm({
            ...form,
            state: userProfile.location?.state || '',
            city: userProfile.location?.city || '',
            street: userProfile.location?.street || '',
            houseNo: userProfile.location?.houseNo || '',
            closeLandmark: userProfile.location?.closestLandmark || ''
          });
        } else {
          setForm({
            ...form,
            state: '',
            city: '',
            street: '',
            houseNo: '',
            closeLandmark: ''
          });
        }
      };

    const submit = async () => {
    
      if(!form.deliveryHub){
        return toast.show("Delivery hub is required", {
          type: "warning",
        });
      }
      
      if(!form.state){
        return toast.show("State is required", {
          type: "warning",
        });
      }
  
      if(!form.city){
        return toast.show("City is required", {
          type: "warning",
        });
      }
  
      if(!form.street){
        return toast.show("Street is required", {
          type: "warning",
        });
      }

      if(!form.houseNo){
        return toast.show("House No. is required", {
          type: "warning",
        });
      }

      if(!form.closeLandmark){
        return toast.show("Close landmark is required", {
          type: "warning",
        });
      }

      enableModal(form)
  
    }

  return (
    <View>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === 'ios' ? 30 : 0}>
            <View>
                <View className="w-full justify-center my-4">

                  <Text className="text-sm text-blue mt-2 font-abold">Enter your location details below</Text>

                  <View className='flex-row gap-2 items-center mt-5'>
                    <Checkbox value={checked} onValueChange={handleAutoFill} color={checked ? '#FF6600' : undefined} style={{borderRadius: 5, marginTop: 5, borderColor: "#003366"}}/>
                    <Text className="text-sm text-blue mt-2 font-abold flex-1">Auto fill location details with location on your profile?</Text>
                  </View>

                  <FormField title="Delivery Hub" value={form.deliveryHub} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, deliveryHub: e })} otherStyles="mt-7" disabled/>
                  <FormField title="State" value={form.state} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, state: e })} otherStyles="mt-7" />
                  <FormField title="City" value={form.city} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, city: e })} otherStyles="mt-7"/>
                  <View className='flex-row items-center w-full justify-between gap-1'>
                    <FormField title="Street" value={form.street} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, street: e })} otherStyles="mt-7 w-[67%]" />
                    <FormField title="House No." value={form.houseNo} placeholder="No." handleChangeText={(e: any) => setForm({ ...form, houseNo: e })} otherStyles="mt-7 w-[30%]" keyboard="phone-pad"/>
                  </View>
                  <FormField title="Closest Landmark" value={form.closeLandmark} placeholder="Enter here" handleChangeText={(e: any) => setForm({ ...form, closeLandmark: e })} otherStyles="mt-7" />
                </View>
                <View className='w-full justify-center my-6'>
                  <CustomButton title={`Pay ${displayCurrency(Number(total), 'GBP')}`} handlePress={submit} containerStyles="w-full" isLoading={isSubmitting} textStyles='text-white'/>
                </View>
            </View>
        </KeyboardAvoidingView>
    </View>
  )
}

export default StoreMakePayment