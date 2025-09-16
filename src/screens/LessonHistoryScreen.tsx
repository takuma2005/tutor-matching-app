import { MaterialIcons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';

import { ChatStackParamList } from '../navigation/ChatStackNavigator';

import StandardScreen from '@/components/templates/StandardScreen';
import { useAuth } from '@/contexts/AuthContext';
import { getApiClient } from '@/services/api/mock';
import type { Lesson, Tutor } from '@/services/api/types';
import { colors, spacing, typography, borderRadius } from '@/styles/theme';

type LessonHistoryScreenNavigationProp = StackNavigationProp<ChatStackParamList, 'LessonHistory'>;
type LessonHistoryScreenRouteProp = RouteProp<ChatStackParamList, 'LessonHistory'>;

interface Props {
  navigation: LessonHistoryScreenNavigationProp;
  route: LessonHistoryScreenRouteProp;
}

const LessonHistoryScreen: React.FC<Props> = ({ route }) => {
  const { tutorId } = route.params;
  const [lessons, setLessons] = React.useState<Lesson[]>([]);
  const [tutor, setTutor] = React.useState<Tutor | null>(null);
  const [selectedTab, setSelectedTab] = React.useState<'upcoming' | 'completed'>('upcoming');
  const { student, user } = useAuth();
  const api = React.useMemo(() => getApiClient(), []);

  React.useEffect(() => {
    const studentId = student?.id ?? user?.id;
    if (!studentId) {
      setLessons([]);
      return;
    }

    const fetchData = async () => {
      try {
        const [lessonsResp, tutorsResp] = await Promise.all([
          api.student.getLessons(studentId),
          api.student.searchTutors(undefined, 1, 200),
        ]);

        if (tutorsResp.success) {
          const tutorData = tutorsResp.data.find((t) => t.id === tutorId);
          setTutor(tutorData || null);
        }

        if (lessonsResp.success) {
          const tutorLessons = lessonsResp.data.filter((lesson) => lesson.tutor_id === tutorId);
          // APIデータをLessonタイプに変換
          const mappedLessons: Lesson[] = tutorLessons.map((l) => ({
            id: l.id,
            tutor_id: l.tutor_id,
            student_id: l.student_id,
            subject: l.subject,
            scheduled_at: l.scheduled_at,
            duration_minutes: l.duration_minutes,
            status: l.status,
            coin_cost: l.coin_cost,
            lesson_notes: l.lesson_notes,
            created_at: l.created_at,
            updated_at: l.updated_at,
          }));
          setLessons(mappedLessons);
        }
      } catch (error) {
        console.error('Error fetching lesson history:', error);
      }
    };

    fetchData();
  }, [api, student?.id, tutorId, user?.id]);

  const now = Date.now();

  const upcomingLessons = React.useMemo(() => {
    return lessons.filter((lesson) => {
      const t = new Date(lesson.scheduled_at).getTime();
      const isFuture = t >= now;
      const isUpcomingStatus = lesson.status === 'scheduled';
      return isUpcomingStatus && isFuture;
    });
  }, [lessons, now]);

  const historyLessons = React.useMemo(() => {
    return lessons.filter((lesson) => {
      const t = new Date(lesson.scheduled_at).getTime();
      const isPast = t < now;
      const isHistoryStatus = lesson.status === 'completed' || lesson.status === 'cancelled';
      return isHistoryStatus || isPast;
    });
  }, [lessons, now]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return colors.secondary;
      case 'scheduled':
        return colors.primary;
      case 'completed':
        return colors.primary;
      case 'cancelled':
        return colors.error;
      default:
        return colors.gray500;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '承認待ち';
      case 'scheduled':
        return '予約確定';
      case 'completed':
        return '完了';
      case 'cancelled':
        return 'キャンセル';
      default:
        return status;
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      month: 'numeric',
      day: 'numeric',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderLessonItem = ({ item }: { item: Lesson }) => {
    return (
      <TouchableOpacity style={styles.lessonCard}>
        <View style={styles.lessonHeader}>
          <View style={styles.tutorInfo}>
            <View style={styles.tutorAvatar}>
              {tutor?.avatar_url ? (
                <Image source={{ uri: tutor.avatar_url }} style={styles.tutorAvatarImage} />
              ) : (
                <MaterialIcons name="person" size={20} color={colors.gray400} />
              )}
            </View>
            <View style={styles.tutorDetails}>
              <Text style={styles.tutorName}>{tutor?.name || '講師'}</Text>
              <Text style={styles.subject}>{item.subject}</Text>
            </View>
          </View>
          <View
            style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}
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
              {formatDateTime(item.scheduled_at)} ({item.duration_minutes}分)
            </Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons name="monetization-on" size={16} color={colors.gray500} />
            <Text style={styles.detailText}>{item.coin_cost.toLocaleString()}コイン</Text>
          </View>
          {item.lesson_notes && (
            <View style={styles.detailRow}>
              <MaterialIcons name="note" size={16} color={colors.gray500} />
              <Text style={styles.detailText}>{item.lesson_notes}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <StandardScreen title={`${tutor?.name || '講師'}さんとの授業履歴`} showBackButton>
      {/* タブ */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'upcoming' && styles.activeTab]}
          onPress={() => setSelectedTab('upcoming')}
        >
          <Text style={[styles.tabText, selectedTab === 'upcoming' && styles.activeTabText]}>
            今後 ({upcomingLessons.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'completed' && styles.activeTab]}
          onPress={() => setSelectedTab('completed')}
        >
          <Text style={[styles.tabText, selectedTab === 'completed' && styles.activeTabText]}>
            履歴 ({historyLessons.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* 授業リスト */}
      <FlatList
        data={selectedTab === 'upcoming' ? upcomingLessons : historyLessons}
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
              {selectedTab === 'upcoming' ? '今後の授業はありません' : '過去の授業はありません'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {selectedTab === 'upcoming'
                ? '授業が申請されるとこちらに表示されます'
                : '授業を完了すると履歴に表示されます'}
            </Text>
          </View>
        }
      />
    </StandardScreen>
  );
};

const styles = StyleSheet.create({
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
    overflow: 'hidden',
  },
  tutorAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
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

export default LessonHistoryScreen;
