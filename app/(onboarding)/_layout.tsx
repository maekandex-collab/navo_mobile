import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

const _layout = () => {
  return (
    <>
    <Stack screenOptions={{
        headerShown: false
      }}>
      <Stack.Screen name='index'/>
      <Stack.Screen name='SignIn'/>
      <Stack.Screen name='SignUp'/>
      <Stack.Screen name='RegisterOtp'/>
      <Stack.Screen name='ForgotPassword'/>
      <Stack.Screen name='ResetPasswordOTP'/>
      <Stack.Screen name='NewResetPassword'/>
    </Stack>

    <StatusBar backgroundColor='#161622' style='light'/>
    </>
  )
}

export default _layout