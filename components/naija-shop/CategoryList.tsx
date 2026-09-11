import { View, FlatList, Text, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Pressable } from 'react-native'
import { router } from 'expo-router';
import { axiosClient } from '@/globalApi';
import { useSkeletonCommonPropsDark } from '@/utils/SkeletonProps';
import { Skeleton } from 'moti/skeleton';
const width = Dimensions.get("window").width

let hasFetched = false;
let cachedCategories: string[] = [];

const CategoryList = () => {

   const [list, setList] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const skeletonProps = useSkeletonCommonPropsDark();
    const dummy = new Array(8).fill(null)

    useEffect(() => {
      if (!hasFetched) {
        fetchCategory()
      } else {
        setList(cachedCategories)
        setLoading(false);
      }
    }, []);
  
    const fetchCategory = async () => {
      setLoading(true)
      try {
        const result = await axiosClient.get("/vendors/products/categories")
        const categories = result.data.categories || []
        setList(categories);
        hasFetched = true;
        cachedCategories = categories 
        console.log("cate=",result.data)
      } catch (error: any) {
        
      } finally {
        setLoading(false)
      }
    }
  
  const goToCategoryProduct = (category: string) => {
    router.push({
      pathname: "/(protected)/(routes)/NaijaShopCategoryProducts",
      params: { category }
    });
  }

  return (
    <View className='bg-dark' style={{ paddingTop: 10, paddingBottom: 30, borderBottomRightRadius: 18, borderBottomLeftRadius: 18 }}>
      {loading ? (
        <FlatList
          data={dummy}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 10 }}
          keyExtractor={(item, index) => index.toString()}
          ItemSeparatorComponent={() => <View className="w-3" />}
          renderItem={({ item }) => (
            <View style={{ width: 80 }}>
              <Skeleton.Group show={loading}>
                <Skeleton height={45} width={80} radius={8} {...skeletonProps} />
              </Skeleton.Group>
            </View>
          )}
          scrollEnabled={true}
          nestedScrollEnabled={true}
        />
      ) : (
        <FlatList
          data={list}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingHorizontal: 10 }}
          keyExtractor={(item, index) => item}
          renderItem={({ item }) => (
            <Pressable className='py-3 px-5 justify-center bg-dark-light items-center rounded-md' onPress={() => goToCategoryProduct(item)}>
              <Text className='font-abold text-center text-base mt-1 text-white capitalize'>{item}</Text>
            </Pressable>
          )}
          scrollEnabled={true}
          nestedScrollEnabled={true}
          ListEmptyComponent={() => (
            <View className="items-center justify-center px-2 py-4 bg-dark-light rounded-md" style={{width: width - 20}}>
              <Text className="text-sm text-center mt-1 text-white" numberOfLines={1}>
                All product categories will show here.
              </Text>
            </View>
          )}
        />
      )}
    </View>
  )
}

export default CategoryList
