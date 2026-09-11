import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

const _layout = () => {
  return (
    <>
    <Stack screenOptions={{
        headerShown: false
      }}>
      <Stack.Screen name='PaymentGateway'/>
      <Stack.Screen
        name="AmazonSearchModal"
        options={{
          presentation: "transparentModal",
          animation: "fade",
          headerShown: false
        }}
      />
      <Stack.Screen
        name="AmazonCategoryModal"
        options={{
          presentation: "transparentModal",
          animation: "fade",
          headerShown: false
        }}
      />
      <Stack.Screen
        name="NaijaShopSearchModal"
        options={{
          presentation: "transparentModal",
          animation: "fade",
          headerShown: false
        }}
      />
       <Stack.Screen
        name="NaijaShopVendorList"
        options={{
          presentation: "transparentModal",
          animation: "fade",
          headerShown: false
        }}
      />
    </Stack>

    <StatusBar backgroundColor='#161622' style='light'/>
    </>
  )
}

export default _layout