import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
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
} from 'react-native';

import { StandardScreen } from '../components/templates';
import { useAuth } from '../contexts/AuthContext';
import { colors, spacing, typography, borderRadius } from '../styles/theme';

export default function ProfileCompletionScreen() {
  const { role, completeProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async () => {
    // 基本的なバリデーション
    if (!formData.age || !formData.grade) {
      Alert.alert('入力エラー', '年齢と学年は必須項目です。');
      return;
    }

    if (role === 'tutor' && (!formData.hourlyRate || !formData.subjectsTaught)) {
      Alert.alert('入力エラー', '先輩として登録する場合、時給と教える科目は必須です。');
      return;
    }

    if (role === 'student' && !formData.subjectsInterested) {
      Alert.alert('入力エラー', '興味のある科目を入力してください。');
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: APIでプロフィール更新
      // 実際の実装では、ここでAPIクライアントを使用してプロフィールを更新
      await new Promise((resolve) => setTimeout(resolve, 1000)); // モック遅延

      completeProfile();
      Alert.alert(
        'プロフィール完了',
        `${role === 'tutor' ? '先輩' : '後輩'}プロフィールの設定が完了しました！`,
        [{ text: 'OK' }],
      );
    } catch (error) {
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
            style={[styles.submitButton, isSubmitting && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={isSubmitting}
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
});
