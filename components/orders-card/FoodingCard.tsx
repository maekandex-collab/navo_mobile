import { View, Text, TouchableOpacity } from 'react-native'
import displayCurrency from '@/utils/displayCurrency';
import CustomButtomSheet from '../CustomButtomSheet';
import AntDesign from '@expo/vector-icons/AntDesign';
import { BottomSheetFlatList, BottomSheetModal, useBottomSheetModal } from '@gorhom/bottom-sheet';
import { useCallback, useMemo, useRef } from 'react';
import { Image as ExpoImage } from 'expo-image';
import OrdersCard from './OrdersCard';

type FoodItem = {
  name: string;
  price: number;
  quantity: number;
  image?: string;
  currency?: string;
};

type OrderItem = {
  id: string;
  totalAmount: number;
  currency: "NGN" | "GBP";
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  createdAt: string;
  items: FoodItem[];
};
const FoodingCard = ({item}: {item: OrderItem}) => {

  const blurhash = 'L~I64noffQfQfQfQfQfQfQfQfQfQ';
    
  const snapPoints = useMemo(() => ["90%"], [])
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const { dismiss } = useBottomSheetModal()

  // callbacks
  const handlePresentModalPress = useCallback(() => {
      bottomSheetModalRef.current?.present();
  }, []);

  const currency = item?.currency;

  return (
    <View className='border-b border-[#ccc]'>
        <OrdersCard
          item={item}
          onViewItems={handlePresentModalPress}
        />

        <CustomButtomSheet ref={bottomSheetModalRef} snapPoints={snapPoints}  enablePenDown={false} dynamicSizing={false} scrollable>
            <View className='h-full'>
                <View className='flex-row w-full items-center justify-between gap-1 mb-3'>
                    <View className='w-8'/>
                    <Text className="text-sm text-center text-gray-300 font-abold">Items Bought</Text>
                    <TouchableOpacity onPress={() => dismiss()}>
                        <AntDesign name="closecircleo" size={30} color="#003366" />
                    </TouchableOpacity>
                </View>

                <BottomSheetFlatList
                    data={item?.items || []}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <View className="w-full mb-4 bg-gray-100/30 rounded-lg p-4 overflow-hidden">
                            <View className="w-full flex-row items-start gap-2">
                                <View className="relative w-[20%] min-h-20 max-h-28 rounded-lg overflow-hidden items-center justify-center">
                                    <ExpoImage source={{ uri: item?.image || "" }} placeholder={{ blurhash }} cachePolicy="disk" contentFit="cover" style={{width: "100%", height: "100%" }}/>
                                </View>
                                <View className="w-full flex-1 items-start">
                                    <Text numberOfLines={3}>{item?.name}</Text> 
                                    <Text>Qty: <Text className="font-amedium text-lg">{item?.quantity}</Text></Text>
                                    <Text>Price: <Text className="font-amedium text-lg">{displayCurrency(Number(item?.price), currency)}</Text></Text>
                                    <Text>Subtotal: <Text className="font-amedium text-lg">{displayCurrency(Number(item?.quantity) * Number(item?.price), currency)}</Text></Text>
                                </View>
                            </View>
                        </View>
                    )}
                    showsVerticalScrollIndicator={false}
                />

            </View>
        </CustomButtomSheet>
    </View>
  )
}

export default FoodingCard