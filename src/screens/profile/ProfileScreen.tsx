import { MaterialIcons } from '@expo/vector-icons';
import type { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useUser } from '../../contexts/UserContext';
import type { MyPageStackParamList } from '../../navigation/MyPageStackNavigator';
import { colors, spacing, typography, borderRadius } from '../../styles/theme';

import ScreenContainer from '@/components/common/ScreenContainer';
import Section from '@/components/common/Section';

type ProfileScreenNavigationProp = StackNavigationProp<MyPageStackParamList, 'Profile'>;

interface ProfileScreenProps {
  navigation: ProfileScreenNavigationProp;
}

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { user, loading, error } = useUser();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>プロフィールを読み込んでいます...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={48} color={colors.error} />
          <Text style={styles.errorText}>{error || 'プロフィールが見つかりません'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ScreenContainer withScroll contentContainerStyle={{ paddingHorizontal: 0, paddingTop: 0 }}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.gray900} />
        </TouchableOpacity>
        <Text style={styles.title}>プロフィール</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('ProfileEdit')}
        >
          <MaterialIcons name="edit" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* プロフィール画像とメイン情報 */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatar}>
                <MaterialIcons name="person" size={60} color={colors.gray400} />
              </View>
            )}
          </View>

          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userInfo}>
            {user.school} • {user.grade}
          </Text>

          <View style={styles.coinBalance}>
            <MaterialIcons name="monetization-on" size={20} color={colors.warning} />
            <Text style={styles.coinText}>{user.coins.toLocaleString()}コイン</Text>
          </View>
        </View>

        {/* 基本情報 */}
        <Section title="基本情報">
          <View style={styles.infoItem}>
            <View style={styles.infoHeader}>
              <MaterialIcons name="person" size={20} color={colors.gray600} />
              <Text style={styles.infoLabel}>名前</Text>
            </View>
            <Text style={styles.infoValue}>{user.name}</Text>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoHeader}>
              <MaterialIcons name="school" size={20} color={colors.gray600} />
              <Text style={styles.infoLabel}>学校</Text>
            </View>
            <Text style={styles.infoValue}>{user.school}</Text>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoHeader}>
              <MaterialIcons name="grade" size={20} color={colors.gray600} />
              <Text style={styles.infoLabel}>学年</Text>
            </View>
            <Text style={styles.infoValue}>{user.grade}</Text>
          </View>
        </Section>

        {/* 連絡先情報 */}
        <Section title="連絡先">
          <View style={styles.infoItem}>
            <View style={styles.infoHeader}>
              <MaterialIcons name="email" size={20} color={colors.gray600} />
              <Text style={styles.infoLabel}>メールアドレス</Text>
            </View>
            <Text style={styles.infoValue}>{user.email || '未設定'}</Text>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoHeader}>
              <MaterialIcons name="phone" size={20} color={colors.gray600} />
              <Text style={styles.infoLabel}>電話番号</Text>
            </View>
            <Text style={styles.infoValue}>{user.phone || '未設定'}</Text>
          </View>
        </Section>

        {/* 興味のある科目 */}
        <Section title="興味のある科目">
          {user.interestedSubjects.length > 0 ? (
            <View style={styles.subjectTags}>
              {user.interestedSubjects.map((subject, index) => (
                <View key={index} style={styles.subjectTag}>
                  <Text style={styles.subjectTagText}>{subject}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noDataText}>設定されていません</Text>
          )}
        </Section>

        {/* 自己紹介 */}
        <Section title="自己紹介">
          <Text style={styles.bioText}>{user.bio || '自己紹介が未設定です。'}</Text>
        </Section>

        {/* 編集ボタン */}
        <View style={styles.editButtonContainer}>
          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={() => navigation.navigate('ProfileEdit')}
          >
            <MaterialIcons name="edit" size={20} color={colors.white} />
            <Text style={styles.editProfileButtonText}>プロフィールを編集</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.appBackground,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.sizes?.body || 16,
    color: colors.gray600,
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: typography.sizes?.body || 16,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.sizes?.h3 || 20,
    fontWeight: '700',
    color: colors.gray900,
  },
  editButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.gray50,
  },
  avatarContainer: {
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: typography.sizes?.h2 || 24,
    fontWeight: '700',
    color: colors.gray900,
    marginBottom: spacing.xs,
  },
  userInfo: {
    fontSize: typography.sizes?.body || 16,
    color: colors.gray600,
    marginBottom: spacing.lg,
  },
  coinBalance: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full || 999,
  },
  coinText: {
    fontSize: typography.sizes?.body || 16,
    fontWeight: '600',
    color: colors.warning,
    marginLeft: spacing.xs,
  },
  section: {
    backgroundColor: colors.white,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes?.h4 || 18,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: spacing.md,
  },
  infoItem: {
    marginBottom: spacing.lg,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  infoLabel: {
    fontSize: typography.sizes?.caption || 12,
    fontWeight: '500',
    color: colors.gray600,
    marginLeft: spacing.sm,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: typography.sizes?.body || 16,
    color: colors.gray900,
    paddingLeft: spacing.xl + spacing.sm,
  },
  subjectTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  subjectTag: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full || 999,
  },
  subjectTagText: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.primary,
    fontWeight: '500',
  },
  noDataText: {
    fontSize: typography.sizes?.body || 16,
    color: colors.gray500,
    fontStyle: 'italic',
  },
  bioText: {
    fontSize: typography.sizes?.body || 16,
    color: colors.gray700,
    lineHeight: 24,
  },
  editButtonContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  editProfileButtonText: {
    fontSize: typography.sizes?.body || 16,
    fontWeight: '600',
    color: colors.white,
    marginLeft: spacing.sm,
  },
  bottomSpacing: {
    height: spacing.xl,
  },
});
