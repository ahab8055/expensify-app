import AsyncStorage from '@react-native-async-storage/async-storage';
import {AppData, Expense, Participant} from '../types';

const STORAGE_KEY = '@ExpenseSplitter:data';

export const StorageService = {
  async loadData(): Promise<AppData> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
    return {expenses: [], participants: []};
  },

  async saveData(data: AppData): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  },

  async addExpense(
    expense: Omit<Expense, 'id'>,
    existingData: AppData,
  ): Promise<AppData> {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
    };

    // Update participants list
    const participantMap = new Map();
    existingData.participants.forEach((p) => participantMap.set(p.id, p));

    // Add payer if not exists
    participantMap.set(expense.payer.id, expense.payer);

    // Add all participants if not exist
    expense.participants.forEach((p) => participantMap.set(p.id, p));

    const updatedData = {
      expenses: [...existingData.expenses, newExpense],
      participants: Array.from(participantMap.values()),
    };

    await this.saveData(updatedData);
    return updatedData;
  },

  async addParticipant(
    participant: Participant,
    existingData: AppData,
  ): Promise<AppData> {
    const exists = existingData.participants.some(
      (p) => p.id === participant.id,
    );
    if (exists) {
      return existingData;
    }

    const updatedData = {
      ...existingData,
      participants: [...existingData.participants, participant],
    };

    await this.saveData(updatedData);
    return updatedData;
  },

  async deleteExpense(
    expenseId: string,
    existingData: AppData,
  ): Promise<AppData> {
    const updatedData = {
      ...existingData,
      expenses: existingData.expenses.filter((e) => e.id !== expenseId),
    };

    await this.saveData(updatedData);
    return updatedData;
  },

  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  },
};
