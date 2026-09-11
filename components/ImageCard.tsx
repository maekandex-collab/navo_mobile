import {
  Dimensions,
  TouchableWithoutFeedback,
  Image,
  Text,
  View,
} from "react-native";
import React from "react";

var { width, height } = Dimensions.get("window");

export default function ImageCard({ item }: {item: any}) {
  return (
    //carosuel image
    <View className="relative">
      <TouchableWithoutFeedback>
        <Image
          source={item.imgUrl}
          style={{
            width: width * 0.8,
            height: 130,
          }}
          resizeMode="contain"
          className="rounded-2xl"
        />
      </TouchableWithoutFeedback>

    </View>
  );
}
