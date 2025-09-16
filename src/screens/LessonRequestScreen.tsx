import { MaterialIcons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFocusEffect } from '@react-navigation/native';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { format as formatDateFns } from 'date-fns';
import { ja } from 'date-fns/locale';
import React, { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';

import { colors, spacing, typography, borderRadius } from '../styles/theme';

import ScreenContainer from '@/components/common/ScreenContainer';
import { useAuth } from '@/contexts/AuthContext';
import { CoinManager } from '@/domain/coin/coinManager';
import { getApiClient, mockApiClient } from '@/services/api/mock';
import type { Tutor, Student, Lesson } from '@/services/api/types';

type Props = {
  route: {
    params: {
      tutorId: string;
      chatRoomId: string;
    };
  };
  navigation: NavigationProp<ParamListBase>;
};

type NavigationLike = {
  navigate?: NavigationProp<ParamListBase>['navigate'];
  getParent?: () => NavigationLike | undefined | null;
  getState?: () => { routeNames?: string[] } | undefined;
};

type LessonRequest = {
  subject: string;
  date: Date;
  duration: number; // minutes
  notes: string;
  totalCost: number; // coins
};

// フォーム型
type RequestForm = {
  subject: string;
  start: Date;
  duration: number;
  notes?: string;
};

// バリデーション
const formSchema = z.object({
  subject: z.string().min(1, '科目を選択してください'),
  start: z.date().refine((d) => d.getTime() > Date.now(), '未来の日時を選択してください'),
  duration: z.number().min(30).max(180),
  notes: z.string().max(500).optional(),
});

// Calendar locale (Japanese)
LocaleConfig.locales['ja'] = {
  monthNames: [
    '1月',
    '2月',
    '3月',
    '4月',
    '5月',
    '6月',
    '7月',
    '8月',
    '9月',
    '10月',
    '11月',
    '12月',
  ],
  monthNamesShort: [
    '1月',
    '2月',
    '3月',
    '4月',
    '5月',
    '6月',
    '7月',
    '8月',
    '9月',
    '10月',
    '11月',
    '12月',
  ],
  dayNames: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
  dayNamesShort: ['日', '月', '火', '水', '木', '金', '土'],
  today: '今日',
};
LocaleConfig.defaultLocale = 'ja';

export default function LessonRequestScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { tutorId } = route.params;
  const [tutor, setTutor] = useState<Tutor | undefined>(undefined);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const { student: authStudent, user: authUser } = useAuth();
  const api = React.useMemo(() => getApiClient() as typeof mockApiClient, []);

  const loadStudentProfile = useCallback(async () => {
    const studentId = authStudent?.id ?? authUser?.id;
    if (!studentId) {
      setCurrentStudent(null);
      return;
    }
    try {
      const profileResp = await api.student.getProfile(studentId);
      if (profileResp?.success) {
        setCurrentStudent(profileResp.data);
      } else if (authStudent) {
        setCurrentStudent(authStudent);
      }
    } catch (error) {
      console.error('Failed to load student profile:', error);
    }
  }, [api, authStudent, authUser?.id]);

  React.useEffect(() => {
    let mounted = true;
    const studentId = authStudent?.id ?? authUser?.id;
    Promise.all([
      studentId
        ? api.student.getProfile(studentId)
        : Promise.resolve({ success: false as const, data: undefined as unknown as Student }),
      api.student.searchTutors(undefined, 1, 200),
    ]).then(([profileResp, tutorsResp]) => {
      if (!mounted) return;
      if (profileResp?.success) setCurrentStudent(profileResp.data);
      else if (authStudent) setCurrentStudent(authStudent);
      if (tutorsResp?.success) setTutor(tutorsResp.data.find((t) => t.id === tutorId));
    });
    return () => {
      mounted = false;
    };
  }, [api, authStudent, authUser?.id, tutorId]);

  useFocusEffect(
    useCallback(() => {
      const studentId = authStudent?.id ?? authUser?.id;
      if (studentId) {
        CoinManager.syncBalance(studentId).catch(() => {});
      }
      loadStudentProfile().catch(() => {});
    }, [authStudent?.id, authUser?.id, loadStudentProfile]),
  );

  const [request, setRequest] = useState<LessonRequest>({
    subject: tutor?.subjects_taught[0] || '数学',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000), // 明日
    duration: 60,
    notes: '',
    totalCost: tutor?.hourly_rate || 1500,
  });

  // react-hook-form セットアップ
  const {
    setValue,
    watch,
    handleSubmit: formHandleSubmit,
    formState: { isValid },
  } = useForm<RequestForm>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      subject: request.subject,
      start: request.date,
      duration: request.duration,
      notes: request.notes,
    },
  });
  const start = watch('start');
  const duration = watch('duration');
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const openCoinManagement = useCallback((): boolean => {
    const tryNavigate = (nav: NavigationLike | null | undefined) => {
      if (!nav || typeof nav.navigate !== 'function') {
        return false;
      }
      const state = typeof nav.getState === 'function' ? nav.getState() : undefined;
      if (state?.routeNames?.includes('CoinManagement')) {
        (nav.navigate as unknown as (routeName: string, params?: unknown) => void)(
          'CoinManagement',
        );
        return true;
      }
      if (state?.routeNames?.includes('Home')) {
        (nav.navigate as unknown as (routeName: string, params?: unknown) => void)('Home', {
          screen: 'CoinManagement',
        });
        return true;
      }
      return false;
    };

    if (tryNavigate(navigation)) return true;
    const parent = navigation.getParent?.();
    if (tryNavigate(parent as NavigationLike | null | undefined)) return true;
    const grandParent = typeof parent?.getParent === 'function' ? parent.getParent() : undefined;
    if (tryNavigate(grandParent as NavigationLike | null | undefined)) return true;
    return false;
  }, [navigation]);

  if (!tutor) {
    return (
      <ScreenContainer>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>先輩の情報が見つかりません</Text>
        </View>
      </ScreenContainer>
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
    setValue('subject', subject, { shouldValidate: true });
    setRequest({ ...request, subject });
  };

  const handleDurationSelect = (value: number) => {
    const totalCost = calculateCost(value);
    setValue('duration', value, { shouldValidate: true });
    setRequest({ ...request, duration: value, totalCost });
  };

  const handleDateTimeConfirm = (selected?: Date) => {
    setShowDateTimePicker(false);
    if (selected) {
      setValue('start', selected, { shouldValidate: true });
      setRequest({ ...request, date: selected, totalCost: calculateCost(request.duration) });
    }
  };

  const formatDate = (date: Date) => {
    return formatDateFns(date, 'M月d日(EEE)', { locale: ja });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // UX helpers
  const setQuickDate = (daysFromToday: number) => {
    const base = new Date();
    base.setDate(base.getDate() + daysFromToday);
    const kept = new Date(request.date);
    kept.setFullYear(base.getFullYear());
    kept.setMonth(base.getMonth());
    kept.setDate(base.getDate());
    // 過去時刻を避ける: 今日選択で現在より前なら1時間後に繰り上げ
    if (daysFromToday === 0 && kept.getTime() < Date.now()) {
      kept.setMinutes(0);
      kept.setHours(new Date().getHours() + 1);
    }
    setRequest({ ...request, date: kept, totalCost: calculateCost(request.duration) });
  };

  const setQuickTime = (hour: number, minute = 0) => {
    const kept = new Date(request.date);
    kept.setHours(hour);
    kept.setMinutes(minute);
    // 過去回避（同日の過去の場合は翌日に繰り上げ）
    const now = new Date();
    const sameDay =
      kept.getFullYear() === now.getFullYear() &&
      kept.getMonth() === now.getMonth() &&
      kept.getDate() === now.getDate();
    if (sameDay && kept.getTime() < now.getTime()) {
      kept.setDate(kept.getDate() + 1);
    }
    setRequest({ ...request, date: kept, totalCost: calculateCost(request.duration) });
  };

  const computedEndTime = () => {
    const end = new Date(request.date.getTime() + request.duration * 60 * 1000);
    return formatTime(end);
  };

  const handleDurationStep = (delta: number) => {
    const next = Math.min(180, Math.max(30, request.duration + delta));
    const totalCost = calculateCost(next);
    setRequest({ ...request, duration: next, totalCost });
  };

  const handleSubmitRequest = () => {
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
              const navigated = openCoinManagement();
              if (!navigated) {
                Alert.alert('ご案内', 'ホームタブの「コイン管理」からコインを購入できます。');
              }
            },
          },
        ],
      );
      return;
    }

    // 確認ダイアログ
    if (!currentStudent) {
      Alert.alert('エラー', 'ログイン済みの生徒情報が必要です。');
      return;
    }

    Alert.alert(
      '授業を申請しますか？',
      `先輩：${tutor.name}\n科目：${request.subject}\n日時：${formatDate(request.date)} ${formatTime(request.date)}\n時間：${request.duration}分\n料金：${request.totalCost}コイン\n\n申請後、コインが仮押さえされます。`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '申請する',
          onPress: async () => {
            try {
              setIsLoading(true);
              const api = getApiClient();
              const payload: Omit<Lesson, 'id' | 'status' | 'created_at' | 'updated_at'> = {
                tutor_id: tutor.id,
                student_id: currentStudent.id,
                subject: request.subject,
                scheduled_at: request.date.toISOString(),
                duration_minutes: request.duration,
                coin_cost: request.totalCost,
                lesson_notes: request.notes,
              };

              const res = await api.student.bookLesson(tutor.id, payload);
              if (res.success) {
                // Sync balance from backend to avoid drift
                await CoinManager.syncBalance(currentStudent.id);

                Alert.alert(
                  '申請完了',
                  `${tutor.name}さんに授業申請を送信しました！\n${request.totalCost}コインが仮押さえされました。\n\n相手の承認をお待ちください。`,
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        navigation.goBack();
                      },
                    },
                  ],
                );
              } else {
                Alert.alert('エラー', res.error ?? '申請に失敗しました');
              }
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
    );
  };

  return (
    <ScreenContainer
      withScroll={false}
      contentContainerStyle={{ paddingHorizontal: 0, paddingTop: 0 }}
    >
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.gray900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>授業を申請</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: spacing.xl * 4 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
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
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowDateTimePicker(true)}
            >
              <MaterialIcons name="event" size={20} color={colors.primary} />
              <Text style={styles.dateTimeButtonText}>{formatDate(start)}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowDateTimePicker(true)}
            >
              <MaterialIcons name="access-time" size={20} color={colors.primary} />
              <Text style={styles.dateTimeButtonText}>{formatTime(start)}</Text>
            </TouchableOpacity>
          </View>

          {/* クイック選択（日付） */}
          <View style={styles.quickRow}>
            <TouchableOpacity style={styles.chip} onPress={() => setQuickDate(0)}>
              <Text style={styles.chipText}>今日</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.chip} onPress={() => setQuickDate(1)}>
              <Text style={styles.chipText}>明日</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.chip} onPress={() => setShowCalendar((v) => !v)}>
              <Text style={styles.chipText}>
                {showCalendar ? 'カレンダーを閉じる' : 'カレンダーで選ぶ'}
              </Text>
            </TouchableOpacity>
          </View>

          {showCalendar && (
            <View style={{ marginTop: spacing.sm }}>
              <Calendar
                current={formatDateFns(start, 'yyyy-MM-dd')}
                minDate={formatDateFns(new Date(), 'yyyy-MM-dd')}
                markedDates={{
                  [formatDateFns(start, 'yyyy-MM-dd')]: {
                    selected: true,
                    selectedColor: colors.primary,
                  },
                }}
                onDayPress={(d) => {
                  const newDate = new Date(start);
                  newDate.setFullYear(Number(d.year));
                  newDate.setMonth(Number(d.month) - 1);
                  newDate.setDate(Number(d.day));
                  setValue('start', newDate, { shouldValidate: true });
                  setRequest({ ...request, date: newDate });
                }}
                theme={{
                  todayTextColor: colors.primary,
                  selectedDayBackgroundColor: colors.primary,
                }}
              />
            </View>
          )}

          {/* クイック選択（時刻） */}
          <View style={styles.quickRow}>
            {[19, 20, 21].map((h) => (
              <TouchableOpacity key={h} style={styles.chip} onPress={() => setQuickTime(h)}>
                <Text style={styles.chipText}>{`${h}:00`}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* メタ情報（終了時刻） */}
          <View style={styles.metaRow}>
            <MaterialIcons name="schedule" size={16} color={colors.gray500} />
            <Text style={styles.metaText}>終了予定: {computedEndTime()}</Text>
          </View>
        </View>

        {/* 時間選択 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>授業時間</Text>

          {/* ステッパー */}
          <View style={styles.stepperRow}>
            <TouchableOpacity style={styles.stepperBtn} onPress={() => handleDurationStep(-30)}>
              <Text style={styles.stepperBtnText}>-30分</Text>
            </TouchableOpacity>
            <Text style={styles.stepperValue}>
              {request.duration}分（終了 {computedEndTime()}）
            </Text>
            <TouchableOpacity style={styles.stepperBtn} onPress={() => handleDurationStep(30)}>
              <Text style={styles.stepperBtnText}>+30分</Text>
            </TouchableOpacity>
          </View>

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
              <Text style={styles.costValue}>{duration}分</Text>
            </View>
            <View style={[styles.costRow, styles.totalCostRow]}>
              <Text style={styles.totalCostLabel}>合計</Text>
              <Text style={styles.totalCostValue}>{calculateCost(duration)}コイン</Text>
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

      {/* 申請ボタン - 固定配置 */}
      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + spacing.md }]}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (isLoading || (currentStudent?.coins ?? 0) < calculateCost(duration) || !isValid) &&
              styles.submitButtonDisabled,
          ]}
          onPress={formHandleSubmit(handleSubmitRequest)}
          disabled={isLoading || (currentStudent?.coins ?? 0) < calculateCost(duration) || !isValid}
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

      {/* DateTimePicker Modal */}
      <DateTimePickerModal
        isVisible={showDateTimePicker}
        mode="datetime"
        minimumDate={new Date()}
        date={start}
        onConfirm={handleDateTimeConfirm}
        onCancel={() => setShowDateTimePicker(false)}
        locale="ja_JP"
        is24Hour
      />
    </ScreenContainer>
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
    paddingHorizontal: 0,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    backgroundColor: colors.white,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.lg,
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
    marginRight: spacing.lg,
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
  quickRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.full || 999,
  },
  chipText: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray700,
    fontWeight: typography.fontWeights.medium,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  metaText: {
    marginLeft: spacing.xs,
    fontSize: typography.fontSizes.sm,
    color: colors.gray600,
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepperBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.md,
  },
  stepperBtnText: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray800,
    fontWeight: typography.fontWeights.medium,
  },
  stepperValue: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray600,
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    paddingBottom: 0,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    backgroundColor: colors.white,
    alignItems: 'center',
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
    width: '92%',
    maxWidth: 560,
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
