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
    // Note: This total ignores exchange rates if not settled, but gives a rough idea in base currency 
    // strictly summing amounts isn't accurate for mixed currencies, but for list view it's acceptable simplified
    return group.expenses.reduce((sum, exp) => {
        // Simple fallback: just add raw amounts if currency matches, otherwise ignore or treat 1:1 for preview
        // To be precise we'd need saved rates, but let's just sum base currency items or show count
        return sum + (exp.currency === group.currency ? exp.amount : 0);
    }, 0);
  };

  return (
    <div className="min-h-screen bg-stone-50 p-6 pb-24">
      <div className="max-w-md mx-auto space-y-10">
        {/* Header */}
        <div className="text-center pt-10 pb-2">
          <h1 className="text-4xl font-extrabold text-stone-800 tracking-tight drop-shadow-sm">
            <span className="text-primary-500">ワリ</span>カーーン！
          </h1>
          <p className="text-stone-400 text-sm mt-3 font-medium">ゆるっと割り勘、パッと精算。</p>
        </div>

        {/* Create New Action */}
        <button
          onClick={onCreateNew}
          className="w-full bg-white p-8 rounded-[2.5rem] shadow-xl shadow-stone-200/50 border border-white flex flex-col items-center justify-center gap-4 hover:border-primary-200 hover:shadow-2xl transition-all group active:scale-[0.98]"
        >
          <div className="w-16 h-16 bg-primary-50 text-primary-500 rounded-full flex items-center justify-center group-hover:bg-primary-500 group-hover:text-white transition-colors shadow-sm">
            <Plus size={32} />
          </div>
          <span className="font-bold text-stone-700 text-lg">あたらしく作る</span>
        </button>

        {/* History Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-stone-400 px-2">
            <History size={18} />
            <h2 className="font-bold text-sm">これまでの記録 (1年分)</h2>
          </div>

          {sortedHistory.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-stone-100">
              <p className="text-stone-300 text-sm font-bold">まだ何もないよ</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedHistory.map((group) => (
                <div
                  key={group.id}
                  onClick={() => onSelectGroup(group)}
                  className={`bg-white p-6 rounded-[2rem] border shadow-sm transition-all active:scale-[0.98] cursor-pointer relative overflow-hidden group ${
                    group.isCompleted ? 'border-stone-100 opacity-80 bg-stone-50' : 'border-white shadow-stone-200/50 hover:border-primary-200'
                  }`}
                >
                  {group.isCompleted && (
                    <div className="absolute top-0 right-0 bg-stone-200 text-stone-500 text-[10px] font-bold px-3 py-1.5 rounded-bl-2xl z-0">
                      おわったやつ
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center relative z-10">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-extrabold text-stone-800 truncate pr-2 text-lg">{group.name}</h3>
                      <div className="flex items-center gap-4 text-xs text-stone-400 mt-2 font-medium">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} />
                          {new Date(group.createdAt).toLocaleDateString('ja-JP')}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Wallet size={14} />
                          {group.currency}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 pl-2">
                       <button
                          onClick={(e) => onDeleteGroup(group.id, e)}
                          className="relative z-20 p-3 text-stone-300 hover:text-red-400 hover:bg-red-50 rounded-full transition-colors"
                          title="削除"
                        >
                          <Trash2 size={20} />
                        </button>
                       <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-300 group-hover:bg-primary-50 group-hover:text-primary-400 transition-colors">
                         <ChevronRight size={20} />
                       </div>
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