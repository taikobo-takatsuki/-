import React, { useState, useMemo } from 'react';
import { Plus, ChevronLeft, Wallet, History, Scale, CheckCircle, ArrowRight } from 'lucide-react';
import { Group, Expense } from '../types';
import { formatCurrency, calculateSettlements, getCurrencySymbol } from '../utils';
import { AddExpenseModal } from './AddExpenseModal';
import { ExpenseList } from './ExpenseList';
import { SettlementList } from './SettlementList';
import { ConfirmDialog } from './ConfirmDialog';

interface DashboardProps {
  group: Group;
  onAddExpense: (expense: Expense) => void;
  onBack: () => void;
  onComplete: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ group, onAddExpense, onBack, onComplete }) => {
  const [activeTab, setActiveTab] = useState<'expenses' | 'settlements'>('settlements');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});

  // Detect foreign currencies used
  const foreignCurrencies = useMemo(() => {
    const used = new Set(group.expenses.map(e => e.currency));
    used.delete(group.currency); // Remove base currency
    return Array.from(used);
  }, [group.expenses, group.currency]);

  // Handle rate input
  const handleRateChange = (currency: string, value: string) => {
    setExchangeRates(prev => ({
      ...prev,
      [currency]: parseFloat(value) || 0
    }));
  };

  const totalExpensesInBase = useMemo(() => {
    return group.expenses.reduce((sum, exp) => {
      const rate = exp.currency === group.currency ? 1 : (exchangeRates[exp.currency] || 0);
      return sum + (exp.amount * rate);
    }, 0);
  }, [group.expenses, group.currency, exchangeRates]);

  const settlements = useMemo(() => {
    // Only calculate if all rates are entered (non-zero) or default to 0
    return calculateSettlements(group.expenses, group.members, group.currency, exchangeRates);
  }, [group.expenses, group.members, group.currency, exchangeRates]);

  // Check if we need rates input
  const needsRates = foreignCurrencies.length > 0;
  const ratesValid = foreignCurrencies.every(c => (exchangeRates[c] || 0) > 0);

  return (
    <div className="min-h-screen bg-stone-50 relative pb-24">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-stone-100 sticky top-0 z-30">
        <div className="max-w-lg mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={onBack}
              className="p-2 -ml-2 text-stone-400 hover:text-stone-700 transition-colors rounded-full hover:bg-stone-50"
            >
              <ChevronLeft size={28} />
            </button>
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-500 font-extrabold text-sm shadow-sm">
                {group.name.substring(0, 1).toUpperCase()}
              </div>
              <h1 className="font-bold text-stone-800 truncate text-lg">{group.name}</h1>
            </div>
          </div>
          
          {!group.isCompleted && (
            <button 
              onClick={() => setIsCompleteDialogOpen(true)}
              className="text-xs font-bold text-white bg-stone-800 px-4 py-2 rounded-full hover:bg-stone-700 transition-colors whitespace-nowrap shadow-lg shadow-stone-200"
            >
              精算おわり！
            </button>
          )}
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-6 space-y-6">
        
        {/* Total Card */}
        <div className={`rounded-[2.5rem] p-8 text-white shadow-xl shadow-primary-200/50 ${group.isCompleted ? 'bg-stone-500' : 'bg-gradient-to-br from-primary-400 to-primary-600'}`}>
          <div className="flex justify-between items-start">
             <div>
                <p className="text-white/80 font-bold mb-1 flex items-center gap-2 text-sm">
                  <Wallet size={16} /> ぜんぶで
                </p>
                <h2 className="text-4xl font-extrabold tracking-tight">
                  {formatCurrency(totalExpensesInBase, group.currency)}
                </h2>
                {needsRates && !ratesValid && (
                  <p className="text-xs text-white/70 mt-1">※レート未設定の外貨は含まれません</p>
                )}
             </div>
             {group.isCompleted && (
               <div className="bg-white/20 p-2 rounded-2xl">
                 <CheckCircle size={28} />
               </div>
             )}
          </div>
          
          <div className="mt-6 flex gap-2 text-sm text-white/90 font-bold">
            <span className="bg-white/20 px-4 py-1.5 rounded-full backdrop-blur-sm">
              {group.members.length} 人
            </span>
            <span className="bg-white/20 px-4 py-1.5 rounded-full backdrop-blur-sm">
              {group.expenses.length} 件
            </span>
            {group.isCompleted && (
              <span className="bg-green-400 text-white px-4 py-1.5 rounded-full shadow-sm">
                精算ずみ
              </span>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white p-1.5 rounded-[1.5rem] border border-stone-100 shadow-sm flex">
          <button
            onClick={() => setActiveTab('settlements')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-2xl transition-all ${
              activeTab === 'settlements' 
                ? 'bg-stone-100 text-stone-800 shadow-inner' 
                : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'
            }`}
          >
            <Scale size={18} /> 精算プラン
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-2xl transition-all ${
              activeTab === 'expenses' 
                ? 'bg-stone-100 text-stone-800 shadow-inner' 
                : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'
            }`}
          >
            <History size={18} /> ログ
          </button>
        </div>

        {/* Rate Setting Section for Settlements */}
        {activeTab === 'settlements' && needsRates && !group.isCompleted && (
          <div className="bg-white rounded-3xl p-6 border-2 border-primary-100 shadow-sm">
            <h3 className="font-bold text-stone-700 mb-4 flex items-center gap-2 text-sm">
              <Scale size={16} className="text-primary-500" />
              本日のレートを入力してね
            </h3>
            <div className="space-y-4">
              {foreignCurrencies.map(currency => (
                <div key={currency} className="flex items-center gap-3">
                  <div className="w-20 font-bold text-stone-500 text-right">
                    1 {getCurrencySymbol(currency)}
                  </div>
                  <ArrowRight size={16} className="text-stone-300" />
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      step="any"
                      placeholder={`0 ${group.currency}`}
                      value={exchangeRates[currency] || ''}
                      onChange={(e) => handleRateChange(currency, e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-stone-50 border border-stone-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none font-bold text-stone-800 text-right pr-12"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 text-sm font-bold">
                      {group.currency}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="animate-in fade-in duration-300">
          {activeTab === 'expenses' ? (
            <ExpenseList 
              expenses={group.expenses} 
              members={group.members} 
              currency={group.currency} 
            />
          ) : (
            <SettlementList 
              debts={settlements} 
              members={group.members} 
              currency={group.currency}
              hasPendingRates={needsRates && !ratesValid}
            />
          )}
        </div>
      </main>

      {/* Floating Action Button (Only if not completed) */}
      {!group.isCompleted && (
        <div className="fixed bottom-6 right-6 z-40 md:right-[calc(50%-14rem)]">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-stone-800 hover:bg-black text-white w-16 h-16 rounded-[2rem] shadow-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 hover:rotate-3"
            title="立替を追加"
          >
            <Plus size={32} />
          </button>
        </div>
      )}

      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        members={group.members}
        currency={group.currency}
        onAdd={onAddExpense}
      />

      <ConfirmDialog
        isOpen={isCompleteDialogOpen}
        title="これで精算しちゃう？"
        message={`みんなの貸し借りを確定して、\nホーム画面の「精算ずみ」に移すよ！`}
        confirmText="完了！"
        onConfirm={() => {
          onComplete();
          setIsCompleteDialogOpen(false);
        }}
        onCancel={() => setIsCompleteDialogOpen(false)}
      />
    </div>
  );
};