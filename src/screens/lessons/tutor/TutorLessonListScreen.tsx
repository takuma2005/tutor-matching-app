import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

import { StandardScreen } from '../../../components/templates';
import { colors, spacing, typography } from '../../../styles/theme';

export default function TutorLessonListScreen() {
  // TODO: 後でAPIクライアントから先輩のレッスン一覧を取得
  const mockLessons = [
    {
      id: '1',
      studentName: '田中花子',
      subject: '数学',
      scheduledAt: '2024-01-25 10:00',
      status: 'scheduled',
      coinCost: 120,
      duration: 60,
    },
    {
      id: '2',
      studentName: '山田太郎',
      subject: '英語',
      scheduledAt: '2024-01-22 18:30',
      status: 'completed',
      coinCost: 180,
      duration: 90,
    },
    {
      id: '3',
      studentName: '鈴木みなみ',
      subject: '化学',
      scheduledAt: '2024-01-28 14:00',
      status: 'pending',
      coinCost: 200,
      duration: 60,
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

  const handleLessonAction = (_lessonId: string, _action: 'approve' | 'complete') => {
    // TODO: APIクライアントでアクション実行
    // console.log(`Lesson ${lessonId}: ${action}`);
  };

  const renderLesson = ({ item }: { item: (typeof mockLessons)[0] }) => (
    <View style={styles.lessonCard}>
      <View style={styles.lessonHeader}>
        <Text style={styles.studentName}>{item.studentName}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>
      <Text style={styles.subject}>{item.subject}</Text>
      <Text style={styles.schedule}>{item.scheduledAt}</Text>
      <View style={styles.lessonInfo}>
        <Text style={styles.duration}>{item.duration}分</Text>
        <Text style={styles.cost}>{item.coinCost}コイン</Text>
      </View>

      {item.status === 'pending' && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleLessonAction(item.id, 'approve')}
        >
          <Text style={styles.actionButtonText}>承認する</Text>
        </TouchableOpacity>
      )}

      {item.status === 'scheduled' && (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.success }]}
          onPress={() => handleLessonAction(item.id, 'complete')}
        >
          <Text style={styles.actionButtonText}>完了にする</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <StandardScreen title="レッスン管理" showBackButton={false}>
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
  studentName: {
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
    marginBottom: spacing.sm,
  },
  lessonInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  duration: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray500,
    fontWeight: '600',
  },
  cost: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.warning,
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: typography.sizes?.body || 14,
    fontWeight: '600',
  },
});
