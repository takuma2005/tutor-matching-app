import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

import { StandardScreen } from '../../components/templates';
import { colors, spacing, typography } from '../../styles/theme';

export default function MatchRequestListScreen() {
  // TODO: 後でAPIクライアントから申請一覧を取得
  const mockRequests = [
    {
      id: '1',
      studentName: '田中花子',
      subject: '数学',
      message: '数学の微積分を基礎から教えてほしいです。',
      status: 'pending',
    },
    {
      id: '2',
      studentName: '山田太郎',
      subject: '英語',
      message: '英語の会話を練習したいです。',
      status: 'approved',
    },
  ];

  const renderRequest = ({ item }: { item: (typeof mockRequests)[0] }) => (
    <View style={styles.requestCard}>
      <Text style={styles.studentName}>{item.studentName}</Text>
      <Text style={styles.subject}>{item.subject}</Text>
      <Text style={styles.message} numberOfLines={2}>
        {item.message}
      </Text>
      <View
        style={[
          styles.statusBadge,
          item.status === 'pending' ? styles.statuspending : styles.statusapproved,
        ]}
      >
        <Text style={styles.statusText}>{item.status === 'pending' ? '承認待ち' : '承認済み'}</Text>
      </View>
    </View>
  );

  return (
    <StandardScreen title="申請管理" showBackButton={false}>
      <FlatList
        data={mockRequests}
        keyExtractor={(item) => item.id}
        renderItem={renderRequest}
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
  requestCard: {
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
    fontSize: typography.sizes?.h4 || 18,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: spacing.xs,
  },
  subject: {
    fontSize: typography.sizes?.body || 16,
    color: colors.primary,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: typography.sizes?.body || 14,
    color: colors.gray600,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 20,
  },
  statuspending: {
    backgroundColor: colors.warning + '20',
  },
  statusapproved: {
    backgroundColor: colors.success + '20',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
