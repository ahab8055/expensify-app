import {Expense, Balance, DebtSettlement} from '../types';

export const calculateBalances = (expenses: Expense[]): Balance[] => {
  const balanceMap = new Map<string, {name: string; balance: number}>();

  // Initialize all participants with 0 balance
  expenses.forEach((expense) => {
    if (!balanceMap.has(expense.payer.id)) {
      balanceMap.set(expense.payer.id, {
        name: expense.payer.name,
        balance: 0,
      });
    }
    expense.participants.forEach((participant) => {
      if (!balanceMap.has(participant.id)) {
        balanceMap.set(participant.id, {name: participant.name, balance: 0});
      }
    });
  });

  // Calculate balances
  expenses.forEach((expense) => {
    const amountPerPerson = expense.amount / expense.participants.length;

    // Payer gets credit for paying
    const payerBalance = balanceMap.get(expense.payer.id)!;
    payerBalance.balance += expense.amount;

    // All participants (including payer) owe their share
    expense.participants.forEach((participant) => {
      const participantBalance = balanceMap.get(participant.id)!;
      participantBalance.balance -= amountPerPerson;
    });
  });

  return Array.from(balanceMap.entries()).map(([participantId, data]) => ({
    participantId,
    participantName: data.name,
    balance: Math.round(data.balance * 100) / 100, // Round to 2 decimal places
  }));
};

export const optimizeDebts = (balances: Balance[]): DebtSettlement[] => {
  const settlements: DebtSettlement[] = [];
  const positiveBalances = balances
    .filter((b) => b.balance > 0.01)
    .sort((a, b) => b.balance - a.balance);
  const negativeBalances = balances
    .filter((b) => b.balance < -0.01)
    .sort((a, b) => a.balance - b.balance);

  let i = 0,
    j = 0;

  while (i < positiveBalances.length && j < negativeBalances.length) {
    const creditor = positiveBalances[i];
    const debtor = negativeBalances[j];

    const amount = Math.min(creditor.balance, -debtor.balance);

    if (amount > 0.01) {
      settlements.push({
        from: debtor.participantName,
        to: creditor.participantName,
        amount: Math.round(amount * 100) / 100,
      });
    }

    creditor.balance -= amount;
    debtor.balance += amount;

    if (creditor.balance < 0.01) {
      i++;
    }
    if (debtor.balance > -0.01) {
      j++;
    }
  }

  return settlements;
};

export const formatCurrency = (amount: number): string => {
  return `$${amount.toFixed(2)}`;
};

export const generateUniqueId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
