import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList, AppData, Balance} from '../types';
import {StorageService} from '../services/storage';
import {PurchaseService} from '../services/purchases';
import {calculateBalances, formatCurrency} from '../utils/calculations';
import {ExpenseItem} from '../components/ExpenseItem';
import {colors, commonStyles, spacing} from '../styles/common';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [data, setData] = useState<AppData>({expenses: [], participants: []});
  const [balances, setBalances] = useState<Balance[]>([]);
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
        setBalances(calculatedBalances);
      } else {
        setBalances([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
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

  const handleAddExpense = async () => {
    const canAdd = await PurchaseService.canAddExpense(data.expenses.length);
    if (!canAdd) {
      Alert.alert(
        'Upgrade Required',
        `Free tier is limited to ${PurchaseService.getFreeExpenseLimit()} expenses. Upgrade to Premium for unlimited expenses!`,
        [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Upgrade', onPress: () => navigation.navigate('Premium')},
        ],
      );
      return;
    }
    navigation.navigate('AddExpense');
  };

  const handleDeleteExpense = (expenseId: string) => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedData = await StorageService.deleteExpense(
                expenseId,
                data,
              );
              setData(updatedData);
              if (updatedData.expenses.length > 0) {
                setBalances(calculateBalances(updatedData.expenses));
              } else {
                setBalances([]);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete expense');
            }
          },
        },
      ],
    );
  };

  const renderExpenseItem = ({item}: {item: any}) => (
    <ExpenseItem
      expense={item}
      showDelete={true}
      onDelete={() => handleDeleteExpense(item.id)}
    />
  );

  const renderQuickStats = () => {
    const totalExpenses = data.expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0,
    );
    const owedToYou = balances
      .filter((b) => b.balance > 0)
      .reduce((sum, b) => sum + b.balance, 0);
    const youOwe = balances
      .filter((b) => b.balance < 0)
      .reduce((sum, b) => sum + Math.abs(b.balance), 0);

    return (
      <View style={styles.statsContainer}>
        <View style={[commonStyles.card, styles.statCard]}>
          <Text style={styles.statValue}>{formatCurrency(totalExpenses)}</Text>
          <Text style={styles.statLabel}>Total Expenses</Text>
        </View>
        <View style={[commonStyles.card, styles.statCard]}>
          <Text style={[styles.statValue, commonStyles.balancePositive]}>
            {formatCurrency(owedToYou)}
          </Text>
          <Text style={styles.statLabel}>Owed to You</Text>
        </View>
        <View style={[commonStyles.card, styles.statCard]}>
          <Text style={[styles.statValue, commonStyles.balanceNegative]}>
            {formatCurrency(youOwe)}
          </Text>
          <Text style={styles.statLabel}>You Owe</Text>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={commonStyles.emptyState}>
      <Text style={styles.emptyStateTitle}>Welcome to Expense Splitter!</Text>
      <Text style={commonStyles.emptyStateText}>
        Start by adding your first expense to track and split costs with
        friends.
      </Text>
      <TouchableOpacity
        style={[commonStyles.button, styles.emptyStateButton]}
        onPress={handleAddExpense}>
        <Text style={commonStyles.buttonText}>Add First Expense</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={commonStyles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Expense Splitter</Text>
        <View style={styles.headerButtons}>
          {!isPremium && (
            <TouchableOpacity
              style={styles.premiumButton}
              onPress={() => navigation.navigate('Premium')}>
              <View style={commonStyles.premiumBadge}>
                <Text style={commonStyles.premiumBadgeText}>PREMIUM</Text>
              </View>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.balancesButton}
            onPress={() => navigation.navigate('Balances')}>
            <Text style={styles.headerButtonText}>Balances</Text>
          </TouchableOpacity>
        </View>
      </View>

      {data.expenses.length > 0 && renderQuickStats()}

      {data.expenses.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={data.expenses}
          keyExtractor={(item) => item.id}
          renderItem={renderExpenseItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      <View style={styles.footer}>
        {!isPremium && (
          <Text style={styles.limitText}>
            Free tier: {data.expenses.length}/
            {PurchaseService.getFreeExpenseLimit()} expenses
          </Text>
        )}
        <TouchableOpacity
          style={commonStyles.button}
          onPress={handleAddExpense}>
          <Text style={commonStyles.buttonText}>Add Expense</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  premiumButton: {
    marginRight: spacing.sm,
  },
  balancesButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  headerButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: spacing.xl,
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
  footer: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  limitText: {
    textAlign: 'center',
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
});
