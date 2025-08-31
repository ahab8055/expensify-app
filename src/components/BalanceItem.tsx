import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Balance} from '../types';
import {formatCurrency} from '../utils/calculations';
import {colors, commonStyles} from '../styles/common';

interface BalanceItemProps {
  balance: Balance;
}

export const BalanceItem: React.FC<BalanceItemProps> = ({balance}) => {
  const isPositive = balance.balance > 0.01;
  const isSettled = Math.abs(balance.balance) <= 0.01;

  const getBalanceStatus = () => {
    if (isSettled) {
      return {text: 'Settled', style: styles.settledText};
    }
    if (isPositive) {
      return {text: 'Is owed', style: commonStyles.balancePositive};
    }
    return {text: 'Owes', style: commonStyles.balanceNegative};
  };

  const balanceStatus = getBalanceStatus();
  const displayAmount = formatCurrency(Math.abs(balance.balance));

  return (
    <View style={[commonStyles.card, styles.balanceItem]}>
      <View style={styles.balanceHeader}>
        <Text style={styles.participantName}>{balance.participantName}</Text>
        <View style={styles.balanceInfo}>
          <Text style={[styles.balanceAmount, balanceStatus.style]}>
            {isSettled ? '$0.00' : displayAmount}
          </Text>
          <Text style={[styles.balanceStatus, balanceStatus.style]}>
            {balanceStatus.text}
          </Text>
        </View>
      </View>

      {!isSettled && (
        <View style={styles.balanceIndicator}>
          <View
            style={[
              styles.balanceBar,
              {backgroundColor: isPositive ? colors.success : colors.error},
            ]}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  balanceItem: {
    marginHorizontal: 16,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  balanceInfo: {
    alignItems: 'flex-end',
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  balanceStatus: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  settledText: {
    color: colors.textSecondary,
  },
  balanceIndicator: {
    marginTop: 8,
    height: 4,
    backgroundColor: colors.divider,
    borderRadius: 2,
    overflow: 'hidden',
  },
  balanceBar: {
    height: '100%',
    borderRadius: 2,
    width: '100%',
  },
});
