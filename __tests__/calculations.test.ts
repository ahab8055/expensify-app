import {
  calculateBalances,
  optimizeDebts,
  formatCurrency,
  generateUniqueId,
} from '../src/utils/calculations';
import {Expense, Participant} from '../src/types';

describe('Calculations Utils', () => {
  const mockParticipants: Participant[] = [
    {id: '1', name: 'Alice'},
    {id: '2', name: 'Bob'},
    {id: '3', name: 'Charlie'},
  ];

  const createMockExpense = (
    amount: number,
    payer: Participant,
    participants: Participant[],
  ): Expense => ({
    id: generateUniqueId(),
    amount,
    description: 'Test expense',
    payer,
    participants,
    date: new Date().toISOString(),
  });

  describe('generateUniqueId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateUniqueId();
      const id2 = generateUniqueId();

      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(typeof id2).toBe('string');
    });
  });

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(10)).toBe('$10.00');
      expect(formatCurrency(10.5)).toBe('$10.50');
      expect(formatCurrency(10.99)).toBe('$10.99');
      expect(formatCurrency(1000.99)).toBe('$1000.99');
    });

    it('should handle negative amounts', () => {
      expect(formatCurrency(-10.5)).toBe('$-10.50');
    });
  });

  describe('calculateBalances', () => {
    it('should calculate simple expense split correctly', () => {
      const expenses = [
        createMockExpense(30, mockParticipants[0], mockParticipants), // Alice pays $30, split 3 ways = $10 each
      ];

      const balances = calculateBalances(expenses);

      expect(balances).toHaveLength(3);

      const aliceBalance = balances.find((b) => b.participantId === '1');
      const bobBalance = balances.find((b) => b.participantId === '2');
      const charlieBalance = balances.find((b) => b.participantId === '3');

      expect(aliceBalance?.balance).toBe(20); // Alice paid $30, owes $10, net +$20
      expect(bobBalance?.balance).toBe(-10); // Bob paid $0, owes $10, net -$10
      expect(charlieBalance?.balance).toBe(-10); // Charlie paid $0, owes $10, net -$10
    });

    it('should handle multiple expenses', () => {
      const expenses = [
        createMockExpense(30, mockParticipants[0], mockParticipants), // Alice pays $30, split 3 ways
        createMockExpense(60, mockParticipants[1], mockParticipants), // Bob pays $60, split 3 ways
      ];

      const balances = calculateBalances(expenses);

      const aliceBalance = balances.find((b) => b.participantId === '1');
      const bobBalance = balances.find((b) => b.participantId === '2');
      const charlieBalance = balances.find((b) => b.participantId === '3');

      // Alice: paid $30, owes $30 (total $90 / 3), net $0
      // Bob: paid $60, owes $30, net +$30
      // Charlie: paid $0, owes $30, net -$30
      expect(aliceBalance?.balance).toBe(0);
      expect(bobBalance?.balance).toBe(30);
      expect(charlieBalance?.balance).toBe(-30);
    });

    it('should handle expenses with different participants', () => {
      const expenses = [
        createMockExpense(20, mockParticipants[0], [
          mockParticipants[0],
          mockParticipants[1],
        ]), // Alice pays $20, split between Alice and Bob
      ];

      const balances = calculateBalances(expenses);

      const aliceBalance = balances.find((b) => b.participantId === '1');
      const bobBalance = balances.find((b) => b.participantId === '2');

      // Alice: paid $20, owes $10, net +$10
      // Bob: paid $0, owes $10, net -$10
      expect(aliceBalance?.balance).toBe(10);
      expect(bobBalance?.balance).toBe(-10);
    });

    it('should return empty array for no expenses', () => {
      const balances = calculateBalances([]);
      expect(balances).toEqual([]);
    });
  });

  describe('optimizeDebts', () => {
    it('should optimize simple debt settlement', () => {
      const balances = [
        {participantId: '1', participantName: 'Alice', balance: 20},
        {participantId: '2', participantName: 'Bob', balance: -10},
        {participantId: '3', participantName: 'Charlie', balance: -10},
      ];

      const settlements = optimizeDebts(balances);

      expect(settlements).toHaveLength(2);
      expect(
        settlements.find((s) => s.from === 'Bob' && s.to === 'Alice')?.amount,
      ).toBe(10);
      expect(
        settlements.find((s) => s.from === 'Charlie' && s.to === 'Alice')
          ?.amount,
      ).toBe(10);
    });

    it('should handle complex debt optimization', () => {
      const balances = [
        {participantId: '1', participantName: 'Alice', balance: 30},
        {participantId: '2', participantName: 'Bob', balance: -20},
        {participantId: '3', participantName: 'Charlie', balance: -10},
      ];

      const settlements = optimizeDebts(balances);

      expect(settlements).toHaveLength(2);

      const totalSettlements = settlements.reduce(
        (sum, s) => sum + s.amount,
        0,
      );
      expect(totalSettlements).toBe(30);
    });

    it('should return empty array for balanced accounts', () => {
      const balances = [
        {participantId: '1', participantName: 'Alice', balance: 0},
        {participantId: '2', participantName: 'Bob', balance: 0},
      ];

      const settlements = optimizeDebts(balances);
      expect(settlements).toEqual([]);
    });

    it('should ignore small balances (less than $0.01)', () => {
      const balances = [
        {participantId: '1', participantName: 'Alice', balance: 0.005},
        {participantId: '2', participantName: 'Bob', balance: -0.005},
      ];

      const settlements = optimizeDebts(balances);
      expect(settlements).toEqual([]);
    });
  });
});
