import React, { ReactNode, useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '../../styles/theme';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  height?: number;
  children: ReactNode;
}

export default function BottomSheet({ isOpen, onClose, height = 560, children }: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const OVERDRAG = 20;
  const sheetOffset = useSharedValue(0);

  useEffect(() => {
    // reset offset when opened
    if (isOpen) sheetOffset.value = 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const pan = Gesture.Pan()
    .onChange((event) => {
      const offDelta = event.changeY + sheetOffset.value;
      const clamp = Math.min(-OVERDRAG, offDelta);
      sheetOffset.value = offDelta > 0 ? offDelta : withSpring(clamp);
    })
    .onFinalize(() => {
      if (sheetOffset.value < height / 3) {
        sheetOffset.value = withSpring(0);
      } else {
        sheetOffset.value = withTiming(height, {}, () => {
          onClose();
        });
      }
    });

  const sheetTranslateY = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetOffset.value }],
  }));

  if (!isOpen) return null;

  return (
    <>
      <Animated.View
        entering={FadeIn}
        exiting={FadeOut}
        style={[styles.backdrop, { top: -insets.top, bottom: -insets.bottom }]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <GestureDetector gesture={pan}>
        <Animated.View
          style={[styles.sheet, { height }, sheetTranslateY]}
          entering={SlideInDown}
          exiting={SlideOutDown}
        >
          <View style={styles.sheetHandle} />
          <View style={styles.content}>{children}</View>
        </Animated.View>
      </GestureDetector>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 1000,
    elevation: 10,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: spacing.lg,
    zIndex: 1100,
    elevation: 20,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gray300,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  content: {
    flex: 1,
  },
});
