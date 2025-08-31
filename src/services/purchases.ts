import AsyncStorage from '@react-native-async-storage/async-storage';
import {PurchaseInfo} from '../types';

const PREMIUM_KEY = '@ExpenseSplitter:premium';
const FREE_EXPENSE_LIMIT = 5;

export const PurchaseService = {
  async isPremium(): Promise<boolean> {
    try {
      const data = await AsyncStorage.getItem(PREMIUM_KEY);
      return data !== null;
    } catch (error) {
      console.error('Error checking premium status:', error);
      return false;
    }
  },

  async purchasePremium(purchaseInfo: PurchaseInfo): Promise<boolean> {
    try {
      // In a real app, you would validate the purchase with RevenueCat
      // For demo purposes, we'll just store the purchase info
      await AsyncStorage.setItem(PREMIUM_KEY, JSON.stringify(purchaseInfo));
      return true;
    } catch (error) {
      console.error('Error processing premium purchase:', error);
      return false;
    }
  },

  async canAddExpense(currentExpenseCount: number): Promise<boolean> {
    const isPremium = await this.isPremium();
    return isPremium || currentExpenseCount < FREE_EXPENSE_LIMIT;
  },

  getFreeExpenseLimit(): number {
    return FREE_EXPENSE_LIMIT;
  },

  getPremiumPrice(): string {
    return '$3.99';
  },

  // Mock RevenueCat methods for demo
  async getAvailableProducts() {
    return [
      {
        identifier: 'premium_unlock',
        title: 'Premium Unlock',
        description: 'Unlimited expenses and PDF export',
        price: 3.99,
        priceString: '$3.99',
      },
    ];
  },

  async makePurchase(productId: string): Promise<PurchaseInfo | null> {
    try {
      // In a real app, this would trigger RevenueCat purchase flow
      // For demo, we'll simulate a successful purchase
      const purchaseInfo: PurchaseInfo = {
        productId,
        transactionId: `demo_${Date.now()}`,
        purchaseToken: `token_${Date.now()}`,
      };

      const success = await this.purchasePremium(purchaseInfo);
      return success ? purchaseInfo : null;
    } catch (error) {
      console.error('Purchase failed:', error);
      return null;
    }
  },

  async restorePurchases(): Promise<boolean> {
    try {
      // In a real app, this would restore purchases from RevenueCat
      // For demo, we'll check if there's stored purchase data
      const data = await AsyncStorage.getItem(PREMIUM_KEY);
      return data !== null;
    } catch (error) {
      console.error('Error restoring purchases:', error);
      return false;
    }
  },
};
