import Header from '@/components/Header'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

const JoinOurCommunity = () => {
  return (
    <SafeAreaView className='h-full bg-white px-4 flex-1'>
      <Header title="Our Community" showGoBack={true} onpress={() => router.back()}/>
    </SafeAreaView>
  )
}

export default JoinOurCommunity