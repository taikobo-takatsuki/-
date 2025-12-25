import { Expense, Member, Debt, Group } from './types';

// Supported Currencies List
export const CURRENCIES = [
  { code: 'JPY', symbol: '¥', name: '日本円' },
  { code: 'USD', symbol: '$', name: '米ドル' },
  { code: 'EUR', symbol: '€', name: 'ユーロ' },
  { code: 'KRW', symbol: '₩', name: '韓国ウォン' },
  { code: 'TWD', symbol: 'NT$', name: '台湾ドル' },
  { code: 'THB', symbol: '฿', name: 'タイバーツ' },
  { code: 'GBP', symbol: '£', name: '英ポンド' },
];

// Payment Apps Configuration
export const PAYMENT_APPS = [
  { 
    name: 'PayPay', 
    scheme: 'paypay://', 
    bgColor: 'bg-[#FF0033]', 
    textColor: 'text-white' 
  },
  { 
    name: 'd払い', 
    scheme: 'dbarai://', // Generic scheme
    bgColor: 'bg-[#CC0033]', 
    textColor: 'text-white' 
  },
  { 
    name: '楽天ペイ', 
    scheme: 'rakutenpay://', 
    bgColor: 'bg-[#BF0000]', 
    textColor: 'text-white' 
  },
];

export const getCurrencySymbol = (code: string) => {
  return CURRENCIES.find(c => c.code === code)?.symbol || code;
};

export const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

// URL Encoding/Decoding for Sharing (Handles Unicode/Japanese)
export const encodeGroupData = (group: Group): string => {
  try {
    const json = JSON.stringify(group);
    // Encode specifically for Unicode support in base64
    return btoa(encodeURIComponent(json).replace(/%([0-9A-F]{2})/g,
      function toSolidBytes(match, p1) {
        return String.fromCharCode(parseInt(p1, 16));
      }));
  } catch (e) {
    console.error("Encoding failed", e);
    return "";
  }
};

export const decodeGroupData = (encoded: string): Group | null => {
  try {
    const json = decodeURIComponent(atob(encoded).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(json);
  } catch (e) {
    console.error("Decoding failed", e);
    return null;
  }
};

export const calculateSettlements = (
  expenses: Expense[], 
  members: Member[], 
  baseCurrency: string,
  rates: Record<string, number> = {}
): Debt[] => {
  if (members.length === 0) return [];

  const balances: { [key: string]: number } = {};
  
  // Initialize balances
  members.forEach(m => balances[m.id] = 0);

  // Calculate net balances in BASE CURRENCY
  expenses.forEach(expense => {
    const paidBy = expense.paidBy;
    
    // Convert to base currency using provided rate or default to 1 if same currency
    // If rate is not provided for a foreign currency, we might have issues, but assuming 1 is fallback (or handled in UI)
    const rate = expense.currency === baseCurrency ? 1 : (rates[expense.currency] || 0);
    const amountInBase = expense.amount * rate;

    // 対象メンバーを取得
    const targets = expense.involvedMembers && expense.involvedMembers.length > 0 
      ? expense.involvedMembers 
      : members.map(m => m.id);

    if (targets.length === 0 || amountInBase === 0) return;

    const splitAmount = amountInBase / targets.length;

    // 支払った人はプラス
    if (balances[paidBy] !== undefined) {
      balances[paidBy] += amountInBase;
    }

    // 対象メンバーはマイナス
    targets.forEach(memberId => {
      if (balances[memberId] !== undefined) {
        balances[memberId] -= splitAmount;
      }
    });
  });

  // Separate into debtors and creditors
  let debtors: { id: string; amount: number }[] = [];
  let creditors: { id: string; amount: number }[] = [];

  Object.entries(balances).forEach(([id, amount]) => {
    const roundedAmount = Math.round(amount * 100) / 100;
    if (roundedAmount < -0.01) {
      debtors.push({ id, amount: roundedAmount });
    } else if (roundedAmount > 0.01) {
      creditors.push({ id, amount: roundedAmount });
    }
  });

  // Sort by magnitude
  debtors.sort((a, b) => a.amount - b.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const debts: Debt[] = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const amount = Math.min(Math.abs(debtor.amount), creditor.amount);

    debts.push({
      from: debtor.id,
      to: creditor.id,
      amount: Math.round(amount * 100) / 100
    });

    debtor.amount += amount;
    creditor.amount -= amount;

    if (Math.abs(debtor.amount) < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return debts;
};

export const generateId = () => Math.random().toString(36).substr(2, 9);