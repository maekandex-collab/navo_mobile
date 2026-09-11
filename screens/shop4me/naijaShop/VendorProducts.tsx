import { View, TextInput, FlatList, Text, TouchableOpacity, Pressable, ActivityIndicator, Image } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { router } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Image as ExpoImage } from 'expo-image';
import { StatusBar } from "expo-status-bar";
import { useSkeletonCommonProps } from "@/utils/SkeletonProps";
import { axiosClient } from "@/globalApi";
import { Skeleton } from "moti/skeleton";
import { Dimensions } from "react-native";
import { NaijaShopGetItems } from "@/utils/NaijaShopCartStorage";
import { useFocusEffect } from "@react-navigation/native";
import ProductSkeleton from "@/components/ProductSkeleton";
import { MasonryFlashList } from "@shopify/flash-list";
import displayCurrency from "@/utils/displayCurrency";
import SearchPlaceholder from "@/components/naija-shop/SearchPlaceholder";
import { formatEnums } from "@/utils/formatEnums";
import { useLocalSearchParams } from "expo-router";
import { getFormattedCartCount } from "@/utils/getFormattedCartCount";
const width = Dimensions.get("window").width

type ProductType = {
  id: string; 
  description: string; 
  image: string[]; 
  name: string; 
  currency: "GBP" | "NGN";
  price: string; 
  productStatus: "in_stock" | "out_of_stock"; 
  quantity: number;
}

type StoreItemType = {
  id: any
  quantity: number,
};

type vendorType = {
    address: string; 
    description: string; 
    email: string;
    id: string;
    isActive: true, 
    logo: string; 
    name:string; 
    phone: string; 
    products: ProductType[];
}

let vendorCache: { [key: string]: vendorType | null } = {};
let vendorFetched: { [key: string]: boolean } = {};

export default function VendorProducts() {

    const blurhash = 'L~I64noffQfQfQfQfQfQfQfQfQfQ';
    
    const { id } = useLocalSearchParams() as any;
    const { top, bottom } = useSafeAreaInsets()
    const [loading, setLoading] = useState(true)
    const [vendor, setVendor] = useState<vendorType | null>(null)
    const skeletonProps = useSkeletonCommonProps();

    const dummy = new Array(6).fill(null)
    const half = (width/2) - 21
    
    const [page, setPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [refreshing, setRefreshing] = useState(false)
  
    const [cart, setCart] = useState<StoreItemType[]>([]);
    
    const loadCart = () => {
      const items = NaijaShopGetItems();
      console.log("i=",items)
      setCart(items);
    };
  
    useFocusEffect(
      useCallback(() => {
    
        loadCart();
      }, [])
    );

    useEffect(() => {
        if (!id) return;

        if (!vendorFetched[id]) {
            fetchProducts();
        } else {

            setVendor(vendorCache[id]);
            setLoading(false);
        }
    }, [id]);
    
    const fetchProducts = async () => {
        setLoading(true)
        try {
            const result = await axiosClient.get(`/vendors/${id}`);

            const products = result.data.data || [];
            const vendorInfo = result.data.vendor || {};

            const formattedVendor = {
                ...vendorInfo,
                products: products,
            };

            vendorFetched[id] = true;
            vendorCache[id] = formattedVendor;

            setVendor(formattedVendor);
            

            console.log("vproducts=", result.data.vendor.products)
        } catch (error: any) {
            
        } finally {
            setLoading(false)
        }
    }

    const loadMore = async () => {
        console.log("trying to loadingmore...")
        if (isLoadingMore || !hasMore || (vendor?.products || []).length < 20) return;
        console.log("loadingmore...")
        setIsLoadingMore(true);

        try {
            const nextPage = page + 1;

            const res = await axiosClient.get(`/vendors/${id}?page=${nextPage}&limit=20`);

            const newProducts = res.data.data || [];

            if (newProducts.length < 20) {
                setHasMore(false);
            }

            setVendor((prev: any) => ({
                ...prev,
                products: [...(prev?.products || []), ...newProducts],
            }));

            setPage(nextPage);
            
        } catch (err) {
            console.error("Failed to load more", err);
        } finally {
            setIsLoadingMore(false);
        }
    };

  return (
    <View className='flex-1 bg-black' style={{ paddingTop: top }}>
        <SearchPlaceholder cart={getFormattedCartCount(cart)} showMenu={false}/>

        <View className="flex-1 bg-white">
            {loading ? (
                <FlatList
                    data={dummy}
                    numColumns={2}
                    showsHorizontalScrollIndicator={false}
                    style={{ padding: 12 }}
                    columnWrapperStyle={{gap: 10, justifyContent: 'space-between', width: '100%'}}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={{gap: 10, paddingBottom: bottom + 16}}
                    ListHeaderComponent={() => (
                        <View className="w-full justify-center p-2">
                            <Skeleton.Group show={loading}>
                                <View className='w-full mb-4 flex-row flex-wrap items-center gap-3'>
                                    <Skeleton height={36} width={36} radius={18} {...skeletonProps} />
                                    <Skeleton height={10} width={100} {...skeletonProps} />
                                </View>
                                <View className='w-full gap-2 items-center'>
                                    <Skeleton height={10} width={'100%'} {...skeletonProps} />
                                    <Skeleton height={10} width={'100%'} {...skeletonProps} />
                                    <Skeleton height={10} width={'100%'} {...skeletonProps} />
                                </View>
                            </Skeleton.Group>
                        </View>
                    )}
                    renderItem={({ item }) => (
                        <View style={{ marginBottom: 10 }}>
                            <ProductSkeleton width={half} />
                        </View>
                    )}
                    scrollEnabled={true}
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <MasonryFlashList
                    data={Array.isArray(vendor?.products) ? vendor.products : []}
                    numColumns={2}
                    keyExtractor={(item) => item?.id}
                    estimatedItemSize={200}
                    contentContainerStyle={{ paddingTop: 10, paddingBottom: bottom + 16 }}
                    ListHeaderComponent={vendor ? () => (
                        <View className="p-2">
                            <View className='gap-2'>
                                <View className="flex-row items-center gap-2">
                                    {vendor?.logo ? (
                                        <View className='size-12 rounded-full border bg-white items-center justify-center border-gray-100 overflow-hidden'>
                                            <Image
                                                style={{ width: "50%", height: "50%" }}
                                                source={{ uri: vendor?.logo }}
                                                resizeMode="cover"
                                            />
                                        </View>
                                    ) : (
                                        <View className="border-gray-100 w-12 h-12 rounded-full" /> // placeholder
                                    )}
                                    <Text className="font-abold text-lg capitalize flex-1">{vendor?.name}</Text>
                                </View>
                                <View className='gap-1'>
                                    <Text className="font-amedium text-base capitalize">{vendor?.description}</Text>
                                    <Text className="font-amedium text-base capitalize">{vendor?.email}</Text>
                                    <Text className="font-amedium text-base capitalize">{vendor?.phone}</Text>
                                    <Text className="font-amedium text-base capitalize">{vendor?.address}</Text>
                                    <Text className="font-abold text-lg pt-2">Products from this vendor</Text>
                                </View>
                            </View>
                        </View>
                    ) : null}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }: { item: any }) => (
                        <TouchableOpacity
                            activeOpacity={0.9}
                            className="m-1"
                            onPress={() => router.push({pathname: "/(protected)/(routes)/NaijaShopProductDetails", params: { productDetails: JSON.stringify(item) }})}
                        >
                            <View className="w-full bg-gray-50" style={{ width: "100%", height: Math.random() * 100 + 150 }}>
                                <ExpoImage source={{ uri: item?.image[0] }} placeholder={{ blurhash }} cachePolicy="disk" contentFit="cover" style={{ width: "100%", height: "100%" }}/>
                            </View>
                            <View className="w-full flex-1 items-start gap-1">
                                <Text className="font-abold" numberOfLines={2}>{item?.name}</Text>
                                <Text numberOfLines={2}>{item?.description}</Text>
                                <Text className={`text-sm font-abold ${item.productStatus === 'in_stock' ? 'text-green-500' : item.productStatus === 'out_of_stock' ? 'text-red-500' : 'text-red-500'}`}>{formatEnums(item.productStatus)}</Text>
                                <Text className="font-amedium" numberOfLines={2}>{displayCurrency(Number(item.price), item?.currency)}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={() => (
                        <View className="items-center justify-center py-8">
                            <Text className="text-2xl font-extrabold">
                                No Products Found
                            </Text>
                            <Text className="text-sm text-center mt-1">
                                This vendor products will show here.
                            </Text>
                        </View>
                    )}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.4}
                    ListFooterComponent={() => {
                        if (isLoadingMore) {
                            return (
                                <View className='items-center p-4'>
                                    <ActivityIndicator size="small" color="#003366" />
                                    <Text className='text-blue text-amedium text-sm mt-1'>Loading more...</Text>
                                </View>
                            );
                        }
            
                        if (!hasMore && (vendor?.products || []).length > 19) {
                            return (
                                <View className='items-center p-4'>
                                    <Text className='text-blue text-amedium text-sm'>No more Data!</Text>
                                </View>
                            );
                        }
            
                        return null;
                    }}
                />
            )}
        </View>

        <StatusBar backgroundColor="#000" style='light'/>
    </View>
  );
}