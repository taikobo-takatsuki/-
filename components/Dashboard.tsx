import React, { useState, useMemo } from 'react';
import { Plus, ChevronLeft, Wallet, History, Scale, CheckCircle } from 'lucide-react';
import { Group, Expense } from '../types';
import { formatCurrency, calculateSettlements } from '../utils';
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

  const totalExpenses = useMemo(() => {
    return group.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  }, [group.expenses]);

  const settlements = useMemo(() => {
    return calculateSettlements(group.expenses, group.members);
  }, [group.expenses, group.members]);

  return (
    <div className="min-h-screen bg-slate-50 relative pb-24">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-lg mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={onBack}
              className="p-2 -ml-2 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                {group.name.substring(0, 1).toUpperCase()}
              </div>
              <h1 className="font-bold text-slate-900 truncate">{group.name}</h1>
            </div>
          </div>
          
          {!group.isCompleted && (
            <button 
              onClick={() => setIsCompleteDialogOpen(true)}
              className="text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-full hover:bg-primary-100 transition-colors whitespace-nowrap"
            >
              精算完了
            </button>
          )}
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-6 space-y-6">
        
        {/* Total Card */}
        <div className={`rounded-2xl p-6 text-white shadow-lg ${group.isCompleted ? 'bg-slate-600' : 'bg-gradient-to-br from-primary-600 to-primary-700 shadow-primary-200/50'}`}>
          <div className="flex justify-between items-start">
             <div>
                <p className="text-white/80 font-medium mb-1 flex items-center gap-2">
                  <Wallet size={16} /> 合計支出
                </p>
                <h2 className="text-4xl font-bold">
                  {formatCurrency(totalExpenses, group.currency)}
                </h2>
             </div>
             {group.isCompleted && (
               <div className="bg-white/20 p-2 rounded-lg">
                 <CheckCircle size={24} />
               </div>
             )}
          </div>
          
          <div className="mt-4 flex gap-2 text-sm text-white/80">
            <span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
              {group.members.length} 人
            </span>
            <span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
              {group.expenses.length} 件
            </span>
            {group.isCompleted && (
              <span className="bg-green-500/80 text-white px-3 py-1 rounded-full backdrop-blur-sm font-bold">
                完了済み
              </span>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm flex">
          <button
            onClick={() => setActiveTab('settlements')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${
              activeTab === 'settlements' 
                ? 'bg-slate-100 text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Scale size={16} /> 精算
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${
              activeTab === 'expenses' 
                ? 'bg-slate-100 text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <History size={16} /> 履歴
          </button>
        </div>

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
            />
          )}
        </div>
      </main>

      {/* Floating Action Button (Only if not completed) */}
      {!group.isCompleted && (
        <div className="fixed bottom-6 right-6 z-40 md:right-[calc(50%-14rem)]">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 focus:ring-4 focus:ring-slate-200"
            title="立替を追加"
          >
            <Plus size={28} />
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
        title="精算を完了しますか？"
        message={`このグループの精算を完了としてマークします。\n完了するとホーム画面の「精算済」リストに移動します。`}
        confirmText="完了にする"
        onConfirm={() => {
          onComplete();
          setIsCompleteDialogOpen(false);
        }}
        onCancel={() => setIsCompleteDialogOpen(false)}
      />
    </div>
  );
};
