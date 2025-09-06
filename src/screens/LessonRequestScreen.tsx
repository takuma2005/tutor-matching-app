import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing, typography, borderRadius } from '../styles/theme';

import { getApiClient } from '@/services/api/mock';
import type { Tutor, Student } from '@/services/api/types';

type Props = {
  route: {
    params: {
      tutorId: string;
      chatRoomId: string;
    };
  };
  navigation: NavigationProp<ParamListBase>;
};

type LessonRequest = {
  subject: string;
  date: Date;
  duration: number; // minutes
  notes: string;
  totalCost: number; // coins
};

export default function LessonRequestScreen({ route, navigation }: Props) {
  const { tutorId } = route.params;
  const [tutor, setTutor] = useState<Tutor | undefined>(undefined);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);

  React.useEffect(() => {
    const api = getApiClient();
    let mounted = true;
    Promise.all([
      api.student.getProfile('student-1'),
      api.student.searchTutors(undefined, 1, 200),
    ]).then(([profileResp, tutorsResp]) => {
      if (!mounted) return;
      if (profileResp?.success) setCurrentStudent(profileResp.data);
      if (tutorsResp?.success) setTutor(tutorsResp.data.find((t) => t.id === tutorId));
    });
    return () => {
      mounted = false;
    };
  }, [tutorId]);

  const [request, setRequest] = useState<LessonRequest>({
    subject: tutor?.subjects_taught[0] || '数学',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000), // 明日
    duration: 60,
    notes: '',
    totalCost: tutor?.hourly_rate || 1500,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!tutor) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>先輩の情報が見つかりません</Text>
        </View>
      </SafeAreaView>
    );
  }

  const subjects = tutor.subjects_taught;
  const durations = [
    { label: '1時間', value: 60 },
    { label: '1.5時間', value: 90 },
    { label: '2時間', value: 120 },
    { label: '2.5時間', value: 150 },
    { label: '3時間', value: 180 },
  ];

  const calculateCost = (duration: number) => {
    return Math.round((tutor.hourly_rate * duration) / 60);
  };

  const handleSubjectSelect = (subject: string) => {
    setRequest({ ...request, subject });
  };

  const handleDurationSelect = (duration: number) => {
    const totalCost = calculateCost(duration);
    setRequest({ ...request, duration, totalCost });
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(request.date);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      setRequest({ ...request, date: newDate });
    }
  };

  const handleTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(request.date);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setRequest({ ...request, date: newDate });
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      month: 'numeric',
      day: 'numeric',
      weekday: 'short',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSubmit = () => {
    // バリデーション
    if (!request.subject) {
      Alert.alert('エラー', '科目を選択してください。');
      return;
    }

    if (request.date <= new Date()) {
      Alert.alert('エラー', '未来の日時を選択してください。');
      return;
    }

    // コイン残高チェック
    if ((currentStudent?.coins ?? 0) < request.totalCost) {
      Alert.alert(
        'コインが不足しています',
        `授業申請には${request.totalCost}コインが必要です。\n現在の残高：${currentStudent?.coins ?? 0}コイン`,
        [
          { text: 'キャンセル', style: 'cancel' },
          {
            text: 'コイン購入',
            onPress: () => {
              /* TODO: コイン購入画面へ */
            },
          },
        ],
      );
      return;
    }

    // 確認ダイアログ
    Alert.alert(
      '授業を申請しますか？',
      `先輩：${tutor.name}\n科目：${request.subject}\n日時：${formatDate(request.date)} ${formatTime(request.date)}\n時間：${request.duration}分\n料金：${request.totalCost}コイン\n\n申請後、コインが仮押さえされます。`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '申請する',
          onPress: () => {
            setIsLoading(true);

            // モック申請処理
            setTimeout(() => {
              setIsLoading(false);
              Alert.alert(
                '申請完了',
                `${tutor.name}さんに授業申請を送信しました！\n${request.totalCost}コインが仮押さえされました。\n\n相手の承認をお待ちください。`,
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // チャット画面に戻る
                      navigation.goBack();
                    },
                  },
                ],
              );
            }, 2000);
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.gray900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>授業を申請</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 先輩情報 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>申請先</Text>
          <View style={styles.tutorCard}>
            <View style={styles.tutorAvatar}>
              <MaterialIcons name="person" size={24} color={colors.gray400} />
            </View>
            <View style={styles.tutorInfo}>
              <Text style={styles.tutorName}>{tutor.name}</Text>
              <Text style={styles.tutorSchool}>
                {tutor.school} {tutor.grade}
              </Text>
              <Text style={styles.tutorRate}>{tutor.hourly_rate}コイン/時</Text>
            </View>
          </View>
        </View>

        {/* 科目選択 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>科目</Text>
          <View style={styles.subjectGrid}>
            {subjects.map((subject) => (
              <TouchableOpacity
                key={subject}
                style={[
                  styles.subjectButton,
                  request.subject === subject && styles.subjectButtonSelected,
                ]}
                onPress={() => handleSubjectSelect(subject)}
              >
                <Text
                  style={[
                    styles.subjectButtonText,
                    request.subject === subject && styles.subjectButtonTextSelected,
                  ]}
                >
                  {subject}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 日時選択 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>日時</Text>
          <View style={styles.dateTimeContainer}>
            <TouchableOpacity style={styles.dateTimeButton} onPress={() => setShowDatePicker(true)}>
              <MaterialIcons name="event" size={20} color={colors.primary} />
              <Text style={styles.dateTimeButtonText}>{formatDate(request.date)}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.dateTimeButton} onPress={() => setShowTimePicker(true)}>
              <MaterialIcons name="access-time" size={20} color={colors.primary} />
              <Text style={styles.dateTimeButtonText}>{formatTime(request.date)}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 時間選択 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>授業時間</Text>
          <View style={styles.durationGrid}>
            {durations.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.durationButton,
                  request.duration === item.value && styles.durationButtonSelected,
                ]}
                onPress={() => handleDurationSelect(item.value)}
              >
                <Text
                  style={[
                    styles.durationButtonText,
                    request.duration === item.value && styles.durationButtonTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* メモ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>メモ（任意）</Text>
          <TextInput
            style={styles.notesInput}
            value={request.notes}
            onChangeText={(text) => setRequest({ ...request, notes: text })}
            placeholder="学習内容や要望があれば入力してください..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={500}
          />
        </View>

        {/* 料金確認 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>料金</Text>
          <View style={styles.costBreakdown}>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>時給</Text>
              <Text style={styles.costValue}>{tutor.hourly_rate}コイン/時</Text>
            </View>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>時間</Text>
              <Text style={styles.costValue}>{request.duration}分</Text>
            </View>
            <View style={[styles.costRow, styles.totalCostRow]}>
              <Text style={styles.totalCostLabel}>合計</Text>
              <Text style={styles.totalCostValue}>{request.totalCost}コイン</Text>
            </View>
          </View>

          <View style={styles.balanceInfo}>
            <MaterialIcons name="account-balance-wallet" size={16} color={colors.gray500} />
            <Text style={styles.balanceText}>
              残高：{currentStudent?.coins ?? 0}コイン
              {(currentStudent?.coins ?? 0) < request.totalCost && (
                <Text style={styles.insufficientText}>（不足）</Text>
              )}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* 申請ボタン */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (isLoading || (currentStudent?.coins ?? 0) < request.totalCost) &&
              styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isLoading || (currentStudent?.coins ?? 0) < request.totalCost}
        >
          <MaterialIcons
            name="school"
            size={20}
            color={colors.white}
            style={styles.submitButtonIcon}
          />
          <Text style={styles.submitButtonText}>{isLoading ? '申請中...' : '授業を申請する'}</Text>
        </TouchableOpacity>
      </View>

      {/* DateTimePickers */}
      {showDatePicker && (
        <DateTimePicker
          value={request.date}
          mode="date"
          minimumDate={new Date()}
          onChange={handleDateChange}
        />
      )}

      {showTimePicker && (
        <DateTimePicker value={request.date} mode="time" onChange={handleTimeChange} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    backgroundColor: colors.white,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray100,
  },
  headerTitle: {
    flex: 1,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.gray900,
    textAlign: 'center',
    marginHorizontal: spacing.md,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.gray900,
    marginBottom: spacing.md,
  },
  tutorCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tutorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  tutorInfo: {
    flex: 1,
  },
  tutorName: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.gray900,
    marginBottom: 2,
  },
  tutorSchool: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray600,
    marginBottom: 2,
  },
  tutorRate: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },
  subjectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  subjectButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray300,
    backgroundColor: colors.white,
  },
  subjectButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  subjectButtonText: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray700,
  },
  subjectButtonTextSelected: {
    color: colors.white,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary + '10',
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  dateTimeButtonText: {
    fontSize: typography.fontSizes.md,
    color: colors.primary,
    marginLeft: spacing.sm,
    fontWeight: typography.fontWeights.medium,
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  durationButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray300,
    backgroundColor: colors.white,
    minWidth: 80,
    alignItems: 'center',
  },
  durationButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  durationButtonText: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray700,
  },
  durationButtonTextSelected: {
    color: colors.white,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSizes.md,
    color: colors.gray900,
    backgroundColor: colors.white,
    minHeight: 100,
  },
  costBreakdown: {
    gap: spacing.sm,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  costLabel: {
    fontSize: typography.fontSizes.md,
    color: colors.gray600,
  },
  costValue: {
    fontSize: typography.fontSizes.md,
    color: colors.gray900,
  },
  totalCostRow: {
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
  },
  totalCostLabel: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.gray900,
  },
  totalCostValue: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
  },
  balanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.md,
  },
  balanceText: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray600,
    marginLeft: spacing.xs,
  },
  insufficientText: {
    color: colors.error,
    fontWeight: typography.fontWeights.medium,
  },
  bottomContainer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    backgroundColor: colors.white,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: colors.gray400,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonIcon: {
    marginRight: spacing.sm,
  },
  submitButtonText: {
    fontSize: typography.fontSizes.md,
    color: colors.white,
    fontWeight: typography.fontWeights.semibold,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  errorText: {
    fontSize: typography.fontSizes.md,
    color: colors.gray600,
    textAlign: 'center',
  },
});
