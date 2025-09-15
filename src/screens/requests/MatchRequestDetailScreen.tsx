import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';

import { StandardScreen } from '../../components/templates';
import { colors, spacing, typography } from '../../styles/theme';

export default function MatchRequestDetailScreen() {
  // TODO: 後でroute.paramsから申請IDを受け取り、APIから詳細を取得
  const mockRequest = {
    id: '1',
    studentName: '田中花子',
    subject: '数学',
    message:
      '数学の微積分を基礎から教えてほしいです。特に応用問題が苦手で、解法のコツを教えていただけると嬉しいです。',
    scheduleNote:
      '週に2回、土日の午前と水曜日の午後を希望します。最初の1月は基礎から始めたいです。',
    status: 'pending',
    createdAt: '2024-01-20',
  };

  const handleApprove = () => {
    Alert.alert('申請を承認', `${mockRequest.studentName}さんの申請を承認しますか？`, [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '承認する',
        onPress: () => {
          // TODO: APIクライアントで承認処理
          Alert.alert('承認完了', '申請を承認しました');
        },
      },
    ]);
  };

  const handleReject = () => {
    Alert.alert('申請を拒否', `${mockRequest.studentName}さんの申請を拒否しますか？`, [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '拒否する',
        style: 'destructive',
        onPress: () => {
          // TODO: APIクライアントで拒否処理
          Alert.alert('拒否完了', '申請を拒否しました');
        },
      },
    ]);
  };

  return (
    <StandardScreen title="申請詳細" showBackButton>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.studentName}>{mockRequest.studentName}</Text>
          <Text style={styles.subject}>科目: {mockRequest.subject}</Text>
          <Text style={styles.date}>申請日: {mockRequest.createdAt}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>メッセージ</Text>
          <Text style={styles.messageText}>{mockRequest.message}</Text>
        </View>

        {mockRequest.scheduleNote && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>希望スケジュール</Text>
            <Text style={styles.scheduleText}>{mockRequest.scheduleNote}</Text>
          </View>
        )}

        {mockRequest.status === 'pending' && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.approveButton} onPress={handleApprove}>
              <Text style={styles.approveButtonText}>承認する</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.rejectButton} onPress={handleReject}>
              <Text style={styles.rejectButtonText}>拒否する</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </StandardScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  studentName: {
    fontSize: typography.sizes?.h3 || 20,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: spacing.xs,
  },
  subject: {
    fontSize: typography.sizes?.body || 16,
    color: colors.primary,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  date: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray500,
  },
  sectionTitle: {
    fontSize: typography.sizes?.h4 || 18,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: spacing.md,
  },
  messageText: {
    fontSize: typography.sizes?.body || 14,
    color: colors.gray700,
    lineHeight: 22,
  },
  scheduleText: {
    fontSize: typography.sizes?.body || 14,
    color: colors.gray700,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  approveButton: {
    flex: 1,
    backgroundColor: colors.success,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveButtonText: {
    color: colors.white,
    fontSize: typography.sizes?.body || 16,
    fontWeight: '600',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: colors.error,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: colors.white,
    fontSize: typography.sizes?.body || 16,
    fontWeight: '600',
  },
});
