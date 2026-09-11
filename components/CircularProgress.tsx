import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CircularProgressProps {
  size: number;
  strokeWidth: number;
  progress: { value: number }; // Shared value
  glowTrigger: { value: number }; // Shared value
  color?: string;
  glowColor?: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  size,
  strokeWidth,
  progress,
  glowTrigger,
  color = 'red',
  glowColor = 'red',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Animate stroke offset
  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference * (1 - progress.value);
    return {
      strokeDashoffset,
    };
  });

  // Animate glow ring scale
  const glowStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withTiming(glowTrigger.value === 1 ? 1.3 : 1, { duration: 200 }),
        },
      ],
    };
  });

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#eee"
          strokeWidth={strokeWidth}
          fill="white"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference}, ${circumference}`}
          animatedProps={animatedProps}
        />
      </Svg>

      {/* Glow ring */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: size / 2,
            borderWidth: 4,
            borderColor: glowColor,
          },
          glowStyle, // Animated properly
        ]}
      />
    </View>
  );
};

export default CircularProgress;
