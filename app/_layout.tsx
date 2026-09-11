import 'react-native-reanimated';
import '../global.css';
import { useFonts } from 'expo-font';
import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Provider } from 'react-redux'
import { store } from "@/redux/store"
import { ToastProvider } from 'react-native-toast-notifications'
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { StripeProvider} from "@stripe/stripe-react-native"
import * as Linking from 'expo-linking';
import { Shop4MeClearItems, StoreClearItems } from '@/utils/CartStorage';
import NetInfoListener from '@/utils/NetInfoListener';
import { NaijaShopClearItems } from '@/utils/NaijaShopCartStorage';
import { AmazonClearItems } from '@/utils/AmazonCartStorage';
import LayoutLoader from '@/hooks/LayoutLoader';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {

  const [fontsLoaded, error] = useFonts({
    "Aeonik-Black": require("../assets/fonts/Aeonik-Black.ttf"),
    "Aeonik-Bold": require("../assets/fonts/Aeonik-Bold.ttf"),
    "Aeonik-Light": require("../assets/fonts/Aeonik-Light.ttf"),
    "Aeonik-Medium": require("../assets/fonts/Aeonik-Medium.ttf"),
    "Aeonik-Regular": require("../assets/fonts/Aeonik-Regular.ttf"),
    "Aeonik-Thin": require("../assets/fonts/Aeonik-Thin.ttf"),
    "Raleway-Black": require("../assets/fonts/Raleway-Black.ttf"),
    "Raleway-ExtraLight": require("../assets/fonts/Raleway-ExtraLight.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    const handleDeepLink = ({ url }: {url: any}) => {
      const data = Linking.parse(url);
      console.log('Received payment callback:', data);

      const hostname = data.hostname
      const query = data.queryParams
      
      if(hostname === "goto"){

        switch (query?.screen) {
          case 'fx':

            if(query?.status === "successful"){

              if(query?.currencyTo === "NGN"){
                router.replace({
                  pathname: "/(protected)/(routes)/NairaAccount",
                  params: {
                    status: query?.status,          
                    reference: query?.reference,
                    currencyFrom: query?.currencyFrom,
                    currencyTo: query?.currencyTo,     
                    paymentType: query?.paymentType,  
                  },
                });
              }else if(query?.currencyTo === "GBP"){
                router.replace({
                  pathname: "/(protected)/(routes)/GBPAccount",
                  params: {
                    status: query?.status,           // "successful"
                    reference: query?.reference,
                    currencyFrom: query?.currencyFrom, // "NGN"
                    currencyTo: query?.currencyTo,     // "GBP"
                    paymentType: query?.paymentType,   // "fx"
                  },
                });
              }else if(query?.currencyTo === "USD"){
                router.replace({
                  pathname: "/(protected)/(routes)/USDAccount",
                  params: {
                    status: query?.status,          
                    reference: query?.reference,
                    currencyFrom: query?.currencyFrom,
                    currencyTo: query?.currencyTo,     
                    paymentType: query?.paymentType,  
                  },
                });
              }else if(query?.currencyTo === "EUR"){
                router.replace({
                  pathname: "/(protected)/(routes)/EUROAccount",
                  params: {
                    status: query?.status,          
                    reference: query?.reference,
                    currencyFrom: query?.currencyFrom,
                    currencyTo: query?.currencyTo,     
                    paymentType: query?.paymentType,  
                  },
                });
              }else{
                router.replace("/(protected)/(tabs)/home")
              }
            }else{
              router.replace("/(protected)/(tabs)/home")
            }
            break;
  
          case 'wallet':
            
            router.replace("/(protected)/(tabs)/home");
            break;

          case 'shop4me':
            if(query?.status === "successful"){
              Shop4MeClearItems();
            }
            router.replace("/(protected)/(routes)/ShopWithLinkOrders")
           
            break;

          case 'orders':
            
            if(query?.status === "successful"){
              StoreClearItems()
            }
            router.replace("/(protected)/(routes)/FoodingOrders")
            break;

          case 'amazon':
            
            if(query?.status === "successful"){
              AmazonClearItems();
            }
            router.replace("/(protected)/(routes)/AmazonOrders")
            break;

          case 'shipments':
            
            router.replace("/(protected)/(routes)/MyShipments");
            break;

          case 'naija-shop':
            
            if(query?.status === "successful"){
              NaijaShopClearItems();
            }
            router.replace("/(protected)/(routes)/AmazonOrders")
            break;
  
          default:
            router.replace("/(protected)/(tabs)/home");
            break;
        }
      }

      // if (data.hostname === "NairaAccount") {
      //   router.replace({
      //     pathname: "/(protected)/(routes)/GBPAccount",
      //     params: {
      //       orderId: data.queryParams?.orderId,
      //       orderReference: data.queryParams?.orderReference,
      //     },
      //   });
      // }else if(data.hostname === "home"){
      //   router.replace({
      //     pathname: "/(protected)/(tabs)/home",
      //     params: {
      //       orderId: data.queryParams?.orderId,
      //       orderReference: data.queryParams?.orderReference,
      //     },
      //   });
      // }else if(data.hostname === "shopforme"){
      //   console.log("getting-shop-verify")
      //   const verifyShopPayment = async () => {
      //     try {
      //       const result = await axiosClient.get(`/payments/verify-shop?idType=ORDER_ID&id=${data.queryParams?.orderId}`);
      //       console.log("shop-verify", result.data);

      //       if(result.data?.data?.success && result.data?.data.paymentStatus === "SUCCESSFUL") {
      //         console.log("cart cleared");
      //         Shop4MeClearItems();
      //       }

      //       router.replace("/(protected)/(tabs)/home")
      //     } catch (error: any) {
      //       router.replace("/(protected)/(tabs)/home")
      //       console.log("shop-verify-error", error.response?.data?.message || error.response?.data?.error?.message);
      //     }
      //   };

      //   verifyShopPayment();
        
      // }else if(data.hostname === "NaijaShopLoad"){
      //   console.log("getting-naijashop-verify")
      //   const verifyNaijaShopPayment = async () => {
      //     try {
      //       const result = await axiosClient.get(`/payments/verify-shop?idType=ORDER_ID&id=${data.queryParams?.orderId}`);
      //       console.log("naija-verify", result.data);

      //       if(result.data?.data?.success && result.data?.data.paymentStatus === "SUCCESSFUL") {
      //         console.log("naija cart cleared");
      //         NaijaShopClearItems();
      //       }

      //       router.replace("/(protected)/(tabs)/home")
      //     } catch (error: any) {
      //       router.replace("/(protected)/(tabs)/home")
      //       console.log("shop-verify-error", error.response?.data?.message || error.response?.data?.error?.message);
      //     }
      //   };

      //   verifyNaijaShopPayment()
      // }else if(data.hostname === "AmazonShopLoad"){
      //   console.log("getting-amazonshop-verify")
      //   const verifyAmazonShopPayment = async () => {
      //     try {
      //       const result = await axiosClient.get(`/payments/verify-shop?idType=ORDER_ID&id=${data.queryParams?.orderId}`);
      //       console.log("naija-verify", result.data);

      //       if(result.data?.data?.success && result.data?.data.paymentStatus === "SUCCESSFUL") {
      //         console.log("naija cart cleared");
      //         AmazonClearItems();
      //       }

      //       router.replace("/(protected)/(tabs)/home")
      //     } catch (error: any) {
      //       router.replace("/(protected)/(tabs)/home")
      //       console.log("shop-verify-error", error.response?.data?.message || error.response?.data?.error?.message);
      //     }
      //   };

      //   verifyAmazonShopPayment()
      // } else {
      //   router.replace("/(protected)/(tabs)/home")
      // }
      
    };

    const sub = Linking.addEventListener('url', handleDeepLink);

      // Check if app was opened from a link
      Linking.getInitialURL().then((url) => {
        if (url) {
          handleDeepLink({ url });
        }
      });

      return () => {
        sub.remove();
      };
    }, []);

    if (!fontsLoaded) {
      return null;
    }

  return (
    <Provider store={store}>
      <StripeProvider publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}>
        <GestureHandlerRootView style={styles.container}>
            <BottomSheetModalProvider>
              <ToastProvider
                placement="top"
                animationType='slide-in'
                successColor="#FFE1CC"
                dangerColor="#FFE1CC"
                warningColor="#FFE1CC"
                normalColor="#FFE1CC"
                textStyle={{ color: "#003366" }}
                offset={70}
                successIcon={<AntDesign name="checkcircle" size={16} color="#003366" />}
                dangerIcon={<AntDesign name="closecircle" size={16} color="#003366" />}
                warningIcon={<Ionicons name="warning" size={16} color="#003366" />}
              >
                <NetInfoListener />
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index"/>
                  <Stack.Screen name="Splash"/>
                  <Stack.Screen name="(onboarding)"/>
                  <Stack.Screen name="(tabs)"/>
                  <Stack.Screen name="(routes)"/>
                </Stack>
                <LayoutLoader/>
              </ToastProvider>
            </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </StripeProvider>
    </Provider>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
