import { Expense, Member, Debt } from './types';

export const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const calculateSettlements = (expenses: Expense[], members: Member[]): Debt[] => {
  if (members.length === 0) return [];

  const balances: { [key: string]: number } = {};
  
  // Initialize balances
  members.forEach(m => balances[m.id] = 0);

  // Calculate net balances
  expenses.forEach(expense => {
    const paidBy = expense.paidBy;
    const amount = expense.amount;
    
    // 対象メンバーを取得（データがない場合は全員を対象とする互換性維持）
    const targets = expense.involvedMembers && expense.involvedMembers.length > 0 
      ? expense.involvedMembers 
      : members.map(m => m.id);

    if (targets.length === 0) return;

    const splitAmount = amount / targets.length;

    // 支払った人はプラス（立て替えた分が戻ってくる権利）
    if (balances[paidBy] !== undefined) {
      balances[paidBy] += amount;
    }

    // 対象メンバーはマイナス（自分の分を支払う義務）
    targets.forEach(memberId => {
      if (balances[memberId] !== undefined) {
        balances[memberId] -= splitAmount;
      }
    });
  });

  // Separate into debtors (owe money, negative balance) and creditors (owed money, positive balance)
  let debtors: { id: string; amount: number }[] = [];
  let creditors: { id: string; amount: number }[] = [];

  Object.entries(balances).forEach(([id, amount]) => {
    // Round to 2 decimals to avoid float issues
    const roundedAmount = Math.round(amount * 100) / 100;
    if (roundedAmount < -0.01) {
      debtors.push({ id, amount: roundedAmount });
    } else if (roundedAmount > 0.01) {
      creditors.push({ id, amount: roundedAmount });
    }
  });

  // Sort by magnitude to optimize transaction count (Greedy approach)
  debtors.sort((a, b) => a.amount - b.amount); // Ascending (most negative first)
  creditors.sort((a, b) => b.amount - a.amount); // Descending (most positive first)

  const debts: Debt[] = [];
  let i = 0; // debtor index
  let j = 0; // creditor index

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    // The amount to settle is the minimum of what debtor owes and creditor needs
    const amount = Math.min(Math.abs(debtor.amount), creditor.amount);

    debts.push({
      from: debtor.id,
      to: creditor.id,
      amount: Math.round(amount * 100) / 100
    });

    // Adjust remaining balances
    debtor.amount += amount;
    creditor.amount -= amount;

    // Move indices if settled (within a small margin for float errors)
    if (Math.abs(debtor.amount) < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return debts;
};

export const generateId = () => Math.random().toString(36).substr(2, 9);
