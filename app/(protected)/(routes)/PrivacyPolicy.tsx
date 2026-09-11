import { SafeAreaView } from 'react-native-safe-area-context'
import Header from '@/components/Header'
import { router } from 'expo-router'

const PrivacyPolicy = () => {
  return (
    <SafeAreaView className='h-full bg-white px-4 flex-1'>
      <Header title="Privacy Policy" showGoBack={true} onpress={() => router.back()}/>
    </SafeAreaView>
  )
}

export default PrivacyPolicy