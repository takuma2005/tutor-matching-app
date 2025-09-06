import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, ViewStyle, StyleProp, DimensionValue } from 'react-native';

import { colors } from '../../styles/theme';

export type SkeletonProps = {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: ViewStyle;
};

export default function Skeleton({
  width = '100%',
  height = 12,
  radius = 6,
  style,
}: SkeletonProps) {
  const shimmer = useRef(new Animated.Value(0)).current;
  const translateX = shimmer.interpolate({ inputRange: [0, 1], outputRange: [-100, 300] });

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  const containerStyle: StyleProp<ViewStyle> = useMemo(
    () => [
      {
        width,
        height,
        borderRadius: radius,
        overflow: 'hidden' as ViewStyle['overflow'],
        backgroundColor: colors.gray100,
      },
      style,
    ],
    [width, height, radius, style],
  );

  return (
    <View style={containerStyle}>
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateX }] }]}>
        <LinearGradient
          colors={['transparent', colors.gray200, 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}
