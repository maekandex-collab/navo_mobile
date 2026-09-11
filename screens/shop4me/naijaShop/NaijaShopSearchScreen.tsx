import { View, FlatList, Text, TouchableOpacity } from "react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image as ExpoImage } from 'expo-image';
import Search from "@/components/naija-shop/Search";
import { StatusBar } from "expo-status-bar";
import {
  NaijaShopAddItem,
  NaijaShopGetItems
} from "@/utils/NaijaShopCartStorage";
import { useFocusEffect } from "@react-navigation/native";
import { Toast } from "react-native-toast-notifications";
import NaijaShopIncrementBtn from "@/components/naija-shop/NaijaShopIncrementBtn";
import { axiosClient } from "@/globalApi";
import displayCurrency from "@/utils/displayCurrency";
import { ActivityIndicator } from "react-native";
import { formatEnums } from "@/utils/formatEnums";
import { getFormattedCartCount } from "@/utils/getFormattedCartCount";

export default function NaijaShopSearchScreen() {

  const blurhash = 'L~I64noffQfQfQfQfQfQfQfQfQfQ';
    
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchStarted, setSearchStarted] = useState(false);

  const { top, bottom } = useSafeAreaInsets();

  // Memoized cart map (FAST lookup instead of function call)
  const cartMap = useMemo(() => {
    const map: any = {};
    cart.forEach((item) => {
      map[item.id] = item;
    });
    return map;
  }, [cart]);

  const loadCart = () => {
    const items = NaijaShopGetItems();
    setCart(items);
  };

  useFocusEffect(
    useCallback(() => {
      loadCart();
    }, [])
  );

  // Proper debounce
  useEffect(() => {
    if (!search) {
      setProducts([]);
      setSearchStarted(false);
      return;
    }

    const timeout = setTimeout(() => {
      performSearch(search);
    }, 400);

    return () => clearTimeout(timeout);
  }, [search]);

  const performSearch = async (searchTerm: string) => {
    setLoading(true);

    try {
      const result = await axiosClient.get(
        `/vendors/search?query=${searchTerm}`
      );

      setProducts(result.data.products || []);
    } catch (error: any) {
      Toast.show(
        error.response?.data?.message ||
          error.response?.data?.error?.message,
        { type: "danger" }
      );
    } finally {
      setLoading(false);
      setSearchStarted(true);
    }
  };

  const addToCart = (id: any) => {
    NaijaShopAddItem({ id, quantity: 1 });

    Toast.show("Item Added to Cart", {
      type: "success",
    });

    loadCart();
  };

  // Memoized item renderer (IMPORTANT)
  const renderItem = useCallback(({ item }: any) => {
    const isInCart = cartMap[item.id];

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        className="w-full flex-row border border-gray-50 rounded-md overflow-hidden"
        onPress={() =>
          router.push({
            pathname: "/(protected)/(routes)/NaijaShopProductDetails",
            params: { productDetails: JSON.stringify(item) },
          })
        }
      >
        <View className="w-[30%] min-h-36 bg-gray-50">
          <ExpoImage source={{ uri: item?.image[0] }} placeholder={{ blurhash }} cachePolicy="disk" contentFit="cover" style={{ width: "100%", height: 180 }}/> 
        </View>

        <View className="flex-1 p-2 gap-1">
          <Text numberOfLines={2}>{item.name}</Text>
          <Text numberOfLines={2}>{item.description}</Text>

          <Text className="text-xl">
            {displayCurrency(Number(item.price), item.currency)}
          </Text>

          <Text
            className={`text-sm ${
              item.productStatus === "IN_STOCK"
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {formatEnums(item.productStatus)}
          </Text>

          <Text numberOfLines={1}>By {item?.vendor?.name}</Text>

          {isInCart ? (
            <NaijaShopIncrementBtn
              id={item.id}
              handleLoadCart={loadCart}
              showCheckout={false}
              otherStyles="w-full"
            />
          ) : (
            <TouchableOpacity
              onPress={() => addToCart(item.id)}
              className="bg-orange py-3 rounded-md items-center"
            >
              <Text className="text-white">Add to cart</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  }, [cartMap]);

  return (
    <View className="flex-1 bg-black" style={{ paddingTop: top }}>
      <Search
        cart={getFormattedCartCount(cart)}
        placeholder="Search products..."
        value={search}
        handleChangeText={setSearch}
        showMenu={false}
      />

      <View className="flex-1 bg-white px-4">
        {loading ? (
          <View className="py-10">
            <ActivityIndicator size="large" color="black"/>
          </View>
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{
              paddingTop: 16,
              paddingBottom: bottom + 16,
              gap: 10,
            }}
            showsVerticalScrollIndicator={false}
            initialNumToRender={6}
            maxToRenderPerBatch={6}
            windowSize={5}
            removeClippedSubviews
            ListEmptyComponent={
              searchStarted ? (
                <Text className="text-center mt-10">
                  No Results Found
                </Text>
              ) : null
            }
          />
        )}
      </View>

      <StatusBar style="light" />
    </View>
  );
}