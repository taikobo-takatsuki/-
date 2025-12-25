import React from 'react';
import { ArrowRight, CheckCircle2, AlertCircle, Smartphone } from 'lucide-react';
import { Member, Debt } from '../types';
import { formatCurrency, PAYMENT_APPS } from '../utils';

interface SettlementListProps {
  debts: Debt[];
  members: Member[];
  currency: string;
  hasPendingRates?: boolean;
}

export const SettlementList: React.FC<SettlementListProps> = ({ debts, members, currency, hasPendingRates }) => {
  const getMemberName = (id: string) => members.find(m => m.id === id)?.name || '不明';

  if (hasPendingRates) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-stone-400 bg-white rounded-3xl border border-dashed border-stone-200">
        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4 text-stone-400">
          <AlertCircle size={32} />
        </div>
        <p className="font-bold text-stone-600">計算できません...</p>
        <p className="text-sm mt-1">外貨のレートを入力してください</p>
      </div>
    );
  }

  if (debts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-stone-400">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4 text-green-500 shadow-sm">
          <CheckCircle2 size={40} />
        </div>
        <p className="font-extrabold text-lg text-stone-700">精算かんりょう！</p>
        <p className="text-sm mt-2 text-stone-500">貸し借りはもうありません✨</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {debts.map((debt, index) => (
        <div 
          key={index} 
          className="bg-white p-5 rounded-3xl border border-stone-100 shadow-sm flex flex-col gap-4"
        >
          {/* Debt Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex items-center gap-3 w-full">
                 <div className="flex items-center gap-2 flex-1 min-w-0">
                   <div className="flex-shrink-0 w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 font-bold text-sm">
                      {getMemberName(debt.from).substring(0, 1)}
                    </div>
                    <span className="font-bold text-stone-700 truncate">{getMemberName(debt.from)}</span>
                 </div>
                 
                 <div className="flex flex-col items-center px-2">
                   <span className="text-[10px] text-stone-400 font-bold mb-1">TO</span>
                   <ArrowRight size={20} className="text-stone-300" />
                 </div>

                 <div className="flex items-center gap-2 flex-1 min-w-0 justify-end sm:justify-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-500 font-bold text-sm order-2 sm:order-1">
                      {getMemberName(debt.to).substring(0, 1)}
                    </div>
                    <span className="font-bold text-stone-700 truncate order-1 sm:order-2">{getMemberName(debt.to)}</span>
                 </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center sm:justify-end bg-stone-50 sm:bg-transparent py-2 rounded-xl sm:py-0">
               <span className="font-extrabold text-stone-800 whitespace-nowrap text-xl">
                {formatCurrency(debt.amount, currency)}
              </span>
              <span className="text-xs font-bold text-stone-400 ml-1 self-end mb-1">を渡す</span>
            </div>
          </div>

          {/* Payment Actions */}
          <div className="pt-2 border-t border-dashed border-stone-100">
             <div className="flex items-center gap-1 mb-2">
                <Smartphone size={12} className="text-stone-400" />
                <span className="text-[10px] text-stone-400 font-bold">アプリで送る</span>
             </div>
             <div className="flex flex-wrap gap-2">
                {PAYMENT_APPS.map((app) => (
                  <a 
                    key={app.name}
                    href={app.scheme}
                    className={`flex-1 min-w-[80px] py-2 px-3 rounded-xl ${app.bgColor} ${app.textColor} text-xs font-bold text-center transition-all hover:opacity-90 active:scale-95 shadow-sm flex items-center justify-center`}
                  >
                    {app.name}
                  </a>
                ))}
             </div>
          </div>
        </div>
      ))}
    </div>
  );
};