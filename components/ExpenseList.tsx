import React from 'react';
import { Receipt, Users } from 'lucide-react';
import { Expense, Member } from '../types';
import { formatCurrency, getCurrencySymbol } from '../utils';

interface ExpenseListProps {
  expenses: Expense[];
  members: Member[];
  currency: string;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, members, currency: baseCurrency }) => {
  const getMemberName = (id: string) => members.find(m => m.id === id)?.name || '不明';

  const getInvolvedSummary = (expense: Expense) => {
    const targets = expense.involvedMembers || members.map(m => m.id);
    if (targets.length === members.length) {
      return null;
    }
    const names = targets.map(id => getMemberName(id));
    return `対象: ${names.join(', ')}`;
  };

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-stone-400">
        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4">
          <Receipt size={24} />
        </div>
        <p className="font-bold">まだログがありません</p>
        <p className="text-sm mt-1">下のボタンから追加してね</p>
      </div>
    );
  }

  // Sort by newest first
  const sortedExpenses = [...expenses].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="space-y-4">
      {sortedExpenses.map((expense) => {
        const involvedSummary = getInvolvedSummary(expense);
        const isForeign = expense.currency !== baseCurrency;
        
        return (
          <div 
            key={expense.id} 
            className="bg-white p-5 rounded-3xl border border-stone-100 shadow-sm flex items-center justify-between group hover:border-primary-200 hover:shadow-md transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-4 overflow-hidden">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-50 text-primary-500 rounded-2xl flex items-center justify-center">
                <Receipt size={20} />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-stone-800 truncate text-lg">{expense.title}</h3>
                <div className="text-sm text-stone-500 mt-1">
                  <span className="font-bold text-stone-600">{getMemberName(expense.paidBy)}</span>
                  {involvedSummary && (
                     <div className="text-xs text-primary-500 mt-1 flex items-center gap-1 font-bold">
                       <Users size={12} /> {involvedSummary}
                     </div>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right flex-shrink-0 ml-4">
              <span className="block font-extrabold text-stone-800 text-lg">
                {isForeign ? (
                   <>
                    {getCurrencySymbol(expense.currency)} {expense.amount.toLocaleString()}
                   </>
                ) : (
                   formatCurrency(expense.amount, expense.currency)
                )}
              </span>
              {isForeign && (
                 <span className="text-[10px] font-bold bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full inline-block mt-1">
                   {expense.currency}
                 </span>
              )}
              <span className="block text-xs text-stone-300 mt-1 font-medium">
                {new Date(expense.timestamp).toLocaleDateString('ja-JP')}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};