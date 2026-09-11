import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { Image as ExpoImage } from 'expo-image';
import { router } from 'expo-router'
import Stars from 'react-native-stars'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import displayCurrency from '@/utils/displayCurrency'
import stripCurrency from '@/utils/stripCurrency'

// type searchType = {
//   asin: string;
//   climate_pledge_friendly: boolean;
//   currency: string;
//   delivery: string;
//   has_variations: boolean;
//   is_amazon_choice: boolean;
//   is_best_seller: boolean;
//   is_prime: boolean;
//   product_minimum_offer_price: string;
//   product_minimum_offer_price_value: number;
//   product_num_offers: number;
//   product_num_ratings: number;
//   product_original_price: string;
//   product_original_price_value: number;
//   product_photo: string;
//   product_price: string;
//   product_price_value: number;
//   product_star_rating: string;
//   product_star_rating_value: number;
//   product_title: string;
//   product_url: string;
//   sales_volume: string;
// }

type searchType = {
  asin: string; 
  createdAt: string;
  currency: string;
  id: number;
  product_photo: string;
  product_price: string; 
  product_original_price: string;
  query: string; 
  product_title: string;
  url: string;
}

const ProductCard = ({item}: {item: searchType}) => {

    const blurhash = 'L~I64noffQfQfQfQfQfQfQfQfQfQ';
    
    const gotToProduct = (asin: string) => {
        router.push({
          pathname: "/(protected)/(routes)/AmazonProductDetails",
          params: { asin }
        });
    }

  return (
    <TouchableOpacity
        activeOpacity={0.9}
        className="mb-2 w-[49%]"
        onPress={() => gotToProduct(item?.asin)}
    >
        <View className="w-full h-44 p-2 bg-gray-50">
            <ExpoImage source={{ uri: item?.product_photo }} placeholder={{ blurhash }} cachePolicy="disk" contentFit="contain" style={{ width: "100%", height: "100%" }}/>
        </View>
        <View className="w-full flex-1 items-start gap-1">
            <Text className="font-abold" numberOfLines={2}>{item?.product_title}</Text>
            {/* <View className='items-center justify-start flex-row gap-1'>
                <Stars
                    display={Number(item?.product_star_rating)}
                    spacing={2}
                    count={5}
                    starSize={14}
                    fullStar= {<FontAwesome name="star" size={14} color="#FFA41C" />}
                    emptyStar= {<FontAwesome name="star-o" size={14} color="#D5DBDB" />}
                    halfStar={<FontAwesome name="star-half-o" size={14} color="#FFA41C" />}
                    
                />
                <Text className='text-xs' numberOfLines={1}>({item?.product_num_ratings})</Text>
            </View> */}
            <Text className="font-amedium text-xl" numberOfLines={2}>
                {displayCurrency(Number(item?.product_price), "GBP")}
                {" "}
                <Text className='line-through text-base text-gray-400'>{item?.product_original_price}</Text> 
            </Text>
            {/* <Text className='text-xs' numberOfLines={1}>{item?.sales_volume}</Text> */}
        </View>
    </TouchableOpacity>
  )
}

export default ProductCard