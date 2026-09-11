import 'react-native-get-random-values';
import { View, Text, Switch, Alert } from 'react-native'
import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import { StatusBar } from 'expo-status-bar'
import SpaceBetween from '@/components/SpaceBetween'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Entypo from '@expo/vector-icons/Entypo'
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Keychain from 'react-native-keychain';
import SHA256 from 'crypto-js/sha256';
import { useToast } from 'react-native-toast-notifications'
import { nanoid } from 'nanoid'
import { axiosClient } from '@/globalApi';
import { hideLoader, showLoader } from '@/redux/LoaderSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

const value1 = nanoid()

const hashed1 = SHA256(value1).toString()

export default function SecurityScreen() {

  const dispatch = useDispatch()
  const { isLoading } = useSelector((state: RootState) => state.loader)
  const toast = useToast();
  const [isEnabled, setIsEnabled] = useState(false)

  useEffect(() => {
     const getBiometricPreference = async () => {
      const stored = await SecureStore.getItemAsync('biometricEnabled');
      setIsEnabled(stored === "true");
    };

    getBiometricPreference()
  }, [])

  // Check device support and attempt login
const handleBiometricLogin = async () => {
  
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware) {
      return Alert.alert(
        'Biometrics Not Supported',
        'Your device does not support biometric authentication.'
      );
    }

    if (!isEnrolled) {
      return Alert.alert(
        'No Biometrics set',
        'No biometrics are enrolled. Please set it up in your device settings to use this feature.'
      );
    }

    const newValue = !isEnabled;

    dispatch(showLoader());
    if (newValue) {
      // Enabling biometric login
      // const result = await LocalAuthentication.authenticateAsync({
      //   promptMessage: 'Confirm your identity to enable biometrics',
      // });

      // if (!result.success) return;

      await Keychain.setGenericPassword("key1", hashed1, {
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
        service: "com.navo.hashed1",
        authenticationPrompt: {
          title: "Enable Biometric Login",
          cancel: "Cancel"
        }
      });

      //Immediately test biometric access
      const creds = await Keychain.getGenericPassword({
        service: "com.navo.hashed1",
        authenticationPrompt: {
          title: "Enable Biometric Login",
          cancel: 'Cancel',
        },
      });

      if (!creds) {
        return Alert.alert("Biometric setup failed", "Authentication failed or was cancelled.");
      }

      const resultApi = await axiosClient.post("/auth/enable-biometric", {
          publicKey: hashed1
        }
      );

      const hashed2 = resultApi.data.privateKey
      console.log("bio", resultApi.data);

      await Keychain.setGenericPassword("key2", hashed2, {
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
        service: "com.navo.hashed2",
      });

    } else {

      const resultApi = await axiosClient.delete("/auth/disable-biometric");

      console.log("dis", resultApi.data);
      await Keychain.resetGenericPassword({ service: 'com.navo.hashed1' })
      await Keychain.resetGenericPassword({ service: 'com.navo.hashed2' })
    }

    await SecureStore.setItemAsync('biometricEnabled', newValue ? 'true' : 'false');
    setIsEnabled(newValue);

  } catch (error) {
    console.error(error);
    toast.show("Retry biometrics later", {
      type: "danger",
    });
  } finally {
    dispatch(hideLoader());
  }
};


  return (
    <SafeAreaView className='h-full bg-white px-4'>
      <Header title="Security" showGoBack={true} onpress={() => router.back()}/>
      
      <View className='mt-4'>
        <SpaceBetween onpress={() => router.push("/(protected)/(routes)/ManagePassword")} title='Manage Password' desc='Secure and update your login credentials effortlessly.' descStyle='text-[9px]' lefticon={<MaterialCommunityIcons name="key-change" color={"#FF6600"} size={18}/>}/>
        <SpaceBetween onpress={() => router.push("/(protected)/(routes)/ManagePin")} title='Manage PIN' desc='Keep your transactions safe with a personalized PIN.' descStyle='text-[9px]' lefticon={<MaterialIcons name="password" size={20} color={"#FF6600"} />}/>
        <View className="justify-between w-full flex-row items-center bg-white border-b border-gray-100 rounded-lg py-3">
          <View className="flex-1 items-center flex-row gap-2">
            <View className={`flex items-center justify-center size-10 rounded-full bg-orangeLight `}>
              <Entypo name="fingerprint" size={20} color="#FF6600" />
            </View>
            
            
            <View className='flex-1 flex-col'>
              <View className='flex-row gap-1 items-center'>
                <Text className="font-amedium text-base text-blue" numberOfLines={1}>Enable Biometric Login</Text>
              </View>
              <Text className='font-amedium text-gray-300 text-[9px]' numberOfLines={1}>swiftly login with fingerprint or face ID.</Text>
            </View>
          </View>
  
          <Switch
            trackColor={{false: '#ccc', true: '#FFC198'}}
            thumbColor={isEnabled ? '#FF6600' : '#fff'}
            ios_backgroundColor="#ccc"
            onValueChange={handleBiometricLogin}
            value={isEnabled}
            disabled={isLoading}
          />
        </View>
      </View>

      <StatusBar backgroundColor='#ffffff' style='dark'/>
    </SafeAreaView>
  )
}

