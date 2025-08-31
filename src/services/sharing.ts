import Share from 'react-native-share';
import {Balance, DebtSettlement, Expense} from '../types';
import {formatCurrency} from '../utils/calculations';

export const ShareService = {
  async shareExpenseReport(
    expenses: Expense[],
    balances: Balance[],
    settlements: DebtSettlement[],
  ): Promise<boolean> {
    try {
      const message = this.createShareMessage(expenses, balances, settlements);

      const shareOptions = {
        title: 'Expense Report',
        message: message,
        subject: 'Expense Report - Shared from Expense Splitter',
      };

      await Share.open(shareOptions);
      return true;
    } catch (error) {
      console.error('Error sharing report:', error);
      return false;
    }
  },

  async shareViaWhatsApp(
    expenses: Expense[],
    balances: Balance[],
    settlements: DebtSettlement[],
  ): Promise<boolean> {
    try {
      const message = this.createShareMessage(expenses, balances, settlements);

      const shareOptions = {
        title: 'Expense Report',
        message: message,
        social: Share.Social.WHATSAPP,
      };

      await Share.shareSingle(shareOptions);
      return true;
    } catch (error) {
      console.error('Error sharing via WhatsApp:', error);
      return false;
    }
  },

  async shareViaEmail(
    expenses: Expense[],
    balances: Balance[],
    settlements: DebtSettlement[],
    recipients?: string[],
  ): Promise<boolean> {
    try {
      const message = this.createShareMessage(expenses, balances, settlements);

      const shareOptions = {
        title: 'Expense Report',
        message: message,
        subject: 'Expense Report - Shared from Expense Splitter',
        email: recipients?.join(','),
        social: Share.Social.EMAIL,
      };

      await Share.shareSingle(shareOptions);
      return true;
    } catch (error) {
      console.error('Error sharing via email:', error);
      return false;
    }
  },

  async sharePDFFile(filePath: string): Promise<boolean> {
    try {
      const shareOptions = {
        title: 'Expense Report PDF',
        message: 'Please find the attached expense report.',
        url: `file://${filePath}`,
        type: 'text/html',
      };

      await Share.open(shareOptions);
      return true;
    } catch (error) {
      console.error('Error sharing PDF file:', error);
      return false;
    }
  },

  createShareMessage(
    expenses: Expense[],
    balances: Balance[],
    settlements: DebtSettlement[],
  ): string {
    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0,
    );
    const currentDate = new Date().toLocaleDateString();

    let message = '🧾 EXPENSE REPORT\\n';
    message += `Generated on: ${currentDate}\\n\\n`;

    message += '📊 SUMMARY\\n';
    message += `Total Expenses: ${formatCurrency(totalExpenses)}\\n`;
    message += `Number of Expenses: ${expenses.length}\\n`;
    message += `Participants: ${balances.length}\\n\\n`;

    if (expenses.length > 0) {
      message += '💳 RECENT EXPENSES\\n';
      expenses.slice(-5).forEach((expense) => {
        message += `• ${expense.description}: ${formatCurrency(
          expense.amount,
        )} (paid by ${expense.payer.name})\\n`;
      });
      message += '\\n';
    }

    if (balances.length > 0) {
      message += '💰 BALANCES\\n';
      balances.forEach((balance) => {
        if (Math.abs(balance.balance) > 0.01) {
          const status = balance.balance > 0 ? 'is owed' : 'owes';
          message += `• ${balance.participantName} ${status} ${formatCurrency(
            Math.abs(balance.balance),
          )}\\n`;
        }
      });
      message += '\\n';
    }

    if (settlements.length > 0) {
      message += '🔄 SUGGESTED PAYMENTS\\n';
      settlements.forEach((settlement) => {
        message += `• ${settlement.from} → ${settlement.to}: ${formatCurrency(
          settlement.amount,
        )}\\n`;
      });
      message += '\\n';
    }

    message += '\\n📱 Shared from Expense Splitter App';

    return message;
  },

  createSimpleBalanceMessage(balances: Balance[]): string {
    let message = '💰 Current Balances:\\n\\n';

    balances.forEach((balance) => {
      if (Math.abs(balance.balance) > 0.01) {
        const status = balance.balance > 0 ? 'is owed' : 'owes';
        message += `${balance.participantName} ${status} ${formatCurrency(
          Math.abs(balance.balance),
        )}\\n`;
      }
    });

    if (balances.every((b) => Math.abs(b.balance) <= 0.01)) {
      message += '🎉 All balances are settled!';
    }

    message += '\\n\\n📱 Shared from Expense Splitter';

    return message;
  },

  async shareSimpleBalances(balances: Balance[]): Promise<boolean> {
    try {
      const message = this.createSimpleBalanceMessage(balances);

      const shareOptions = {
        title: 'Current Balances',
        message: message,
      };

      await Share.open(shareOptions);
      return true;
    } catch (error) {
      console.error('Error sharing balances:', error);
      return false;
    }
  },
};
