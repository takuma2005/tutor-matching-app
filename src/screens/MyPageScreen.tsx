import { MaterialIcons } from '@expo/vector-icons';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useUser } from '../contexts/UserContext';
import type { HomeStackParamList } from '../navigation/HomeStackNavigator';
import type { MyPageStackParamList } from '../navigation/MyPageStackNavigator';
import type { TabParamList } from '../navigation/TabNavigator';
import { colors, spacing, typography, borderRadius } from '../styles/theme';

type MyPageNav = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'MyPage'>,
  CompositeNavigationProp<
    StackNavigationProp<MyPageStackParamList>,
    StackNavigationProp<HomeStackParamList>
  >
>;

export default function MyPageScreen({ navigation }: { navigation: MyPageNav }) {
  const insets = useSafeAreaInsets();
  const { user } = useUser();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']} testID="mypage-container">
      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.title}>マイページ</Text>
      </View>

      {/* プロフィールカード */}
      <View style={styles.profileCard} testID="profile-card">
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {user?.avatar ? (
              <Image
                source={{ uri: user.avatar as string }}
                style={styles.avatarImage}
                testID="profile-avatar"
              />
            ) : (
              <View style={styles.avatar} testID="profile-avatar">
                <MaterialIcons name="person" size={30} color={colors.gray400} />
              </View>
            )}
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || '名前未設定'}</Text>
            <Text style={styles.profileSchool}>
              {user?.school || '学校未設定'} {user?.grade || '学年未設定'}
            </Text>
            <View style={styles.coinBalance}>
              <MaterialIcons name="monetization-on" size={16} color={colors.warning} />
              <Text style={styles.coinText}>{(user?.coins ?? 0).toLocaleString()}コイン</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <MaterialIcons name="arrow-forward-ios" size={16} color={colors.gray400} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 64 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 設定メニュー */}
        <View style={styles.section} testID="content-section">
          <Text style={styles.sectionTitle}>設定</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              (
                navigation as unknown as {
                  navigate: (route: string, params?: { screen?: string }) => void;
                }
              ).navigate('Home', { screen: 'CoinManagement' })
            }
          >
            <View style={styles.menuIconContainer}>
              <MaterialIcons name="monetization-on" size={20} color={colors.warning} />
            </View>
            <Text style={styles.menuText}>コイン管理</Text>
            <MaterialIcons name="chevron-right" size={20} color={colors.gray400} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              (
                navigation as unknown as {
                  navigate: (route: string, params?: { screen?: string }) => void;
                }
              ).navigate('Home', { screen: 'Favorite' })
            }
          >
            <View style={styles.menuIconContainer}>
              <MaterialIcons name="favorite" size={20} color={colors.error} />
            </View>
            <Text style={styles.menuText}>お気に入り</Text>
            <MaterialIcons name="chevron-right" size={20} color={colors.gray400} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('MatchRequests')}
          >
            <View style={styles.menuIconContainer}>
              <MaterialIcons name="assignment" size={20} color={colors.gray600} />
            </View>
            <Text style={styles.menuText}>申請状況</Text>
            <MaterialIcons name="chevron-right" size={20} color={colors.gray400} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <MaterialIcons name="help" size={20} color={colors.gray600} />
            </View>
            <Text style={styles.menuText}>ヘルプ・サポート</Text>
            <MaterialIcons name="chevron-right" size={20} color={colors.gray400} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <MaterialIcons name="logout" size={20} color={colors.error} />
            </View>
            <Text style={[styles.menuText, { color: colors.error }]}>ログアウト</Text>
            <MaterialIcons name="chevron-right" size={20} color={colors.gray400} />
          </TouchableOpacity>
        </View>

        {/* 底部余白 */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.appBackground,
  },
  header: {
    backgroundColor: colors.appBackground,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray200,
  },
  title: {
    fontSize: typography.sizes?.h2 || 24,
    fontWeight: '700',
    color: colors.gray900,
    textAlign: 'center',
  },
  profileCard: {
    backgroundColor: colors.appBackground,
    marginHorizontal: 0,
    marginTop: 0,
    borderRadius: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray200,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  avatarContainer: {
    marginRight: spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.gray200,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: typography.sizes?.h4 || 18,
    fontWeight: '700',
    color: colors.gray900,
    marginBottom: spacing.xs / 2,
  },
  profileSchool: {
    fontSize: typography.sizes?.body || 16,
    color: colors.gray600,
    marginBottom: spacing.sm,
  },
  coinBalance: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.full || 999,
    alignSelf: 'flex-start',
  },
  coinText: {
    fontSize: typography.sizes?.caption || 12,
    fontWeight: '600',
    color: colors.warning,
    marginLeft: spacing.xs / 2,
  },
  profileButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: colors.white,
    marginHorizontal: 0,
    marginTop: spacing.sm,
    padding: spacing.lg,
    borderRadius: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.gray200,
  },
  sectionTitle: {
    fontSize: typography.sizes?.h4 || 18,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuText: {
    flex: 1,
    fontSize: typography.sizes?.body || 16,
    color: colors.gray900,
  },
  menuDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.gray200,
    marginLeft: spacing.sm + 36 + spacing.md,
  },
  bottomSpacing: {
    height: spacing.xl,
  },
});
