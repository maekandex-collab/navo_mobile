import { View, FlatList, Dimensions, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Pressable } from 'react-native'
import { axiosClient } from '@/globalApi';
import { Skeleton } from 'moti/skeleton'
import { useSkeletonCommonProps } from '@/utils/SkeletonProps';
import { router } from 'expo-router';
const width = Dimensions.get("window").width

type CategoryTypes = {
  id: string;
  name: string;
}

let hasFetched = false;
let cachedCategories: CategoryTypes[] = [];

const CategoryList = () => {

  const [list, setList] = useState<CategoryTypes[]>([])
  const [loading, setLoading] = useState(true)
  const skeletonProps = useSkeletonCommonProps();
  const dummy = new Array(8).fill(null)

  const category = [
    {
      id: "1",
      name: "electronics"
    },
    {
      id: "2",
      name: "phones"
    },
    {
      id: "3",
      name: "laptops"
    },
    {
      id: "4",
      name: "clothes"
    },
    {
      id: "5",
      name: "computers"
    }
  ]

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
      const result = await axiosClient.get("/amazonshop/category-list")
      const categories = result.data.data || []
      setList(categories);
      hasFetched = true;
      cachedCategories = categories 

      console.log("cate=",result.data)
    } catch (error: any) {
      
    } finally {
      setLoading(false)
    }
  }

  const gotToProduct = (category: string) => {
    router.push({
      pathname: "/(protected)/(routes)/(modals)/AmazonCategoryModal",
      params: { category }
    });
  }

  return (
    <View className='flex-1 my-2'>
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
          // data={list}
          data={category}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 10 }}
          keyExtractor={(item, index) => item.id.toString()}
          ItemSeparatorComponent={() => <View className="w-3" />}
          renderItem={({ item }) => (
            <Pressable className='my-1 px-3 py-4 items-center bg-gray-50 rounded-md' onPress={() => gotToProduct(item?.name)}>
              <Text className='font-abold text-center text-base leading-4 mt-1 capitalize' numberOfLines={1}>{item?.name}</Text>
            </Pressable>
          )}
          scrollEnabled={true}
          nestedScrollEnabled={true}
          ListEmptyComponent={() => (
            <View className="items-center justify-center px-2 py-4 bg-gray-50 rounded-md" style={{width: width - 20}}>
              <Text className="text-sm text-center mt-1" numberOfLines={1}>
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
