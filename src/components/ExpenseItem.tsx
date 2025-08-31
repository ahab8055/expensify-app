import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Expense} from '../types';
import {formatCurrency} from '../utils/calculations';
import {colors, commonStyles} from '../styles/common';

interface ExpenseItemProps {
  expense: Expense;
  onPress?: () => void;
  showDelete?: boolean;
  onDelete?: () => void;
}

export const ExpenseItem: React.FC<ExpenseItemProps> = ({
  expense,
  onPress,
  showDelete,
  onDelete,
}) => {
  return (
    <TouchableOpacity
      style={[commonStyles.card, styles.expenseItem]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}>
      <View style={styles.expenseHeader}>
        <Text style={styles.expenseDescription}>{expense.description}</Text>
        <Text style={styles.expenseAmount}>
          {formatCurrency(expense.amount)}
        </Text>
      </View>

      <View style={styles.expenseDetails}>
        <Text style={styles.expenseDetail}>
          Paid by:{' '}
          <Text style={styles.expenseDetailBold}>{expense.payer.name}</Text>
        </Text>
        <Text style={styles.expenseDate}>
          {new Date(expense.date).toLocaleDateString()}
        </Text>
      </View>

      <Text style={styles.participantsLabel}>
        Participants: {expense.participants.map((p) => p.name).join(', ')}
      </Text>

      {showDelete && onDelete && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={onDelete}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  expenseItem: {
    marginHorizontal: 16,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  expenseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  expenseDetail: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  expenseDetailBold: {
    fontWeight: '600',
    color: colors.text,
  },
  expenseDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  participantsLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  deleteButtonText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: '600',
  },
});
