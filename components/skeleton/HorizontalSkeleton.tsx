import { View, Text, Dimensions } from 'react-native'
import { useSkeletonCommonProps } from '@/utils/SkeletonProps';
import { Skeleton } from 'moti/skeleton';

const HorizontalSkeleton = ({title}: {title: string}) => {

    const skeletonProps = useSkeletonCommonProps();
    const dummy = new Array(3).fill(null)

  return (
    <View className='py-2'>
        <Text className='font-abold text-xl px-3 pb-2'>{title}</Text>
       <View className='flex-row gap-4' style={{ paddingHorizontal: 10 }}>
            <View style={{ width: 130 }}>
                <Skeleton.Group show={true}>
                    <Skeleton height={130} width={130} radius={10} {...skeletonProps} />
                </Skeleton.Group>
            </View>
            <View style={{ width: 130 }}>
                <Skeleton.Group show={true}>
                    <Skeleton height={130} width={130} radius={10} {...skeletonProps} />
                </Skeleton.Group>
            </View>
            <View style={{ width: 130 }}>
                <Skeleton.Group show={true}>
                    <Skeleton height={130} width={130} radius={10} {...skeletonProps} />
                </Skeleton.Group>
            </View>
       </View>
    </View>
  )
}

export default HorizontalSkeleton