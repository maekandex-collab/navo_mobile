import { View, Text } from 'react-native'
import React from 'react'
import { Skeleton } from 'moti/skeleton'
import { useSkeletonCommonProps } from '@/utils/SkeletonProps';

const ProductSkeleton = ({width}: {width: any}) => {

  const skeletonProps = useSkeletonCommonProps();

  return (
    <View className="gap-2">
      <Skeleton height={150} width={width} radius={10} {...skeletonProps} />
      <Skeleton height={10} width={width} radius={10} {...skeletonProps} />
      <Skeleton height={10} width={width} radius={10} {...skeletonProps} />
      <Skeleton height={10} width={width} radius={10} {...skeletonProps} />
    </View>
  )
}

export default ProductSkeleton