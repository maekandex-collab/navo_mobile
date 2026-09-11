import { View } from 'react-native'
import { useSkeletonCommonPropsDark } from '@/utils/SkeletonProps';
import { Skeleton } from 'moti/skeleton';

const NaijaShopCategorySkeleton = () => {

  const skeletonProps = useSkeletonCommonPropsDark();

  return (
    <View className='bg-dark' style={{ paddingTop: 10, paddingBottom: 30, borderBottomRightRadius: 18, borderBottomLeftRadius: 18 }}>
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
            <View style={{ width: 80 }}>
              <Skeleton.Group show={true}>
                <Skeleton height={45} width={80} radius={8} {...skeletonProps} />
              </Skeleton.Group>
            </View>
       </View>
    </View>
  )
}

export default NaijaShopCategorySkeleton
