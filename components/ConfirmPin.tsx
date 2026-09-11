import { Dimensions, FlatList, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import CustomButton from './CustomButton';
import Ionicons from '@expo/vector-icons/Ionicons';
import CustomButtomSheet from './CustomButtomSheet';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useToast } from 'react-native-toast-notifications';
import { axiosClient } from '@/globalApi';
import * as SecureStore from "expo-secure-store";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from "@/redux/AuthSlice";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearProfile } from '@/redux/ProfileSlice';
import { RootState } from '@/redux/store';
import { hideLoader, showLoader } from '@/redux/LoaderSlice';

const ConfirmPin = ({bottomSheetModalPinRef, closePinModal, onConfirmPin, isVisible}: {bottomSheetModalPinRef: any; closePinModal: () => void; onConfirmPin: (pin: string) => void; isVisible: boolean}) => {

  const { token } = useSelector((state: RootState) => state.auth)

  const toast = useToast();
  const dispatch = useDispatch();
  const { width, height } = Dimensions.get("window");
  const dialPad = [1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "del"];
  const dialPadSize = width * 0.2;
  const pinLength = 4;
  const [pinCode, setPinCode] = useState<any>([]);
  const [displayPinCode, setDisplayPinCode] = useState<any>([]);
  const [logoutToken, setLogoutToken] = useState<any>("")
  const snapPoints = useMemo(() => ["70%", "90%"], [])

  const resetState = () => {
    setPinCode([]);
    setDisplayPinCode([]);
  };

  useEffect(() => {
    resetState();
  }, [isVisible]);

  useEffect(() => {
    const handleToken = async () => {
      setLogoutToken(token);
    };

    handleToken()
  }, [])

  const handleSetPin = async () => {
    if(pinCode.length === 4){
      const pin = pinCode.join('')

      try {
              
        dispatch(showLoader());
        
        const result = await axiosClient.post("/account/use-transaction-pin", {
          transactionPin: pin
        })

        closePinModal()

        onConfirmPin(pin)
        setPinCode([])
        setDisplayPinCode([])
  
      } catch (error: any) {
        toast.show(error.response.data.message || error.response.data.error.message,{
          type: "danger",
        });

        console.log(error.response.data)

        if(error.response.status === 403 && error.response.data.message === "Too many incorrect attempts. You have been signed out."){
          await SecureStore.deleteItemAsync("accessToken");
          await SecureStore.deleteItemAsync("refreshToken");
          await AsyncStorage.removeItem('userProfile');
          
          dispatch(logout());
          dispatch(clearProfile());
          router.replace("/(onboarding)/SignIn");

          axiosClient.post("/auth/logout", {}, {
            headers: {
              Authorization: `Bearer ${logoutToken}`,
            }
          })
  
        }
        dispatch(hideLoader());
        setPinCode([])
        setDisplayPinCode([])
        
      } 
      // finally {
      //   dispatch(hideLoader());
      //   setPinCode([])
      //   setDisplayPinCode([])
      // }

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

  const SetPinDailPad = ({ onPress }: {onPress: (item: string | number) => void}) => {
      return (
        <View>
          <FlatList
            data={dialPad}
            numColumns={3}
            style={{ flexGrow: 1 }}
            keyExtractor={(_, index) => index.toString()}
            columnWrapperStyle={{ gap: 30 }}
            contentContainerStyle={{ gap: 22 }}
            renderItem={({ item }) => {
              return (
                <TouchableOpacity
                  onPress={() => onPress(item)}
                  disabled={item === ""}
                >
                  <View
                    style={{
                      width: dialPadSize,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {item === "del" ? (
                      <MaterialCommunityIcons
                        name="backspace-outline"
                        size={dialPadSize / 3}
                        color="#003366"
                      />
                    ) : item === "" ? (
                      <Ionicons
                        name="finger-print"
                        size={dialPadSize / 3}
                        color="white"
                      />
                    ) : (
                      <Text
                        style={{
                          fontSize: dialPadSize / 3,
                          fontWeight: "500",
                          color: "#003366",
                        }}
                      >
                        {item}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            }}
            ListFooterComponent={() => (
              <View className='w-full justify-center my-2'>
                <CustomButton title="Confirm PIN" handlePress={handleSetPin} containerStyles="w-full" textStyles='text-white'/>
              </View>
            )}
          />
        </View>
      );
    };

  return (
    <CustomButtomSheet ref={bottomSheetModalPinRef} snapPoints={snapPoints} enablePenDown={false} onDismiss={closePinModal}>
        <View>
        <View className='flex-row w-full items-center justify-between gap-1'>
            <View className='w-8'/>
            <Text className="text-sm text-center text-gray-300 font-abold">Confirm with PIN</Text>
            <TouchableOpacity onPress={closePinModal}>
            <AntDesign name="closecircleo" size={30} color="#003366" />
            </TouchableOpacity>
        </View>

        <Text className="text-xl text-blue mt-4 font-abold text-center mb-1">Enter Transaction PIN</Text>

        <View className='items-center justify-between gap-2'>
            <View className='flex-row gap-2 my-4 items-center justify-center'>
            {[...Array(pinLength).keys()].map((index) => {
                // const isSelected = !!pinCode[index];
                const isSelected = displayPinCode[index] ?? "";

                return (
                <View key={index} className='size-10 bg-inputBg rounded-lg items-center justify-center'>
                    <Text className='font-amedium text-2xl text-blue'>{isSelected}</Text>
                </View>
                );
            })}
            </View>
    
            <View style={{ justifyContent: 'center'}}>
              <SetPinDailPad
                  onPress={(item) => {
                  if (item === "del") {

                    if(pinCode.length > 0){
                      setPinCode((prevCode: any) => prevCode.slice(0, prevCode.length - 1));
                      setDisplayPinCode((prevCode: any) => prevCode.slice(0, prevCode.length - 1));
                    }

                  } else if (typeof item === "number") {

                    if(pinCode.length < 4){
                      setPinCode((prevCode: any) => [...prevCode, item]);
                      setDisplayPinCode((prevCode: any) => [...prevCode, item]);

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
                  }}
              />
            </View>
        </View>
        </View>
    </CustomButtomSheet>
  )
}

export default ConfirmPin