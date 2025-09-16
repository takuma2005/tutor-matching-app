import { MaterialIcons } from '@expo/vector-icons';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';

import { StandardScreen } from '../components/templates';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import type { HomeStackParamList } from '../navigation/HomeStackNavigator';
import type { MyPageStackParamList } from '../navigation/MyPageStackNavigator';
import type { StudentTabParamList } from '../navigation/StudentTabNavigator';
import type { TutorTabParamList } from '../navigation/TutorTabNavigator';
import { colors, spacing, typography, borderRadius } from '../styles/theme';

type MyPageNav = CompositeNavigationProp<
  BottomTabNavigationProp<StudentTabParamList | TutorTabParamList, 'MyPage'>,
  CompositeNavigationProp<
    StackNavigationProp<MyPageStackParamList>,
    StackNavigationProp<HomeStackParamList>
  >
>;

export default function MyPageScreen({ navigation }: { navigation: MyPageNav }) {
  const { user } = useUser();
  const { role, switchRole } = useAuth();

  const handleRoleSwitch = (newRole: 'student' | 'tutor') => {
    const currentRoleText = role === 'student' ? '後輩' : '先輩';
    const newRoleText = newRole === 'student' ? '後輩' : '先輩';

    Alert.alert(
      '役割を切り替え',
      `${currentRoleText}から${newRoleText}へ切り替えますか？\n\n切り替え後にプロフィール情報の入力が必要な場合があります。`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '切り替える',
          onPress: async () => {
            const result = await switchRole(newRole);
            if (result.success) {
              Alert.alert('切り替え完了', `${newRoleText}への切り替えが完了しました！`, [
                { text: 'OK' },
              ]);
            } else {
              Alert.alert('エラー', '役割の切り替えに失敗しました。');
            }
          },
        },
      ],
    );
  };

  return (
    <StandardScreen title="マイページ" showBackButton={false}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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

        {/* 役割切り替えセクション */}
        <View style={styles.roleSwitchCard}>
          <View style={styles.roleHeader}>
            <MaterialIcons name="swap-horiz" size={24} color={colors.primary} />
            <View style={styles.roleInfo}>
              <Text style={styles.roleTitle}>現在の役割</Text>
              <Text style={styles.currentRole}>
                {role === 'student' ? '後輩として利用中' : '先輩として登録中'}
              </Text>
            </View>
          </View>

          <View style={styles.roleSwitchButtons}>
            {role !== 'tutor' && (
              <TouchableOpacity
                style={styles.switchButton}
                onPress={() => handleRoleSwitch('tutor')}
              >
                <MaterialIcons name="school" size={20} color={colors.secondary} />
                <Text style={[styles.switchButtonText, { color: colors.secondary }]}>
                  先輩として登録
                </Text>
              </TouchableOpacity>
            )}

            {role !== 'student' && (
              <TouchableOpacity
                style={styles.switchButton}
                onPress={() => handleRoleSwitch('student')}
              >
                <MaterialIcons name="person" size={20} color={colors.primary} />
                <Text style={[styles.switchButtonText, { color: colors.primary }]}>
                  後輩として利用
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

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
    </StandardScreen>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl * 2,
  },
  profileCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.gray200,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
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
  section: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.gray200,
    overflow: 'hidden',
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
  // 役割切り替えセクション
  roleSwitchCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.gray200,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  roleInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  roleTitle: {
    fontSize: typography.sizes?.body || 16,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: spacing.xs / 2,
  },
  currentRole: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray600,
  },
  roleSwitchButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  switchButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray50,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  switchButtonText: {
    fontSize: typography.sizes?.body || 14,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
});
