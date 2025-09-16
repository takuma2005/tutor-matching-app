import { MaterialIcons } from '@expo/vector-icons';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';

import Badge from '../components/common/Badge';
import BottomSheet from '../components/common/BottomSheet';
import { colors, spacing, typography, borderRadius, shadows } from '../styles/theme';

import ScreenContainer from '@/components/common/ScreenContainer';
import { COIN_PACKAGES, calculateSavings, type CoinPackage } from '@/constants/coinPlans';
import { useAuth } from '@/contexts/AuthContext';
import { CoinManager } from '@/domain/coin/coinManager';
import { getApiClient } from '@/services/api/mock';
import type { CoinTransaction } from '@/services/api/types';

// コイン購入パッケージは constants/coinPlans.ts から取得

type Props = {
  navigation: NavigationProp<ParamListBase>;
};

export default function CoinManagementScreen({ navigation }: Props) {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const { student, user } = useAuth();

  React.useEffect(() => {
    const api = getApiClient();
    let mounted = true;
    const userId = student?.id ?? user?.id;
    if (!userId) {
      setBalance(0);
      setTransactions([]);
      return () => {
        mounted = false;
      };
    }
    Promise.all([
      api.student.getProfile(userId),
      api.coin.getBalance(userId),
      api.coin.getTransactionHistory(userId, 1, 50),
    ])
      .then(([_profileResp, balanceResp, txResp]) => {
        if (!mounted) return;
        if (balanceResp?.success) setBalance(balanceResp.data.balance);
        if (txResp?.success) setTransactions(txResp.data);
      })
      .catch(() => {})
      .finally(() => {});
    return () => {
      mounted = false;
    };
  }, [student?.id, user?.id]);

  // Bottom sheet state
  const [isSheetOpen, setSheetOpen] = useState(false);
  const toggleSheet = () => setSheetOpen((prev) => !prev);

  const handlePurchase = (coinPackage: CoinPackage) => {
    const api = getApiClient();
    const userId = student?.id ?? user?.id;
    if (!userId) {
      Alert.alert('エラー', 'コイン残高の取得に失敗しました。ログイン状態を確認してください。');
      return;
    }
    const amount = coinPackage.coins + (coinPackage.bonus ?? 0);
    Alert.alert(
      'コイン購入確認',
      `${coinPackage.coins}${coinPackage.bonus ? ` + ボーナス${coinPackage.bonus}` : ''}コインを¥${coinPackage.price.toLocaleString()}で購入しますか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '購入する',
          onPress: async () => {
            setIsLoading(true);
            try {
              // Use domain manager to keep mock/prod switchable
              await CoinManager.purchase(userId, amount, 'pm_card_visa');
              const [bal, hist] = await Promise.all([
                api.coin.getBalance(userId),
                api.coin.getTransactionHistory(userId, 1, 50),
              ]);
              if (bal.success) {
                setBalance(bal.data.balance);
              }
              if (hist.success) setTransactions(hist.data);
              Alert.alert(
                '購入完了',
                `${coinPackage.coins}${coinPackage.bonus ? ` + ${coinPackage.bonus}` : ''}コインを購入しました！`,
              );
            } catch (e: unknown) {
              const msg = e instanceof Error ? e.message : '購入に失敗しました';
              Alert.alert('エラー', msg);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'add-circle';
      case 'spend':
        return 'remove-circle';
      case 'refund':
        return 'card-giftcard';
      default:
        return 'monetization-on';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'purchase':
        return colors.success;
      case 'refund':
        return colors.success;
      case 'spend':
        return colors.error;
      default:
        return colors.gray500;
    }
  };

  const renderCoinPackage = (coinPackage: CoinPackage) => {
    const {
      basePrice: _basePrice,
      savings: _savings,
      savingsPercent,
    } = calculateSavings(coinPackage);
    return (
      <TouchableOpacity
        key={coinPackage.id}
        style={[
          styles.packageCard,
          coinPackage.popular && styles.popularPackage,
          selectedPackage === coinPackage.id && styles.selectedPackage,
        ]}
        onPress={() => setSelectedPackage(coinPackage.id)}
        activeOpacity={0.9}
      >
        {coinPackage.popular && (
          <View style={styles.popularBadge}>
            <Badge color="info" size="sm">
              人気No.1
            </Badge>
          </View>
        )}

        <View style={styles.coinAmount}>
          <View style={styles.coinIcon}>
            <MaterialIcons name="paid" size={20} color={colors.warning} />
          </View>
          <Text style={styles.coinValue}>{coinPackage.coins.toLocaleString()}</Text>
          <Text style={styles.coinUnit}>コイン</Text>
          {savingsPercent > 0 && <Text style={styles.savingText}>約{savingsPercent}%お得</Text>}
          {coinPackage.label && <Text style={styles.labelText}>{coinPackage.label}</Text>}
        </View>

        <TouchableOpacity
          style={[
            styles.priceButton,
            selectedPackage === coinPackage.id && styles.priceButtonSelected,
          ]}
          onPress={() => handlePurchase(coinPackage)}
          disabled={isLoading}
        >
          <Text style={styles.priceButtonText}>¥{coinPackage.price.toLocaleString()}</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderTransaction = ({ item }: { item: CoinTransaction }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionIcon}>
        <MaterialIcons
          name={getTransactionIcon(item.type)}
          size={20}
          color={getTransactionColor(item.type)}
        />
      </View>

      <View style={styles.transactionDetails}>
        <Text style={styles.transactionTitle}>{item.description}</Text>
        <Text style={styles.transactionDate}>{formatDate(item.created_at)}</Text>
      </View>

      <Text
        style={[
          styles.transactionAmount,
          { color: item.amount > 0 ? colors.success : colors.error },
        ]}
      >
        {item.amount > 0 ? '+' : ''}
        {item.amount.toLocaleString()}
      </Text>
    </View>
  );

  return (
    <ScreenContainer
      withScroll={false}
      contentContainerStyle={{ paddingTop: 0, paddingHorizontal: 0 }}
      bottomSpacing={spacing.xl}
    >
      {/* Header: full-bleed white background, fixed (non-scrolling) */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.gray900} />
        </TouchableOpacity>
        <Text style={styles.title}>コイン管理</Text>
        <TouchableOpacity style={styles.headerRightButton} onPress={toggleSheet}>
          <MaterialIcons name="tune" size={24} color={colors.gray900} />
        </TouchableOpacity>
      </View>

      {/* Body scrollable content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 現在の残高 */}
        <View style={styles.balanceSection}>
          <View style={styles.balanceCard}>
            <View style={styles.balanceIconContainer}>
              <MaterialIcons name="account-balance-wallet" size={32} color={colors.primary} />
            </View>
            <Text style={styles.balanceTitle}>現在の残高</Text>
            <Text style={styles.balanceAmount}>{(balance ?? 0).toLocaleString()}コイン</Text>
          </View>
        </View>

        {/* コイン購入パッケージ */}
        <View style={[styles.section, styles.packagesSection]}>
          <Text style={styles.sectionTitle}>コイン購入</Text>
          <Text style={styles.sectionSubtitle}>
            マッチング申請や授業予約にコインをご利用ください
          </Text>

          <View style={styles.packagesGrid}>{COIN_PACKAGES.map(renderCoinPackage)}</View>
        </View>

        {/* 取引履歴 */}
        <View style={[styles.section, styles.historySection]}>
          <Text style={styles.sectionTitle}>取引履歴</Text>
          <View style={styles.historyContainer}>
            {transactions.slice(0, 8).map((transaction, index) => (
              <View key={index}>{renderTransaction({ item: transaction })}</View>
            ))}
          </View>

          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>すべての履歴を見る</Text>
            <MaterialIcons name="arrow-forward" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* 底部余白 */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      <BottomSheet isOpen={isSheetOpen} onClose={toggleSheet} height={560}>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>オプション</Text>
            <Text style={styles.sectionSubtitle}>このシートは固定高さで表示されます。</Text>
          </View>
          <View style={{ height: spacing.xl }} />
        </ScrollView>
      </BottomSheet>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.appBackground,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: typography.sizes?.h3 || 20,
    fontWeight: '600',
    color: colors.gray900,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  balanceSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  balanceCard: {
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray200,
    ...shadows.sm,
  },
  balanceTitle: {
    fontSize: typography.sizes?.body || 16,
    color: colors.gray600,
    marginBottom: spacing.xs,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.xs / 2,
  },
  balanceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  balanceEquivalent: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray500,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  historySection: {
    paddingTop: 0,
    paddingBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes?.h4 || 18,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: spacing.sm,
  },
  sectionSubtitle: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray600,
    marginBottom: spacing.md,
  },
  packagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  packagesSection: {
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  packageCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    width: '48%',
    minHeight: 200,
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'visible',
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  popularPackage: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  selectedPackage: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full || 999,
    zIndex: 5,
  },
  popularText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: '700',
  },
  coinAmount: {
    alignItems: 'center',
    marginBottom: spacing.md,
    flexGrow: 1,
    justifyContent: 'center',
  },
  coinIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.warning + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinValue: {
    fontSize: typography.sizes?.h4 || 18,
    fontWeight: '700',
    color: colors.gray900,
    marginTop: spacing.xs,
  },
  coinUnit: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray500,
    marginTop: spacing.xs,
  },
  bonusText: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.success,
    fontWeight: '500',
  },
  equivalentText: {
    marginTop: spacing.xs / 2,
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray500,
    fontWeight: '400',
  },
  savingText: {
    marginTop: spacing.xs,
    fontSize: typography.sizes?.caption || 12,
    color: colors.success,
    fontWeight: '600',
  },
  labelText: {
    marginTop: spacing.xs / 2,
    fontSize: typography.sizes?.caption || 12,
    color: colors.primary,
    fontWeight: '600',
  },
  priceButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  priceButtonSelected: {
    backgroundColor: colors.primaryDark,
  },
  priceButtonText: {
    fontSize: typography.sizes?.h4 || 18,
    color: colors.white,
    fontWeight: '700',
    lineHeight: 40,
    textAlign: 'center',
  },
  historyContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray200,
    ...shadows.sm,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: typography.sizes?.body || 16,
    color: colors.gray900,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray500,
  },
  transactionAmount: {
    fontSize: typography.sizes?.body || 16,
    fontWeight: '600',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  viewAllText: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.primary,
    marginRight: spacing.xs / 2,
  },
  bottomSpacing: {
    height: spacing.xl,
  },
  headerRightButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
