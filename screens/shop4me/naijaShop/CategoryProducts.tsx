import { View, TextInput, FlatList, Text, TouchableOpacity, Pressable, ActivityIndicator, Image } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image as ExpoImage } from 'expo-image';
import Search from "@/components/naija-shop/Search";
import { StatusBar } from "expo-status-bar";
import { useSkeletonCommonProps } from "@/utils/SkeletonProps";
import { axiosClient } from "@/globalApi";
import { Skeleton } from "moti/skeleton";
import { Dimensions } from "react-native";
import { NaijaShopGetItems } from "@/utils/NaijaShopCartStorage";
import { useFocusEffect } from "@react-navigation/native";
import ProductSkeleton from "@/components/ProductSkeleton";
import { MasonryFlashList } from "@shopify/flash-list";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Stars from "react-native-stars";
import displayCurrency from "@/utils/displayCurrency";
import SearchPlaceholder from "@/components/naija-shop/SearchPlaceholder";
import { formatEnums } from "@/utils/formatEnums";
import { useLocalSearchParams } from "expo-router";
import { getFormattedCartCount } from "@/utils/getFormattedCartCount";
const width = Dimensions.get("window").width

type vendorType = {
  id: string;
  name: string;
  logo: string;
}

type ProductType = {
  id: string; 
  description: string; 
  image: string[]; 
  name: string; 
  currency: "GBP" | "NGN";
  price: string; 
  productStatus: "in_stock" | "out_of_stock";
  quantity: number;
  vendor: vendorType
}

type StoreItemType = {
  id: any
  quantity: number,
};

let categoryCache: { [key: string]: ProductType[] } = {};
let categoryFetched: { [key: string]: boolean } = {};

export default function CategoryProducts() {

    const blurhash = 'L~I64noffQfQfQfQfQfQfQfQfQfQ';
    
    const { category } = useLocalSearchParams() as any;
    const [loading, setLoading] = useState(true)
    const [products, setProducts] = useState<ProductType[]>([])
    const skeletonProps = useSkeletonCommonProps();
    const { top, bottom } = useSafeAreaInsets()

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
        if (!category) return;

        if (!categoryFetched[category]) {
            fetchProducts();
        } else {
            // load cached products for this category
            setProducts(categoryCache[category]);
            setLoading(false);
        }
    }, [category]);

    
    const fetchProducts = async () => {
        setLoading(true)
        try {
            console.log("products")
            const result = await axiosClient.get(`/vendors/products/category?category=${category}`)
            const list = result.data.data || []
            
            // cache per category
            categoryFetched[category] = true;
            categoryCache[category] = list;

            setProducts(list);

            console.log("vproducts=", result.data)
        } catch (error: any) {
            
        } finally {
            setLoading(false)
        }
    }

    const loadMore = async () => {
        console.log("trying to loadingmore...")
        if (isLoadingMore || !hasMore || products.length < 20) return;
        console.log("loadingmore...")
        setIsLoadingMore(true);

        try {
            const nextPage = page + 1;

            const res = await axiosClient.get(`/vendors/products/category?category${category}?page=${nextPage}&limit=20`);

            const newData = res.data.data || [];

            if (newData.length < 20) {
                setHasMore(false); // No more data
            }

            setProducts((prev: any) => [...prev, ...newData]);
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
                    data={products}
                    numColumns={2}
                    keyExtractor={(item) => item?.id}
                    estimatedItemSize={200}
                    contentContainerStyle={{ paddingTop: 10, paddingBottom: bottom + 16 }}
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
                                <Text className="font-amedium">{displayCurrency(Number(item.price), item?.currency)}</Text>
                                <Text numberOfLines={1}>By {item?.vendor?.name}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={() => (
                        <View className="items-center justify-center py-8">
                            <Text className="text-2xl font-extrabold">
                                No Products Found
                            </Text>
                            <Text className="text-sm text-center mt-1">
                                Products in {category?.toLowerCase()} category will show here.
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
            
                        if (!hasMore && products.length > 19) {
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