import { View, Image } from 'react-native'
import { Tabs, router } from 'expo-router'
import { icons } from '../../../constants'
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TabIcon = ({icon, focused}: {icon: any; focused: boolean}) => {
  return (
    <View className={`items-center justify-center ${!focused ? 'opacity-60' : ''}`}>
      <Image source={icon} resizeMode='contain' className={`w-6 h-6`}/>
    </View>
  )
}
const TabsLayout = () => {

  const insets = useSafeAreaInsets();

  return (
    <>
        <Tabs screenOptions={{ 
          tabBarShowLabel: true, 
          tabBarActiveTintColor: '#003366', 
          tabBarInactiveTintColor: '#ccc', 
          tabBarStyle: { 
            backgroundColor: '#ffffff', 
            borderWidth: 1, 
            paddingTop: 2, 
            borderTopColor: '#ccc',  
            height: 55 + insets.bottom,
            paddingBottom: insets.bottom, 
            borderTopLeftRadius: 20, 
            borderTopRightRadius: 20,
            elevation: 0,
        }}}>
            <Tabs.Screen name="home/index" options={{title: 'Home', headerShown: false, tabBarIcon: ({ focused }) => (
              <TabIcon icon={icons.home} focused={focused}/>
            )}}/>
            <Tabs.Screen name="shipments/index" options={{title: 'Shipments', headerShown: false, tabBarIcon: ({ focused }) => (
              <TabIcon icon={icons.shipments} focused={focused}/>
            )}}/>
            <Tabs.Screen name="transactions/index" options={{title: 'Transactions', headerShown: false, tabBarIcon: ({ focused }) => (
              <TabIcon icon={icons.transactions} focused={focused}/>
            )}}/>
            <Tabs.Screen name="market/index" options={{title: 'Market', headerShown: false, tabBarIcon: ({ focused }) => (
              <TabIcon icon={icons.shop4me} focused={focused}/>
            )}} listeners={() => ({
              tabPress: (e) => {
                e.preventDefault()
                router.push("/(protected)/(routes)/Market")
              }
            })}/>
            <Tabs.Screen name="more/index" options={{title: 'More', headerShown: false, tabBarIcon: ({ focused }) => (
              <TabIcon icon={icons.more} focused={focused}/>
            )}}/>
        </Tabs>
    </>
  )
}

export default TabsLayout