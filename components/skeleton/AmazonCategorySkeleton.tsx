import { View } from 'react-native'
import { Skeleton } from 'moti/skeleton'
import { useSkeletonCommonProps } from '@/utils/SkeletonProps';

const AmazonCategorySkeleton = () => {

  const skeletonProps = useSkeletonCommonProps();

  return (
    <View className='flex-1 my-2'>
        <View className='flex-row gap-4' style={{ paddingHorizontal: 10 }}>
            <View style={{ width: 80 }}>
              <Skeleton.Group show={true}>
                <Skeleton height={45} width={80} radius={8} {...skeletonProps} />
              </Skeleton.Group>
            </View>
            <View style={{ width: 80 }}>
              <Skeleton.Group show={true}>
                <Skeleton height={45} width={80} radius={8} {...skeletonProps} />
              </Skeleton.Group>
            </View>
            <View style={{ width: 80 }}>
              <Skeleton.Group show={true}>
                <Skeleton height={45} width={80} radius={8} {...skeletonProps} />
              </Skeleton.Group>
            </View>
            <View style={{ width: 80 }}>
              <Skeleton.Group show={true}>
                <Skeleton height={45} width={80} radius={8} {...skeletonProps} />
              </Skeleton.Group>
            </View>
            <View style={{ width: 80 }}>
              <Skeleton.Group show={true}>
                <Skeleton height={45} width={80} radius={8} {...skeletonProps} />
              </Skeleton.Group>
            </View>
        </View>
    </View>
  )
}

export default AmazonCategorySkeleton
