import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Member, Debt } from '../types';
import { formatCurrency } from '../utils';

interface SettlementListProps {
  debts: Debt[];
  members: Member[];
  currency: string;
}

export const SettlementList: React.FC<SettlementListProps> = ({ debts, members, currency }) => {
  const getMemberName = (id: string) => members.find(m => m.id === id)?.name || '不明';

  if (debts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 text-green-500">
          <CheckCircle2 size={32} />
        </div>
        <p className="font-bold">精算完了！</p>
        <p className="text-sm mt-1">貸し借りはありません。</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {debts.map((debt, index) => (
        <div 
          key={index} 
          className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between"
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs uppercase">
              {getMemberName(debt.from).substring(0, 1)}
            </div>
            <div className="truncate flex items-center gap-2 text-sm sm:text-base">
              <span className="font-bold text-slate-900">{getMemberName(debt.from)}</span>
              <span className="text-slate-400 text-xs mx-1">→</span>
              <span className="font-bold text-slate-900">{getMemberName(debt.to)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <span className="font-bold text-primary-600 whitespace-nowrap text-lg">
              {formatCurrency(debt.amount, currency)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};