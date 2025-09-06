import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';

import { colors, spacing } from '../../styles/theme';

type Props = {
  children: ReactNode;
  edges?: Edge[];
  backgroundColor?: string;
  paddingHorizontal?: number;
  paddingBottom?: number;
};

export default function ScreenLayout({
  children,
  edges = ['top'],
  backgroundColor = colors.background,
  paddingHorizontal = spacing.screen.paddingHorizontal,
  paddingBottom = spacing.screen.paddingBottom,
}: Props) {
  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={edges}>
      <View style={[styles.content, { paddingHorizontal, paddingBottom }]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
