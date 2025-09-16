import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { StandardScreen } from '../components/templates';
import { useAuth } from '../contexts/AuthContext';
import { colors, spacing, typography, borderRadius } from '../styles/theme';

import { COIN_CONSTANTS } from '@/constants/coinPlans';
import { getApiClient } from '@/services/api/mock';
import type { Student, Tutor } from '@/services/api/types';

export default function ProfileCompletionScreen() {
  const { user, role, completeProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const api = React.useMemo(() => getApiClient(), []);

  // フォーム状態
  const [formData, setFormData] = useState({
    // 共通フィールド
    age: '',
    grade: '',
    school: '',
    bio: '',

    // 先輩用フィールド
    hourlyRate: '',
    subjectsTaught: '',
    experienceYears: '',
    qualifications: '',

    // 後輩用フィールド
    subjectsInterested: '',
    learningGoals: '',
  });

  useEffect(() => {
    let isMounted = true;

    const joinList = (values?: string[]) => (values && values.length ? values.join('、 ') : '');

    const loadProfile = async () => {
      if (!user?.id || !role) {
        if (isMounted) {
          setIsLoadingProfile(false);
        }
        return;
      }

      setIsLoadingProfile(true);

      try {
        if (role === 'student') {
          const response = await api.student.getProfile(user.id);
          if (!isMounted) return;
          if (response.success && response.data) {
            const studentProfile = response.data as Student;
            const subjects = studentProfile.subjects_interested?.length
              ? studentProfile.subjects_interested
              : (studentProfile.interested_subjects ?? []);

            setFormData((prev) => ({
              ...prev,
              age: studentProfile.age ? String(studentProfile.age) : prev.age,
              grade: studentProfile.grade ?? prev.grade,
              school: studentProfile.school ?? prev.school,
              bio: studentProfile.bio ?? prev.bio,
              subjectsInterested: subjects.length ? joinList(subjects) : prev.subjectsInterested,
              learningGoals: studentProfile.learning_goals ?? prev.learningGoals,
            }));
          } else if (response.error) {
            Alert.alert('エラー', response.error);
          }
        } else {
          const response = await api.tutor.getProfile(user.id);
          if (!isMounted) return;
          if (response.success && response.data) {
            const tutorProfile = response.data as Tutor;
            setFormData((prev) => ({
              ...prev,
              grade: tutorProfile.grade ?? prev.grade,
              school: tutorProfile.school ?? prev.school,
              bio: tutorProfile.bio ?? prev.bio,
              hourlyRate: tutorProfile.hourly_rate
                ? String(tutorProfile.hourly_rate)
                : prev.hourlyRate,
              subjectsTaught: tutorProfile.subjects_taught?.length
                ? joinList(tutorProfile.subjects_taught)
                : prev.subjectsTaught,
              experienceYears:
                typeof tutorProfile.experience_years === 'number'
                  ? String(tutorProfile.experience_years)
                  : prev.experienceYears,
              qualifications: tutorProfile.qualifications?.length
                ? joinList(tutorProfile.qualifications)
                : prev.qualifications,
            }));
          } else if (response.error) {
            Alert.alert('エラー', response.error);
          }
        }
      } catch (error) {
        console.error('プロフィール読み込みエラー:', error);
        Alert.alert('エラー', 'プロフィール情報の取得に失敗しました。');
      } finally {
        if (isMounted) {
          setIsLoadingProfile(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [api, role, user?.id]);

  const handleSubmit = async () => {
    if (!user?.id || !role) {
      Alert.alert('エラー', 'ユーザー情報が取得できません。再度ログインしてください。');
      return;
    }

    if (!formData.age || !formData.grade) {
      Alert.alert('入力エラー', '年齢と学年は必須項目です。');
      return;
    }

    const ageValue = Number(formData.age);
    if (Number.isNaN(ageValue) || ageValue <= 0) {
      Alert.alert('入力エラー', '年齢は正の数字で入力してください。');
      return;
    }

    const trimmedGrade = formData.grade.trim();
    const trimmedSchool = formData.school.trim();
    const trimmedBio = formData.bio.trim();
    const trimmedLearningGoals = formData.learningGoals.trim();

    const parseList = (value: string) =>
      value
        .split(/[,、，\s]+/)
        .map((item) => item.trim())
        .filter((item) => item.length > 0);

    let studentSubjects: string[] = [];
    let tutorSubjects: string[] = [];
    let hourlyRateValue = 0;
    let experienceValue: number | undefined;
    let qualificationList: string[] = [];

    if (role === 'student') {
      studentSubjects = parseList(formData.subjectsInterested);
      if (studentSubjects.length === 0) {
        Alert.alert('入力エラー', '興味のある科目を入力してください。');
        return;
      }
    } else {
      if (!formData.hourlyRate || !formData.subjectsTaught) {
        Alert.alert('入力エラー', '先輩として登録する場合、時給と教える科目は必須です。');
        return;
      }

      const hourlyRateNum = Number(formData.hourlyRate);
      if (Number.isNaN(hourlyRateNum)) {
        Alert.alert('入力エラー', '時給は数字で入力してください。');
        return;
      }

      if (hourlyRateNum < COIN_CONSTANTS.MIN_HOURLY_RATE) {
        Alert.alert(
          '入力エラー',
          `時給は最低 ${COIN_CONSTANTS.MIN_HOURLY_RATE} コイン以上で設定してください。`,
        );
        return;
      }
      hourlyRateValue = hourlyRateNum;

      tutorSubjects = parseList(formData.subjectsTaught);
      if (tutorSubjects.length === 0) {
        Alert.alert('入力エラー', '教える科目を入力してください。');
        return;
      }

      if (formData.experienceYears) {
        const parsedExperience = Number(formData.experienceYears);
        if (Number.isNaN(parsedExperience) || parsedExperience < 0) {
          Alert.alert('入力エラー', '指導経験年数は0以上の数字で入力してください。');
          return;
        }
        experienceValue = parsedExperience;
      }

      qualificationList = formData.qualifications ? parseList(formData.qualifications) : [];
    }

    setIsSubmitting(true);

    try {
      if (role === 'student') {
        const payload: Partial<Student> = {
          age: ageValue,
          grade: trimmedGrade,
          school: trimmedSchool || undefined,
          bio: trimmedBio || undefined,
          subjects_interested: studentSubjects,
          interested_subjects: studentSubjects,
          learning_goals: trimmedLearningGoals || undefined,
        };

        const response = await api.student.updateProfile(user.id, payload);
        if (!response.success) {
          Alert.alert('エラー', response.error || 'プロフィールの保存に失敗しました。');
          return;
        }
      } else {
        const payload: Partial<Tutor> = {
          grade: trimmedGrade || undefined,
          school: trimmedSchool || undefined,
          bio: trimmedBio || undefined,
          hourly_rate: hourlyRateValue,
          subjects_taught: tutorSubjects,
          qualifications: qualificationList,
        };

        if (typeof experienceValue === 'number') {
          payload.experience_years = experienceValue;
        }

        const response = await api.tutor.updateProfile(user.id, payload);
        if (!response.success) {
          Alert.alert('エラー', response.error || 'プロフィールの保存に失敗しました。');
          return;
        }
      }

      completeProfile();
      Alert.alert(
        'プロフィール完了',
        `${role === 'tutor' ? '先輩' : '後輩'}プロフィールの設定が完了しました！`,
        [{ text: 'OK' }],
      );
    } catch (error) {
      console.error('プロフィール更新エラー:', error);
      Alert.alert('エラー', 'プロフィールの保存に失敗しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCommonFields = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>基本情報</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>年齢 *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.age}
          onChangeText={(text) => setFormData((prev) => ({ ...prev, age: text }))}
          keyboardType="numeric"
          placeholder="例: 18"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>学年 *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.grade}
          onChangeText={(text) => setFormData((prev) => ({ ...prev, grade: text }))}
          placeholder="例: 高校3年生"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>学校</Text>
        <TextInput
          style={styles.textInput}
          value={formData.school}
          onChangeText={(text) => setFormData((prev) => ({ ...prev, school: text }))}
          placeholder="例: 〇〇高等学校"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>自己紹介</Text>
        <TextInput
          style={[styles.textInput, styles.multilineInput]}
          value={formData.bio}
          onChangeText={(text) => setFormData((prev) => ({ ...prev, bio: text }))}
          placeholder="自己紹介を書いてください..."
          multiline
          numberOfLines={4}
        />
      </View>
    </View>
  );

  const renderTutorFields = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>先輩情報</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>時給（コイン/時） *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.hourlyRate}
          onChangeText={(text) => setFormData((prev) => ({ ...prev, hourlyRate: text }))}
          keyboardType="numeric"
          placeholder="例: 1500（最低1200コイン）"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>教える科目 *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.subjectsTaught}
          onChangeText={(text) => setFormData((prev) => ({ ...prev, subjectsTaught: text }))}
          placeholder="例: 数学、物理、化学"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>指導経験年数</Text>
        <TextInput
          style={styles.textInput}
          value={formData.experienceYears}
          onChangeText={(text) => setFormData((prev) => ({ ...prev, experienceYears: text }))}
          keyboardType="numeric"
          placeholder="例: 2"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>資格・実績</Text>
        <TextInput
          style={[styles.textInput, styles.multilineInput]}
          value={formData.qualifications}
          onChangeText={(text) => setFormData((prev) => ({ ...prev, qualifications: text }))}
          placeholder="例: 英検2級、数学検定準1級"
          multiline
          numberOfLines={3}
        />
      </View>
    </View>
  );

  const renderStudentFields = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>後輩情報</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>興味のある科目 *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.subjectsInterested}
          onChangeText={(text) => setFormData((prev) => ({ ...prev, subjectsInterested: text }))}
          placeholder="例: 数学、英語、物理"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>学習目標</Text>
        <TextInput
          style={[styles.textInput, styles.multilineInput]}
          value={formData.learningGoals}
          onChangeText={(text) => setFormData((prev) => ({ ...prev, learningGoals: text }))}
          placeholder="例: 大学受験対策、定期テストの点数向上"
          multiline
          numberOfLines={3}
        />
      </View>
    </View>
  );

  if (isLoadingProfile) {
    return (
      <StandardScreen title="プロフィール設定" showBackButton={false}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>プロフィールを読み込み中です...</Text>
        </View>
      </StandardScreen>
    );
  }

  return (
    <StandardScreen title="プロフィール設定" showBackButton={false}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <MaterialIcons
              name={role === 'tutor' ? 'school' : 'person'}
              size={48}
              color={colors.primary}
            />
            <Text style={styles.headerTitle}>
              {role === 'tutor' ? '先輩プロフィール' : '後輩プロフィール'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {role === 'tutor'
                ? '教える先輩として必要な情報を入力してください'
                : '学ぶ後輩として必要な情報を入力してください'}
            </Text>
          </View>

          {renderCommonFields()}
          {role === 'tutor' ? renderTutorFields() : renderStudentFields()}
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (isSubmitting || isLoadingProfile) && styles.disabledButton,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting || isLoadingProfile}
          >
            <Text style={styles.submitButtonText}>{isSubmitting ? '保存中...' : '設定完了'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </StandardScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  headerTitle: {
    fontSize: typography.sizes?.h3 || 20,
    fontWeight: '700',
    color: colors.gray900,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: typography.sizes?.body || 14,
    color: colors.gray600,
    marginTop: spacing.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes?.h4 || 18,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.sizes?.body || 14,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: spacing.xs,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.sizes?.body || 14,
    backgroundColor: colors.white,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: typography.sizes?.body || 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.sizes?.body || 16,
    color: colors.gray600,
    textAlign: 'center',
  },
});
