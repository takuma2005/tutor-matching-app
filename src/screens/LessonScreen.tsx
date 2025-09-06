import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing, typography, borderRadius } from '../styles/theme';

import { getApiClient } from '@/services/api/mock';
import type { Tutor } from '@/services/api/types';

type LessonStatus = 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';

type Lesson = {
  id: string;
  tutorId: string;
  studentId: string;
  subject: string;
  scheduledAt: Date;
  duration: number; // minutes
  status: LessonStatus;
  price: number;
  notes?: string;
};

// サービスから取得するため、ローカルモックは削除

export default function LessonScreen() {
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'completed'>('upcoming');
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  React.useEffect(() => {
    const api = getApiClient();
    let mounted = true;
    Promise.all([
      api.student.getLessons(undefined, 1, 100),
      api.student.searchTutors(undefined, 1, 200),
    ]).then(([lessonsResp, tutorsResp]) => {
      if (!mounted) return;
      const srvLessons = lessonsResp?.success ? lessonsResp.data : [];
      const mapped: Lesson[] = srvLessons.map((l) => ({
        id: l.id,
        tutorId: l.tutor_id,
        studentId: l.student_id,
        subject: l.subject,
        scheduledAt: new Date(l.scheduled_at),
        duration: l.duration_minutes,
        status:
          l.status === 'scheduled'
            ? 'confirmed'
            : l.status === 'in_progress'
              ? 'in-progress'
              : l.status === 'completed'
                ? 'completed'
                : 'cancelled',
        price: l.coin_cost,
        notes: l.lesson_notes,
      }));
      setLessons(mapped);
      if (tutorsResp?.success) setTutors(tutorsResp.data);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const now = Date.now();
  const upcomingLessons = lessons.filter(
    (lesson) =>
      (lesson.status === 'pending' || lesson.status === 'confirmed') &&
      lesson.scheduledAt.getTime() >= now,
  );

  const completedLessons = lessons.filter((lesson) => lesson.status === 'completed');

  const getStatusColor = (status: LessonStatus) => {
    switch (status) {
      case 'pending':
        return colors.warning;
      case 'confirmed':
        return colors.success;
      case 'completed':
        return colors.primary;
      case 'cancelled':
        return colors.error;
      default:
        return colors.gray500;
    }
  };

  const getStatusText = (status: LessonStatus) => {
    switch (status) {
      case 'pending':
        return '承認待ち';
      case 'confirmed':
        return '予約確定';
      case 'completed':
        return '完了';
      case 'cancelled':
        return 'キャンセル';
      default:
        return status;
    }
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      month: 'numeric',
      day: 'numeric',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderLessonItem = ({ item }: { item: Lesson }) => {
    const tutor = tutors.find((t) => t.id === item.tutorId);
    if (!tutor) return null;

    return (
      <TouchableOpacity style={styles.lessonCard}>
        <View style={styles.lessonHeader}>
          <View style={styles.tutorInfo}>
            <View style={styles.tutorAvatar}>
              <MaterialIcons name="person" size={20} color={colors.gray400} />
            </View>
            <View style={styles.tutorDetails}>
              <Text style={styles.tutorName}>{tutor.name}</Text>
              <Text style={styles.subject}>{item.subject}</Text>
            </View>
          </View>
          <View
            style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}
          >
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>

        <View style={styles.lessonDetails}>
          <View style={styles.detailRow}>
            <MaterialIcons name="schedule" size={16} color={colors.gray500} />
            <Text style={styles.detailText}>
              {formatDateTime(item.scheduledAt)} ({item.duration}分)
            </Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons name="monetization-on" size={16} color={colors.gray500} />
            <Text style={styles.detailText}>{item.price.toLocaleString()}コイン</Text>
          </View>
          {item.notes && (
            <View style={styles.detailRow}>
              <MaterialIcons name="note" size={16} color={colors.gray500} />
              <Text style={styles.detailText}>{item.notes}</Text>
            </View>
          )}
        </View>

        {item.status === 'confirmed' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.completeButton}>
              <Text style={styles.completeButtonText}>完了にする</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>授業</Text>
        <Text style={styles.subtitle}>予約の管理と履歴</Text>
      </View>

      {/* タブ */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'upcoming' && styles.activeTab]}
          onPress={() => setSelectedTab('upcoming')}
        >
          <Text style={[styles.tabText, selectedTab === 'upcoming' && styles.activeTabText]}>
            予定 ({upcomingLessons.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'completed' && styles.activeTab]}
          onPress={() => setSelectedTab('completed')}
        >
          <Text style={[styles.tabText, selectedTab === 'completed' && styles.activeTabText]}>
            履歴 ({completedLessons.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* 授業リスト */}
      <FlatList
        data={selectedTab === 'upcoming' ? upcomingLessons : completedLessons}
        renderItem={renderLessonItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons
              name={selectedTab === 'upcoming' ? 'event-note' : 'history'}
              size={64}
              color={colors.gray300}
            />
            <Text style={styles.emptyTitle}>
              {selectedTab === 'upcoming'
                ? '予定された授業がありません'
                : '完了した授業がありません'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {selectedTab === 'upcoming'
                ? 'チャットから先輩に授業を申請してみましょう'
                : '授業を完了すると履歴に表示されます'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  title: {
    fontSize: typography.fontSizes.xxl || 28,
    fontWeight: typography.fontWeights.bold,
    color: colors.gray900,
    marginBottom: spacing.xs / 2,
  },
  subtitle: {
    fontSize: typography.fontSizes.sm || 14,
    color: colors.gray600,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.gray50,
    margin: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: typography.fontSizes.sm || 14,
    color: colors.gray600,
    fontWeight: typography.fontWeights.medium,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: typography.fontWeights.semibold,
  },
  listContent: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  lessonCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray200,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  tutorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tutorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  tutorDetails: {
    flex: 1,
  },
  tutorName: {
    fontSize: typography.fontSizes.md || 16,
    fontWeight: typography.fontWeights.semibold,
    color: colors.gray900,
    marginBottom: 2,
  },
  subject: {
    fontSize: typography.fontSizes.sm || 14,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.full || 999,
  },
  statusText: {
    fontSize: typography.fontSizes.xs || 12,
    fontWeight: typography.fontWeights.semibold,
  },
  lessonDetails: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailText: {
    fontSize: typography.fontSizes.sm || 14,
    color: colors.gray700,
    flex: 1,
  },
  actionButtons: {
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    paddingTop: spacing.md,
    marginTop: spacing.sm,
  },
  completeButton: {
    backgroundColor: colors.success,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  completeButtonText: {
    fontSize: typography.fontSizes.sm || 14,
    color: colors.white,
    fontWeight: typography.fontWeights.semibold,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyTitle: {
    fontSize: typography.fontSizes.lg || 18,
    fontWeight: typography.fontWeights.semibold,
    color: colors.gray600,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: typography.fontSizes.md || 16,
    color: colors.gray500,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.lg,
  },
});
