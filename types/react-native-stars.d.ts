declare module "react-native-stars" {
  import * as React from "react";
  import { ViewStyle } from "react-native";

  interface StarsProps {
    display?: number;
    spacing?: number;
    count?: number;
    starSize?: number;
    fullStar?: React.ReactNode;
    emptyStar?: React.ReactNode;
    halfStar?: React.ReactNode;
    disabled?: boolean;
    update?: (value: number) => void;
    fullStarColor?: string;
    emptyStarColor?: string;
    halfStarColor?: string;
    style?: ViewStyle;
  }

  export default class Stars extends React.Component<StarsProps> {}
}
