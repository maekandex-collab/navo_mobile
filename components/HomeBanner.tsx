import { Dimensions, Image, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Carousal, { Pagination } from "react-native-snap-carousel";
import { images } from "@/constants";
import ImageCard from "./ImageCard";
import { useState } from "react";
const { width, height } = Dimensions.get("window");

export const data = [
    {
      id: 1,
      imgUrl: images.rectangle,
    },
    {
      id: 2,
      imgUrl: images.rectangle,
    },
    {
      id: 3,
      imgUrl: images.rectangle,
    },
    {
      id: 4,
      imgUrl: images.rectangle,
    }
  ];

export default function HomeBanner() {
 
  const [index, setIndex] = useState<number>(0)

  return (
      <View className={`pb-4 ${Platform.OS === "ios" ? 'mt-3' : ""}`}>
        <View>
          <Carousal
              data={data}
              renderItem={({ item }) => <ImageCard item={item} />}
              firstItem={1}
              inactiveSlideScale={0.86}
              inactiveSlideOpacity={0.8}
              sliderWidth={width}
              itemWidth={width * 0.8}
              slideStyle={{ display: "flex", alignItems: "center" }}
              onSnapToItem={(index) => setIndex(index)}
            />
            <Pagination
              dotsLength={data.length}
              activeDotIndex={index}
              containerStyle={{ marginTop: -25 }}
              dotStyle={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  marginHorizontal: -10,
                  backgroundColor: '#FF6600'
              }}
              inactiveDotStyle={{
                  backgroundColor: '#ccc'
              }}
              inactiveDotOpacity={0.4}
              inactiveDotScale={0.6}
            />
        </View>
      </View>
  );
}

