import { View, StyleSheet, Dimensions } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import React, { useCallback, memo } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import Carousel, { Pagination } from 'react-native-reanimated-carousel';

const { width } = Dimensions.get('window');

// Memoized Carousel Item
type CarouselItemProps = {
  uri: string
};

const CarouselItem = memo(({ uri }: CarouselItemProps) => {

  const blurhash = 'L~I64noffQfQfQfQfQfQfQfQfQfQ';
    
  return (
    <View style={styles.itemContainer}>
      <ExpoImage source={{ uri }} placeholder={{ blurhash }} cachePolicy="disk" contentFit="contain" style={{ width: '94%', height: '100%' }}/>
    </View>
  );
});

const ProductDetailCarousel = ({images}: {images: string[]}) => {
  const scrollOffsetValue = useSharedValue<number>(0);
  const progress = useSharedValue(0);

  // Memoized renderItem for Carousel
  const renderCarouselItem = useCallback(
    ({ item, index }: { item: string; index: number }) => (
      <CarouselItem uri={item} key={index} />
    ),
    []
  );

  return (
    <>
      <View style={{ alignItems: 'center' }}>
        <Carousel
          loop
          width={width}
          height={380}
          snapEnabled
          pagingEnabled
          data={images}
          defaultScrollOffsetValue={scrollOffsetValue}
          mode="horizontal-stack"
          modeConfig={{
            snapDirection: 'left',
            stackInterval: 0,
          }}
          onConfigurePanGesture={(panGesture) => {
            panGesture.activeOffsetX([-10, 10]);
            panGesture.failOffsetY([-5, 5]);
          }}
          onProgressChange={(_, absoluteProgress) => {
            progress.value = absoluteProgress;
          }}
          renderItem={renderCarouselItem}
        />
      </View>

      {/* Pagination Dots */}
      <View style={styles.paginationContainer}>
        <Pagination.Basic
          progress={progress}
          data={images}
          dotStyle={styles.dot}
          activeDotStyle={styles.activeDot}
        />
      </View>
    </>
  );
};

export default ProductDetailCarousel;

const styles = StyleSheet.create({
  itemContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationContainer: {
    margin: 16,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: '#C8C8C8',
  },
  activeDot: {
    backgroundColor: '#000',
  },
});
