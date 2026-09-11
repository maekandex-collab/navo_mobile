import { Link, router } from 'expo-router';
import React, { useRef, useState, useCallback, memo } from 'react';
import {
  StyleSheet,
  FlatList,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomButton from '@/components/CustomButton';
import { StatusBar } from 'expo-status-bar';
import { images } from '@/constants';

const { width } = Dimensions.get('window');

type SlideItem = {
  id: number;
  title: string;
  subtitle: string;
  image: any;
};

const slides: SlideItem[] = [
  {
    id: 1,
    title: 'Effortless Deliveries',
    subtitle: 'Send and receive packages seamlessly with our fast and reliable logistics service.',
    image: images.background1,
  },
  {
    id: 2,
    title: 'Real-Time Tracking',
    subtitle: 'Stay updated with live tracking and instant notifications for your shipments.',
    image: images.background2,
  },
  {
    id: 3,
    title: 'We Shop, You Relax',
    subtitle: 'Let us handle your shopping while you sit back. Simply place an order, and we’ll get it delivered to you.',
    image: images.background3,
  },
  {
    id: 4,
    title: 'Secure Payments',
    subtitle: 'Enjoy safe transactions and reliable delivery, ensuring you get exactly what you ordered.',
    image: images.background4,
  },
];

const Slide = memo(({ item, statusBarHeight, currentSlideIndex, skip }: {
  item: SlideItem;
  statusBarHeight: number;
  currentSlideIndex: number;
  skip: () => void;
}) => {
  return (
    <ImageBackground source={item.image} resizeMode="cover" style={styles.image}>
      <View className='flex-1' style={{ marginTop: statusBarHeight }}>
        <Header currentSlideIndex={currentSlideIndex} skip={skip} />
        <View className={`h-full w-screen justify-end flex-1 items-center px-4 ${item.id === 4 ? 'mb-16' : 'mb-28'}`}>
          <Text className='text-white font-ablack text-2xl text-center px-4 pb-3'>{item.title}</Text>
          <Text className='text-white text-center px-6'>{item.subtitle}</Text>
          {item.id === 4 && (
            <View className='w-full mt-14'>
              <CustomButton title="Create Account" handlePress={() => router.push("/(onboarding)/SignUp")} containerStyles="w-full" textStyles='text-white' />
              <CustomButton title="Get Quote" handlePress={() => router.push("/(onboarding)/GetQuote")} containerStyles="w-full mt-3 bg-white" textStyles='text-blue' />
            </View>
          )}
        </View>
      </View>
    </ImageBackground>
  );
});

const Header = memo(({ currentSlideIndex, skip }: { currentSlideIndex: number; skip: () => void }) => {
  const isLight = currentSlideIndex === 0 || currentSlideIndex === 2;

  return (
    <View>
      <StatusBar style="light" />
      <View className='p-4'>
        <View className='flex-row items-center justify-between w-full'>
          <View className="flex-row justify-center items-center">
            <Text className={`text-orange font-ablack text-2xl`} style={{fontSize: 30}}>Navo</Text>
            <Text
              className={`${isLight ? 'text-blue' : 'text-white'} font-abold`}
              style={{ fontSize: 25, transform: [{ translateY: -10 }] }}
            >
              +
            </Text>
          </View>
          {currentSlideIndex === slides.length - 1 ? (
            <TouchableOpacity onPress={() => router.push('/(onboarding)/SignIn')}>
              <Text className='text-blue text-2xl font-amedium'>Login</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={skip}>
              <Text className={`${isLight ? 'text-blue' : 'text-white'} text-2xl font-amedium`}>Skip</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              currentSlideIndex === index && { backgroundColor: '#FF6600', width: 25 },
            ]}
          />
        ))}
      </View>
    </View>
  );
});

const Onboarding = () => {
  const insets = useSafeAreaInsets();
  const statusBarHeight = insets.top + 10;
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const ref = useRef<FlatList>(null);

  const updateCurrentSlideIndex = (e: any) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    setCurrentSlideIndex(currentIndex);
  };

  const skip = useCallback(() => {
    const lastSlideIndex = slides.length - 1;
    ref.current?.scrollToOffset({ offset: lastSlideIndex * width });
    setCurrentSlideIndex(lastSlideIndex);
  }, []);

  // const goToNextSlide = () => {
  //   const nextSlideIndex = currentSlideIndex + 1;
  //   if (nextSlideIndex != slides.length) {
  //     const offset = nextSlideIndex * width;
  //     ref?.current.scrollToOffset({offset});
  //     setCurrentSlideIndex(currentSlideIndex + 1);
  //   }
  // };

  return (
    <SafeAreaProvider>
      <SafeAreaView edges={['left', 'right']} className='flex-1 bg-blue'>
        <StatusBar style='light' />
        <FlatList
          ref={ref}
          data={slides}
          keyExtractor={(item) => item.id.toString()}
          onMomentumScrollEnd={updateCurrentSlideIndex}
          showsHorizontalScrollIndicator={false}
          horizontal
          pagingEnabled
          renderItem={({ item }) => (
            <Slide
              item={item}
              statusBarHeight={statusBarHeight}
              currentSlideIndex={currentSlideIndex}
              skip={skip}
            />
          )}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  indicator: {
    height: 4,
    width: 10,
    backgroundColor: '#ffffff',
    marginHorizontal: 3,
    borderRadius: 2,
  },
  image: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },
});

export default Onboarding;
