import React from 'react';
import { Plus, History, Calendar, ChevronRight, Wallet, Trash2 } from 'lucide-react';
import { Group } from '../types';
import { formatCurrency } from '../utils';

interface HomeProps {
  history: Group[];
  onCreateNew: () => void;
  onSelectGroup: (group: Group) => void;
  onDeleteGroup: (groupId: string, e: React.MouseEvent) => void;
}

export const Home: React.FC<HomeProps> = ({ history, onCreateNew, onSelectGroup, onDeleteGroup }) => {
  // Sort history by updatedAt desc
  const sortedHistory = [...history].sort((a, b) => b.updatedAt - a.updatedAt);

  const getTotalExpenses = (group: Group) => {
    return group.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-20">
      <div className="max-w-md mx-auto space-y-8">
        {/* Header */}
        <div className="text-center pt-8 pb-4">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">割り勘アプリ</h1>
          <p className="text-slate-500 text-sm mt-1">イベントや旅行の経費をスマートに精算</p>
        </div>

        {/* Create New Action */}
        <button
          onClick={onCreateNew}
          className="w-full bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center gap-3 hover:border-primary-300 hover:shadow-md transition-all group active:scale-[0.98]"
        >
          <div className="w-14 h-14 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-colors">
            <Plus size={28} />
          </div>
          <span className="font-bold text-slate-900">新しいグループを作成</span>
        </button>

        {/* History Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-500 px-1">
            <History size={18} />
            <h2 className="font-bold text-sm">履歴 (過去1年分)</h2>
          </div>

          {sortedHistory.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl border border-slate-100 border-dashed">
              <p className="text-slate-400 text-sm">まだ履歴がありません</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedHistory.map((group) => (
                <div
                  key={group.id}
                  onClick={() => onSelectGroup(group)}
                  className={`bg-white p-4 rounded-xl border shadow-sm transition-all active:scale-[0.99] cursor-pointer relative overflow-hidden group ${
                    group.isCompleted ? 'border-slate-200 opacity-90' : 'border-primary-200 hover:border-primary-300'
                  }`}
                >
                  {group.isCompleted && (
                    <div className="absolute top-0 right-0 bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-bl-lg z-0">
                      精算済
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center relative z-10">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 truncate pr-2">{group.name}</h3>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(group.createdAt).toLocaleDateString('ja-JP')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Wallet size={12} />
                          {formatCurrency(getTotalExpenses(group), group.currency)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 pl-2">
                       <button
                          onClick={(e) => onDeleteGroup(group.id, e)}
                          className="relative z-20 p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                          title="削除"
                        >
                          <Trash2 size={18} />
                        </button>
                       <ChevronRight size={18} className="text-slate-300 group-hover:text-primary-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
