import { MaterialIcons } from '@expo/vector-icons';
import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { useUser } from '../../contexts/UserContext';
import type { MyPageStackParamList } from '../../navigation/MyPageStackNavigator';
import { colors, spacing, typography, borderRadius } from '../../styles/theme';

import ScreenContainer from '@/components/common/ScreenContainer';
import Section from '@/components/common/Section';

type ProfileEditScreenNavigationProp = StackNavigationProp<MyPageStackParamList, 'ProfileEdit'>;

interface ProfileEditScreenProps {
  navigation: ProfileEditScreenNavigationProp;
}

export default function ProfileEditScreen({ navigation }: ProfileEditScreenProps) {
  const { user, updateUserProfile, loading } = useUser();

  const [formData, setFormData] = useState({
    name: '',
    school: '',
    grade: '',
    email: '',
    phone: '',
    bio: '',
    interestedSubjects: [] as string[],
  });

  const [hasChanges, setHasChanges] = useState(false);

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
    'プログラミング',
    '音楽',
    '美術',
  ];

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        school: user.school,
        grade: user.grade,
        email: user.email,
        phone: user.phone,
        bio: user.bio,
        interestedSubjects: [...user.interestedSubjects],
      });
    }
  }, [user]);

  const handleInputChange = (field: keyof typeof formData, value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);
  };

  const toggleSubject = (subject: string) => {
    const updatedSubjects = formData.interestedSubjects.includes(subject)
      ? formData.interestedSubjects.filter((s) => s !== subject)
      : [...formData.interestedSubjects, subject];

    handleInputChange('interestedSubjects', updatedSubjects);
  };

  const handleSave = async () => {
    if (!user) return;

    // バリデーション
    if (!formData.name.trim()) {
      Alert.alert('エラー', '名前を入力してください。');
      return;
    }

    try {
      const success = await updateUserProfile({
        name: formData.name,
        school: formData.school,
        grade: formData.grade,
        email: formData.email,
        phone: formData.phone,
        bio: formData.bio,
        interestedSubjects: formData.interestedSubjects,
      });

      if (success) {
        Alert.alert('成功', 'プロフィールが更新されました。', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
        setHasChanges(false);
      } else {
        Alert.alert('エラー', 'プロフィールの更新に失敗しました。');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('エラー', 'プロフィールの更新中にエラーが発生しました。');
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert('変更を破棄', '変更内容が保存されていません。破棄してよろしいですか？', [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '破棄',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ]);
    } else {
      navigation.goBack();
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>読み込み中...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScreenContainer withScroll contentContainerStyle={{ paddingHorizontal: 0, paddingTop: 0 }}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleCancel}>
          <MaterialIcons name="close" size={24} color={colors.gray900} />
        </TouchableOpacity>
        <Text style={styles.title}>プロフィール編集</Text>
        <TouchableOpacity
          style={[styles.saveButton, (!hasChanges || loading) && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!hasChanges || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text
              style={[
                styles.saveButtonText,
                (!hasChanges || loading) && styles.saveButtonTextDisabled,
              ]}
            >
              保存
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 基本情報 */}
        <Section title="基本情報">
          <View style={styles.inputGroup}>
            <Text style={styles.label}>名前 *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => handleInputChange('name', text)}
              placeholder="名前を入力"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>学校</Text>
            <TextInput
              style={styles.input}
              value={formData.school}
              onChangeText={(text) => handleInputChange('school', text)}
              placeholder="学校名を入力"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>学年</Text>
            <TextInput
              style={styles.input}
              value={formData.grade}
              onChangeText={(text) => handleInputChange('grade', text)}
              placeholder="例：高校3年、大学2年"
            />
          </View>
        </Section>

        {/* 連絡先 */}
        <Section title="連絡先">
          <View style={styles.inputGroup}>
            <Text style={styles.label}>メールアドレス</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              placeholder="example@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>電話番号</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(text) => handleInputChange('phone', text)}
              placeholder="090-1234-5678"
              keyboardType="phone-pad"
            />
          </View>
        </Section>

        {/* 興味のある科目 */}
        <Section title="興味のある科目">
          <Text style={styles.sectionSubtitle}>学びたい科目を選択してください（複数選択可）</Text>

          <View style={styles.subjectGrid}>
            {availableSubjects.map((subject) => {
              const isSelected = formData.interestedSubjects.includes(subject);
              return (
                <TouchableOpacity
                  key={subject}
                  style={[styles.subjectChip, isSelected && styles.subjectChipSelected]}
                  onPress={() => toggleSubject(subject)}
                >
                  <Text
                    style={[styles.subjectChipText, isSelected && styles.subjectChipTextSelected]}
                  >
                    {subject}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Section>

        {/* 自己紹介 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>自己紹介</Text>
          <TextInput
            style={styles.bioInput}
            value={formData.bio}
            onChangeText={(text) => handleInputChange('bio', text)}
            placeholder="あなたについて自由に記述してください..."
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            maxLength={500}
          />
          <Text style={styles.characterCount}>{formData.bio.length}/500文字</Text>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
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
  saveButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    minWidth: 60,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: colors.gray300,
  },
  saveButtonText: {
    fontSize: typography.sizes?.body || 16,
    fontWeight: '600',
    color: colors.white,
  },
  saveButtonTextDisabled: {
    color: colors.gray500,
  },
  scrollView: {
    flex: 1,
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
  sectionSubtitle: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray600,
    marginBottom: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.lg,
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
  bioInput: {
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.sizes?.body || 16,
    color: colors.gray900,
    backgroundColor: colors.white,
    minHeight: 120,
  },
  characterCount: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray500,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  subjectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  subjectChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full || 999,
    borderWidth: 1,
    borderColor: colors.gray300,
    backgroundColor: colors.white,
  },
  subjectChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  subjectChipText: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray600,
    fontWeight: '500',
  },
  subjectChipTextSelected: {
    color: colors.white,
  },
  bottomSpacing: {
    height: spacing.xl * 2,
  },
});
