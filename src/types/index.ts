export interface Participant {
  id: string;
  name: string;
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  payer: Participant;
  participants: Participant[];
  date: string;
}

export interface Balance {
  participantId: string;
  participantName: string;
  balance: number; // positive = owed money, negative = owes money
}

export interface DebtSettlement {
  from: string;
  to: string;
  amount: number;
}

export interface AppData {
  expenses: Expense[];
  participants: Participant[];
}

export interface PurchaseInfo {
  purchaseToken?: string;
  productId: string;
  transactionId?: string;
}

export type RootStackParamList = {
  Home: undefined;
  AddExpense: undefined;
  Balances: undefined;
  Premium: undefined;
};
