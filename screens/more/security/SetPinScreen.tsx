import CustomButton from '@/components/CustomButton';
import Header from '@/components/Header';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Keypad from 'react-native-simple-keypad';
import { useToast } from 'react-native-toast-notifications';
import { axiosClient } from '@/globalApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { setProfile } from '@/redux/ProfileSlice';
import { useDispatch } from 'react-redux';
import { hideLoader, showLoader } from '@/redux/LoaderSlice';

export default function SetPinScreen() {
  const [pinCode, setPinCode] = useState<any>([]);
  const [displayPinCode, setDisplayPinCode] = useState<any>([]);
  const toast = useToast();
  const dispatch = useDispatch()

  const keys = (value: number | string) => {
    if (value === "delete") {
      if(pinCode.length > 0){
        setPinCode((prevCode: any) => prevCode.slice(0, prevCode.length - 1));
        setDisplayPinCode((prevCode: any) => prevCode.slice(0, prevCode.length - 1));
      }

    } else if (typeof value === "number") {
      if(pinCode.length < 4){
        setPinCode((prevCode: any) => [...prevCode, value]);
        setDisplayPinCode((prevCode: any) => [...prevCode, value]);

        // After 500ms, replace the last entered number with "*"
        setTimeout(() => {
          setDisplayPinCode((prevCode: any) => {
            const updated = [...prevCode];
            if (updated.length > 0) {
              updated[updated.length - 1] = "*";
            }
            return updated;
          });
        }, 50);
      }
    }
  }

  const handleSetPin = async () => {
    if(pinCode.length === 4){
      const pin = pinCode.join('')

      try {
              
        dispatch(showLoader());
        const result = await axiosClient.post("/account/set-pin", {
          transactionPin: pin
        })
  
        const pinStatus = {isPinSet: result.data.isPinSet, setPin: true}
        const userProfile = await AsyncStorage.mergeItem('userProfile', JSON.stringify(pinStatus));

        const recentProfile = await AsyncStorage.getItem('userProfile');
        const updatedProfile = recentProfile ? JSON.parse(recentProfile) : null;
  
        if (updatedProfile) {
          dispatch(setProfile(updatedProfile));
        }

        setPinCode([])

        toast.show(result.data.message,{
          type: "success",
        });

        router.replace("/(protected)/(routes)/Security")
  
      } catch (error: any) {
        toast.show(error.response.data.message || error.response.data.error.message,{
          type: "danger",
        });
      } finally {
        dispatch(hideLoader());
      }

    }else if (pinCode.length === 0){
      toast.show("Pin fields are empty",{
        type: "error",
      });
    }else if (pinCode.length < 4){
      toast.show("Pin must be 4 numbers",{
        type: "error",
      });
    }else if (pinCode.length > 4){
      toast.show("Pin is greater than 4 numbers",{
        type: "error",
      });
    }
  }

  return (
    <SafeAreaView className='h-full bg-white px-4'>
      <Header title="Set PIN" showGoBack={true} onpress={() => router.back()}/>
        <View className='flex-1 items-center justify-between gap-2'>
          <View className='flex-row gap-2 mt-8 items-center justify-center'>
            {[...Array(4).keys()].map((index) => {

              return (
                <View key={index} className='size-12 bg-inputBg rounded-lg items-center justify-center'>
                  <Text className='font-amedium text-3xl text-blue'>{displayPinCode[index]}</Text>
                </View>
              );
            })}
          </View>
    
          <View style={{ justifyContent: 'center'}}>
            <Keypad
              onKeyPress={(value) => keys(value)}
              textStyle={{ fontWeight: '600', fontSize: 30, color: "#003366" }}
              backspaceIconFillColor="#003366"
              backspaceIcon={<MaterialCommunityIcons name="backspace" size={24} color="#003366" />}
              backspaceIconStrokeColor="#FFFFFF"
              backspaceIconHeight={24}
              backspaceIconWidth={33}
            />
          </View>
          <View className='w-full justify-center my-6'>
              <CustomButton title="Set Pin" handlePress={handleSetPin} containerStyles="w-full" textStyles='text-white'/>
          </View>
        </View>

      <StatusBar backgroundColor='#ffffff' style='dark'/>
    </SafeAreaView>
  );
}