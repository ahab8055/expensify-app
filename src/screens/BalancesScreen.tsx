import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList, AppData, Balance, DebtSettlement} from '../types';
import {StorageService} from '../services/storage';
import {PurchaseService} from '../services/purchases';
import {ShareService} from '../services/sharing';
import {PDFService} from '../services/pdf';
import {
  calculateBalances,
  optimizeDebts,
  formatCurrency,
} from '../utils/calculations';
import {BalanceItem} from '../components/BalanceItem';
import {colors, commonStyles, spacing} from '../styles/common';

type BalancesScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Balances'
>;

export const BalancesScreen: React.FC = () => {
  const navigation = useNavigation<BalancesScreenNavigationProp>();
  const [data, setData] = useState<AppData>({expenses: [], participants: []});
  const [balances, setBalances] = useState<Balance[]>([]);
  const [settlements, setSettlements] = useState<DebtSettlement[]>([]);
  const [isPremium, setIsPremium] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [appData, premiumStatus] = await Promise.all([
        StorageService.loadData(),
        PurchaseService.isPremium(),
      ]);

      setData(appData);
      setIsPremium(premiumStatus);

      if (appData.expenses.length > 0) {
        const calculatedBalances = calculateBalances(appData.expenses);
        const optimizedSettlements = optimizeDebts([...calculatedBalances]);
        setBalances(calculatedBalances);
        setSettlements(optimizedSettlements);
      } else {
        setBalances([]);
        setSettlements([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load balance data');
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  useEffect(() => {
    const handleShareOptions = () => {
      if (balances.length === 0) {
        Alert.alert('No Data', 'Add some expenses first to share balances!');
        return;
      }

      Alert.alert(
        'Share Options',
        'How would you like to share the balances?',
        [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Simple Share', onPress: handleSimpleShare},
          {text: 'Detailed Report', onPress: handleDetailedShare},
          ...(isPremium
            ? [{text: 'PDF Export', onPress: handlePDFExport}]
            : []),
        ],
      );
    };
    
    navigation.setOptions({
      headerTitle: 'Balances',
      headerRight: () => (
        <TouchableOpacity
          style={commonStyles.headerButton}
          onPress={handleShareOptions}>
          <Text style={commonStyles.headerButtonText}>Share</Text>
        </TouchableOpacity>
      ),
    });
  const handleSimpleShare = async () => {
    try {
      await ShareService.shareSimpleBalances(balances);
    } catch (error) {
      Alert.alert('Error', 'Failed to share balances');
    }
  };

  const handleDetailedShare = async () => {
    try {
      await ShareService.shareExpenseReport(
        data.expenses,
        balances,
        settlements,
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to share report');
    }
  };

  const handlePDFExport = async () => {
    if (!isPremium) {
      Alert.alert(
        'Premium Feature',
        'PDF export is available with Premium upgrade.',
        [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Upgrade', onPress: () => navigation.navigate('Premium')},
        ],
      );
      return;
    }

    try {
      const filePath = await PDFService.generateExpenseReport(
        data.expenses,
        balances,
        settlements,
      );

      if (filePath) {
        const success = await ShareService.sharePDFFile(filePath);
        if (success) {
          // Clean up the file after sharing
          setTimeout(() => PDFService.deleteReportFile(filePath), 5000);
        }
      } else {
        Alert.alert('Error', 'Failed to generate PDF report');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to export PDF');
    }
  };

  const renderBalanceItem = ({item}: {item: Balance}) => (
    <BalanceItem balance={item} />
  );

  const renderSettlementItem = ({item}: {item: DebtSettlement}) => (
    <View style={[commonStyles.card, styles.settlementItem]}>
      <View style={styles.settlementHeader}>
        <Text style={styles.settlementText}>
          <Text style={styles.fromPerson}>{item.from}</Text>
          {' owes '}
          <Text style={styles.toPerson}>{item.to}</Text>
        </Text>
        <Text style={styles.settlementAmount}>
          {formatCurrency(item.amount)}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.markPaidButton}
        onPress={() => handleMarkAsPaid(item)}>
        <Text style={styles.markPaidButtonText}>Mark as Paid</Text>
      </TouchableOpacity>
    </View>
  );

  const handleMarkAsPaid = (settlement: DebtSettlement) => {
    Alert.alert(
      'Mark as Paid',
      `Mark the payment from ${settlement.from} to ${settlement.to} as completed?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Mark Paid',
          onPress: () => {
            // In a real app, you might want to track settlements
            Alert.alert('Marked as Paid', 'This payment has been recorded!');
          },
        },
      ],
    );
  };

  const renderSummary = () => {
    const totalExpenses = data.expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0,
    );
    const peopleInDebt = balances.filter((b) => b.balance < -0.01).length;
    const peopleOwed = balances.filter((b) => b.balance > 0.01).length;

    return (
      <View style={[commonStyles.card, styles.summaryCard]}>
        <Text style={styles.summaryTitle}>Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Expenses:</Text>
          <Text style={styles.summaryValue}>
            {formatCurrency(totalExpenses)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>People in debt:</Text>
          <Text style={styles.summaryValue}>{peopleInDebt}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>People owed:</Text>
          <Text style={styles.summaryValue}>{peopleOwed}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Transactions needed:</Text>
          <Text style={styles.summaryValue}>{settlements.length}</Text>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={commonStyles.emptyState}>
      <Text style={styles.emptyStateTitle}>No Expenses Yet</Text>
      <Text style={commonStyles.emptyStateText}>
        Add expenses to see balance calculations and who owes whom.
      </Text>
      <TouchableOpacity
        style={[commonStyles.button, styles.emptyStateButton]}
        onPress={() => navigation.navigate('AddExpense')}>
        <Text style={commonStyles.buttonText}>Add First Expense</Text>
      </TouchableOpacity>
    </View>
  );

  if (balances.length === 0) {
    return <View style={commonStyles.container}>{renderEmptyState()}</View>;
  }

  return (
    <View style={commonStyles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}>
        {renderSummary()}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Individual Balances</Text>
          <FlatList
            data={balances}
            keyExtractor={(item) => item.participantId}
            renderItem={renderBalanceItem}
            scrollEnabled={false}
          />
        </View>

        {settlements.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Suggested Payments</Text>
            <Text style={styles.sectionSubtitle}>
              Optimize your settlements with minimum transactions
            </Text>
            <FlatList
              data={settlements}
              keyExtractor={(item, index) => `${item.from}-${item.to}-${index}`}
              renderItem={renderSettlementItem}
              scrollEnabled={false}
            />
          </View>
        )}

        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[commonStyles.button, styles.actionButton]}
            onPress={handleSimpleShare}>
            <Text style={commonStyles.buttonText}>Share Balances</Text>
          </TouchableOpacity>

          {isPremium && (
            <TouchableOpacity
              style={[commonStyles.secondaryButton, styles.actionButton]}
              onPress={handlePDFExport}>
              <Text style={commonStyles.secondaryButtonText}>Export PDF</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  summaryCard: {
    margin: spacing.md,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  section: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
    marginHorizontal: spacing.md,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    marginHorizontal: spacing.md,
  },
  settlementItem: {
    marginHorizontal: spacing.md,
  },
  settlementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  settlementText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  fromPerson: {
    fontWeight: 'bold',
    color: colors.error,
  },
  toPerson: {
    fontWeight: 'bold',
    color: colors.success,
  },
  settlementAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  markPaidButton: {
    backgroundColor: colors.success,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-end',
  },
  markPaidButtonText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '600',
  },
  actionsSection: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  actionButton: {
    marginBottom: spacing.sm,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  emptyStateButton: {
    marginTop: spacing.lg,
    minWidth: 200,
  },
