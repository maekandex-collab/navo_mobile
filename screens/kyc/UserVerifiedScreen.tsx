import { View, Text } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomButton from '@/components/CustomButton';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';

const UserVerifiedScreen = () => {

  const insets = useSafeAreaInsets();
  const statusBarTop = insets.top + 20;
  const statusBarBottom = insets.bottom + 30;

  const goBack = () => {
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace("/(protected)/(tabs)/home")
    }
  }

  return (
    <LinearGradient colors={['#FFFFFF', '#FFC198']} start={{ x: 0, y: 0.1 }} end={{ x: 0, y: 1 }} style={{ flex: 1 }} className='items-center justify-center'>
        <View className='w-full flex-1 px-4 justify-between' style={{ marginTop: statusBarTop, marginBottom: statusBarBottom }}>
          <View className='flex-1 items-center justify-center'>
            <View className='w-full'>
              <View className='items-center justify-center w-full'>
                <MaterialIcons name="verified" size={60} color="#003366" />
                <Text className={`font-ablack text-xl text-center text-blue`}>KYC VERIFICATION</Text>
                <Text className={`font-abold text-xl text-center text-blue mt-3`}>Your KYC has been verified</Text>
              </View>
            </View>
          </View>

          <View>
            <CustomButton title="Go Back" containerStyles='w-full my-2' textStyles='text-white' handlePress={goBack}/>
          </View>
        </View>
      <StatusBar style="dark" backgroundColor='#ffffff'/>
    </LinearGradient>
  )
}

export default UserVerifiedScreen