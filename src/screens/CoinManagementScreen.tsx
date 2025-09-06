import { MaterialIcons } from '@expo/vector-icons';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Badge from '../components/common/Badge';
import BottomSheet from '../components/common/BottomSheet';
import { colors, spacing, typography, borderRadius } from '../styles/theme';

import { CoinManager } from '@/domain/coin/coinManager';
import { getApiClient } from '@/services/api/mock';
import type { CoinTransaction } from '@/services/api/types';

type CoinPackage = {
  id: string;
  coins: number;
  price: number;
  bonus?: number;
  popular?: boolean;
};

const coinPackages: CoinPackage[] = [
  { id: 'p1', coins: 400, price: 490 },
  { id: 'p2', coins: 1250, price: 1480, popular: true },
  { id: 'p3', coins: 4300, price: 4900 },
  { id: 'p4', coins: 8800, price: 9800 },
];

type Props = {
  navigation: NavigationProp<ParamListBase>;
};

export default function CoinManagementScreen({ navigation }: Props) {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);

  React.useEffect(() => {
    const api = getApiClient();
    let mounted = true;
    Promise.all([
      api.student.getProfile('student-1'),
      api.coin.getBalance('student-1'),
      api.coin.getTransactionHistory('student-1', 1, 50),
    ])
      .then(([profileResp, balanceResp, txResp]) => {
        if (!mounted) return;
        if (balanceResp?.success) setBalance(balanceResp.data.balance);
        if (txResp?.success) setTransactions(txResp.data);
      })
      .catch(() => {})
      .finally(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  // Bottom sheet state
  const [isSheetOpen, setSheetOpen] = useState(false);
  const toggleSheet = () => setSheetOpen((prev) => !prev);

  const handlePurchase = (coinPackage: CoinPackage) => {
    const api = getApiClient();
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
              await CoinManager.purchase('student-1', amount, 'pm_card_visa');
              const [bal, hist] = await Promise.all([
                api.coin.getBalance('student-1'),
                api.coin.getTransactionHistory('student-1', 1, 50),
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

  const renderCoinPackage = (coinPackage: CoinPackage) => (
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
      <LinearGradient
        colors={
          selectedPackage === coinPackage.id
            ? [colors.primary + '10', colors.primary + '05']
            : [colors.gray50, colors.gray50]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {coinPackage.popular && (
        <View style={styles.popularBadge}>
          <Badge color="warning" size="sm">
            人気
          </Badge>
        </View>
      )}

      <View style={styles.coinAmount}>
        <MaterialIcons name="monetization-on" size={32} color={colors.warning} />
        <Text style={styles.coinValue}>{coinPackage.coins.toLocaleString()}</Text>
        {coinPackage.bonus && <Text style={styles.bonusText}>+{coinPackage.bonus} ボーナス</Text>}
      </View>

      <View style={styles.priceSection}>
        <Text style={styles.price}>¥{coinPackage.price.toLocaleString()}</Text>
        <TouchableOpacity
          style={styles.purchaseButton}
          onPress={() => handlePurchase(coinPackage)}
          disabled={isLoading}
        >
          <Text style={styles.purchaseButtonText}>{isLoading ? '処理中...' : '購入'}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const typeLabel = (type: string) => {
    switch (type) {
      case 'purchase':
        return '購入';
      case 'spend':
        return '支出';
      case 'refund':
        return '返金';
      default:
        return type;
    }
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
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
          <View
            style={{
              backgroundColor: item.type === 'spend' ? colors.error + '15' : colors.success + '15',
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 999,
              marginRight: 8,
            }}
          >
            <Text
              style={{
                fontSize: typography.sizes?.caption || 12,
                color: item.type === 'spend' ? colors.error : colors.success,
                fontWeight: '600',
              }}
            >
              {typeLabel(item.type)}
            </Text>
          </View>
          <Text style={styles.transactionTitle}>{item.description}</Text>
        </View>
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
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.gray900} />
        </TouchableOpacity>
        <Text style={styles.title}>コイン管理</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerRightButton} onPress={toggleSheet}>
            <MaterialIcons name="tune" size={24} color={colors.gray900} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 現在の残高 */}
        <View style={styles.balanceSection}>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceTitle}>現在の残高</Text>
            <Text style={styles.balanceAmount}>{(balance ?? 0).toLocaleString()}コイン</Text>
          </View>
        </View>

        {/* コイン購入パッケージ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>コイン購入</Text>
          <Text style={styles.sectionSubtitle}>
            マッチング申請や授業予約にコインをご利用ください
          </Text>

          <View style={styles.packagesGrid}>{coinPackages.map(renderCoinPackage)}</View>
        </View>

        {/* 取引履歴 */}
        <View style={styles.section}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray100,
  },
  title: {
    flex: 1,
    fontSize: typography.sizes?.h3 || 20,
    fontWeight: '600',

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
  balanceSection: {
    padding: spacing.lg,
  },
  balanceCard: {
    backgroundColor: colors.primary + '10',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  balanceTitle: {
    fontSize: typography.sizes?.body || 16,
    color: colors.gray700,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes?.h4 || 18,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.gray600,
    marginBottom: spacing.lg,
  },
  packagesGrid: {
    // gap is not fully supported across RN versions; use margin on children instead
  },
  packageCard: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.gray200,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  popularPackage: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '05',
  },
  selectedPackage: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full || 999,
  },
  popularText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: '700',
  },
  coinAmount: {
    flex: 1,
    alignItems: 'center',
  },
  coinValue: {
    fontSize: typography.sizes?.h3 || 20,
    fontWeight: '700',
    color: colors.gray900,
    marginTop: spacing.xs,
  },
  bonusText: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.success,
    fontWeight: '500',
  },
  priceSection: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: typography.sizes?.h4 || 18,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: spacing.sm,
  },
  purchaseButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    minWidth: 80,
    alignItems: 'center',
  },
  purchaseButtonText: {
    fontSize: typography.sizes?.caption || 12,
    color: colors.white,
    fontWeight: '600',
  },
  historyContainer: {
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray100,
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
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray100,
  },
});
