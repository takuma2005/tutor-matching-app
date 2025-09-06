import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { colors, spacing, typography, borderRadius, shadows } from '../../styles/theme';

type Props = {
  role: 'student' | 'tutor';
  onVerificationComplete: (phoneNumber: string, code: string) => void;
};

export default function PhoneVerificationScreen({ role, onVerificationComplete }: Props) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [loading, setLoading] = useState(false);

  const handleSendCode = () => {
    const phonePattern = /^\d{3}-\d{4}-\d{4}$/;
    if (!phonePattern.test(phoneNumber)) {
      Alert.alert('エラー', '正しい電話番号を入力してください（例：090-1234-5678）');
      return;
    }

    setLoading(true);
    // モック：実際のSMS送信はせず、すぐに認証コード入力画面へ
    setTimeout(() => {
      setLoading(false);
      setStep('code');
      Alert.alert('SMS送信完了', 'モックモード：認証コードに「123456」を入力してください', [
        { text: 'OK' },
      ]);
    }, 1000);
  };

  const handleVerifyCode = () => {
    if (verificationCode !== '123456') {
      Alert.alert('エラー', '認証コードが正しくありません');
      return;
    }

    onVerificationComplete(phoneNumber, verificationCode);
  };

  const formatPhoneNumber = (text: string) => {
    // 数字のみ抽出
    const digits = text.replace(/\D/g, '');

    // 自動フォーマット（090-1234-5678）
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 7) {
      return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    } else {
      return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
    }
  };

  const roleText = role === 'student' ? '後輩' : '先輩';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <MaterialIcons name="phone" size={48} color={colors.primary} />
        <Text style={styles.title}>電話番号認証</Text>
        <Text style={styles.subtitle}>{roleText}として登録するため、電話番号の認証が必要です</Text>
      </View>

      <View style={styles.content}>
        {step === 'phone' ? (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>電話番号</Text>
            <TextInput
              style={styles.input}
              placeholder="090-1234-5678"
              value={phoneNumber}
              onChangeText={(text) => setPhoneNumber(formatPhoneNumber(text))}
              keyboardType="phone-pad"
              maxLength={13}
            />
            <Text style={styles.hint}>SMSで認証コードをお送りします</Text>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSendCode}
              disabled={loading || phoneNumber.length !== 13}
            >
              <Text style={styles.buttonText}>{loading ? '送信中...' : '認証コードを送信'}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>認証コード</Text>
            <TextInput
              style={[styles.input, styles.codeInput]}
              placeholder="123456"
              value={verificationCode}
              onChangeText={setVerificationCode}
              keyboardType="numeric"
              maxLength={6}
              textAlign="center"
            />
            <Text style={styles.hint}>{phoneNumber}に送信された6桁のコードを入力してください</Text>

            <TouchableOpacity
              style={[styles.button, verificationCode.length !== 6 && styles.buttonDisabled]}
              onPress={handleVerifyCode}
              disabled={verificationCode.length !== 6}
            >
              <Text style={styles.buttonText}>認証する</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.backButton} onPress={() => setStep('phone')}>
              <Text style={styles.backButtonText}>電話番号を変更</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.xxl * 2,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSizes.xxxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.gray900,
    marginTop: spacing.md,
  },
  subtitle: {
    fontSize: typography.fontSizes.md,
    color: colors.gray600,
    marginTop: spacing.sm,
    textAlign: 'center',
    lineHeight: typography.lineHeights.relaxed * typography.fontSizes.md,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  inputContainer: {
    marginTop: spacing.xl,
  },
  label: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.gray700,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSizes.lg,
    borderWidth: 1,
    borderColor: colors.gray300,
    ...shadows.sm,
  },
  codeInput: {
    fontSize: typography.fontSizes.xxl,
    letterSpacing: 8,
  },
  hint: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray500,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  buttonDisabled: {
    backgroundColor: colors.gray300,
  },
  buttonText: {
    color: colors.white,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
  },
  backButton: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: typography.fontSizes.sm,
  },
});
