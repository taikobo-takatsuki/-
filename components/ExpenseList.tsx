import React from 'react';
import { Receipt, Users } from 'lucide-react';
import { Expense, Member } from '../types';
import { formatCurrency } from '../utils';

interface ExpenseListProps {
  expenses: Expense[];
  members: Member[];
  currency: string;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, members, currency }) => {
  const getMemberName = (id: string) => members.find(m => m.id === id)?.name || '不明';

  const getInvolvedSummary = (expense: Expense) => {
    const targets = expense.involvedMembers || members.map(m => m.id);
    if (targets.length === members.length) {
      return null; // 全員の場合は表示しない（シンプルにするため）
    }
    const names = targets.map(id => getMemberName(id));
    return `対象: ${names.join(', ')}`;
  };

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <Receipt size={24} />
        </div>
        <p className="font-bold">まだ履歴がありません</p>
        <p className="text-sm mt-1">立替を追加してください</p>
      </div>
    );
  }

  // Sort by newest first
  const sortedExpenses = [...expenses].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="space-y-3">
      {sortedExpenses.map((expense) => {
        const involvedSummary = getInvolvedSummary(expense);
        
        return (
          <div 
            key={expense.id} 
            className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-primary-100 transition-colors"
          >
            <div className="flex items-center gap-4 overflow-hidden">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                <Receipt size={20} />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-slate-900 truncate">{expense.title}</h3>
                <div className="text-sm text-slate-500">
                  <span className="font-medium text-slate-700">{getMemberName(expense.paidBy)}</span> が支払いました
                  {involvedSummary && (
                     <div className="text-xs text-primary-600 mt-0.5 flex items-center gap-1">
                       <Users size={10} /> {involvedSummary}
                     </div>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right flex-shrink-0 ml-4">
              <span className="block font-bold text-slate-900 text-lg">
                {formatCurrency(expense.amount, currency)}
              </span>
              <span className="text-xs text-slate-400">
                {new Date(expense.timestamp).toLocaleDateString('ja-JP')}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
