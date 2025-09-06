import { MaterialIcons } from '@expo/vector-icons';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import BottomSheet from '../components/common/BottomSheet';
import type { HomeStackParamList } from '../navigation/HomeStackNavigator';
import type { TabParamList } from '../navigation/TabNavigator';
import { colors, spacing, typography, borderRadius } from '../styles/theme';

import { getApiClient } from '@/services/api/mock';
import type { Student } from '@/services/api/types';

type StudentProfile = {
  name: string;
  school: string;
  grade: string;
  email: string;
  phone: string;
  interestedSubjects: string[];
  bio: string;
};

type MyPageNav = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'MyPage'>,
  StackNavigationProp<HomeStackParamList>
>;

export default function MyPageScreen({ navigation }: { navigation: MyPageNav }) {
  const insets = useSafeAreaInsets();
  const [isSheetOpen, setSheetOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<'info' | 'edit'>('info');
  const [profile, setProfile] = useState<StudentProfile>({
    name: '',
    school: '未設定',
    grade: '未設定',
    email: '',
    phone: '',
    interestedSubjects: [],
    bio: '',
  });

  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);

  React.useEffect(() => {
    const api = getApiClient();
    let mounted = true;
    api.student.getProfile('student-1').then((resp) => {
      if (!mounted) return;
      if (resp?.success && resp.data) {
        setCurrentStudent(resp.data);
        setProfile({
          name: resp.data.name,
          school: resp.data.school || '未設定',
          grade: resp.data.grade || '未設定',
          email: resp.data.email || '',
          phone: resp.data.phone || '',
          interestedSubjects: resp.data.interested_subjects || [],
          bio: resp.data.bio || '',
        });
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const availableSubjects = [
    '数学',
    '英語',
    '物理',
    '化学',
    '生物',
    '国語',
    '現代文',
    '古文',
    '日本史',
    '世界史',
  ];

  const handleSave = async () => {
    const api = getApiClient();
    // プロフィール保存処理
    if (!currentStudent) return;
    await api.student.updateProfile(currentStudent.id, {
      name: profile.name,
      grade: profile.grade,
      email: profile.email,
      phone: profile.phone,
      subjects_interested: profile.interestedSubjects,
      bio: profile.bio,
      school: profile.school,
    });
    Alert.alert('保存完了', 'プロフィールが更新されました。');
    setActiveTab('info');
    setSheetOpen(false);
  };

  const toggleSheet = () => {
    setSheetOpen((prev) => !prev);
  };

  const handleCancel = () => {
    // 変更を取り消し
    if (currentStudent) {
      setProfile({
        name: currentStudent.name,
        school: currentStudent.school || '未設定',
        grade: currentStudent.grade || '未設定',
        email: currentStudent.email || '',
        phone: currentStudent.phone || '',
        interestedSubjects: currentStudent.interested_subjects || [],
        bio: currentStudent.bio || '',
      });
    }
    setActiveTab('info');
  };

  const toggleSubject = (subject: string) => {
    if (profile.interestedSubjects.includes(subject)) {
      setProfile({
        ...profile,
        interestedSubjects: profile.interestedSubjects.filter((s) => s !== subject),
      });
    } else {
      setProfile({
        ...profile,
        interestedSubjects: [...profile.interestedSubjects, subject],
      });
    }
  };

  const renderSubjectTags = () => (
    <View style={styles.subjectTags}>
      {availableSubjects.map((subject) => {
        const isSelected = profile.interestedSubjects.includes(subject);
        return (
          <TouchableOpacity
            key={subject}
            style={[styles.subjectTag, isSelected && styles.subjectTagSelected]}
            onPress={() => activeTab === 'edit' && toggleSubject(subject)}
            disabled={activeTab !== 'edit'}
          >
            <Text style={[styles.subjectTagText, isSelected && styles.subjectTagTextSelected]}>
              {subject}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

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
            <View style={styles.avatar} testID="profile-avatar">
              <MaterialIcons name="person" size={30} color={colors.gray400} />
            </View>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.profileSchool}>
              {profile.school} {profile.grade}
            </Text>
            <View style={styles.coinBalance}>
              <MaterialIcons name="monetization-on" size={16} color={colors.warning} />
              <Text style={styles.coinText}>
                {(currentStudent?.coins ?? 0).toLocaleString()}コイン
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* タブ */}
      <View style={styles.tabContainer} testID="tab-container">
        <TouchableOpacity
          style={[styles.tab, activeTab === 'info' && styles.activeTab]}
          onPress={() => setActiveTab('info')}
        >
          <Text style={[styles.tabText, activeTab === 'info' && styles.activeTabText]}>情報</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'edit' && styles.activeTab]}
          onPress={() => {
            setActiveTab('info');
            toggleSheet();
          }}
        >
          <Text style={[styles.tabText, activeTab === 'edit' && styles.activeTabText]}>編集</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 64 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'info' ? (
          <>
            {/* 基本情報表示 */}
            <View style={styles.section} testID="content-section">
              <Text style={styles.sectionTitle}>基本情報</Text>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>名前</Text>
                <Text style={styles.infoValue}>{profile.name}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>学校</Text>
                <Text style={styles.infoValue}>{profile.school}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>学年</Text>
                <Text style={styles.infoValue}>{profile.grade}</Text>
              </View>
            </View>

            <View style={styles.section} testID="content-section">
              <Text style={styles.sectionTitle}>連絡先</Text>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>メール</Text>
                <Text style={styles.infoValue}>{profile.email || '未設定'}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>電話</Text>
                <Text style={styles.infoValue}>{profile.phone || '未設定'}</Text>
              </View>
            </View>

            <View style={styles.section} testID="content-section">
              <Text style={styles.sectionTitle}>興味のある科目</Text>
              <View style={styles.subjectTags}>
                {profile.interestedSubjects.map((subject, index) => (
                  <View key={index} style={styles.subjectTagDisplay}>
                    <Text style={styles.subjectTagDisplayText}>{subject}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section} testID="content-section">
              <Text style={styles.sectionTitle}>自己紹介</Text>
              <Text style={styles.bioText}>{profile.bio || '自己紹介が未設定です。'}</Text>
            </View>

            {/* 設定メニュー */}
            <View style={styles.section} testID="content-section">
              <Text style={styles.sectionTitle}>設定</Text>

              <TouchableOpacity
                style={styles.menuItem}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onPress={() => (navigation as any).navigate('Home', { screen: 'CoinManagement' })}
              >
                <View style={styles.menuIconContainer}>
                  <MaterialIcons name="monetization-on" size={20} color={colors.warning} />
                </View>
                <Text style={styles.menuText}>コイン管理</Text>
                <MaterialIcons name="chevron-right" size={20} color={colors.gray400} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuIconContainer}>
                  <MaterialIcons name="notifications" size={20} color={colors.gray600} />
                </View>
                <Text style={styles.menuText}>通知設定</Text>
                <MaterialIcons name="chevron-right" size={20} color={colors.gray400} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuIconContainer}>
                  <MaterialIcons name="help" size={20} color={colors.gray600} />
                </View>
                <Text style={styles.menuText}>ヘルプ・サポート</Text>
                <MaterialIcons name="chevron-right" size={20} color={colors.gray400} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuIconContainer}>
                  <MaterialIcons name="logout" size={20} color={colors.error} />
                </View>
                <Text style={[styles.menuText, { color: colors.error }]}>ログアウト</Text>
                <MaterialIcons name="chevron-right" size={20} color={colors.gray400} />
              </TouchableOpacity>
            </View>
          </>
        ) : null}

        {/* 底部余白 */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      <BottomSheet isOpen={isSheetOpen} onClose={toggleSheet} height={560}>
        <ScrollView style={{ flex: 1, backgroundColor: colors.white }} showsVerticalScrollIndicator>
          {/* 編集モード（シート内） */}
          <View style={styles.sectionSheet}>
            <Text style={styles.sectionTitle}>基本情報</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>名前</Text>
              <TextInput
                style={styles.input}
                value={profile.name}
                onChangeText={(text) => setProfile({ ...profile, name: text })}
                placeholder="名前を入力"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>学校</Text>
              <TextInput
                style={styles.input}
                value={profile.school}
                onChangeText={(text) => setProfile({ ...profile, school: text })}
                placeholder="学校名を入力"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>学年</Text>
              <TextInput
                style={styles.input}
                value={profile.grade}
                onChangeText={(text) => setProfile({ ...profile, grade: text })}
                placeholder="学年を入力"
              />
            </View>
          </View>

          <View style={styles.sectionSheet}>
            <Text style={styles.sectionTitle}>連絡先</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>メールアドレス</Text>
              <TextInput
                style={styles.input}
                value={profile.email}
                onChangeText={(text) => setProfile({ ...profile, email: text })}
                placeholder="メールアドレスを入力"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>電話番号</Text>
              <TextInput
                style={styles.input}
                value={profile.phone}
                onChangeText={(text) => setProfile({ ...profile, phone: text })}
                placeholder="電話番号を入力"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.sectionSheet}>
            <Text style={styles.sectionTitle}>興味のある科目</Text>
            <Text style={styles.sectionSubtitle}>学びたい科目を選んでください</Text>
            {renderSubjectTags()}
          </View>

          <View style={styles.sectionSheet}>
            <Text style={styles.sectionTitle}>自己紹介</Text>
            <TextInput
              style={styles.bioInput}
              value={profile.bio}
              onChangeText={(text) => setProfile({ ...profile, bio: text })}
              placeholder="自己紹介を入力してください"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                handleCancel();
                setSheetOpen(false);
              }}
            >
              <Text style={styles.cancelButtonText}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>保存</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: spacing.xl }} />
        </ScrollView>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  header: {
    backgroundColor: colors.gray50,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: {
    fontSize: typography.sizes?.h2 || 24,
    fontWeight: '700',
    color: colors.gray900,
    textAlign: 'center',
  },
  profileCard: {
    backgroundColor: colors.gray50,
    marginHorizontal: 0,
    marginTop: 0,
    borderRadius: 0,
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.gray50,
    marginHorizontal: 0,
    marginTop: 0,
    borderRadius: 0,
    padding: spacing.xs / 2,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: typography.sizes?.body || 16,
    color: colors.gray600,
  },
  activeTabText: {
    color: colors.white,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: colors.gray50,
    marginHorizontal: 0,
    marginTop: spacing.sm,
    padding: spacing.lg,
    borderRadius: 0,
  },
  sectionSheet: {
    backgroundColor: colors.white,
    marginHorizontal: 0,
    marginTop: spacing.sm,
    padding: spacing.lg,
    borderRadius: 0,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  infoLabel: {
    fontSize: typography.sizes?.body || 16,
    color: colors.gray600,
  },
  infoValue: {
    fontSize: typography.sizes?.body || 16,
    color: colors.gray900,
    fontWeight: '500',
  },
  subjectTagDisplay: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.full || 999,
    marginRight: spacing.sm,
    marginBottom: spacing.xs,
  },
  subjectTagDisplayText: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.primary,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: typography.sizes?.h4 || 18,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: spacing.sm,
  },
  sectionSubtitle: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray600,
    marginBottom: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.sizes?.body || 16,
    fontWeight: '500',
    color: colors.gray700,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.sizes?.body || 16,
    color: colors.gray900,
    backgroundColor: colors.white,
  },
  value: {
    fontSize: typography.sizes?.body || 16,
    color: colors.gray900,
    paddingVertical: spacing.sm,
  },
  subjectTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  subjectTag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full || 999,
    borderWidth: 1,
    borderColor: colors.gray300,
    backgroundColor: colors.white,
  },
  subjectTagSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  subjectTagText: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray600,
  },
  subjectTagTextSelected: {
    color: colors.white,
  },
  bioInput: {
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.sizes?.body || 16,
    color: colors.gray900,
    backgroundColor: colors.white,
    minHeight: 100,
  },
  bioText: {
    fontSize: typography.sizes?.body || 16,
    color: colors.gray700,
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray300,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: typography.sizes?.body || 16,
    color: colors.gray600,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: typography.sizes?.body || 16,
    color: colors.white,
    fontWeight: '600',
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
  bottomSpacing: {
    height: spacing.xl,
  },
});
