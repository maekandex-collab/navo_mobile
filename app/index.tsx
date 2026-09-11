import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { login, logout, setLoading } from "@/redux/AuthSlice";
import { Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setEmail, setProfile } from "@/redux/ProfileSlice";

export default function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);
  const [notFirstTimeInApp, setNotFirstTimeInApp] = useState<string | null>(null)

  useEffect(() => {
    const getData = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync("accessToken");
        const notFirstTime = await AsyncStorage.getItem('notFirstTime');
        const userProfile = await AsyncStorage.getItem('userProfile');
        const email = await AsyncStorage.getItem('email');
        const user = userProfile ? JSON.parse(userProfile) : null;
        setNotFirstTimeInApp(notFirstTime)

        if (storedToken) {
          if (user) {
            console.log("redux user", user)
            dispatch(setProfile(user));
          }
          dispatch(login(storedToken));
        } else {
          dispatch(logout());
        }

        dispatch(setEmail(email));
      } catch (error) {
        dispatch(logout());
      } finally {
        dispatch(setLoading(false));
      }
      
    };

    getData();
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-blue">
        <StatusBar backgroundColor="#003366" style="light" />
        <View className="flex-row justify-center items-center">
          <Text className='text-orange font-ablack' style={{fontSize: 40}}>Navo</Text>
          <Text className="text-white font-ablack" style={{ fontSize: 35, transform: [{ translateY: -10 }] }}>+</Text>
        </View>
      </View>
    );
  }

  return <Redirect href={isAuthenticated ? "/(protected)/(tabs)/home" : notFirstTimeInApp ? "/(onboarding)/SignIn" : "/Splash"} />;
}
