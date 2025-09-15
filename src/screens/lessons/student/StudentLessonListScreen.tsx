import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

import { StandardScreen } from '../../../components/templates';
import { colors, spacing, typography } from '../../../styles/theme';

export default function StudentLessonListScreen() {
  // TODO: 後でAPIクライアントから生徒のレッスン一覧を取得
  const mockLessons = [
    {
      id: '1',
      tutorName: '佐藤太郎',
      subject: '数学',
      scheduledAt: '2024-01-25 10:00',
      status: 'scheduled',
      coinCost: 120,
    },
    {
      id: '2',
      tutorName: '山田英子',
      subject: '英語',
      scheduledAt: '2024-01-22 18:30',
      status: 'completed',
      coinCost: 180,
    },
    {
      id: '3',
      tutorName: '鈴木健一',
      subject: '化学',
      scheduledAt: '2024-01-20 14:00',
      status: 'completed',
      coinCost: 200,
    },
  ];

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return '予定';
      case 'completed':
        return '完了';
      case 'pending':
        return '承認待ち';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return colors.primary;
      case 'completed':
        return colors.success;
      case 'pending':
        return colors.warning;
      default:
        return colors.gray500;
    }
  };

  const renderLesson = ({ item }: { item: (typeof mockLessons)[0] }) => (
    <View style={styles.lessonCard}>
      <View style={styles.lessonHeader}>
        <Text style={styles.tutorName}>{item.tutorName}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>
      <Text style={styles.subject}>{item.subject}</Text>
      <Text style={styles.schedule}>{item.scheduledAt}</Text>
      <Text style={styles.cost}>{item.coinCost}コイン</Text>
    </View>
  );

  return (
    <StandardScreen title="レッスン履歴" showBackButton={false}>
      <FlatList
        data={mockLessons}
        keyExtractor={(item) => item.id}
        renderItem={renderLesson}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      />
    </StandardScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  lessonCard: {
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
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  tutorName: {
    fontSize: typography.sizes?.h4 || 18,
    fontWeight: '600',
    color: colors.gray900,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  subject: {
    fontSize: typography.sizes?.body || 16,
    color: colors.primary,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  schedule: {
    fontSize: typography.sizes?.body || 14,
    color: colors.gray600,
    marginBottom: spacing.xs,
  },
  cost: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.warning,
    fontWeight: '600',
  },
});
