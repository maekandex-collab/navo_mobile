import { View, Text, TouchableOpacity } from 'react-native'
import displayCurrency from '@/utils/displayCurrency';
import CustomButtomSheet from '../CustomButtomSheet';
import AntDesign from '@expo/vector-icons/AntDesign';
import { BottomSheetFlatList, BottomSheetModal, useBottomSheetModal } from '@gorhom/bottom-sheet';
import { useCallback, useMemo, useRef } from 'react';
import { router } from 'expo-router';
import OrdersCard from './OrdersCard';

type ProductItem = {
  name: string;
  link: string;
  details: string;
  color: string;
  size: string;

  currency: "NGN" | "GBP";

  price: number;
  quantity: number;

  serviceFee: number;

  originalPriceNGN: number;
  originalPriceGBP: number;
};

type OrderItem = {
  id: string;
  totalAmount: number;
  currency: "NGN" | "GBP";
   paymentMethod: string;
    paymentStatus: string;
  transaction: {
    category: string;
    id: string;
    paymentMethod: string;
    paymentStatus: string;
    reference: string;
  }
  status: string;
  createdAt: string;
  items: ProductItem[];
};
const ShopWithLinkCard = ({item}: {item: OrderItem}) => {

  const snapPoints = useMemo(() => ["90%"], [])
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const { dismiss } = useBottomSheetModal()

  // callbacks
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  console.log("it=", item)

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
                      <View>
                        <View className="justify-between w-full items-start gap-2 bg-gray-100/30 rounded-lg p-3 mb-4">
                          <View className="gap-2 w-full max-w-full">
                            <View className='border-b border-[#b8b4b4] pb-2'>
                              <Text className="font-abold text-base text-blue">Product Name:</Text>
                              <Text className="font-amedium text-base text-blue">{item?.name}</Text>
                            </View>
                            <View className='border-b border-[#b8b4b4] pb-2'>
                              <Text className="font-abold text-base text-blue">Size:</Text>
                              <Text className="font-amedium text-base text-blue">{item?.size}</Text>
                            </View>
                            <View className='border-b border-[#b8b4b4] pb-2'>
                              <Text className="font-abold text-base text-blue">Color:</Text>
                              <Text className="font-amedium text-base text-blue">{item?.color}</Text>
                            </View>
                            <View className='border-b border-[#b8b4b4] pb-2'>
                              <Text className="font-abold text-base text-blue">Quantity:</Text>
                              <Text className="font-amedium text-base text-blue">{item?.quantity}</Text>
                            </View>
                            <View className='border-b border-[#b8b4b4] pb-2'>
                              <Text className="font-abold text-base text-blue">Product Amount (GBP):</Text>
                              <Text className="font-amedium text-base text-blue">{displayCurrency(Number(item?.originalPriceGBP), 'GBP')}</Text>
                            </View>
                            <View className='border-b border-[#b8b4b4] pb-2'>
                              <Text className="font-abold text-base text-blue">Converted Amount (NGN):</Text>
                              <Text className="font-amedium text-base text-blue">{displayCurrency(Number(item?.originalPriceNGN), 'NGN')}</Text>
                            </View>
                            <View className='border-b border-[#b8b4b4] pb-2'>
                              <Text className="font-abold text-base text-blue">Service fee (NGN):</Text>
                              <Text className="font-amedium text-base text-blue">{displayCurrency(Number(item?.serviceFee), 'NGN')}</Text>
                            </View>
                            <View className='border-b border-[#b8b4b4] pb-2'>
                              <Text className="font-abold text-base text-blue">Total Price (NGN):</Text>
                              <Text className="font-amedium text-base text-blue">{displayCurrency(Number(item?.price), 'NGN')}</Text>
                            </View>
                            <View className='border-b border-[#b8b4b4] pb-2'>
                              <Text className="font-abold text-base text-blue">Online Store Link:</Text>
                              <TouchableOpacity onPress={() => {
                                dismiss();
                                router.push({
                                  pathname: "/(protected)/(routes)/ExternalLinks",
                                  params: { paylink:  item?.link},
                                })
                              }}
                              >
                                <Text className="font-amedium text-base text-orange">{item?.link}</Text>
                              </TouchableOpacity>
                            </View>
                            <View className='pb-2'>
                              <Text className="font-abold text-base text-blue">Details:</Text>
                              <Text className="font-amedium text-base text-blue">{item?.details}</Text>
                            </View>
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

export default ShopWithLinkCard