import RNFS from 'react-native-fs';
import {Balance, DebtSettlement, Expense} from '../types';
import {formatCurrency} from '../utils/calculations';

export const PDFService = {
  async generateExpenseReport(
    expenses: Expense[],
    balances: Balance[],
    settlements: DebtSettlement[],
  ): Promise<string | null> {
    try {
      // Create HTML content for PDF
      const htmlContent = this.createHTMLReport(
        expenses,
        balances,
        settlements,
      );

      // Define file path
      const fileName = `expense_report_${Date.now()}.html`;
      const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

      // Write HTML file (in a real app, you'd convert this to PDF)
      await RNFS.writeFile(filePath, htmlContent, 'utf8');

      return filePath;
    } catch (error) {
      console.error('Error generating PDF report:', error);
      return null;
    }
  },

  createHTMLReport(
    expenses: Expense[],
    balances: Balance[],
    settlements: DebtSettlement[],
  ): string {
    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0,
    );
    const currentDate = new Date().toLocaleDateString();

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Expense Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .section { margin-bottom: 25px; }
        .section h2 { color: #2196F3; border-bottom: 2px solid #2196F3; padding-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f5f5f5; font-weight: bold; }
        .positive { color: #4CAF50; font-weight: bold; }
        .negative { color: #F44336; font-weight: bold; }
        .summary { background-color: #f9f9f9; padding: 15px; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Expense Report</h1>
        <p>Generated on ${currentDate}</p>
    </div>

    <div class="section">
        <div class="summary">
            <h2>Summary</h2>
            <p><strong>Total Expenses:</strong> ${formatCurrency(
              totalExpenses,
            )}</p>
            <p><strong>Number of Expenses:</strong> ${expenses.length}</p>
            <p><strong>Number of Participants:</strong> ${balances.length}</p>
        </div>
    </div>

    <div class="section">
        <h2>Expenses</h2>
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Paid By</th>
                    <th>Participants</th>
                </tr>
            </thead>
            <tbody>
                ${expenses
                  .map(
                    (expense) => `
                    <tr>
                        <td>${new Date(expense.date).toLocaleDateString()}</td>
                        <td>${expense.description}</td>
                        <td>${formatCurrency(expense.amount)}</td>
                        <td>${expense.payer.name}</td>
                        <td>${expense.participants
                          .map((p) => p.name)
                          .join(', ')}</td>
                    </tr>
                `,
                  )
                  .join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>Balances</h2>
        <table>
            <thead>
                <tr>
                    <th>Participant</th>
                    <th>Balance</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${balances
                  .map(
                    (balance) => `
                    <tr>
                        <td>${balance.participantName}</td>
                        <td class="${
                          balance.balance >= 0 ? 'positive' : 'negative'
                        }">
                            ${formatCurrency(Math.abs(balance.balance))}
                        </td>
                        <td>${
                          balance.balance > 0
                            ? 'Is owed'
                            : balance.balance < 0
                            ? 'Owes'
                            : 'Settled'
                        }</td>
                    </tr>
                `,
                  )
                  .join('')}
            </tbody>
        </table>
    </div>

    ${
      settlements.length > 0
        ? `
    <div class="section">
        <h2>Suggested Settlements</h2>
        <table>
            <thead>
                <tr>
                    <th>From</th>
                    <th>To</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                ${settlements
                  .map(
                    (settlement) => `
                    <tr>
                        <td>${settlement.from}</td>
                        <td>${settlement.to}</td>
                        <td>${formatCurrency(settlement.amount)}</td>
                    </tr>
                `,
                  )
                  .join('')}
            </tbody>
        </table>
    </div>
    `
        : ''
    }

    <div class="section" style="text-align: center; margin-top: 40px; color: #666;">
        <p>Generated by Expense Splitter App</p>
    </div>
</body>
</html>`;
  },

  async deleteReportFile(filePath: string): Promise<void> {
    try {
      if (await RNFS.exists(filePath)) {
        await RNFS.unlink(filePath);
      }
    } catch (error) {
      console.error('Error deleting report file:', error);
    }
  },
};
